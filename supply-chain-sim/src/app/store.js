import { configureStore } from "@reduxjs/toolkit";
import counterSlice from "../features/counterSlice";
import stateSlice from "../features/stateSlice";

export const store = configureStore({
  reducer: {
    counter: counterSlice,
    state: stateSlice,
  },
});
