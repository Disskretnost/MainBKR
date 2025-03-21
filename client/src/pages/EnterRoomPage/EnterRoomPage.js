import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './EnterRoomPage.css';

const EnterRoomPage = () => {
  const navigate = useNavigate();

  const [accessCode, setAccessCode] = useState(''); // Переименовано в accessCode
  const [error, setError] = useState('');

  const handleAccessCodeChange = (e) => { // Обновлен обработчик
    setAccessCode(e.target.value);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!accessCode.trim()) { // Проверка accessCode
      setError('Пожалуйста, введите код доступа.');
      return;
    }

    // Перенаправляем на страницу видеоконференции, передавая код доступа
    navigate(`/video?code=${accessCode}`); // Убрали roomId, передаем только code
  };

  return (
    <div className="enter-room-page-container">
      <h1 className="enter-room-page-title">Введите данные для входа</h1>
      <form onSubmit={handleSubmit} className="enter-room-form">
        {error && <p className="error-message">{error}</p>}

        <div className="form-group">
          <label htmlFor="accessCode" className="form-label">Код доступа:</label> {/* Обновлен label */}
          <input
            type="text"
            id="accessCode" // Обновлен id
            value={accessCode} // Обновлено value
            onChange={handleAccessCodeChange} // Обновлен обработчик
            placeholder="Введите код доступа"
            className="form-control"
          />
        </div>

        <button type="submit" className="submit-button">Войти в комнату</button>
      </form>
    </div>
  );
};

export default EnterRoomPage;