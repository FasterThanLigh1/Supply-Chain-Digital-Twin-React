import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  name: "default",
  id: "default",
  x: 0,
  y: 0,
  inventory: [],
  processes: [],
  type: "default",
};

export const chosenSlice = createSlice({
  name: "chosen",
  initialState,
  reducers: {
    setChosen: (state, action) => {
      console.log("chosen: ", action.payload);
      state.name = action.payload.name;
      state.x = action.payload.x;
      state.y = action.payload.y;
      state.inventory = action.payload.inventory;
      state.processes = action.payload.processes;
      state.type = action.payload.type;
      state.id = action.payload.id;
    },
    setX: (state, action) => {
      state.x = action.payload;
    },
    setY: (state, action) => {
      state.y = action.payload;
    },
  },
});

// Action creators are generated for each case reducer function
export const { setChosen, setX, setY } = chosenSlice.actions;
export const selectName = (state) => state.chosen.name;
export const selectX = (state) => state.chosen.x;
export const selectY = (state) => state.chosen.y;
export const selectInventory = (state) => state.chosen.inventory;
export const selectProcesses = (state) => state.chosen.processes;
export const selectType = (state) => state.chosen.type;
export const selectId = (state) => state.chosen.id;

export default chosenSlice.reducer;
