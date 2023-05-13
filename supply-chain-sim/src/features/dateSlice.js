import { createSlice } from "@reduxjs/toolkit";
import dayjs from "dayjs";

const initialState = {
  currentDate: "2018-04-13 19:18",
  duration: 0,
};

export const dateSlice = createSlice({
  name: "date",
  initialState,
  reducers: {
    setDuration: (state, action) => {
      state.duration = action.payload;
    },
    setCurrentDate: (state, action) => {
      state.currentDate = action.payload;
    },
  },
});

// Action creators are generated for each case reducer function
export const { setDuration, setCurrentDate } = dateSlice.actions;
export const selectCurrentDate = (state) => state.date.currentDate;
export const selectDuration = (state) => state.date.duration;

export default dateSlice.reducer;
