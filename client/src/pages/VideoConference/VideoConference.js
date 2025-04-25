import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import VideoConferenceManager from '../../socket/VideoConferenceManager';
import AccessCodePanel from '../../components/AccessCodePanel/AccessCodePanel';
import ChatPanel from '../../components/ChatPanel/ChatPanel';
import './VideoConference.css';
import { IconButton } from '@mui/material';
import CallEndIcon from '@mui/icons-material/CallEnd';
import MicIcon from '@mui/icons-material/Mic';
import MicOffIcon from '@mui/icons-material/MicOff';
import ScreenShareIcon from '@mui/icons-material/ScreenShare';
import StopScreenShareIcon from '@mui/icons-material/StopScreenShare';
import ChatIcon from '@mui/icons-material/Chat';
import { addMessage } from './../../slices/chatSlice';
import getGridClass from '../../utils/conference/getGridClass';
import handleToggleMicFn from '../../utils/conference/handleToggleMic';
import handleToggleScreenSharingFn from '../../utils/conference/handleToggleScreenSharing';
import handleToggleChatFn from '../../utils/conference/handleToggleChat';


const VideoCall = () => {
  const roomName = useSelector(state => state.conference.id);
  const accessCode = useSelector(state => state.conference.accessCode);
  const { id, username } = useSelector(state => state.auth.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const conferenceManagerRef = useRef(null);
  const videoContainerRef = useRef(null);
  const streamsCountRef = useRef(0);
  const [isExiting, setIsExiting] = useState(false);
  const [micEnabled, setMicEnabled] = useState(true);
  const [screenSharing, setScreenSharing] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [subtitles, setSubtitles] = useState({});
  

  const updateGridClass = () => {
    const gridClass = getGridClass(streamsCountRef.current);
    if (videoContainerRef.current) {
      videoContainerRef.current.className = `video-container ${gridClass}`;
    }
  };

  const handleToggleMic = () => handleToggleMicFn(conferenceManagerRef, setMicEnabled);
  const handleToggleScreenSharing = () => handleToggleScreenSharingFn(conferenceManagerRef, screenSharing, setScreenSharing);
  const handleToggleChat = () => handleToggleChatFn(setShowChat);

  const handleExit = () => {
    setIsExiting(true);
    conferenceManagerRef.current?.cleanup();
    navigate('/');
  };

  const callbacks = {
    onLocalStream: (stream, socketId) => {
      const existingVideo = document.getElementById(`video-${socketId}`);
      if (existingVideo) {
        existingVideo.srcObject = stream;
        return;
      }

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

    onRemoteStream: (stream, producerId, kind, clientId) => {
      if (kind === 'video') {
        const existingVideo = document.getElementById(`video-${producerId}`);
        if (existingVideo) {
          existingVideo.srcObject = stream;
          return;
        }

        const container = document.createElement('div');
        container.className = 'stream-container';
        const video = document.createElement('video');
        video.id = `video-${producerId}`;
        video.autoplay = true;
        video.className = 'video-element';
        video.srcObject = stream;
        container.appendChild(video);
        console.log("Создание субтитров для", clientId)
        const subtitleContainer = document.createElement('div');
        subtitleContainer.className = 'subtitle-container';
        subtitleContainer.id = `subtitle-${clientId}`;
        subtitleContainer.innerText = subtitles[clientId] || '';
        container.appendChild(subtitleContainer);

        videoContainerRef.current.appendChild(container);
        streamsCountRef.current += 1;
        updateGridClass();
      } else if (kind === 'audio') {
        const audio = document.createElement('audio');
        audio.id = `audio-${producerId}`;
        audio.autoplay = true;
        audio.srcObject = stream;
        audio.hidden = true;
        document.body.appendChild(audio);
      }
    },

    onRemoteStreamEnded: (producerId) => {
      const element = document.getElementById(`video-${producerId}`);
      if (element?.parentNode && videoContainerRef.current.contains(element.parentNode)) {
        videoContainerRef.current.removeChild(element.parentNode);
        streamsCountRef.current = Math.max(0, streamsCountRef.current - 1);
        updateGridClass();
      }
    },

    onError: (message) => console.error(message),

    onCleanup: () => {
      console.log('Все ресурсы очищены');
      streamsCountRef.current = 0;
      if (videoContainerRef.current) {
        videoContainerRef.current.className = 'video-container';
      }
    },

    onSpeechRecognized: (text) => console.log('Распознано:', text),
  };

  useEffect(() => {
    if (!roomName) return;

    conferenceManagerRef.current = new VideoConferenceManager(roomName, accessCode, id, callbacks);
    conferenceManagerRef.current.initialize();

    return () => conferenceManagerRef.current?.cleanup();
  }, [roomName, accessCode]);

  useEffect(() => {
    if (!conferenceManagerRef.current) return;
  
    const socket = conferenceManagerRef.current.socket;
  
    const handleSubtitles = async ({ userId, text, lang3 }) => {
      try {
        const url = `https://translate.googleapis.com/translate_a/single?client=gtx&dt=t&sl=${lang3}&tl=en&q=${encodeURIComponent(text)}`;
        const res = await fetch(url);
        const data = await res.json();
  
        const translated = data[0]?.[0]?.[0] ?? text;
  
        console.log('📝 Перевод:', translated);
  
        setSubtitles(prevSubtitles => ({
          ...prevSubtitles,
          [userId]: translated,
        }));
      } catch (err) {
        console.error('❌ Ошибка при переводе:', err);
  
        setSubtitles(prevSubtitles => ({
          ...prevSubtitles,
          [userId]: text,
        }));
      }
    };
  
    socket.on('subtitles', handleSubtitles);
  
    return () => {
      socket.off('subtitles', handleSubtitles);
    };
  }, []);
  
  

  // 🔄 Синхронизация субтитров с DOM
  useEffect(() => {
    Object.entries(subtitles).forEach(([clientId, text]) => {
      const subtitleEl = document.getElementById(`subtitle-${clientId}`);
      if (subtitleEl) {
        subtitleEl.innerText = text;
      }
    });
  }, [subtitles]);

  useEffect(() => {
    if (!conferenceManagerRef.current) return;

    const handleNewMessage = (message) => {
      dispatch(addMessage({
        id: message.timestamp || Date.now(),
        text: message.text,
        sender: message.username,
        isOwn: message.username === username,
        timestamp: message.timestamp || Date.now()
      }));
    };

    const socket = conferenceManagerRef.current.socket;
    socket.on('message', handleNewMessage);

    return () => socket.off('message', handleNewMessage);
  }, [dispatch, username]);

  return (
    <div className="video-conference-container">
      <div className="main-content">
        <div className="video-wrapper">
          <div className="video-container" ref={videoContainerRef} />
        </div>

        {showChat && <ChatPanel onClose={handleToggleChat} conferenceManager={conferenceManagerRef.current} />}
      </div>

      <div className="access-panel-wrapper">
        <div className="access-panel-container">
          <AccessCodePanel accessCode={accessCode} />

          <IconButton onClick={handleExit} disabled={isExiting} className="exit-call-button" aria-label="Выйти из чата">
            <CallEndIcon fontSize="large" />
          </IconButton>

          <IconButton onClick={handleToggleMic} className="toggle-mic-button" aria-label="Вкл/выкл микрофон">
            {micEnabled ? <MicIcon fontSize="large" /> : <MicOffIcon fontSize="large" />}
          </IconButton>

          <IconButton onClick={handleToggleScreenSharing} className="toggle-screen-button" aria-label="Вкл/выкл демонстрацию экрана">
            {screenSharing ? <StopScreenShareIcon fontSize="large" /> : <ScreenShareIcon fontSize="large" />}
          </IconButton>

          <IconButton
            onClick={handleToggleChat}
            className="toggle-chat-button"
            aria-label="Чат"
            style={{ opacity: showChat ? 0 : 1 }}
            disabled={showChat}
          >
            <ChatIcon fontSize="large" />
          </IconButton>
        </div>
      </div>
    </div>
  );
};

export default VideoCall;
