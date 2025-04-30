
const Participant = require('../models/Participant');
const User = require('../models/User');
const Conference = require('../models/Conference');
const ApiError = require('../exceptions/apiError');
const ParticipantDTO = require('../dtos/participant-dto'); 

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

  async getOnlineParticipants(conferenceId) {
    try {
      const participants = await Participant.findAll({
        where: {
          conferenceId,
          isOnline: true
        },
        attributes: ['id', 'userId', 'conferenceId', 'joinedAt'], 
        order: [['joinedAt', 'ASC']]
      });
      //console.log(participants)
      return participants.map(p => new ParticipantDTO(p));
    } catch (error) {
      console.error('Get online participants error:', error);
      throw ApiError.DatabaseError('Ошибка получения онлайн-участников');
    }
  }

  async getAllParticipants() {
    try {
      const participants = await Participant.findAll({
        attributes: ['id', 'userId', 'conferenceId', 'isOnline', 'joinedAt'],
        order: [['joinedAt', 'ASC']]
      });

      console.log('Все участники:', participants);
      return participants.map(p => new ParticipantDTO(p));
    } catch (error) {
      console.error('Get all participants error:', error);
      throw ApiError.DatabaseError('Ошибка получения всех участников');
    }
  }
}

module.exports = new ParticipantService();