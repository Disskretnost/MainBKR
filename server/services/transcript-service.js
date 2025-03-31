// services/transcript-service.js
const Transcript = require('../models/Transcript');
const User = require('../models/User'); // Import the User model
const ApiError = require('../exceptions/apiError');
const TranscriptDTO = require('../dtos/transcript-dto'); // Import TranscriptDTO


class TranscriptService {
    // Create a new transcript
    async createTranscript(userId, conferenceId, message) {
      try {
        const transcript = await Transcript.create({
          userId: userId,
          conferenceId: conferenceId,
          message: message,
        });
        return new TranscriptDTO(transcript); // Return DTO
      } catch (error) {
        console.error(error);
        throw error;
      }
    }
  
  
    async getTranscriptsForConference(conferenceId) {
      try {
        const transcripts = await Transcript.findAll({
          where: { conferenceId: conferenceId },
          order: [['timestamp', 'ASC']], // Sort by timestamp in ascending order
          // No include here
        });
  
        return transcripts.map(transcript => new TranscriptDTO(transcript)); // Map to DTOs
  
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
          
          if (result === 0) {
            throw ApiError.NotFound('No transcripts found for this conference');
          }
          
          return { success: true, deletedCount: result };
        } catch (error) {
          console.error(error);
          throw error;
        }
      }
  }
  
  module.exports = new TranscriptService();