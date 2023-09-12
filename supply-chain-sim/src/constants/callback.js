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
import _ from "lodash";

export function removeTags(str) {
  if (str === null || str === "") return false;
  else str = str.toString();

  // Regular expression to identify HTML tags in
  // the input string. Replacing the identified
  // HTML tag with a null string.
  return str.replace(/(<([^>]+)>)/gi, "");
}

export const execute = (obj, curTime) => {
  //console.log(obj.startEvent);
  console.log("[RUN] " + obj.name + " | Current Hour: " + curTime);
  console.log(obj.processes);
  //console.log(obj.processes);
  if (obj.runState === RUN_STATE.RUNNING) return;
  obj.runState = RUN_STATE.RUNNING;
  if (obj.processes.length < 1) {
    if (obj.startEvent.startType === EVENT_START_TYPE.TIMER) {
      if (obj.startEvent.startTime == curTime) {
        obj.startEvent.run(obj);
        obj.processes.push({
          task: _.cloneDeep(obj.startEvent.next),
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
              task: _.cloneDeep(obj.processes[i].task.next[j]),
              duration: obj.processes[i].task.next[j].duration,
              curDuration: 1,
            });
          }
        }
        console.log("After:", obj.processes);
        i--;
      } else {
        console.log("Process: ", obj.processes);
        if (obj.processes[i].curDuration >= obj.processes[i].duration) {
          obj.processes[i].task.run(obj);
          if (obj.runState === RUN_STATE.RUNNING) continue;
          if (obj.processes[i].task.throwId !== null) {
            console.log(obj.processes[i].task.throwId);
            pushEvent(obj.processes[i].task.throwId);
            /* obj.processes[i].task.throw.processes.push({
              task: obj.processes[i].task.throwEvent,
              duration: obj.processes[i].task.throw.startEvent.duration,
              curDuration: 1,
            }); */
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
            console.log("After: ", obj.processes[i]);
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

export const runShipment = async (step, id, obj, onFinishCallBack, cargo) => {
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

export const openNotificationWithIcon = (
  message,
  description,
  type,
  duration = 3
) => {
  notification[type]({
    message: message,
    description: description,
    duration: duration,
  });
};

export const constructVertices = (name, id, vertices) => {
  console.log(name, id);
  const newAgent = new Agent(name, 37, -98, [], null, AGENT_TYPE.SUPPLIER, id);
  const deepAgent = _.cloneDeep(newAgent);
  vertices.push(deepAgent);
  return deepAgent;
};

export const constructGraph = (vertices) => {
  for (var i = 0; i < vertices.length; i++) {
    //Add references
    /* for (let k = 0; k < vertices[i].taskList.length; k++) {
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
    } */

    //Add vertices
    CURRENT_GRAPH.addVertex(new Node(i, _.cloneDeep(vertices[i])));
    console.log("CONSTRUCT GRAPH", CURRENT_GRAPH);
  }
  //Add initial path
  for (var i = 0; i < vertices.length - 1; i++) {
    CURRENT_GRAPH.addEdge(i, i + 1);
  }
};

export const constructThrowEvent = () => {
  for (let i = 0; i < CURRENT_GRAPH.AdjList.length; i++) {
    for (let j = 0; j < CURRENT_GRAPH.AdjList[i].data.taskList.length; j++) {
      if (CURRENT_GRAPH.AdjList[i].data.taskList[j].throwId !== null) {
        console.log("Task: ", CURRENT_GRAPH.AdjList[i].data.taskList[j].name);
        const temp = getThrowData(
          CURRENT_GRAPH.AdjList[i].data.taskList[j].throwId
        ).then((value) => {
          console.log(value);
          CURRENT_GRAPH.AdjList[i].data.taskList[j].throw = value.throw;
          CURRENT_GRAPH.AdjList[i].data.taskList[j].throwEvent =
            value.throwEvent;
        });
        console.log(CURRENT_GRAPH.AdjList[i].data.taskList[j]);
      }
    }
    console.log("Tasklist: ", CURRENT_GRAPH.AdjList[i].data.taskList);
  }
};

export const getThrowData = async (id) => {
  for (let i = 0; i < CURRENT_GRAPH.AdjList.length; i++) {
    for (let j = 0; j < CURRENT_GRAPH.AdjList[i].data.taskList.length; j++) {
      if (CURRENT_GRAPH.AdjList[i].data.taskList[j].id == id) {
        return {
          throw: CURRENT_GRAPH.AdjList[i].data,
          throwEvent: CURRENT_GRAPH.AdjList[i].data.taskList[j],
        };
      }
    }
  }
  return {
    throw: null,
    throwEvent: null,
  };
};

export const pushEvent = (id) => {
  for (let i = 0; i < CURRENT_GRAPH.AdjList.length; i++) {
    for (let j = 0; j < CURRENT_GRAPH.AdjList[i].data.taskList.length; j++) {
      if (CURRENT_GRAPH.AdjList[i].data.taskList[j].id == id) {
        CURRENT_GRAPH.AdjList[i].data.processes.push({
          task: CURRENT_GRAPH.AdjList[i].data.taskList[j],
          duration: CURRENT_GRAPH.AdjList[i].data.taskList[j].duration,
          curDuration: 1,
        });
        console.log("After push: ", CURRENT_GRAPH.AdjList[i].data.processes);
      }
    }
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
  runShipment(obj.route, id, obj, [
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

const abstractRemoveInventory = (demand, obj) => {
  const returnDeliver = [];
  for (let i = 0; i < demand.length; i++) {
    for (let j = 0; j < obj.inventory.length; j++) {
      if (obj.inventory[j].name == demand[i].name) {
        if (obj.inventory[j].quantity == 0) {
          alert(`stock out for ${obj.inventory[j].name}`);
          returnDeliver.push({
            name: demand[i].name,
            quantity: 0,
          });
        } else {
          const temp = obj.inventory[j].quantity - demand[i].quantity;
          if (temp < 0) {
            console.log(
              "Not enough in inventory and added to backlog " + obj.name
            );
            const itemToAdd = {
              name: demand[i].name,
              quantity: demand[i].quantity,
            };
            obj.backOrder.push(itemToAdd);
            returnDeliver.push({
              name: demand[i].name,
              quantity: 0,
            });
          } else {
            //obj.inventory[j].quantity = temp;
            returnDeliver.push(demand[i]);
          }
        }
      }
    }
  }
  console.log("After:", obj.inventory);
  return returnDeliver;
};

const abstractAddInventory = (item, obj) => {
  console.log("Add item: ", item);
  const tempInventory = _.cloneDeep(obj.inventory);
  for (let i = 0; i < item.length; i++) {
    for (let j = 0; j < tempInventory.length; j++) {
      if (item[i].name == tempInventory[j].name) {
        tempInventory[j].quantity += item[i].quantity;
      }
    }
  }
  obj.inventory = tempInventory;
  console.log("After:", obj);
};

const getCustomer = (id) => {
  for (let i = 0; i < CURRENT_GRAPH.AdjList.length; i++) {
    if (CURRENT_GRAPH.AdjList[i].id == id) {
      return CURRENT_GRAPH.AdjList[i];
    }
  }
};

export const abstractMove = (obj) => {
  const tempDemand = obj.getDemand();
  let customers = obj.getCustomer();
  console.log("Customers: ", customers);
  //obj.abstractRemoveInventory(tempDemand[0].demand);
  for (let i = 0; i < tempDemand.length; i++) {
    const temp = abstractRemoveInventory(tempDemand[i].demand, obj);
    console.log("After each remove: ", temp);
    const id = "peep" + obj.name;
    console.log("Customer: ", getCustomer(customers[i].id));
    runShipment(obj.route, id, obj, [
      () => {
        //console.log("Finish shipment");
        const tempCustomer = getCustomer(customers[i].id);
        abstractAddInventory(temp, tempCustomer.data);
      },
    ]);

    /* const temp2 = _.cloneDeep(temp1.data.inventory);
    temp2[0].quantity = 10;
    temp1.data.inventory = temp2;
    console.log("after changes: ", temp1); */
  }
};

export async function getRoute(start, end, routeId, map) {
  console.log("Start cordinate: ", start);
  console.log("End cordinate: ", end);
  // make a directions request using cycling profile
  // an arbitrary start will always be the same
  // only the end or destination will change
  const query = await fetch(
    `https://api.mapbox.com/directions/v5/mapbox/driving/${start[0]},${start[1]};${end[0]},${end[1]}?steps=true&geometries=geojson&access_token=${mapboxgl.accessToken}`,
    { method: "GET" }
  );
  const json = await query.json();
  console.log("Route: ", json);
  const data = json.routes[0];
  if (data === undefined) return;
  //console.log(data);
  const route = data.geometry.coordinates;
  const geojson = {
    type: "Feature",
    properties: {},
    geometry: {
      type: "LineString",
      coordinates: route,
    },
  };
  const length = turf.length(geojson.geometry, { units: "kilometers" });

  // if the route already exists on the map, we'll reset it using setData
  if (map.current.getSource(routeId)) {
    map.current.getSource(routeId).setData(geojson);
  }
  // otherwise, we'll make a new request
  else {
    map.current.addLayer({
      id: routeId,
      type: "line",
      source: {
        type: "geojson",
        data: geojson,
      },
      layout: {
        "line-join": "round",
        "line-cap": "round",
      },
      paint: {
        "line-color": "#FD4D00",
        "line-width": 5,
        "line-opacity": 0.75,
      },
    });
  }
  // add turn instructions here at the end
}
