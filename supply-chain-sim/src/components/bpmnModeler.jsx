import React, { useContext, useEffect, useRef, useState } from "react";
import Modeler from "bpmn-js/lib/Modeler";
import "bpmn-js/dist/assets/diagram-js.css";
import "bpmn-js/dist/assets/bpmn-font/css/bpmn-embedded.css";
import axios from "axios";
import { Button, Select, Upload, message } from "antd";
import BpmnModdle from "bpmn-moddle";
import TokenSimulationModule from "bpmn-js-token-simulation";
import SimulationSupportModule from "bpmn-js-token-simulation/lib/simulation-support";
import "bpmn-js-token-simulation/assets/css/bpmn-js-token-simulation.css";
import modeler from "bpmn-js-token-simulation/lib/modeler";
import {
  BPMN_TYPE,
  CURRENT_BPMN_MODEl,
  EVENT_START_TYPE,
  EVENT_TYPE,
} from "../constants";
import {
  RESET_IMPORT,
  constructGraph,
  constructVertices,
  getEventStartType,
} from "../constants/callback";
import {
  CURRENT_PARTICIPANTS_DATA,
  TASK_DATA,
  VERTICES,
} from "../globalVariable";
import { Activity, Event } from "../constants/class";

const moddle = new BpmnModdle();

const yellow = {
  stroke: "black",
  fill: "#e6fff5",
};

const fill = [];

