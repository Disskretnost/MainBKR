const conferenceFileService = require('../services/conferenceFile-service');

class ConferenceFileController {
  // Получение всех файлов (без пагинации)
  async getAllFiles(req, res, next) {
    try {
      const { id } = req.params;
      const files = await conferenceFileService.getAllFiles(id);
      //console.log(files);
      
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



  async markFileAsDeleted(req, res, next) {
    try {
        const { fileId, userId } = req.params;
        
        
        // Вызываем сервис для установки статуса 'deleted'
        await conferenceFileService.setFileStatusDeleted(
            fileId, 
            userId, 
            'deleted'
        );

        // Отправляем успешный статус 201 (Created)
        return res.sendStatus(201);
        
    } catch (e) {
        // В случае ошибки передаем ее в обработчик ошибок
        next(e);
    }
}

}

module.exports = new ConferenceFileController();