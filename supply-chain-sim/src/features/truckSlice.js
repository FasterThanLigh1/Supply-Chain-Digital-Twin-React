import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  truckDataArray: [],
};

export const truckSlice = createSlice({
  name: "truck",
  initialState,
  reducers: {
    setTruckDataArray: (state, action) => {
      state.truckDataArray = action.payload;
    },
  },
});

// Action creators are generated for each case reducer function
export const { setTruckDataArray } = truckSlice.actions;
export const selectTruckDataArray = (state) => state.truck.truckDataArray;

export default truckSlice.reducer;
