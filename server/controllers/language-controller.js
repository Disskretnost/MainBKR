const languageService = require('../services/language-service');

class LanguageController {
  async getLanguages(req, res, next) {
    try {
      const userId = req.user.id;
      const languages = await languageService.getLanguages(userId);
      res.json(languages);
    } catch (e) {
      next(e);
    }
  }

  async addLanguage(req, res, next) {
    try {
      const userId = req.user.id;
      const { language } = req.body;
      const newLang = await languageService.addLanguage(userId, language);
      res.status(201).json(newLang);
    } catch (e) {
      next(e);
    }
  }

  async removeLanguage(req, res, next) {
    try {
      const userId = req.user.id;
      const { language } = req.params;
      const result = await languageService.removeLanguage(userId, language);
      res.json(result);
    } catch (e) {
      next(e);
    }
  }

  async changePrimaryLanguage(req, res, next) {
    try {
      const userId = req.user.id;
      const { language } = req.body;
      const result = await languageService.changePrimaryLanguage(userId, language);
      res.json(result);
    } catch (e) {
      next(e);
    }
  }
}

module.exports = new LanguageController();
