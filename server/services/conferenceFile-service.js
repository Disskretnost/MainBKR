const ConferenceFile = require('../models/ConferenceFile');
const Conference = require('../models/Conference');
const ApiError = require('../exceptions/apiError');
const ConferenceFileDTO = require('./../dtos/conferenceFile-dto'); // Предполагается, что у вас есть DTO
const listFileDTO = require('./../dtos/listFile-dto'); 

class ConferenceFileService {
  // Добавление файла к конференции
  async addFileToConference(conferenceId, filename, filepath) {
    try {
      // Проверяем существование конференции
      const conference = await Conference.findByPk(conferenceId);
      if (!conference) {
        throw ApiError.NotFound('Конференция не найдена');
      }

      // Создаем запись о файле
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

  // Получение информации о файле конференции
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

  // Удаление файла конференции
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
      // 1. Сначала находим ID конференций, где пользователь является владельцем
      const userConferences = await Conference.findAll({
        attributes: ['id'],
        where: { ownerId: userId }
      });
      const conferenceIds = userConferences.map(c => c.id);
      const files = await ConferenceFile.findAll({
        where: {
          conferenceId: conferenceIds
        }
      });
      console.log(files);
      
      return files.map(file => new listFileDTO(file));
  
      
    
    } catch (error) {
      console.error('Ошибка при получении файлов:', error);
      throw error;
    }
  } 


  async getFileForDownload(fileId) {
    const file = await ConferenceFile.findByPk(fileId);
    return new ConferenceFileDTO(file);
  }
}

module.exports = new ConferenceFileService();