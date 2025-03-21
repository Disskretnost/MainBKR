const conferenceService = require('../services/conference-service');
const ApiError = require('./../exceptions/apiError'); // Убедитесь, что путь к ApiError правильный
const crypto = require('crypto'); // Импортируем модуль crypto


class ConferenceController {
  // Создание комнаты
  async createConference(req, res, next) {
    try {
      const { ownerId } = req.body; //  Удаляем accessCode из req.body, т.к. генерируем его сами
      console.log(req.body);

      // Генерация случайного кода доступа
      const accessCode = crypto.randomBytes(8).toString('hex'); // 8 байт = 16 символов в hex

      const conferenceData = await conferenceService.createConference(ownerId, accessCode);
      return res.status(201).json(conferenceData);
    } catch (e) {
      next(e);
    }
  }

  async getConferenceByAccessCode(req, res, next) {
    try {
      const { accessCode } = req.body;  // Извлекаем accessCode из req.body
      const conferenceData = await conferenceService.getConferenceByAccessCode(accessCode);
      return res.status(200).json(conferenceData);
    } catch (e) {
      next(e);
    }
  }

  // Удаление комнаты
}

module.exports = new ConferenceController();