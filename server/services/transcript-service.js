
const Transcript = require('../models/Transcript');
const User = require('../models/User'); 
const ApiError = require('../exceptions/apiError');
const TranscriptDTO = require('../dtos/transcript-dto'); 


class TranscriptService {
    async createTranscript(userId, conferenceId, message) {
      try {
        await Transcript.create({
          userId,
          conferenceId,
          message,
          timestamp: new Date() 
      });
      } catch (error) {
        console.error(error);
        throw error;
      }
    }
  
  
    async getTranscriptsForConference(conferenceId) {
      try {
        const transcripts = await Transcript.findAll({
          where: { conferenceId: conferenceId },
          order: [['timestamp', 'ASC']], 
          include: [
            {
              model: User,
              attributes: ['username'], 
              required: false 
            }
          ],
          raw: true,
          nest: true 
        });
        console.log(transcripts);
  
        return transcripts.map(transcript => new TranscriptDTO(transcript)); 
  
      } catch (error) {
        console.error(error);
        throw error;
      }
    }
  
  
    async deleteTranscriptsForConference(conferenceId) {
        try {
          const result = await Transcript.destroy({
            where: { conferenceId: conferenceId }
          });
          return { success: true, deletedCount: result };
        } catch (error) {
          console.error(error);
          throw error;
        }
      }
  }
  
  module.exports = new TranscriptService();