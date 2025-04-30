const conferenceService = require('../services/conference-service');
const ApiError = require('./../exceptions/apiError'); 
const crypto = require('crypto'); 


class ConferenceController {
  async createConference(req, res, next) {
    try {
      const { ownerId } = req.body; 
      console.log(req.body);
      const accessCode = crypto.randomBytes(8).toString('hex'); 
      const conferenceData = await conferenceService.createConference(ownerId, accessCode);
      return res.status(201).json(conferenceData);
    } catch (e) {
      next(e);
    }
  }

  async getConferenceByAccessCode(req, res, next) {
    try {
      const { accessCode } = req.body;  
      const conferenceData = await conferenceService.getConferenceByAccessCode(accessCode);
      return res.status(200).json(conferenceData);
    } catch (e) {
      next(e);
    }
  }

}

module.exports = new ConferenceController();