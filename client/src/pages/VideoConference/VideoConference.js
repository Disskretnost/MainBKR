import React, { useEffect } from 'react';
import io from 'socket.io-client';
import { Device } from 'mediasoup-client';

const socketIo = io('ws://kucherenkoaleksanr.ru/mediasoup');
const roomName = 'test1'; // Room name is hardcoded to 'test1'

let device;
let rtpCapabilities;
let producerTransport;
let consumerTransports = [];
let audioProducer;
let videoProducer;
let consumer;
let isProducer = false;

let params = {
  encodings: [
    { rid: 'r0', maxBitrate: 100000, scalabilityMode: 'S1T3' },
    { rid: 'r1', maxBitrate: 300000, scalabilityMode: 'S1T3' },
    { rid: 'r2', maxBitrate: 900000, scalabilityMode: 'S1T3' }
  ],
  codecOptions: {
    videoGoogleStartBitrate: 1000
  }
};

let audioParams;
let videoParams = { params };
let consumingTransports = [];

const App = () => {
  useEffect(() => {
    socketIo.on('connection-success', ({ socketId }) => {
      console.log(socketId);
      getLocalStream();
    });

    socketIo.on('new-producer', ({ producerId }) => signalNewConsumerTransport(producerId));

    socketIo.on('producer-closed', ({ remoteProducerId }) => {
      const producerToClose = consumerTransports.find(
        (transportData) => transportData.producerId === remoteProducerId
      );
      producerToClose.consumerTransport.close();
      producerToClose.consumer.close();
      consumerTransports = consumerTransports.filter(
        (transportData) => transportData.producerId !== remoteProducerId
      );
      const videoContainer = document.getElementById('videoContainer');
      videoContainer.removeChild(document.getElementById(`td-${remoteProducerId}`));
    });

    return () => {
      socketIo.off('connection-success');
      socketIo.off('new-producer');
      socketIo.off('producer-closed');
    };
  }, []);

  const getLocalStream = () => {
    navigator.mediaDevices
      .getUserMedia({
        audio: true,
        video: { width: { min: 640, max: 1920 }, height: { min: 400, max: 1080 } }
      })
      .then(streamSuccess)
      .catch((error) => {
        console.log(error.message);
      });
  };

  const streamSuccess = (stream) => {
    const localVideo = document.getElementById('localVideo');
    localVideo.srcObject = stream;

    audioParams = { track: stream.getAudioTracks()[0], ...audioParams };
    videoParams = { track: stream.getVideoTracks()[0], ...videoParams };

    joinRoom();
  };

  const joinRoom = () => {
    socketIo.emit('joinRoom', { roomName }, (data) => {
      console.log(`Router RTP Capabilities... ${data.rtpCapabilities}`);
      rtpCapabilities = data.rtpCapabilities;
      createDevice();
    });
  };

  const createDevice = async () => {
    try {
      device = new Device();
      await device.load({ routerRtpCapabilities: rtpCapabilities });
      console.log('Device RTP Capabilities', device.rtpCapabilities);
      createSendTransport();
    } catch (error) {
      console.log(error);
      if (error.name === 'UnsupportedError') {
        console.warn('browser not supported');
      }
    }
  };

  const createSendTransport = () => {
    socketIo.emit('createWebRtcTransport', { consumer: false }, ({ params }) => {
      if (params.error) {
        console.log(params.error);
        return;
      }

      console.log(params);
      producerTransport = device.createSendTransport(params);
      producerTransport.on('connect', async ({ dtlsParameters }, callback, errback) => {
        try {
          await socketIo.emit('transport-connect', { dtlsParameters });
          callback();
        } catch (error) {
          errback(error);
        }
      });

      producerTransport.on('produce', async (parameters, callback, errback) => {
        console.log(parameters);

        try {
          await socketIo.emit(
            'transport-produce',
            {
              kind: parameters.kind,
              rtpParameters: parameters.rtpParameters,
              appData: parameters.appData
            },
            ({ id, producersExist }) => {
              callback({ id });
              if (producersExist) getProducers();
            }
          );
        } catch (error) {
          errback(error);
        }
      });

      connectSendTransport();
    });
  };

  const connectSendTransport = async () => {
    audioProducer = await producerTransport.produce(audioParams);
    videoProducer = await producerTransport.produce(videoParams);

    audioProducer.on('trackended', () => {
      console.log('audio track ended');
    });

    audioProducer.on('transportclose', () => {
      console.log('audio transport ended');
    });

    videoProducer.on('trackended', () => {
      console.log('video track ended');
    });

    videoProducer.on('transportclose', () => {
      console.log('video transport ended');
    });
  };

  const signalNewConsumerTransport = async (remoteProducerId) => {
    if (consumingTransports.includes(remoteProducerId)) return;

    consumingTransports.push(remoteProducerId);

    await socketIo.emit('createWebRtcTransport', { consumer: true }, ({ params }) => {
      if (params.error) {
        console.log(params.error);
        return;
      }
      console.log(`PARAMS... ${params}`);

      let consumerTransport;
      try {
        consumerTransport = device.createRecvTransport(params);
      } catch (error) {
        console.log(error);
        return;
      }

      consumerTransport.on('connect', async ({ dtlsParameters }, callback, errback) => {
        try {
          await socketIo.emit('transport-recv-connect', {
            dtlsParameters,
            serverConsumerTransportId: params.id
          });
          callback();
        } catch (error) {
          errback(error);
        }
      });

      connectRecvTransport(consumerTransport, remoteProducerId, params.id);
    });
  };

  const getProducers = () => {
    socketIo.emit('getProducers', (producerIds) => {
      console.log(producerIds);
      producerIds.forEach(signalNewConsumerTransport);
    });
  };

  const connectRecvTransport = async (consumerTransport, remoteProducerId, serverConsumerTransportId) => {
    await socketIo.emit(
      'consume',
      {
        rtpCapabilities: device.rtpCapabilities,
        remoteProducerId,
        serverConsumerTransportId
      },
      async ({ params }) => {
        if (params.error) {
          console.log('Cannot Consume');
          return;
        }

        console.log(`Consumer Params ${params}`);
        const consumer = await consumerTransport.consume({
          id: params.id,
          producerId: params.producerId,
          kind: params.kind,
          rtpParameters: params.rtpParameters
        });

        consumerTransports = [
          ...consumerTransports,
          {
            consumerTransport,
            serverConsumerTransportId: params.id,
            producerId: remoteProducerId,
            consumer
          }
        ];

        const newElem = document.createElement('div');
        newElem.setAttribute('id', `td-${remoteProducerId}`);

        if (params.kind === 'audio') {
          newElem.innerHTML = `<audio id="${remoteProducerId}" autoplay></audio>`;
        } else {
          newElem.setAttribute('class', 'remoteVideo');
          newElem.innerHTML = `<video id="${remoteProducerId}" autoplay class="video"></video>`;
        }

        const videoContainer = document.getElementById('videoContainer');
        videoContainer.appendChild(newElem);
        const { track } = consumer;
        document.getElementById(remoteProducerId).srcObject = new MediaStream([track]);
        socketIo.emit('consumer-resume', { serverConsumerId: params.serverConsumerId });
      }
    );
  };

  return (
    <div id="video">
      <table className="mainTable">
        <tbody>
          <tr>
            <td className="localColumn">
              <video id="localVideo" autoPlay className="video" muted></video>
            </td>
            <td className="remoteColumn">
              <div id="videoContainer"></div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default App;
