import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  state: "prepare material",
};

export const stateSlice = createSlice({
  name: "state",
  initialState,
  reducers: {
    setState: (state, action) => {
      state.state = action.payload;
    },
  },
});

// Action creators are generated for each case reducer function
export const { setState } = stateSlice.actions;
export const selectState = (state) => state.state.state;

export default stateSlice.reducer;
