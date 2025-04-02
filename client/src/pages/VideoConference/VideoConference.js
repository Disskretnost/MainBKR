
import React, { useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import VideoConferenceManager from '../../socket/VideoConferenceManager';
import AccessCodePanel from '../../components/AccessCodePanel/AccessCodePanel';
import './VideoConference.css';
import { Button, IconButton } from '@mui/material';
import CallEndIcon from '@mui/icons-material/CallEnd';
import VpnKeyIcon from '@mui/icons-material/VpnKey';

const VideoCall = () => {
  const roomName = useSelector((state) => state.conference.id);
  const accessCode = useSelector((state) => state.conference.accessCode);
  const { id } = useSelector(state => state.auth.user);
  const conferenceManagerRef = useRef(null);
  const videoContainerRef = useRef(null);
  const navigate = useNavigate();
  const [isExiting, setIsExiting] = useState(false);

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
      console.log('Все ресурсы очищены');
    },
    onSpeechRecognized: (text) => {
      console.log('Распознано:', text);
    },
  };

  const handleExit = () => {
    setIsExiting(true);
    if (conferenceManagerRef.current) {
      conferenceManagerRef.current.cleanup();
    }
    navigate('/'); // Переход на главную страницу
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
        <div className="access-panel-container">
            <AccessCodePanel accessCode={accessCode} />
            <IconButton
              onClick={handleExit}
              disabled={isExiting}
              className="exit-call-button"
              aria-label="Выйти из чата"
            >
              <CallEndIcon fontSize="large" />
            </IconButton>
        </div>
      </div>
    </div>
  );
};

export default VideoCall;