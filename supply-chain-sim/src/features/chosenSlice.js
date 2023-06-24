import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  name: "default",
  id: "default",
  longitude: 0,
  latitude: 0,
  inventory: [],
  demand: [],
  type: "default",
  nodeId: -1,
};

export const chosenSlice = createSlice({
  name: "chosen",
  initialState,
  reducers: {
    setChosen: (state, action) => {
      console.log("chosen: ", action.payload);
      state.name = action.payload.name;
      state.longitude = action.payload.longitude;
      state.latitude = action.payload.latitude;
      state.inventory = action.payload.inventory;
      state.demand = action.payload.demand;
      state.type = action.payload.type;
      state.id = action.payload.id;
      state.nodeId = action.payload.nodeId;
    },
    setLongitude: (state, action) => {
      state.longitude = action.payload;
    },
    setLatitude: (state, action) => {
      state.latitude = action.payload;
    },
    setDemandSlice: (state, action) => {
      state.demand = action.payload;
    },
    setInventorySlice: (state, action) => {
      state.inventory = action.payload;
      console.log(action.payload);
    },
  },
});

// Action creators are generated for each case reducer function
export const {
  setChosen,
  setLongitude,
  setLatitude,
  setInventorySlice,
  setDemandSlice,
} = chosenSlice.actions;
export const selectName = (state) => state.chosen.name;
export const selectLongitude = (state) => state.chosen.longitude;
export const selectLatitude = (state) => state.chosen.latitude;
export const selectInventory = (state) => state.chosen.inventory;
export const selectDemand = (state) => state.chosen.demand;
export const selectType = (state) => state.chosen.type;
export const selectId = (state) => state.chosen.id;
export const selectNodeId = (state) => state.chosen.nodeId;

export default chosenSlice.reducer;
