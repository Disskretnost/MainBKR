class ConferenceFileDTO {
    constructor(model) {
      this.id = model.id;
      this.conferenceId = model.conferenceId;
      this.filename = model.filename;
      this.filepath = model.filepath;
      // Добавьте другие поля, если они есть в модели
    }
  }
  
  module.exports = ConferenceFileDTO;