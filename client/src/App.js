import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Routes, Route, Navigate } from 'react-router-dom';
import { setAuthData, logout } from './slices/authSlice';
import LoginPage from './pages/LoginPage/LoginPage';
import HomePage from './pages/HomePage/HomePage';
import RegisterPage from './pages/RegisterPage/RegisterPage';
import AuthService from './services/AuthService';
import Room from './/pages/Room/room';
import VideoCall from './pages/VideoConference/VideoConference';
import EnterRoomPage from './pages/EnterRoomPage/EnterRoomPage';
import './App.css';

const App = () => {
  const dispatch = useDispatch();
  const isAuthenticated = useSelector(state => state.auth.isAuthenticated);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const refreshToken = localStorage.getItem('refreshToken');
    if (refreshToken && !isAuthenticated) {
      setIsLoading(true);
      AuthService.refreshToken(refreshToken)
        .then(data => {
          const { accessToken, refreshToken, user } = data;
          dispatch(setAuthData({ accessToken, refreshToken, user }));
        })
        .catch(error => {
          console.error('Ошибка при обновлении токенов:', error.message);
          localStorage.removeItem('refreshToken');
          dispatch(logout());
        })
        .finally(() => {
          setIsLoading(false);
        });
    } else {
      setIsLoading(false);
    }
  }, [dispatch, isAuthenticated]);

  if (isLoading) {
    return <div>Загрузка...</div>;
  }

  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/registration" element={<RegisterPage />} />
      <Route
        path="/"
        element={
          isAuthenticated ? (
            <HomePage />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />



       <Route
        path="/enter-room"
        element={
          isAuthenticated ? (
           <EnterRoomPage />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />

      <Route
        path="/room/:id"
        element={
          isAuthenticated ? (
            <VideoCall/>
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />
    </Routes>
  );
};

export default App;