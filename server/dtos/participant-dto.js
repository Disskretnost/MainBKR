
class ParticipantDTO {
    id;
    userId;
    conferenceId;
    joinedAt;
    isOnline;

    constructor(participant) {
        this.id = participant.id;
        this.userId = participant.userId;
        this.conferenceId = participant.conferenceId;
        this.joinedAt = participant.joinedAt;
        this.isOnline = participant.isOnline; // Добавляем флаг онлайн-статуса
    }
}

module.exports = ParticipantDTO;