// services/participant-service.js
const Participant = require('../models/Participant');
const User = require('../models/User');
const Conference = require('../models/Conference');
const ApiError = require('../exceptions/apiError');
const ParticipantDTO = require('../dtos/participant-dto'); // Предполагается, что у вас есть DTO

class ParticipantService {
  async addParticipant(conferenceId, userId) {
    try {
      const participant = await Participant.create({ conferenceId, userId });
      return new ParticipantDTO(participant);
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
  
  async deactivateParticipant(conferenceId, userId) {
    try {
      const participant = await Participant.findOne({ where: { conferenceId, userId } });

      await participant.update({ isOnline: false });
      return true;
    } catch (error) {
      console.error('Deactivate error:', error);
      throw error;
    }
  }
}

module.exports = new ParticipantService();