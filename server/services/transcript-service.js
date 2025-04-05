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
          order: [['timestamp', 'ASC']], // Сортировка по времени
          include: [
            {
              model: User,
              attributes: ['username'], // Получаем только username
              required: false // LEFT JOIN (если у записи нет user, она всё равно попадёт в результат)
            }
          ],
          raw: true,
          nest: true // ← для корректного отображения вложенных моделей
        });
        console.log(transcripts);
  
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
          return { success: true, deletedCount: result };
        } catch (error) {
          console.error(error);
          throw error;
        }
      }
  }
  
  module.exports = new TranscriptService();