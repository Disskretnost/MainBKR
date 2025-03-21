import { configureStore } from '@reduxjs/toolkit';
import authReducer from './../slices/authSlice';  // Путь может быть другим
import conferenceReducer from './../slices/roomSlice'; // Импортируем conferenceReducer

const store = configureStore({
  reducer: {
    auth: authReducer,
    conference: conferenceReducer, 
  },
});

export default store;