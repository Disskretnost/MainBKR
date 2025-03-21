import $api from "../http";

export default class RoomService {
  // Создание комнаты
  static async createConference(ownerId) {
    try {
      const response = await $api.post('/createRoom', { ownerId }); // Изменен путь

      if (response.status === 201) { // 201 Created
        return response.data; // Возвращаем данные созданной комнаты (включая accessCode)
      } else {
        throw new Error('Ошибка при создании комнаты');
      }
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Произошла ошибка при создании комнаты. Попробуйте снова.');
    }
  }

  // Получение комнаты по accessCode
  static async getConferenceByAccessCode(accessCode) {
    try {
      const response = await $api.post('/enterRoom', { accessCode }); // Изменен путь и метод (теперь POST)

      if (response.status === 200) {
        return response.data; // Возвращаем данные комнаты
      } else {
        throw new Error('Комната не найдена');
      }
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Произошла ошибка при получении комнаты. Проверьте код доступа.');
    }
  }

}