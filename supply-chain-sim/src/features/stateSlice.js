import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  isRunningSimulation: false,
};

export const stateSlice = createSlice({
  name: "state",
  initialState,
  reducers: {
    set: (state, action) => {
      state.isRunningSimulation = action.payload;
    },
  },
});

// Action creators are generated for each case reducer function
export const { set } = stateSlice.actions;
export const selectState = (state) => state.state.isRunningSimulation;

export default stateSlice.reducer;
