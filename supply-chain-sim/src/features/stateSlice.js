import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  isRunningSimulation: false,
};

export const stateSlice = createSlice({
  name: "state",
  initialState,
  reducers: {
    setState: (state, action) => {
      state.isRunningSimulation = action.payload;
    },
  },
});

// Action creators are generated for each case reducer function
export const { setState } = stateSlice.actions;
export const selectState = (state) => state.state.isRunningSimulation;

export default stateSlice.reducer;
