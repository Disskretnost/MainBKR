import io from 'socket.io-client';
import { Device } from 'mediasoup-client';

export default class VideoConferenceManager {
  constructor(roomName, accessCode, id, callbacks) {
    this.roomName = roomName;
    this.accessCode = accessCode;
    this.callbacks = callbacks;
    this.id = id;
    this.recognition = null;
    this.initSpeechRecognition();
    this.device = null;
    this.rtpCapabilities = null;
    this.producerTransport = null;
    this.consumerTransports = [];
    this.audioProducer = null;
    this.videoProducer = null;
    this.socket = null;
    this.socketId = null;
    this.consumingTransports = [];
    
    this.params = {
      encodings: [
        { rid: 'r0', maxBitrate: 100000, scalabilityMode: 'S1T3' },
        { rid: 'r1', maxBitrate: 300000, scalabilityMode: 'S1T3' },
        { rid: 'r2', maxBitrate: 900000, scalabilityMode: 'S1T3' }
      ],
      codecOptions: {
        videoGoogleStartBitrate: 1000
      }
    };
  }

  async initialize() {
    const WEBSOCKET_URL = process.env.REACT_APP_WEBSOCKET_URL || 'wss://kucherenkoaleksanr.ru/mediasoup';
    this.socket = io(WEBSOCKET_URL);


    this.socket.on('connection-success', ({ socketId }) => {
      this.socketId = socketId;
      this.callbacks.onSocketId(socketId);
      this.getLocalStream();
    });

    this.socket.on('new-producer', ({ producerId,id }) => this.signalNewConsumerTransport(producerId, id));

    this.socket.on('producer-closed', ({ remoteProducerId }) => {
      this.handleProducerClosed(remoteProducerId);
    });
  }

  initSpeechRecognition() {
    if (!('webkitSpeechRecognition' in window)) {
      console.warn('Браузер не поддерживает распознавание голоса');
      return;
    }
  
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    this.recognition = new SpeechRecognition();
    this.recognition.continuous = true;
    this.recognition.interimResults = false;
    this.recognition.lang = 'ru-RU';
  
    this.recognition.onresult = (event) => {
      let finalTranscript = '';
  
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        }
      }
  
