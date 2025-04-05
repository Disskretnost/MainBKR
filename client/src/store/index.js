import { configureStore } from '@reduxjs/toolkit';
import authReducer from './../slices/authSlice';  // Путь может быть другим
import conferenceReducer from './../slices/roomSlice'; // Импортируем conferenceReducer
import conferenceFilesReducer from './../slices/conferenceFilesSlice'; 

const store = configureStore({
  reducer: {
    auth: authReducer,
    conference: conferenceReducer, 
    conferenceFiles: conferenceFilesReducer, 
  },
});

export default store;