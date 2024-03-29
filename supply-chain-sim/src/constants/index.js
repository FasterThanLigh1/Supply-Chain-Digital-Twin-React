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

export const DTDL_CONTENT_ATTRIBUTES = {
  PROPERTY: "Property",
  TELEMETRY: "Telemetry",
  RELATIONSHIP: "Relationship",
  COMPONENT: "Component",
};

export const MAIN_COLOR = "rgba(255, 255, 255, 0.2)";

export const ACTIVE_MARKERS = [];
export const ACTIVE_ROUTE = [];
export const CURRENT_BPMN_MODEl = {
  diagram: null,
};

export const DTDL_MARKER_TYPE = {
  SUPPLIER: "dtmi:dtdl:Supplier",
  DISTRIBUTOR: "dtmi:dtdl:Distributor",
  CUSTOMER: "dtmi:dtdl:Customer",
  FARM: "dtmi:dtdl:Farm",
};

export const REACT_APP_SUPABASE_URL =
  "https://yfglzchwttkotbtjhmnl.supabase.co";
export const REACT_APP_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlmZ2x6Y2h3dHRrb3RidGpobW5sIiwicm9sZSI6ImFub24iLCJpYXQiOjE2ODc0MTQxMjcsImV4cCI6MjAwMjk5MDEyN30.K0EXVA8ele2aDAH5U5dUI8nw2UCkMLooAg7I4L4LlSg";

export const SUPABASE_TABLE = {
  PARTICIPANT_LIST: "participants",
  USER_LIST: "users",
  ORGANIZATION_LIST: "organization",
  LIVE_DATA: "participants_live_data",
  TRANSPORT_DATA: "transport_data",
  VEHICLE: "vehicle",
  PRODUCT: "product",
  CARGO_DATA: "cargo_data",
  CARGO_PRODUCT_DATA: "cargo_product_data",
  INVENTORY: "inventory",
  WARNING_LIST: "warning",
  IOT_DEVICES: "iot_devices",
  IOT_DEVICES_HISTORY: "iot_history_data",
  LIVE_TELEMETRY: "live_telemetry",
  LIVE_PROCESS: "live_process",
  SUPPLIER: "supplier",
  SALES: "sales",
  VIEW: {
    GET_DATA_ORDER_BY_DATE: "get_participants_data_order_by_date",
  },
  TRANSPORT_STATUS: {
    COMPLETE: "complete",
    ONGOING: "ongoing",
    FAIL: "fail",
  },
  PROCESS_STATUS: {
    ACTIVE: "active",
    IDLE: "idle",
  },
  IOT_DEVICE_TYPE: {
    MILK_MONITOR: "milk-monitor",
    WAREHOUSE_MONITOR: "warehouse-monitor",
    PACKAGE_MONITOR: "package-monitor",
    SALE_MONITOR: "sales-monitor",
    PRODUCE_MONITOR: "produce-monitor",
    SHIP_MONITOR: "shipping-monitor",
  },
};

//SUPABASE VARIABLES
export const SUPABASE_DATA = {
  ACTIVE_LIVE_TRUCK_MARKERS: [],
  ACTIVE_LIVE_PARTICIPANTS: [],
};

//REALTIME MAP UI DATA
export const UI_DATA = {
  SELECT_DEVICE_ID: null,
  SELECT_PARTICIPANT_ID: null,
  SELECT_BPMN_TASK: [],
  SELECT_CANVAS: null,
};

//UI COLOR
export const COLOR = {
  ORANGE: "rgb(251 191 36)", //AMBER-400
  WHITE: "#ffffff",
  GRAY: "#c4c4c4",
};
