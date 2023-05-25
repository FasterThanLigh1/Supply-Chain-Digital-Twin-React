import * as turf from "@turf/turf";
import carImage from "../../public/Image/truck.png";
import mapboxgl from "mapbox-gl"; // eslint-disable-line import/no-webpack-loader-syntax
import { Map } from "../globalVariable";
import {
  RUN_STATE,
  AGENT_TYPE,
  EVENT_START_TYPE,
  EVENT_TYPE,
  GATEWAY_TYPE,
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
  if (Map.current.getLayer(id)) return;

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
  Map.current.addSource(id, {
    type: "geojson",
    data: iPoint,
    maxzoom: 20,
  });
  Map.current.loadImage(carImage, (error, image) => {
    if (error) throw error;
    var popup = new mapboxgl.Popup()
      .setHTML(`<strong>Test<strong></p>`)
      .addTo(Map.current);

    // Add the image to the Map.current style.
    Map.current.addImage("cat" + id, image);
    Map.current.addLayer({
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
  var pSource = Map.current.getSource(id);
  var interval = setInterval(function () {
    rep += 50;
    if (rep > numSteps) {
      if (Map.current.hasImage("cat" + id)) {
        console.log("[End shipment]");
        Map.current.removeImage("cat" + id);
        Map.current.removeLayer(id);
        Map.current.removeSource(id);
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
