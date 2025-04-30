// conference-dto.js
class ConferenceDTO {
    id;
    ownerId;
    accessCode;
    createdAt; 
    isActive;

    constructor(conference) {
        this.id = conference.id;
        this.ownerId = conference.ownerId;
        this.accessCode = conference.accessCode;
        this.createdAt = conference.createdAt; 
        this. isActive = conference.isActive; 
    }
}

module.exports = ConferenceDTO;