import { configureStore } from '@reduxjs/toolkit';
import authReducer from './../slices/authSlice';  
import conferenceReducer from './../slices/roomSlice'; 
import conferenceFilesReducer from './../slices/conferenceFilesSlice'; 
import chatReducer from './../slices/chatSlice';
import languageReducer from './../slices/languageSlice';  

const store = configureStore({
  reducer: {
    auth: authReducer,
    conference: conferenceReducer, 
    conferenceFiles: conferenceFilesReducer, 
    chat: chatReducer,
    languages: languageReducer,  
  },
});

export default store;
