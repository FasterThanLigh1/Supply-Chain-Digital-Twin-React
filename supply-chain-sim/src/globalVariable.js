import { Graph } from "./constants/class";
import {
  abstractMove,
  load,
  move,
  print,
  printWhole,
} from "./constants/callback";

/////

export var VERTICES = [];
export var CURRENT_GRAPH = new Graph();
// adding vertices
//constructGraph(VERTICES);

//CURRENT_GRAPH.addEdge(0, 1);

export const CURRENT_SIMULATION_DATA = {
  currentAgent: null,
  currentTask: null,
  currentSimulationId: 0,
};

export var CURRENT_MAP = {
  current: null,
};

export var CURRENT_PARTICIPANTS_DATA = {
  participants: [],
  referenceEvents: [],
  referenceAgents: [],
  referenceParticipants: [],
};

export var TASK_DATA = {
  tasks: [
    {
      id: "print",
      name: "print",
      callback: print,
    },
    {
      id: "printWhole",
      name: "printWhole",
      callback: printWhole,
    },
    {
      id: "move",
      name: "move",
      callback: abstractMove,
    },
    {
      id: "load",
      name: "load",
      callback: load,
    },
  ],
};

export var EXPORT_DATA = {
  participants: [],
};
