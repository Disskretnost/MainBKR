// src/services/ConferenceFileService.js
import $api from "../http";  // Подключаем axios экземпляр
import fileDownload from 'js-file-download';

class ConferenceFileService {
  static async getConferenceFile(conferenceId) {
    try {
      const response = await $api.get(`/getconferenceFile/${conferenceId}`);
      if (response.status === 200 && response.data) {
        console.log('Полученные данные о файле:', response.data);
        return response.data;
      } else {
        console.error('Ошибка при получении файла для конференции: Статус ответа не 200');
      }
    } catch (error) {
      console.error('Ошибка при получении файла:', error.response?.data?.message || 'Произошла ошибка при получении файла. Попробуйте снова.');
    }
  }

  static async downloadConferenceFile(fileId, filename) {
    try {
      // Делает GET запрос к API для получения файла
      const response = await $api.get(`/download/${fileId}`, { responseType: 'blob' });
      
      if (response.status === 200 && response.data) {
        // Если файл получен успешно, инициируем его загрузку
        fileDownload(response.data, filename);
      } else {
        console.error('Ошибка при скачивании файла: Статус ответа не 200');
      }
    } catch (error) {
      console.error('Ошибка при скачивании файла:', error.response?.data?.message || 'Произошла ошибка при скачивании файла. Попробуйте снова.');
    }
  }
}

// Экспортируем сервис как default
export default ConferenceFileService;
