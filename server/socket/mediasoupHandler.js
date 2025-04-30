
const mediasoup = require('mediasoup');
const { v4: uuidv4 } = require('uuid');
const participantService = require('../services/ParticipantService');
const path = require('path');
const fs = require('fs'); 
const officegen = require('officegen');
const transcriptService = require('./../services/transcript-service');
const ConferenceFileService = require('../services/conferenceFile-service');


let worker;
let rooms = {};
let peers = {};
let transports = [];
let producers = [];
let consumers = [];
const socketToUserMap = new Map(); // { socketId -> { userId, roomName } } //костыль между промежуточными данными и бд

const mediaCodecs = [
  {
    kind: 'audio',
    mimeType: 'audio/opus',
    clockRate: 48000,
    channels: 2,
  },
  {
    kind: 'video',
    mimeType: 'video/VP8',
    clockRate: 90000,
    parameters: {
      'x-google-start-bitrate': 1000,
    },
  },
];

const createWorker = async () => {
  worker = await mediasoup.createWorker({
    rtcMinPort: 2000,
    rtcMaxPort: 2020,
  });
  console.log(`worker pid ${worker.pid}`);

  worker.on('died', error => {
    console.error('mediasoup worker has died');
    setTimeout(() => process.exit(1), 2000);
  });

  return worker;
};

const createWebRtcTransport = async (router) => {
  return new Promise(async (resolve, reject) => {
    try {
      const webRtcTransport_options = {
        listenIps: [
          {
            ip: '0.0.0.0',
            announcedIp: process.env.MEDIA_SERVER,
          }
        ],
        enableUdp: true,
        enableTcp: true,
        preferUdp: true,
        iceServers: [
          {
            urls: 'stun:stun.l.google.com:19302'
          },
          {
            urls: 'turn:relay1.expressturn.com:3478',
            username: 'efY1N8CC9QW4SWCLD9',
            credential: 'JiQ8WC2gbyA4G3Ja'
          }
        ]
      };

      let transport = await router.createWebRtcTransport(webRtcTransport_options);
      console.log(`transport id: ${transport.id}`);

      transport.on('dtlsstatechange', dtlsState => {
        if (dtlsState === 'closed') {
          transport.close();
        }
      });

      transport.on('close', () => {
        console.log('transport closed');
      });

      resolve(transport);
    } catch (error) {
      reject(error);
    }
  });
};

const createRoom = async (roomName, socketId) => {
  let router;
  let peersList = [];
  
  if (rooms[roomName]) {
    router = rooms[roomName].router;
    peersList = rooms[roomName].peers || [];
  } else {
    router = await worker.createRouter({ mediaCodecs });
  }
  
  console.log(`Router ID: ${router.id}`, peersList.length);

  rooms[roomName] = {
    router,
    peers: [...peersList, socketId],
  };

  return router;
};

const addTransport = (socketId, transport, roomName, consumer) => {
  transports = [
    ...transports,
    { socketId, transport, roomName, consumer }
  ];

  peers[socketId] = {
    ...peers[socketId],
    transports: [
      ...peers[socketId].transports,
      transport.id,
    ]
  };
};

const addProducer = (socketId, producer, roomName) => {
  producers = [
    ...producers,
    { socketId, producer, roomName }
  ];

  peers[socketId] = {
    ...peers[socketId],
    producers: [
      ...peers[socketId].producers,
      producer.id,
    ]
  };
};

const addConsumer = (socketId, consumer, roomName) => {
  consumers = [
    ...consumers,
    { socketId, consumer, roomName }
  ];

  peers[socketId] = {
    ...peers[socketId],
    consumers: [
      ...peers[socketId].consumers,
      consumer.id,
    ]
  };
};

const getTransport = (socketId) => {
  const [producerTransport] = transports.filter(
    transport => transport.socketId === socketId && !transport.consumer
  );
  return producerTransport.transport;
};

const informConsumers = (roomName, socketId, producerid, id) => {
  console.log(`just joined, id ${producerid} ${roomName}, ${socketId}`);
  producers.forEach(producerData => {
    if (producerData.socketId !== socketId && producerData.roomName === roomName) {
      const producerSocket = peers[producerData.socketId].socket;
      producerSocket.emit('new-producer', { producerId: producerid, id: id });
    }
  });
};

const removeItems = (items, socketId, type) => {
  items.forEach(item => {
    if (item.socketId === socketId) {
      item[type].close();
    }
  });
  return items.filter(item => item.socketId !== socketId);
};

