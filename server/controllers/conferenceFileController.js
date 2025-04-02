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
  async downloadFile(req, res, next) {
    try {
      const { id } = req.params;
      const fileDTO = await conferenceFileService.getFileForDownload(id);
      
      // Отправляем файл (без указания имени — возьмётся из filepath)
      res.download(fileDTO.filepath, function (err) {
        if (err) {
          console.log(err);
        }
      });
      
    } catch (e) {
      next(e);
    }
  }
}

module.exports = new ConferenceFileController();