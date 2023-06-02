import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  isRunningSimulation: false,
  currentTaskId: null,
};

export const stateSlice = createSlice({
  name: "state",
  initialState,
  reducers: {
    setState: (state, action) => {
      state.isRunningSimulation = action.payload;
    },
    setTaskId: (state, action) => {
      state.currentTaskId = action.payload;
    },
  },
});

// Action creators are generated for each case reducer function
export const { setState } = stateSlice.actions;
export const selectState = (state) => state.state.isRunningSimulation;
export const selectTaskId = (state) => state.currentTaskId;

export default stateSlice.reducer;
