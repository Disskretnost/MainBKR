import { createSlice } from '@reduxjs/toolkit';

const languageSlice = createSlice({
    name: 'languages',
    initialState: {
      languages: [],  
      primaryLanguage: null,  
    },
    reducers: {
      setLanguages: (state, action) => {
        // Add check for payload existence and type
        if (!Array.isArray(action.payload)) {
          console.error('setLanguages payload must be an array');
          return;
        }
        
        state.languages = action.payload;
  
        // Find primary language
        const primaryLang = action.payload.find(lang => lang.isPrimary);
        if (primaryLang) {
          state.primaryLanguage = primaryLang;
        } else {
          state.primaryLanguage = null; // Reset if no primary language found
        }
      },
  
      setPrimaryLanguage: (state, action) => {
        state.primaryLanguage = action.payload;
      }, 
    }
  });

export const { setLanguages, setPrimaryLanguage } = languageSlice.actions;
export default languageSlice.reducer;
