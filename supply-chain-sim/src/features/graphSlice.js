import React from "react";
import { createSlice } from "@reduxjs/toolkit";
import _ from "lodash";

const initialState = {
  numOfVertices: 0,
  adjList: [],
};

export const graphSlice = createSlice({
  name: "graph",
  initialState,
  reducers: {
    setGraph: (state, action) => {
      console.log(action.payload);
      state.numOfVertices = action.payload.numOfVertices;
      state.adjList = _.cloneDeep(action.payload.adjList);
    },
  },
});

// Action creators are generated for each case reducer function
export const { setGraph } = graphSlice.actions;
export const selectNumOfVertices = (state) => state.graph.numOfVertices;
export const selectAdjList = (state) => state.graph.adjList;

export default graphSlice.reducer;
