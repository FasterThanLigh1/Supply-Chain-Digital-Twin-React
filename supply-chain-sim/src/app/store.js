import { configureStore } from "@reduxjs/toolkit";
import stateSlice from "../features/stateSlice";
import chosenSlice from "../features/chosenSlice";
import userSlice from "../features/userSlice";

export const store = configureStore({
  reducer: {
    state: stateSlice,
    chosen: chosenSlice,
    user: userSlice,
  },
});
