import { configureStore } from '@reduxjs/toolkit';
import authReducer from './../slices/authSlice';  // Путь может быть другим
import conferenceReducer from './../slices/roomSlice'; // Импортируем conferenceReducer
import conferenceFilesReducer from './../slices/conferenceFilesSlice'; 
import chatReducer from './../slices/chatSlice';

const store = configureStore({
  reducer: {
    auth: authReducer,
    conference: conferenceReducer, 
    conferenceFiles: conferenceFilesReducer, 
    chat: chatReducer
  },
});

export default store;