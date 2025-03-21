// services/conference-service.js
const Conference = require('../models/Conference'); // Укажите правильный путь к вашим моделям
const  User  = require('../models/User'); // Укажите правильный путь к вашим моделям
const ApiError = require('../exceptions/apiError'); // Убедитесь, что путь к ApiError правильный
const ConferenceDTO = require('../dtos/room-dto'); // Импортируйте ConferenceDTO



class ConferenceService {
  // Создание комнаты
  async createConference(ownerId, accessCode) {
    try {
      const conference = await Conference.create({
        ownerId: ownerId,
        accessCode: accessCode
      });
      const conferenceDto = new ConferenceDTO(conference);
      return conferenceDto;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async getConferenceByAccessCode(accessCode) {
    const conference = await Conference.findOne({ where: { accessCode } });

    if (!conference) {
      throw ApiError.NotFound('Комната с таким кодом доступа не найдена.');
    }

    const conferenceDto = new ConferenceDTO(conference);
    return conferenceDto;
  }
  // Удаление комнаты
  async deleteConference(id) {
    const conference = await Conference.findByPk(id); // Поиск комнаты по ID

    if (!conference) {
      throw ApiError.NotFound('Комната не найдена');
    }
    await conference.destroy(); // Удаление комнаты
  }
}

module.exports = new ConferenceService();