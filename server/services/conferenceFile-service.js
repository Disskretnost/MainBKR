const ConferenceFile = require('../models/ConferenceFile');
const Conference = require('../models/Conference');
const ApiError = require('../exceptions/apiError');
const ConferenceFileDTO = require('./../dtos/conferenceFile-dto'); // Предполагается, что у вас есть DTO
const listFileDTO = require('./../dtos/listFile-dto'); 
const Participant = require('./../models/Participant');
const FileStatus = require('../models/FileStatus'); 

class ConferenceFileService {

  async addFileToConference(conferenceId, filename, filepath) {
    try {
      const conference = await Conference.findByPk(conferenceId);
      if (!conference) {
        throw ApiError.NotFound('Конференция не найдена');
      }

      const file = await ConferenceFile.create({
        conferenceId,
        filename,
        filepath
      });

      return new ConferenceFileDTO(file);
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async getConferenceFile(conferenceId) {
    try {
      const file = await ConferenceFile.findOne({ 
        where: { conferenceId } 
      });

      if (!file) {
        throw ApiError.NotFound('Файл для данной конференции не найден');
      }

      return new ConferenceFileDTO(file);
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async deleteConferenceFile(conferenceId) {
    try {
      const file = await ConferenceFile.findOne({ 
        where: { conferenceId } 
      });

      await file.destroy();
      return { success: true };
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async getAllFiles(userId) {
    try {
        // 1. Находим ID конференций пользователя
        const userParticipation = await Participant.findAll({
            attributes: ['conferenceId'],
            where: { 
                userId: userId
            },
            raw: true
        });
        

        const conferenceIds = userParticipation.map(p => p.conferenceId);

        const files = await ConferenceFile.findAll({
          where: {
              conferenceId: conferenceIds
          },
          include: [{
              model: FileStatus,
              as: 'statuses',
              where: {
                  userId: userId,      
                  status: 'visible'    
              },
              required: true           
          }]
      });

        return files.map(file => new listFileDTO(file));
        
    } catch (error) {
        console.error('Ошибка при получении файлов:', error);
        throw error;
    }
}


  async getFileForDownload(conferenceId) {
    const file = await ConferenceFile.findByPk(conferenceId);
    return new ConferenceFileDTO(file);
  }


  async setFileStatusForAll(conferenceId, status = 'visible') {
    try {
        // 1. Проверка существования файла
        const fileExists = await ConferenceFile.count({ 
            where: { conferenceId } 
        });
        if (!fileExists) {
            throw ApiError.NotFound('Файл конференции не найден');
        }

        // 2. Получаем только userId участников (оптимизированный запрос)
        const participants = await Participant.findAll({
            where: { conferenceId },
            attributes: ['userId'], // Только ID пользователей
            raw: true // Возвращаем простые объекты
        });

        // 3. Массовое создание/обновление
        if (participants.length > 0) {
            await FileStatus.bulkCreate(
                participants.map(({ userId }) => ({
                    userId,
                    fileConferenceId: conferenceId,
                    status,
                    changedAt: new Date()
                })),
                {
                    updateOnDuplicate: ['status', 'changedAt']
                }
            );
        }

        return { 
            success: true,
            message: `Статус "${status}" установлен для ${participants.length} участников`
        };

    } catch (error) {
        console.error('Ошибка установки статуса файла:', error);
        throw error;
    }
}

async setFileStatusDeleted(fileId, userId) {
  try {
      // Обновляем или вставляем запись, если её нет
      const result = await FileStatus.upsert({
          fileConferenceId: fileId,
          userId: userId,
          status: 'deleted',
          changedAt: new Date()
      });

      return result;  // Если нужно вернуть результат операции
  } catch (e) {
      console.error("Ошибка при изменении статуса файла:", e);
      throw new Error("Ошибка при изменении статуса файла"); // Прокидываем ошибку дальше
  }
}

}

module.exports = new ConferenceFileService();