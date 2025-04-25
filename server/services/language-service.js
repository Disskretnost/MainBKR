const Language = require('../models/Language.js');
const ApiError = require('../exceptions/apiError');
const LanguageDTO = require('../dtos/language-dto.js');  // Используем DTO

class LanguageService {
    // Получение всех языков пользователя с использованием DTO
    async getLanguages(userId) {
        const langs = await Language.findAll({ where: { userId } });
        return langs.map(lang => new LanguageDTO(lang));  // Возвращаем каждый язык в виде DTO
    }

    // Добавление языка с использованием DTO
    async addLanguage(userId, language) {
        const exists = await Language.findOne({ where: { userId, language } });
        if (exists) throw ApiError.BadRequest('Этот язык уже добавлен');
    
        const count = await Language.count({ where: { userId } });
        const isPrimary = count === 0;
    
        const newLang = await Language.create({ userId, language, isPrimary });
        const languages = await this.getLanguages(userId);  // Получаем актуальный список языков
        return languages.map(lang => new LanguageDTO(lang));  // Возвращаем список языков в виде DTO
    }
  
    // Удаление языка с использованием DTO
    async removeLanguage(userId, language) {
        const deleted = await Language.destroy({ where: { userId, language } });
        if (!deleted) throw ApiError.NotFound('Язык не найден');
        
        const languages = await this.getLanguages(userId);  // Получаем актуальный список языков
        return languages.map(lang => new LanguageDTO(lang));  // Возвращаем список языков в виде DTO
    }

    // Метод для изменения главного языка с использованием DTO
    async changePrimaryLanguage(userId, language) {
        // Сначала находим все языки пользователя
        const userLanguages = await Language.findAll({ where: { userId } });
    
        // Если выбранный язык не существует
        const selectedLanguage = userLanguages.find(lang => lang.language === language);
        if (!selectedLanguage) throw ApiError.NotFound('Язык не найден');
    
        // Если выбранный язык уже является главным, ничего не меняем
        if (selectedLanguage.isPrimary) throw ApiError.BadRequest('Этот язык уже главный');
    
        // Обновляем текущий главный язык (если он есть)
        const currentPrimaryLanguage = userLanguages.find(lang => lang.isPrimary);
        if (currentPrimaryLanguage) {
            await currentPrimaryLanguage.update({ isPrimary: false });
        }
    
        // Устанавливаем новый главный язык
        await selectedLanguage.update({ isPrimary: true });
    
        const languages = await this.getLanguages(userId);  // Получаем актуальный список языков
        return languages.map(lang => new LanguageDTO(lang));  // Возвращаем список языков в виде DTO
    }
}

module.exports = new LanguageService();
