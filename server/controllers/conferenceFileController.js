const conferenceFileService = require('../services/conferenceFile-service');

class ConferenceFileController {
  // Получение всех файлов (без пагинации)
  async getAllFiles(req, res, next) {
    try {
      const files = await conferenceFileService.getAllFiles();
      return res.status(200).json(files);
    } catch (e) {
      next(e);
    }
  }
}

module.exports = new ConferenceFileController();