import React, { useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import VideoConferenceManager from '../../socket/VideoConferenceManager';
import AccessCodePanel from '../../components/AccessCodePanel/AccessCodePanel';
import './VideoConference.css';

const VideoCall = () => {
  const roomName = useSelector((state) => state.conference.id); //id комнаты 
  const accessCode = useSelector((state) => state.conference.accessCode); //id комнаты  токен доступа
  const {id} = useSelector(state => state.auth.user);
  const conferenceManagerRef = useRef(null);
  const videoContainerRef = useRef(null);

  const callbacks = {
    onLocalStream: (stream, socketId) => {
      const video = document.createElement('video');
      video.srcObject = stream;
      video.autoplay = true;
      video.muted = true;
      video.className = 'video-descendant';
      video.id = `video-${socketId}`;
      videoContainerRef.current.appendChild(video);
    },
    onRemoteStream: (stream, producerId, kind) => {
      const container = document.createElement('div');
      container.id = `td-${producerId}`;
      
      const mediaElement = document.createElement(kind === 'audio' ? 'audio' : 'video');
      mediaElement.id = `${kind}-${producerId}`;
      mediaElement.autoplay = true;
      if (kind === 'video') {
        mediaElement.className = 'video-descendant';
      }
      mediaElement.srcObject = stream;
      
      container.appendChild(mediaElement);
      videoContainerRef.current.appendChild(container);
    },
    onRemoteStreamEnded: (producerId) => {
      const element = document.getElementById(`td-${producerId}`);
      if (element && videoContainerRef.current.contains(element)) {
        videoContainerRef.current.removeChild(element);
      }
    },
    onSocketId: (socketId) => {
      console.log('Socket ID:', socketId);
    },
    onError: (message) => {
      console.error(message);
    },
    onTrackEnded: (type) => {
      console.log(`${type} track ended`);
    },
    onTransportClose: (type) => {
      console.log(`${type} transport ended`);
    },
    onCleanup: () => {
      // Дополнительная очистка при необходимости
    },
    onSpeechRecognized: (text) => {
      console.log('Распознано:', text);
      // Можно отображать распознанный текст в интерфейсе
    },
  };

  useEffect(() => {
    if (!roomName) return;

    conferenceManagerRef.current = new VideoConferenceManager(
      roomName,
      accessCode,
      id,
      callbacks
    );
    conferenceManagerRef.current.initialize();

    return () => {
      if (conferenceManagerRef.current) {
        conferenceManagerRef.current.cleanup();
      }
    };
  }, [roomName, accessCode]);

  return (
    <div className="video-conference-container">
      <div className="video-container" ref={videoContainerRef} />
      <div className="access-panel-wrapper">
        <AccessCodePanel accessCode={accessCode} />
      </div>
    </div>
  );
};

export default VideoCall;