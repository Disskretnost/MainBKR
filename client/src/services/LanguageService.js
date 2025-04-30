import $api from "../http"; 

export default class LanguageService {

  static async getLanguages() {
    try {
      const response = await $api.get('/languages');  

      if (response.status === 200) {
        return response.data; 
      } else {
        throw new Error('Не удалось получить языки');
      }
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Произошла ошибка при получении языков. Попробуйте снова.');
    }
  }


  static async addLanguage(language) {
    try {
      const response = await $api.post('/languages', { language });  

      if (response.status === 201) {  
        return response.data;  
      } else {
        throw new Error('Ошибка при добавлении языка');
      }
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Произошла ошибка при добавлении языка. Попробуйте снова.');
    }
  }


  static async removeLanguage(language) {
    try {
      const response = await $api.delete(`/languages/${language}`);  

      if (response.status === 200) {
        return response.data;  
      } else {
        throw new Error('Ошибка при удалении языка');
      }
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Произошла ошибка при удалении языка. Попробуйте снова.');
    }
  }

  static async changePrimaryLanguage(language) {
    try {
      const response = await $api.post('/changePrimaryLanguage', { language });  

      if (response.status === 200) {
        return response.data;  
      } else {
        throw new Error('Ошибка при смене главного языка');
      }
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Произошла ошибка при смене главного языка. Попробуйте снова.');
    }
  }
}
