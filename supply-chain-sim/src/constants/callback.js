import * as turf from "@turf/turf";
import carImage from "../../public/Image/truck.png";
import { notification } from "antd";
import { Agent, Node } from "./class";
import mapboxgl from "mapbox-gl"; // eslint-disable-line import/no-webpack-loader-syntax
import {
  CURRENT_MAP,
  CURRENT_PARTICIPANTS_DATA,
  CURRENT_GRAPH,
  VERTICES,
} from "../globalVariable";
import {
  RUN_STATE,
  AGENT_TYPE,
  EVENT_START_TYPE,
  EVENT_TYPE,
  GATEWAY_TYPE,
  MESSAGE_TYPE,
} from ".";

export const execute = (obj, curTime) => {
  //console.log(obj.startEvent);
  console.log("[RUN] " + obj.name + " | Current Hour: " + curTime);
  //console.log(obj.processes);
  if (obj.runState === RUN_STATE.RUNNING) return;
  obj.runState = RUN_STATE.RUNNING;
  if (obj.processes.length < 1) {
    if (obj.startEvent.startType === EVENT_START_TYPE.TIMER) {
      if (obj.startEvent.startTime == curTime) {
        obj.startEvent.run(obj);
        obj.processes.push({
          task: obj.startEvent.next,
          duration: obj.startEvent.next.duration,
          curDuration: 1,
        });
      } else {
        obj.runState = RUN_STATE.CAN_RUN;
      }
    } else {
      obj.runState = RUN_STATE.CAN_RUN;
    }
  } else {
    for (let i = 0; i < obj.processes.length; i++) {
      if (obj.processes[i].task.type === EVENT_TYPE.END) {
        obj.processes[i].task.run(obj);
        obj.processes.splice(i, 1);
        i--;
        continue;
      } else if (obj.processes[i].task.type === GATEWAY_TYPE.PARALLEL) {
        for (let j = 0; j < obj.processes[i].task.next.length; j++) {
          if (
            obj.processes[i].task.next[j].startType !== EVENT_START_TYPE.MESSAGE
          ) {
            obj.processes.push({
              task: obj.processes[i].task.next[j],
              duration: obj.processes[i].task.next[j].duration,
              curDuration: 1,
            });
          }
        }
        //console.log("After:", obj.processes);
        obj.processes.splice(0, 1);
        i--;
      } else {
        if (obj.processes[i].curDuration >= obj.processes[i].duration) {
          obj.processes[i].task.run(obj);
          if (obj.runState === RUN_STATE.RUNNING) continue;
          if (obj.processes[i].task.throw !== null) {
            obj.processes[i].task.throw.processes.push({
              task: obj.processes[i].task.throwEvent,
              duration: obj.processes[i].task.throw.startEvent.duration,
              curDuration: 1,
            });
          }
          if (
            obj.processes[i].task.next.startType === EVENT_START_TYPE.MESSAGE
          ) {
            obj.processes.splice(i, 1);
            i--;
            continue;
          }
          if (obj.processes[i].task.next.type === GATEWAY_TYPE.EXCLUSIVE) {
            if (check(curTime, 6)) {
              obj.processes[i].task = obj.processes[i].task.next.next[1];
            } else {
              obj.processes[i].task = obj.processes[i].task.next.next[0];
            }
          } else {
            obj.processes[i].task = obj.processes[i].task.next;
          }

          obj.processes[i].curDuration = 1;
          obj.processes[i].duration = obj.processes[i].task.duration;
        } else {
          obj.processes[i].curDuration += 1;
          obj.runState = RUN_STATE.CAN_RUN;
        }
        /* obj.processes[i].task.run(obj);
        if (obj.processes[i].task.next != null) {
          obj.processes[i].task = obj.processes[i].task.next;
        } */
      }
    }
  }
};

