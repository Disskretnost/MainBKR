
const Conference = require('../models/Conference'); 
const  User  = require('../models/User'); 
const ApiError = require('../exceptions/apiError'); 
const ConferenceDTO = require('../dtos/room-dto'); 



class ConferenceService {

  async createConference(ownerId, accessCode) {
    try {
      const conference = await Conference.create({
        ownerId: ownerId,
        accessCode: accessCode
      });
      const conferenceDto = new ConferenceDTO(conference);
      return conferenceDto;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async getConferenceByAccessCode(accessCode) {
    const conference = await Conference.findOne({ where: { accessCode } });

    if (!conference) {
      throw ApiError.NotFound('Комната с таким кодом доступа не найдена.');
    }

    const conferenceDto = new ConferenceDTO(conference);
    return conferenceDto;
  }

  async deleteConference(id) {
    const conference = await Conference.findByPk(id); 

    if (!conference) {
      throw ApiError.NotFound('Комната не найдена');
    }
    await conference.destroy(); 
  }
}

module.exports = new ConferenceService();