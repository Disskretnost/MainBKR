
class ParticipantDTO {
    id;
    userId;
    conferenceId;
    joinedAt;

    constructor(participant) {
        this.id = participant.id;
        this.userId = participant.userId;
        this.conferenceId = participant.conferenceId;
        this.joinedAt = participant.joinedAt;
    }
}

module.exports = ParticipantDTO;