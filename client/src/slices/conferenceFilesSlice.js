import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  files: []
};

const conferenceFilesSlice = createSlice({
  name: 'conferenceFiles',
  initialState,
  reducers: {
    // Добавление файлов для конференции
    setConferenceFiles: (state, action) => {
      state.files = action.payload;
    },
    
    // Добавление одного файла для конференции
    addConferenceFile: (state, action) => {
      state.files.push(action.payload);
    },

    // Удаление файла по id
    removeConferenceFile: (state, action) => {
      state.files = state.files.filter(file => file.id !== action.payload);
    },

    // Обновление файла
    updateConferenceFile: (state, action) => {
      const index = state.files.findIndex(file => file.id === action.payload.id);
      if (index !== -1) {
        state.files[index] = { ...state.files[index], ...action.payload };
      }
    },

    // Сброс файлов конференции
    resetConferenceFiles: (state) => {
      state.files = [];
    }
  },
});

export const { setConferenceFiles, addConferenceFile, removeConferenceFile, updateConferenceFile, resetConferenceFiles } = conferenceFilesSlice.actions;

export default conferenceFilesSlice.reducer;
