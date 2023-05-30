export const mapaboxAcessToken =
  "pk.eyJ1IjoidmVyZ2lsMTAxOCIsImEiOiJjbGRzYWs4azIwMmN2M29vd3I3aGhyMTh3In0.85H5Og9UYgn81_phMNb9kQ";

export const AGENT_TYPE = {
  SUPPLIER: "supplier",
  DISTRIBUTOR: "distributor",
  MANUFACTURER: "manufacturer",
  CUSTOMER: "customer",
};

export const RUN_STATE = {
  CAN_RUN: "CanRun",
  RUNNING: "Running",
};

export const EVENT_TYPE = {
  START: "start",
  END: "end",
  INTERMEDIATE: "intermediate",
};

export const EVENT_START_TYPE = {
  LOOP: "loop",
  MESSAGE: "message",
  TIMER: "timer",
  AUTO: "auto",
};

export const GATEWAY_TYPE = {
  PARALLEL: "parallel",
  EXCLUSIVE: "exclusive",
};

export const MESSAGE_TYPE = {
  SUCCESS: "success",
  INFO: "info",
  WARNING: "warning",
  ERROR: "error",
};

export const BPMN_TYPE = {
  PARTICIPANT: "bpmn:Participant",
  TASK: "bpmn:Task",
  START_EVENT: "bpmn:StartEvent",
  END_EVENT: "bpmn:EndEvent",
  INTERMEDIATE_EVENT: "bpmn:IntermediateCatchEvent",
  DATA_STORE: "bpmn:DataStoreReference",
  PARALLEL_GATEWAY: "bpmn:ParallelGateway",
};

export const TASK_TYPE = {
  PRINT: "print",
  PRINT_WHOLE: "printWhole",
  ADD_INVENTORY: "addInventory",
  REMOVE_INVENTORY: "removeInventory",
  LOAD: "load",
  UNLOAD: "unload",
  CHECK_DEMAND: "checkDemand",
  MOVE: "move",
};

export const MAIN_COLOR = "rgba(255, 255, 255, 0.2)";

export const ACTIVE_MARKERS = [];
export const ACTIVE_ROUTE = [];
export const CURRENT_BPMN_MODEl = {
  diagram: null,
};
