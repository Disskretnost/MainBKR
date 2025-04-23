export default class SpeechRecognitionManager {
  constructor({ socket, userId, roomId }) {
    this.socket = socket;
    this.userId = userId;
    this.roomId = roomId;

    this.supported = false;

    // Строка, которую будем отправлять каждые 5 секунд
    this.textToSend = "Тестовое сообщение для отправки каждую 5 секунду";

    // Добавляем заглушку для метода stop
    this.stop = () => {
      console.log('Метод stop был вызван (заглушка)');
    };
    this.start = () => {
      console.log('Метод start был вызван (заглушка)');
    };

    this._startMessageSending();
  }

  // Метод для старта отправки сообщений каждую 5 секунду
  _startMessageSending() {
    // Отправка сообщения каждую 5 секунду
    setInterval(() => {
      this._sendMessage();
    }, 5000);
  }

  // Метод для отправки сообщения
  _sendMessage() {
    const lang3 = 'eng'; // Установим язык как английский (можно заменить на любой другой, если нужно)

    // Отправка сообщения через сокет
    if (this.socket) {
      this.socket.emit('newMessage', {
        userId: this.userId,
        roomId: this.roomId,
        text: this.textToSend,
        isSpeech: false,  // это не речь, а обычное сообщение
        lang3,  // Язык, определённый как 'eng' (английский)
      });
    }
  }
}
