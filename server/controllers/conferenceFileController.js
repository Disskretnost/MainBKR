const conferenceFileService = require('../services/conferenceFile-service');

class ConferenceFileController {
 
  async getAllFiles(req, res, next) {
    try {
      const { id } = req.params;
      const files = await conferenceFileService.getAllFiles(id);
      return res.status(200).json(files);
    } catch (e) {
      next(e);
    }
  }
  async downloadFile(req, res, next) {
    try {
      const { id } = req.params;
      const fileDTO = await conferenceFileService.getFileForDownload(id);
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
        await conferenceFileService.setFileStatusDeleted(
            fileId, 
            userId, 
            'deleted'
        );
        return res.sendStatus(201);
        
    } catch (e) {
        next(e);
    }
}

}

module.exports = new ConferenceFileController();