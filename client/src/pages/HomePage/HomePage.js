import React, { useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { createConference } from '../../slices/roomSlice';
import './HomePage.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faDoorOpen } from '@fortawesome/free-solid-svg-icons';
import RoomService from '../../services/RoomService';

const HomePage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const {id} = useSelector(state => state.auth.user);

  const handleCreateRoom = (e) => {
    e.preventDefault();

    RoomService.createConference(id)
      .then(result => {
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
        console.error("Ошибка создания комнаты:", err);
        alert("Ошибка при создании комнаты. Попробуйте еще раз.");
      });
  };

  const handleJoinRoom = () => {
    navigate('/enter-room');
  };

  return (
    <div className="home-page-container">
      <nav className="nav-bar">
        {/* ... (панель навигации) ... */}
      </nav>

      <h1 className="home-page-title">Добро пожаловать в VideoTalk</h1>

      <div className="action-buttons">
        <button
          className="create-button"
          onClick={handleCreateRoom}
        >
          <FontAwesomeIcon icon={faPlus} className="button-icon" />
          create a video conference
        </button>
        <button className="join-button" onClick={handleJoinRoom}>
          <FontAwesomeIcon icon={faDoorOpen} className="button-icon" />
          Join a video conference
        </button>
      </div>

    </div>
  );
};

export default HomePage;