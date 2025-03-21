import React, { useEffect, useRef } from 'react';
import io from 'socket.io-client';
import { Device } from 'mediasoup-client';
import { useSelector } from 'react-redux'; // Import useSelector

//const roomName = 'test1'; // Room name is hardcoded to 'test1'

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

const VideoCall = () => {
  const socketRef = useRef(null); // Ref to hold the socket instance
  const roomName =  useSelector((state) => state.conference.id);
  const accessCode = useSelector((state) => state.conference.accessCode); // Get roomId from Redux store
  
  useEffect(() => {

    socketRef.current = io('ws://localhost/mediasoup');
    socketRef.current.on('connection-success', ({ socketId }) => {
      console.log(socketId);
      getLocalStream();
    });

    socketRef.current.on('new-producer', ({ producerId }) => signalNewConsumerTransport(producerId));

    socketRef.current.on('producer-closed', ({ remoteProducerId }) => {
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
      socketRef.current.off('connection-success');
      socketRef.current.off('new-producer');
      socketRef.current.off('producer-closed');
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
    console.log("Такое название комнаты", roomName)
    socketRef.current.emit('joinRoom', {roomName}, (data) => {
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
    socketRef.current.emit('createWebRtcTransport', { consumer: false }, ({ params }) => {
      if (params.error) {
        console.log(params.error);
        return;
      }

      console.log(params);
      producerTransport = device.createSendTransport(params);
      producerTransport.on('connect', async ({ dtlsParameters }, callback, errback) => {
        try {
          await socketRef.current.emit('transport-connect', { dtlsParameters });
          callback();
        } catch (error) {
          errback(error);
        }
      });

      producerTransport.on('produce', async (parameters, callback, errback) => {
        console.log(parameters);

        try {
          await socketRef.current.emit(
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

    await socketRef.current.emit('createWebRtcTransport', { consumer: true }, ({ params }) => {
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
          await socketRef.current.emit('transport-recv-connect', {
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
    socketRef.current.emit('getProducers', (producerIds) => {
      console.log(producerIds);
      producerIds.forEach(signalNewConsumerTransport);
    });
  };

  const connectRecvTransport = async (consumerTransport, remoteProducerId, serverConsumerTransportId) => {
    await socketRef.current.emit(
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
        socketRef.current.emit('consumer-resume', { serverConsumerId: params.serverConsumerId });
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
      <div style={{ textAlign: 'center', marginTop: '20px' }}>
        <h2>Access Code: {accessCode}</h2>
      </div>
    </div>
  );
};

export default VideoCall;