      if (finalTranscript && this.socket) {
        // Отправка через существующий сокет-канал
        this.socket.emit('newMessage', {
          userId: this.id,
          roomId: this.roomName,
          text: finalTranscript,
          isSpeech: true 
        });
      }
    };
  
    this.recognition.onerror = (event) => {
      console.error('Ошибка распознавания:', event.error);
    };
  
    this.recognition.onstart = () => {
      console.log("Распознавание речи запущено");
    };
  
    this.recognition.onend = () => {
      console.log("Распознавание завершено, перезапуск...");
      this.recognition.start();
    };
  
    this.recognition.start();
  }

  async getLocalStream() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: { width: { min: 640, max: 1920 }, height: { min: 400, max: 1080 } }
      });
      this.streamSuccess(stream);
    } catch (error) {
      console.error('Error getting user media:', error);
      this.callbacks.onError('Не удалось получить доступ к камере/микрофону');
    }
  }

  streamSuccess(stream) {
    const audioParams = { track: stream.getAudioTracks()[0] };
    const videoParams = { track: stream.getVideoTracks()[0], params: this.params };
    
    this.callbacks.onLocalStream(stream, this.socketId);
    this.joinRoom(audioParams, videoParams);
  }

  joinRoom(audioParams, videoParams) {
    this.socket.emit('joinRoom', { roomName: this.roomName, id: this.id }, (data) => {
      this.rtpCapabilities = data.rtpCapabilities;
      this.createDevice(audioParams, videoParams);
    });
  }

  async createDevice(audioParams, videoParams) {
    try {
      this.device = new Device();
      await this.device.load({ routerRtpCapabilities: this.rtpCapabilities });
      this.createSendTransport(audioParams, videoParams);
    } catch (error) {
      console.error('Device creation error:', error);
      if (error.name === 'UnsupportedError') {
        this.callbacks.onError('Ваш браузер не поддерживается');
      }
    }
  }

  createSendTransport(audioParams, videoParams) {
    this.socket.emit('createWebRtcTransport', { consumer: false }, ({ params }) => {
      if (params.error) {
        console.error(params.error);
        this.callbacks.onError('Ошибка создания транспорта');
        return;
      }

      this.producerTransport = this.device.createSendTransport(params);
      
      this.producerTransport.on('connect', async ({ dtlsParameters }, callback, errback) => {
        try {
          await this.socket.emit('transport-connect', { dtlsParameters });
          callback();
        } catch (error) {
          errback(error);
        }
      });

      this.producerTransport.on('produce', async (parameters, callback, errback) => {
        try {
          await this.socket.emit(
            'transport-produce',
            {
              kind: parameters.kind,
              rtpParameters: parameters.rtpParameters,
              appData: parameters.appData,
              id: this.id
            },
            ({ id, producersExist }) => {
              callback({ id });
              if (producersExist) this.getProducers();
            }
          );
        } catch (error) {
          errback(error);
        }
      });

      this.connectSendTransport(audioParams, videoParams);
    });
  }

  async connectSendTransport(audioParams, videoParams) {
    try {
      this.audioProducer = await this.producerTransport.produce(audioParams);
      this.videoProducer = await this.producerTransport.produce(videoParams);

      this.audioProducer.on('trackended', () => this.callbacks.onTrackEnded('audio'));
      this.audioProducer.on('transportclose', () => this.callbacks.onTransportClose('audio'));
      this.videoProducer.on('trackended', () => this.callbacks.onTrackEnded('video'));
      this.videoProducer.on('transportclose', () => this.callbacks.onTransportClose('video'));

    } catch (error) {
      console.error('Error connecting send transport:', error);
      this.callbacks.onError('Ошибка подключения медиапотоков');
    }
  }

  async signalNewConsumerTransport(remoteProducerId, clientId) {
    console.log("Пизда",clientId)
    if (this.consumingTransports.includes(remoteProducerId)) return;

    this.consumingTransports.push(remoteProducerId);

    await this.socket.emit('createWebRtcTransport', { consumer: true }, ({ params }) => {
      if (params.error) {
        console.error(params.error);
        return;
      }

      let consumerTransport;
      try {
        consumerTransport = this.device.createRecvTransport(params);
      } catch (error) {
        console.error(error);
        return;
      }

      consumerTransport.on('connect', async ({ dtlsParameters }, callback, errback) => {
        try {
          await this.socket.emit('transport-recv-connect', {
            dtlsParameters,
            serverConsumerTransportId: params.id
          });
          callback();
        } catch (error) {
          errback(error);
        }
      });

      this.connectRecvTransport(consumerTransport, remoteProducerId, params.id);
    });
  }

  getProducers() {
    this.socket.emit('getProducers', (producerInfoList) => { // Ожидаем массив объектов
  
      producerInfoList.forEach(info => {
        this.signalNewConsumerTransport(info.producerId, info.clientId); // Передаём producerId и clientId
      });
    });
  }

  async connectRecvTransport(consumerTransport, remoteProducerId, serverConsumerTransportId) {
    await this.socket.emit(
      'consume',
      {
        rtpCapabilities: this.device.rtpCapabilities,
        remoteProducerId,
        serverConsumerTransportId
      },
      async ({ params }) => {
        if (params.error) {
          console.error('Не удается потреблять:', params.error);
          return;
        }

        try {
          const consumer = await consumerTransport.consume({
            id: params.id,
            producerId: params.producerId,
            kind: params.kind,
            rtpParameters: params.rtpParameters
          });

          this.consumerTransports.push({
            consumerTransport,
            serverConsumerTransportId: params.id,
            producerId: remoteProducerId,
            consumer
          });

          const { track } = consumer;
          this.callbacks.onRemoteStream(
            new MediaStream([track]), 
            remoteProducerId, 
            params.kind
          );

          this.socket.emit('consumer-resume', { serverConsumerId: params.serverConsumerId });
        } catch (error) {
          console.error('Ошибка при подключении получателя:', error);
        }
      }
    );
  }

  handleProducerClosed(remoteProducerId) {
    const producerToClose = this.consumerTransports.find(
      transportData => transportData.producerId === remoteProducerId
    );
    
    if (producerToClose) {
      producerToClose.consumerTransport.close();
      producerToClose.consumer.close();
    }
    
    this.consumerTransports = this.consumerTransports.filter(
      transportData => transportData.producerId !== remoteProducerId
    );
    
    this.callbacks.onRemoteStreamEnded(remoteProducerId);
  }

  cleanup() {
    if (this.socket) {
      this.socket.disconnect();
    }
    
    if (this.producerTransport) {
      this.producerTransport.close();
    }
    
    this.consumerTransports.forEach(transportData => {
      transportData.consumerTransport.close();
      transportData.consumer.close();
    });
    
    this.callbacks.onCleanup();
  }
}