import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  isRunningSimulation: false,
  currentTaskId: null,
  graphChanged: 0,
  state: "prepare material",
};

export const stateSlice = createSlice({
  name: "state",
  initialState,
  reducers: {
    setState: (state, action) => {
      state.state = action.payload;
    },
    setTaskId: (state, action) => {
      state.currentTaskId = action.payload;
    },
    setGraphChanged: (state, action) => {
      state.graphChanged = action.payload;
    },
  },
});

// Action creators are generated for each case reducer function
export const { setState, setGraphChanged, setTaskId } = stateSlice.actions;
export const selectState = (state) => state.state.state;
export const selectTaskId = (state) => state.state.currentTaskId;
export const selectGraphChanged = (state) => state.state.graphChanged;

export default stateSlice.reducer;
