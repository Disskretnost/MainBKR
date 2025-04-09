class ConferenceFileDTO {
  constructor(model) {
    this.conferenceId = model.conferenceId;
    this.filename = model.filename;
    this.filepath = model.filepath;
  }
}

module.exports = ConferenceFileDTO;