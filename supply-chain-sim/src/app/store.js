import { configureStore } from "@reduxjs/toolkit";
import stateSlice from "../features/stateSlice";
import graphSlice from "../features/graphSlice";
import chosenSlice from "../features/chosenSlice";
import dateSlice from "../features/dateSlice";
import dtdlSlice from "../features/dtdlSlice";
import userSlice from "../features/userSlice";
import truckSlice from "../features/truckSlice";

export const store = configureStore({
  reducer: {
    state: stateSlice,
    graph: graphSlice,
    chosen: chosenSlice,
    date: dateSlice,
    dtdl: dtdlSlice,
    user: userSlice,
    truck: truckSlice,
  },
});