function BpmnModeler(url) {
  const [diagram, diagramSet] = useState("");
  const [modeling, setModeling] = useState(null);
  const [currentModeler, modelerSet] = useState(null);
  const container = document.getElementById("container");

  useEffect(() => {
    if (diagram.length === 0) {
      if (CURRENT_BPMN_MODEl.diagram != null) {
        diagramSet(CURRENT_BPMN_MODEl.diagram);
      } else {
        axios
          .get(
            "https://cdn.staticaly.com/gh/bpmn-io/bpmn-js-examples/master/colors/resources/pizza-collaboration.bpmn"
          )
          .then((r) => {
            diagramSet(r.data);
          })
          .catch((e) => {
            console.log(e);
          });
      }
    }
    if (diagram.length > 0) {
      if (currentModeler == null) {
        const modeler = new Modeler({
          container,
          additionalModules: [TokenSimulationModule, SimulationSupportModule],
          keyboard: {
            bindTo: document,
          },
        });
        /* simulationSupport = modeler.get("simulationSupport");
        simulationSupport.toggleSimulation(true); */
        var modeling = modeler.get("modeling");
        setModeling(modeling);

        //window.alert("WANT ME TO CONTINUE?");
        modelerSet(modeler);
        /* setBusiness(modeler);
        console.log(business); */
        modeler.importXML(diagram, (err) => {
          if (err) {
          } else {
            var elementRegistry = modeler.get("elementRegistry");
            console.log(elementRegistry);
            elementRegistry.forEach(function (elem, gfx) {
              if (elem.type === "bpmn:StartEvent") {
                // do something with the task
                console.log("Start", elem);
                //simulationSupport.triggerElement(elem.id);
                modeling.setColor(elem, yellow);
              }
            });
          }
        });
        const events = modeler.get("eventBus");
        console.log(events);
      } else {
        currentModeler.importXML(diagram, (err) => {
          if (err) {
          } else {
            console.log("[modeler]: ", currentModeler);
            var elementRegistry = currentModeler.get("elementRegistry");
            console.log(elementRegistry);
            elementRegistry.forEach(function (elem, gfx) {
              if (elem.type === BPMN_TYPE.PARTICIPANT) {
                fill.push(elem);
                CURRENT_PARTICIPANTS_DATA.referenceParticipants.push(elem);
                const tempAgent = constructVertices(
                  elem.businessObject.name,
                  elem.id,
                  VERTICES
                );

                //sort children from left to right by x
                elem.children.sort(function (a, b) {
                  return a.x - b.x;
                });
                console.log(tempAgent);

                //Loop through children
                let prev = null;
                elem.children.forEach((item) => {
                  console.log(
                    "Name: ",
                    item.businessObject.name,
                    "Type: ",
                    item.type
                  );
                  if (item.type === BPMN_TYPE.TASK) {
                    console.log("Task: ", item);
                    const activity = new Activity(
                      item.businessObject.name,
                      null,
                      0,
                      [],
                      item.id
                    );
                    prev.next = activity;
                    prev = prev.next;
                    tempAgent.taskList.push(activity);

                    //If task has throw event connect to message task of other participants
                    if (item.outgoing.length > 1) {
                      console.log("has references: ", item.businessObject.name);
                      activity.throwId = item.outgoing[1].target.id;
                    }
                  } else if (item.type === BPMN_TYPE.START_EVENT) {
                    console.log(item.businessObject.name);
                    //SPLIT NAME TO GET NAME AND START TYPE
                    const split = item.businessObject.name.split("|");
                    console.log(split);
                    const startType = getEventStartType(split[0].trim());
                    const realName = split[1].trim();
                    const startEvent = new Event(
                      realName,
                      null,
                      0,
                      EVENT_TYPE.START,
                      startType,
                      0,
                      [],
                      item.id
                    );

                    tempAgent.startEvent = startEvent;
                    tempAgent.taskList.push(startEvent);
                    prev = startEvent;

                    //Add participants id and child id to references array
                    CURRENT_PARTICIPANTS_DATA.referenceEvents.push({
                      event: startEvent,
                      agent: tempAgent,
                    });
                  } else if (item.type === BPMN_TYPE.INTERMEDIATE_EVENT) {
                    console.log(item.businessObject.name);
                    const split = item.businessObject.name.split("|");
                    console.log(split);
                    const startType = getEventStartType(split[0].trim());
                    const realName = split[1].trim();
                    const immediateEvent = new Event(
                      realName,
                      null,
                      0,
                      EVENT_TYPE.INTERMEDIATE,
                      startType,
                      0,
                      [],
                      item.id
                    );

                    prev.next = immediateEvent;
                    prev = prev.next;

                    CURRENT_PARTICIPANTS_DATA.referenceEvents.push({
                      event: immediateEvent,
                      agent: tempAgent,
                    });
                  } else if (item.type === BPMN_TYPE.END_EVENT) {
                    console.log(item.businessObject.name);
                    const endEvent = new Event(
                      item.businessObject.name,
                      null,
                      0,
                      EVENT_TYPE.END,
                      EVENT_START_TYPE.AUTO,
                      0,
                      [],
                      item.id
                    );

                    prev.next = endEvent;
                    tempAgent.taskList.push(endEvent);
                  }
                });
              }
            });

            constructGraph(VERTICES);
          }
        });
      }
    }
  }, [diagram]);

  const props = {
    name: "file",
    action: "https://www.mocky.io/v2/5cc8019d300000980a055e76",
    headers: {
      authorization: "authorization-text",
    },
    onChange(info) {
      if (info.file.status !== "uploading") {
        //console.log(info.file, info.fileList);
      }
      if (info.file.status === "done") {
        console.log(info.file.name + " success");
        //message.success(`${info.file.name} file uploaded successfully`);
      } else if (info.file.status === "error") {
        console.log(info.file.name + " fail");
        //message.error(`${info.file.name} file upload failed.`);
      }
    },
  };

  const OnClick = () => {
    currentModeler.saveXML().then((xml) => {
      var encodedData = encodeURIComponent(xml.xml);
      const link = document.createElement("a");
      link.download = "test.bpmn";
      link.href = "data:text/csv;charset=utf-8," + encodedData;
      link.click();
      var elementRegistry = currentModeler.get("elementRegistry");
      elementRegistry.forEach(function (elem, gfx) {
        if (elem.businessObject.$instanceOf("bpmn:Gateway")) {
          // do something with the task
          /* console.log("yes");
          console.log(elem); */
        }
      });
    });
    //diagram.saveXML().then(( xml ) => console.log(xml));
  };

  const onImport = (res) => {
    diagramSet(res);
    CURRENT_BPMN_MODEl.diagram = res;
    RESET_IMPORT();
  };

  return (
    <div className="bg-white">
      <Button
        type="primary"
        onClick={OnClick}
        style={{
          background: "red",
          borderColor: "yellow",
        }}
      >
        Download
      </Button>
      <Upload
        {...props}
        beforeUpload={(file) => {
          const reader = new FileReader();

          reader.onload = (e) => {
            console.log("[Upload]", e.target.result);
            console.log(moddle.fromXML(e.target.result));
            onImport(e.target.result);
          };
          reader.readAsText(file);

          // Prevent upload
          return false;
        }}
      >
        <Button
          style={{ background: "red", borderColor: "yellow" }}
          type="primary"
        >
          Import
        </Button>
      </Upload>
      <Button
        onClick={() => {
          console.log(fill);
          for (let i = 0; i < fill.length; i++) {
            modeling.setColor(fill[i], yellow);
          }
        }}
      >
        Next
      </Button>
      <div
        id="container"
        style={{
          border: "1px solid #000000",
          height: "90vh",
          width: "80vw",
          margin: "auto",
        }}
      ></div>
    </div>
  );
}
export default BpmnModeler;
