import { configureStore } from "@reduxjs/toolkit";
import stateSlice from "../features/stateSlice";
import graphSlice from "../features/graphSlice";
import chosenSlice from "../features/chosenSlice";
import dateSlice from "../features/dateSlice";

export const store = configureStore({
  reducer: {
    state: stateSlice,
    graph: graphSlice,
    chosen: chosenSlice,
    date: dateSlice,
  },
});
