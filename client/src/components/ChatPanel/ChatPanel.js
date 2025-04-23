// ChatPanel.js
import React, { useState, useEffect, useRef } from 'react';
import {  useSelector } from 'react-redux';
import CloseIcon from '@mui/icons-material/Close';
import './ChatPanel.css';

const ChatPanel = ({ onClose, conferenceManager }) => {
  const [inputValue, setInputValue] = useState('');
  const messages = useSelector(state => state.chat.messages);
  const { username } = useSelector(state => state.auth.user);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = () => {
    if (inputValue.trim() === '') return;

    conferenceManager.socket.emit('sendMessage', {
      username,
      text: inputValue,
    });

    setInputValue('');
  };

  return (
    <div className="chat-panel">
      <div className="chat-header">
        <span>Чат</span>
        <button className="close-button" onClick={onClose} aria-label="Закрыть чат">
          <CloseIcon />
        </button>
      </div>

      <div className="chat-messages">
        {messages.map((msg) => (
          <div 
            key={msg.id} 
            className={`chat-message ${msg.isOwn ? 'own-message' : 'other-message'}`}
          >
            <strong>{msg.sender}:</strong> {msg.text}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div className="chat-input">
        <input
          type="text"
          placeholder="Введите сообщение..."
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
        />
        <button onClick={handleSend}>Отправить</button>
      </div>
    </div>
  );
};

export default ChatPanel;
