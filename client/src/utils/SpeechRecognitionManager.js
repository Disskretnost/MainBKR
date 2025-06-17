// src/utils/SpeechRecognitionManager.js
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
    this.recognition.lang = 'ru-RU';  // Вы можете изменить язык на другой по умолчанию

    this.recognition.onresult = this._handleResult.bind(this);
    this.recognition.onerror = this._handleError.bind(this);
    this.recognition.onstart = () => console.log('🎙️ Распознавание речи запущено');
    this.recognition.onend = () => {
      console.log('🔁 Распознавание завершено, перезапуск...');
      this.start(); // автоперезапуск
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
      'eng', // Английский
      'cmn', // Мандарин (китайский)
      'spa', // Испанский
      'fra', // Французский
      'ara', // Арабский
      'por', // Португальский
      'deu', // Немецкий
      'rus', // Русский
      'jpn', // Японский
      'hin'  // Хинди
    ];
    const whitelist2 = [
      'en', // для eng
      'zh', // для cmn
      'es', // для spa
      'fr', // для fra
      'ar', // для ara
      'pt', // для por
      'de', // для deu
      'ru', // для rus
      'ja', // для jpn
      'hi'  // для hin
    ];

    if (finalTranscript && this.socket) {
      // Определение языка с использованием franc и whitelist
      let lang3 = franc(finalTranscript, { whitelist }); // Определяем язык с учетом whitelist

      if (lang3 === 'und') {
        console.warn('Не удалось определить язык');
      }

      let lang2 = 'en'; // язык по умолчанию

      const index = whitelist.indexOf(lang3);
      if (index !== -1) {
        lang2 = whitelist2[index];
      } else {
        console.warn('Не удалось сопоставить язык:', lang3);
      }

      // Отправка сообщения с определённым языком
      this.socket.emit('newMessage', {
        userId: this.userId,
        roomId: this.roomId,
        text: finalTranscript,
        isSpeech: true,
        lang3: lang2
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
