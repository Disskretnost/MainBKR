const Language = require('../models/Language.js');
const ApiError = require('../exceptions/apiError');
const LanguageDTO = require('../dtos/language-dto.js');  

class LanguageService {
   
    async getLanguages(userId) {
        const langs = await Language.findAll({ where: { userId } });
        return langs.map(lang => new LanguageDTO(lang));  
    }


    async addLanguage(userId, language) {
        const exists = await Language.findOne({ where: { userId, language } });
        if (exists) throw ApiError.BadRequest('Этот язык уже добавлен');
    
        const count = await Language.count({ where: { userId } });
        const isPrimary = count === 0;
    
        const newLang = await Language.create({ userId, language, isPrimary });
        const languages = await this.getLanguages(userId);  
        return languages.map(lang => new LanguageDTO(lang));  
    }

    async removeLanguage(userId, language) {
        const deleted = await Language.destroy({ where: { userId, language } });
        if (!deleted) throw ApiError.NotFound('Язык не найден');
        
        const languages = await this.getLanguages(userId);  
        return languages.map(lang => new LanguageDTO(lang));  
    }


    async changePrimaryLanguage(userId, language) {
        const userLanguages = await Language.findAll({ where: { userId } });
        const selectedLanguage = userLanguages.find(lang => lang.language === language);
        if (!selectedLanguage) throw ApiError.NotFound('Язык не найден');

        if (selectedLanguage.isPrimary) throw ApiError.BadRequest('Этот язык уже главный');

        const currentPrimaryLanguage = userLanguages.find(lang => lang.isPrimary);
        if (currentPrimaryLanguage) {
            await currentPrimaryLanguage.update({ isPrimary: false });
        }
        await selectedLanguage.update({ isPrimary: true });
    
        const languages = await this.getLanguages(userId);  
        return languages.map(lang => new LanguageDTO(lang));  
    }
}

module.exports = new LanguageService();
