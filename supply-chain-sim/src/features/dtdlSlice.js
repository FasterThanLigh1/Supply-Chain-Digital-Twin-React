import { createSlice } from "@reduxjs/toolkit";
import dayjs from "dayjs";

const initialState = {
  mainTwin: null,
  childTwinArray: [],
};

export const dtdlSlice = createSlice({
  name: "dtdl",
  initialState,
  reducers: {
    pushChildTwin: (state, action) => {
      console.log("In slice ", action.payload);
      state.childTwinArray.push(action.payload);
      console.log(state.childTwinArray);
    },
    setMainTwin: (state, action) => {
      state.mainTwin = action.payload;
    },
  },
});

// Action creators are generated for each case reducer function
export const { pushChildTwin, setMainTwin } = dtdlSlice.actions;
export const selectMainTwin = (state) => state.dtdl.mainTwin;
export const selectChildTwinArray = (state) => state.dtdl.childTwinArray;

export default dtdlSlice.reducer;