export const runShipment = (step, id, obj, vehicle, onFinishCallBack) => {
  if (CURRENT_MAP.current.getLayer(id)) return;

  /* dispatch(setState(true)); */
  console.log("Step: ", step);
  var length = turf.length(step, { units: "kilometers" });
  console.log("Turf length: ", length);
  var iPathLength = turf.lineDistance(step, "kilometers");
  console.log("Path Length: ", iPathLength);
  var iPoint = turf.along(step, 0, "kilometers");
  var rep = 0;
  var numSteps = iPathLength; //Change this to set animation resolution
  var timePerStep = 1000; //Change this to alter animation speed
  CURRENT_MAP.current.addSource(id, {
    type: "geojson",
    data: iPoint,
    maxzoom: 20,
  });
  CURRENT_MAP.current.loadImage(carImage, (error, image) => {
    if (error) throw error;
    var popup = new mapboxgl.Popup()
      .setHTML(`<strong>Test<strong></p>`)
      .addTo(CURRENT_MAP.current);

    // Add the image to the Map.current style.
    CURRENT_MAP.current.addImage("cat" + id, image);
    CURRENT_MAP.current.addLayer({
      id: id,
      type: "symbol",
      source: id,
      layout: {
        "icon-image": "cat" + id, // reference the image
        "icon-size": 0.75,
      } /* 
          paint: {
            "circle-radius": 4,
          }, */,
    });
  });
  var pSource = CURRENT_MAP.current.getSource(id);
  var interval = setInterval(function () {
    rep += 50;
    if (rep > numSteps) {
      if (CURRENT_MAP.current.hasImage("cat" + id)) {
        console.log("[End shipment]");
        CURRENT_MAP.current.removeImage("cat" + id);
        CURRENT_MAP.current.removeLayer(id);
        CURRENT_MAP.current.removeSource(id);
        for (let i = 0; i < onFinishCallBack.length; i++) {
          onFinishCallBack[i]();
        }
        obj.runState = RUN_STATE.CAN_RUN;
        clearInterval(interval);
      }
    } else {
      var curDistance = (rep / numSteps) * iPathLength;
      var iPoint = turf.along(step, curDistance, "kilometers");
      pSource.setData(iPoint);
      //console.log(curDistance);
    }
  }, timePerStep);
};

export const openNotificationWithIcon = (message, description, type) => {
  notification[type]({
    message: message,
    description: description,
    duration: 3,
  });
};

export const constructVertices = (name, id, vertices) => {
  console.log(name, id);
  const newAgent = new Agent(name, 37, -98, [], null, AGENT_TYPE.SUPPLIER, id);
  vertices.push(newAgent);
  return newAgent;
};

export const constructGraph = (vertices) => {
  //Add vertices
  for (var i = 0; i < vertices.length; i++) {
    CURRENT_GRAPH.addVertex(new Node(i, vertices[i]));

    //Add references
    for (let k = 0; k < vertices[i].taskList.length; k++) {
      console.log(vertices[i]);
      if (vertices[i].taskList[k].throwId != null) {
        for (
          let j = 0;
          j < CURRENT_PARTICIPANTS_DATA.referenceEvents.length;
          j++
        ) {
          if (
            CURRENT_PARTICIPANTS_DATA.referenceEvents[j].event.id ==
            vertices[i].taskList[k].throwId
          ) {
            console.log("Yes: ", CURRENT_PARTICIPANTS_DATA.referenceEvents[j]);
            vertices[i].taskList[k].throw =
              CURRENT_PARTICIPANTS_DATA.referenceEvents[j].agent;
            vertices[i].taskList[k].throwEvent =
              CURRENT_PARTICIPANTS_DATA.referenceEvents[j].event;
          }
        }
      }
    }
  }
  //Add initial path
  for (var i = 0; i < vertices.length - 1; i++) {
    CURRENT_GRAPH.addEdge(i, i + 1);
  }
};

export const getEventStartType = (eventString) => {
  const eventStringLowerCase = eventString.toLowerCase();
  if (eventStringLowerCase == "loop") {
    return EVENT_START_TYPE.LOOP;
  } else if (eventStringLowerCase == "message") {
    return EVENT_START_TYPE.MESSAGE;
  } else if (eventStringLowerCase == "timer") {
    return EVENT_START_TYPE.TIMER;
  }
  return EVENT_START_TYPE.AUTO;
};

export const RESET_SIMULATION = () => {
  openNotificationWithIcon("RESET", "Reset simulation", MESSAGE_TYPE.WARNING);
  //CLEAR ARRAY
  CURRENT_PARTICIPANTS_DATA.participants.length = 0;
  CURRENT_PARTICIPANTS_DATA.referenceEvents.length = 0;
};

export const RESET_IMPORT = () => {
  VERTICES.length = 0;
  console.log("clear");
  console.log(VERTICES);
};

export const print = (obj) => {
  //console.log(obj.name);
  console.log("print: ", obj.name);
  obj.runState = RUN_STATE.CAN_RUN;
};

export const printWhole = (obj) => {
  console.log("printWhole: ", obj.name);
  obj.runState = RUN_STATE.CAN_RUN;
};

export const move = (obj) => {
  console.log(obj);
  for (let i = 0; i < obj.transport.length; i++) {
    obj.transport[i].move();
  }
  const id = "peep" + obj.name;
  runShipment(obj.route, id, obj, obj.transport[0], [
    () => {
      console.log("Finish shipment");
      obj.unload(obj);
    },
  ]);
  console.log(obj.transport);
};

export const load = (obj) => {
  console.log("SHIPPING: ", obj.customerDemand);
  for (let i = 0; i < obj.customerDemand.length; i++) {
    console.log(obj.customerDemand);
    obj.customerDemand[i].transport.loadBulk(obj.customerDemand[i].demand);
  }
  obj.calcEverything(obj);
  obj.runState = RUN_STATE.CAN_RUN;
};
