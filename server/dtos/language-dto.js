class LanguageDTO {
    constructor(model) {
      this.userId = model.userId;
      this.language = model.language;
      this.isPrimary = model.isPrimary;
      this.createdAt = model.createdAt;
      this.updatedAt = model.updatedAt;
    }
  }
  
  module.exports = LanguageDTO;
  