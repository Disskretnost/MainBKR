// src/components/ControlPanel.js
import React from 'react';
import { useSelector } from 'react-redux';
import { IconButton } from '@mui/material';
import CallEndIcon from '@mui/icons-material/CallEnd';
import MicIcon from '@mui/icons-material/Mic';
import MicOffIcon from '@mui/icons-material/MicOff';
import ScreenShareIcon from '@mui/icons-material/ScreenShare';
import StopScreenShareIcon from '@mui/icons-material/StopScreenShare';
import ChatIcon from '@mui/icons-material/Chat';
import AccessCodePanel from '../../components/AccessCodePanel/AccessCodePanel';

const ControlPanel = ({
  handleExit,
  isExiting,
  handleToggleMic,
  micEnabled,
  handleToggleScreenSharing,
  screenSharing,
  handleToggleChat,
  showChat
}) => {
  const accessCode = useSelector((state) => state.conference.accessCode);

  return (
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
  );
};

export default ControlPanel;