const cleanupPeer = (socketId) => {
  if (!peers[socketId]) return;

  const { roomName } = peers[socketId];
  
  consumers = removeItems(consumers, socketId, 'consumer');
  producers = removeItems(producers, socketId, 'producer');
  transports = removeItems(transports, socketId, 'transport');
  
  delete peers[socketId];

  if (rooms[roomName]) {
    rooms[roomName].peers = rooms[roomName].peers.filter(id => id !== socketId);
    
    if (rooms[roomName].peers.length === 0) {
      console.log(`Room ${roomName} is now empty, closing router`);
      rooms[roomName].router.close();
      delete rooms[roomName];
    }
  }
};

const getProducersList = (socketId) => {
  const { roomName } = peers[socketId];
  let producerList = [];

  producers.forEach(producerData => {
    if (producerData.socketId !== socketId && producerData.roomName === roomName) {
      const userInfo = socketToUserMap.get(producerData.socketId);
      console.log(userInfo)

      if (userInfo) {
        producerList = [...producerList, { producerId: producerData.producer.id, clientId: userInfo.id}]; 
      } else {
        console.warn(`Не найден userId для socketId: ${producerData.socketId}`);

      }
    }
  });

  return producerList;
};

const initializeSocketHandlers = (io) => {

  worker = createWorker();

  const connections = io.of('/mediasoup');

  connections.on('connection', async (socket) => {
    console.log('New connection:', socket.id);
    socket.emit('connection-success', { socketId: socket.id });

    socket.on('joinRoom', async ({ roomName, id }, callback) => {
      socket.join(roomName);
      const router = await createRoom(roomName, socket.id);
      const participant = await participantService.addParticipant(roomName, id);
      socketToUserMap.set(socket.id, { id, roomName });
      console.log(participant);
      peers[socket.id] = {
        socket,
        roomName,
        transports: [],
        producers: [],
        consumers: [],
        peerDetails: {
          name: '',
          isAdmin: false,
        }
      };

      const rtpCapabilities = router.rtpCapabilities;
      callback({ rtpCapabilities });
    });

    socket.on('createWebRtcTransport', async ({ consumer }, callback) => {
      const roomName = peers[socket.id].roomName;
      const router = rooms[roomName].router;

      createWebRtcTransport(router).then(
        transport => {
          callback({
            params: {
              id: transport.id,
              iceParameters: transport.iceParameters,
              iceCandidates: transport.iceCandidates,
              dtlsParameters: transport.dtlsParameters,
            }
          });
          addTransport(socket.id, transport, roomName, consumer);
        },
        error => {
          console.log(error);
        });
    });

    socket.on('transport-connect', ({ dtlsParameters }) => {
      console.log('DTLS PARAMS... ', { dtlsParameters });
      getTransport(socket.id).connect({ dtlsParameters });
    });

    socket.on('transport-produce', async ({ kind, rtpParameters,id }, callback) => {
      try {
        const producer = await getTransport(socket.id).produce({
          kind,
          rtpParameters,
        });

        const { roomName } = peers[socket.id];
        addProducer(socket.id, producer, roomName);
        informConsumers(roomName, socket.id, producer.id, id);

        console.log('Producer ID: ', producer.id, producer.kind);

        producer.on('transportclose', () => {
          console.log('transport for this producer closed');
          producer.close();
        });

        callback({
          id: producer.id,
          producersExist: producers.length > 1
        });
      } catch (error) {
        console.error('Error in transport-produce:', error);
        callback({ error: error.message });
      }
    });

    socket.on('getProducers', callback => {
      callback(getProducersList(socket.id));
    });

    socket.on('transport-recv-connect', async ({ dtlsParameters, serverConsumerTransportId }) => {
      console.log(`DTLS PARAMS: ${dtlsParameters}`);
      const consumerTransport = transports.find(transportData => (
        transportData.consumer && transportData.transport.id == serverConsumerTransportId
      )).transport;
      await consumerTransport.connect({ dtlsParameters });
    });

    socket.on('consume', async ({ rtpCapabilities, remoteProducerId, serverConsumerTransportId }, callback) => {
      try {
        const { roomName } = peers[socket.id];
        const router = rooms[roomName].router;
        let consumerTransport = transports.find(transportData => (
          transportData.consumer && transportData.transport.id == serverConsumerTransportId
        )).transport;

        if (router.canConsume({
          producerId: remoteProducerId,
          rtpCapabilities
        })) {
          const consumer = await consumerTransport.consume({
            producerId: remoteProducerId,
            rtpCapabilities,
            paused: true,
          });

          consumer.on('transportclose', () => {
            console.log('transport close from consumer');
          });

          consumer.on('producerclose', () => {
            console.log('producer of consumer closed');
            socket.emit('producer-closed', { remoteProducerId });

            consumerTransport.close([]);
            transports = transports.filter(transportData => transportData.transport.id !== consumerTransport.id);
            consumer.close();
            consumers = consumers.filter(consumerData => consumerData.consumer.id !== consumer.id);
          });

          addConsumer(socket.id, consumer, roomName);

          callback({
            params: {
              id: consumer.id,
              producerId: remoteProducerId,
              kind: consumer.kind,
              rtpParameters: consumer.rtpParameters,
              serverConsumerId: consumer.id,
            }
          });
        }
      } catch (error) {
        console.log(error.message);
        callback({
          params: {
            error: error
          }
        });
      }
    });

    socket.on('consumer-resume', async ({ serverConsumerId }) => {
      console.log('consumer resume');
      const { consumer } = consumers.find(consumerData => consumerData.consumer.id === serverConsumerId);
      await consumer.resume();
    });

    socket.on('disconnect', async () => {
      const userData = socketToUserMap.get(socket.id);
        
      console.log(`User disconnecting:`, userData);

      await participantService.deactivateParticipant(
        userData.roomName,
        userData.id
      );

      const onlineParticipants = await participantService.getOnlineParticipants(userData.roomName);
      console.log(onlineParticipants);

      socketToUserMap.delete(socket.id);
      cleanupPeer(socket.id);
    
      if (onlineParticipants.length === 0) {
        try {
          const transcripts = await transcriptService.getTranscriptsForConference(userData.roomName);
          let docx = officegen('docx');
          
          let lastUserId = null;
          let currentParagraph = null;
          
          for (const transcript of transcripts) {
           
            if (transcript.userId !== lastUserId) {
              currentParagraph = docx.createP();
              currentParagraph.addText(`${transcript.username}: `, { font_size: 12, bold: true });
              lastUserId = transcript.userId;
            }

            currentParagraph.addText(transcript.message + '. ', { font_size: 12 });
          }
    
          const timestamp = Date.now();
          const filename = `document_${userData.roomName}_${timestamp}.docx`;
          const outputPath = path.join(__dirname, '..', '..', 'chat_storage', filename);
    
          const out = fs.createWriteStream(outputPath);
          docx.generate(out);
          await ConferenceFileService.addFileToConference(
            userData.roomName, 
            filename,
            outputPath
          );
          await ConferenceFileService.setFileStatusForAll(userData.roomName, 'visible');
          await transcriptService.deleteTranscriptsForConference(userData.roomName);

          out.on('close', async () => {
            console.log(`Файл ${filename} успешно сохранен и записан в БД`);
          });
    
        } catch (error) {
          console.error('Error generating Word document from database:', error);
        }
      } else {
        console.log(`Room ${userData.roomName} still has online participants.`);
      }
    });


    socket.on('newMessage', async (messageData) => {
      try {
        const { roomId, userId, text, lang3 } = messageData;
        
        
        console.log(messageData);
        const userData = socketToUserMap.get(socket.id);
        if (!userData) return;
      
        const { roomName } = userData;
        connections.to(roomName).emit('subtitles', {
          userId,
          text,
          lang3
        });
        console.log(`Отправляю в комнату: ${roomName}`);
        
        const transcript = await transcriptService.createTranscript(userId, roomId, text);
      } catch (error) {
        console.error('Ошибка обработки сообщения:', error);
      }
    });

  socket.on('sendMessage', ({ username, text }) => {
    const userData = socketToUserMap.get(socket.id);
    if (!userData) return;
  
    const { roomName } = userData;
  
    console.log('Список комнат:', connections.adapter.rooms); // <--- вот так!
    console.log('Клиенты в комнате:', connections.adapter.rooms.get(roomName));
    console.log(`Отправляю в комнату: ${roomName}`);
  
    connections.to(roomName).emit('message', {
      username,
      text,
      timestamp: Date.now()
    });
  });
  
  
    
    
  });
};

module.exports = {
  initializeSocketHandlers,
};