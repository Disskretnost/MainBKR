import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './EnterRoomPage.css';
import RoomService from '../../services/RoomService';
import { useDispatch, useSelector } from 'react-redux';
import { createConference } from '../../slices/roomSlice';
const EnterRoomPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [accessCode, setAccessCode] = useState(''); // Переименовано в accessCode
  const [error, setError] = useState('');

  const handleAccessCodeChange = (e) => { // Обновлен обработчик
    setAccessCode(e.target.value);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    RoomService.getConferenceByAccessCode(accessCode)
      .then(result => {
        console.log(result)
        const { id, ownerId, accessCode, createdAt, isActive } = result; // Получаем все поля
        dispatch(createConference({
          id,
          ownerId,
          accessCode,
          createdAt,
          isActive
        }));
        navigate(`/room/${id}`);
      })
      .catch(err => {
        console.error("Ошибка при подключении к комнате ", err);
        alert("Ошибка при подключении к комнате Попробуйте еще раз.");
      });
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