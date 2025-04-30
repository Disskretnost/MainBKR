class ConferenceFileDTO {
    constructor(model) {
      this.id = model.id;
      this.conferenceId = model.conferenceId;
      this.filename = model.filename;
      this.filepath = model.filepath;
      this.createdAt = model.createdAt;
    }
  }
  
  module.exports = ConferenceFileDTO;


  