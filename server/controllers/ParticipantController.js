const participantService = require('../services/ParticipantService');

class ParticipantController {

  async getAllParticipants(req, res, next) {
    try {
      const participants = await participantService.getAllParticipants();
      return res.status(200).json(participants);
    } catch (e) {
      next(e);
    }
  }

  async getOnlineParticipants(req, res, next) {
    try {
      const { conferenceId } = req.params;
      const participants = await participantService.getOnlineParticipants(conferenceId);
      return res.status(200).json(participants);
    } catch (e) {
      next(e);
    }
  }
}

module.exports = new ParticipantController();
