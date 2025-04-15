import React, { useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import VideoConferenceManager from '../../socket/VideoConferenceManager';
import AccessCodePanel from '../../components/AccessCodePanel/AccessCodePanel';
import './VideoConference.css';
import { IconButton } from '@mui/material';
import CallEndIcon from '@mui/icons-material/CallEnd';
import MicIcon from '@mui/icons-material/Mic';
import MicOffIcon from '@mui/icons-material/MicOff';
import ScreenShareIcon from '@mui/icons-material/ScreenShare';
import StopScreenShareIcon from '@mui/icons-material/StopScreenShare';

const VideoCall = () => {
  const roomName = useSelector((state) => state.conference.id);
  const accessCode = useSelector((state) => state.conference.accessCode);
  const { id } = useSelector(state => state.auth.user);
  const conferenceManagerRef = useRef(null);
  const videoContainerRef = useRef(null);
  const navigate = useNavigate();
  const [isExiting, setIsExiting] = useState(false);
  const streamsCountRef = useRef(0);
  const [micEnabled, setMicEnabled] = useState(true);
  const [screenSharing, setScreenSharing] = useState(false);

  const updateGridClass = () => {
    const count = streamsCountRef.current;
    let gridClass = 'grid-';
    
    if (count <= 4) {
      gridClass += count;
    } else {
      gridClass += 'many';
    }
    
    videoContainerRef.current.className = `video-container ${gridClass}`;
  };

  const handleToggleMic = () => {
    const manager = conferenceManagerRef.current;
  
    if (manager?.audioProducer?.track) {
      const audioTrack = manager.audioProducer.track;
      const willBeEnabled = !audioTrack.enabled;
  
      audioTrack.enabled = willBeEnabled;
      setMicEnabled(willBeEnabled);
  
      console.log('🎤 Microphone:', willBeEnabled ? 'включён' : 'выключен');
  
      // Управляем речевым распознаванием
      if (willBeEnabled) {
        manager.startSpeechRecognition?.();
      } else {
        manager.stopSpeechRecognition?.();
      }
    } else {
      console.error('🎤 Audio track not found');
    }
  };

  const handleToggleScreenSharing = async () => {
    const manager = conferenceManagerRef.current;
    if (!manager) return;
  
    if (screenSharing) {
      await manager.switchToCamera();
      setScreenSharing(false);
    } else {
      await manager.switchToScreen();
      setScreenSharing(true);
    }
  };

  const callbacks = {
    onLocalStream: (stream, socketId) => {
      const existingVideo = document.getElementById(`video-${socketId}`);
      
      if (existingVideo) {
        // Если видео уже есть — просто заменим источник
        existingVideo.srcObject = stream;
        return;
      }
    
      // Если видео нет — создаём заново
      const container = document.createElement('div');
      container.className = 'stream-container';
      
      const video = document.createElement('video');
      video.srcObject = stream;
      video.autoplay = true;
      video.muted = true;
      video.className = 'video-element';
      video.id = `video-${socketId}`;
      
      container.appendChild(video);
      videoContainerRef.current.appendChild(container);
      streamsCountRef.current += 1;
      updateGridClass();
    },
    
    onRemoteStream: (stream, producerId, kind) => {
      // Для видео создаем контейнер и видео элемент
      if (kind === 'video') {
        const container = document.createElement('div');
        container.className = 'stream-container';
        
        const video = document.createElement('video');
        video.id = `video-${producerId}`;
        video.autoplay = true;
        video.className = 'video-element';
        video.srcObject = stream;
        
        container.appendChild(video);
        videoContainerRef.current.appendChild(container);
        streamsCountRef.current += 1;
        updateGridClass();
      }
      // Для аудио просто создаем невидимый audio элемент
      else if (kind === 'audio') {
        const audio = document.createElement('audio');
        audio.id = `audio-${producerId}`;
        audio.autoplay = true;
        audio.srcObject = stream;
        audio.hidden = true;
        document.body.appendChild(audio); // Добавляем в body, но не в контейнер
      }
    },
    onRemoteStreamEnded: (producerId) => {
      const element = document.getElementById(`video-${producerId}`);
      if (element && element.parentNode && videoContainerRef.current.contains(element.parentNode)) {
        videoContainerRef.current.removeChild(element.parentNode);
        streamsCountRef.current = Math.max(0, streamsCountRef.current - 1);
        updateGridClass();
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
      streamsCountRef.current = 0;
      if (videoContainerRef.current) {
        videoContainerRef.current.className = 'video-container';
      }
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
    navigate('/');
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

          <IconButton
            onClick={handleToggleMic}
            className="toggle-mic-button"
            aria-label="Вкл/выкл микрофон"
          >
            {micEnabled ? <MicIcon fontSize="large" /> : <MicOffIcon fontSize="large" />}
          </IconButton>

          <IconButton
            onClick={handleToggleScreenSharing}
            className="toggle-screen-button"
            aria-label="Вкл/выкл демонстрацию экрана"
          >
            {screenSharing ? <StopScreenShareIcon fontSize="large" /> : <ScreenShareIcon fontSize="large" />}
          </IconButton>
        </div>
      </div>
    </div>
  );
};

export default VideoCall;
