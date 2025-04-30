
import { franc } from 'franc';

export default class SpeechRecognitionManager {
  constructor({ socket, userId, roomId }) {
    this.socket = socket;
    this.userId = userId;
    this.roomId = roomId;

    this.supported = false;
    this.recognition = null;

    this._init();
  }

  _init() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      console.warn('Браузер не поддерживает SpeechRecognition');
      return;
    }

    this.supported = true;
    this.recognition = new SpeechRecognition();

    this.recognition.continuous = true;
    this.recognition.interimResults = false;
    this.recognition.lang = 'ru-RU';  

    this.recognition.onresult = this._handleResult.bind(this);
    this.recognition.onerror = this._handleError.bind(this);
    this.recognition.onstart = () => console.log('🎙️ Распознавание речи запущено');
    this.recognition.onend = () => {
      console.log('🔁 Распознавание завершено, перезапуск...');
      this.start(); 
    };
  }

  _handleResult(event) {
    let finalTranscript = '';
    for (let i = event.resultIndex; i < event.results.length; ++i) {
      if (event.results[i].isFinal) {
        finalTranscript += event.results[i][0].transcript;
      }
    }

    const whitelist = [
      'en', // Английский
      'zh', // Мандарин (китайский)
      'es', // Испанский
      'fr', // Французский
      'ar', // Арабский
      'pt', // Португальский
      'de', // Немецкий
      'ru', // Русский
      'ja', // Японский
      'hi'  // Хинди
    ];
    

    if (finalTranscript && this.socket) {
      let lang3 = franc(finalTranscript, { whitelist }); 

      if (lang3 === 'und') {
        console.warn('Не удалось определить язык');
      }
      this.socket.emit('newMessage', {
        userId: this.userId,
        roomId: this.roomId,
        text: finalTranscript,
        isSpeech: true,
        lang3, 
      });
    }
  }

  _handleError(event) {
    console.error('SpeechRecognition error:', event.error);
  }

  start() {
    if (this.supported) {
      try {
        this.recognition.start();
      } catch (e) {
        console.warn('Распознавание уже запущено или ошибка запуска');
      }
    }
  }

  stop() {
    if (this.supported && this.recognition) {
      this.recognition.stop();
    }
  }
}
