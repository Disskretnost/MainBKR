
class TranscriptDTO {
    constructor(transcript) {
        this.id = transcript.id;
        this.userId = transcript.userId;
        this.conferenceId = transcript.conferenceId;
        this.message = transcript.message;
        this.timestamp = transcript.timestamp;
        this.username = transcript.user.username;
    }
}

module.exports = TranscriptDTO;