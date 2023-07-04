import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  currentUser: null,
};

export const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setCurrentUser: (state, action) => {
      state.currentUser = action.payload;
    },
  },
});

// Action creators are generated for each case reducer function
export const { setCurrentUser } = userSlice.actions;
export const selectUser = (state) => state.user.currentUser;

export default userSlice.reducer;
