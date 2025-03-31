const ConferenceFile = require('../models/ConferenceFile');
const Conference = require('../models/Conference');
const ApiError = require('../exceptions/apiError');
const ConferenceFileDTO = require('./../dtos/conferenceFile-dto'); // Предполагается, что у вас есть DTO

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

      if (!file) {
        throw ApiError.NotFound('Файл для данной конференции не найден');
      }

      await file.destroy();
      return { success: true };
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async getAllFiles() {
    try {
      const files = await ConferenceFile.findAll(); // Убрана сортировка
      
      return files.map(file => new ConferenceFileDTO(file));
    } catch (error) {
      console.error('Ошибка при получении файлов:', error);
      throw error;
    }
  }
}

module.exports = new ConferenceFileService();