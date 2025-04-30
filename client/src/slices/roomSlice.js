import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  id: null,
  ownerId: null,
  accessCode: null,
  createdAt: null,
  isActive: false
};

const roomSlice = createSlice({
  name: 'conference',
  initialState,
  reducers: {
    createConference: (state, action) => {
      const { id, ownerId, accessCode, createdAt, isActive } = action.payload;
      state.id = id;
      state.ownerId = ownerId;
      state.accessCode = accessCode;
      state.createdAt = createdAt;
      state.isActive = isActive;
    },
    resetConference: (state) => {
      state.id = null;
      state.ownerId = null;
      state.accessCode = null;
      state.createdAt = null;
      state.isActive = false;
    }
  },
});

export const { createConference, resetConference } = roomSlice.actions;

export default roomSlice.reducer;