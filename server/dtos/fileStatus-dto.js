class FileStatusDTO {
    constructor(model) {
      this.userId = model.userId;
      this.fileId = model.fileId;
      this.status = model.status;
      this.changedAt = model.changedAt;
    }
  }
  
  module.exports = FileStatusDTO;