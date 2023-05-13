import React, { useContext, useEffect, useRef, useState } from "react";
import Modeler from "bpmn-js/lib/Modeler";
import "bpmn-js/dist/assets/diagram-js.css";
import "bpmn-js/dist/assets/bpmn-font/css/bpmn-embedded.css";
import axios from "axios";
import { Button, Upload, message } from "antd";
import BpmnModdle from "bpmn-moddle";
import TokenSimulationModule from "bpmn-js-token-simulation";
import SimulationSupportModule from "bpmn-js-token-simulation/lib/simulation-support";
import "bpmn-js-token-simulation/assets/css/bpmn-js-token-simulation.css";
import modeler from "bpmn-js-token-simulation/lib/modeler";

const moddle = new BpmnModdle();
let simulationSupport = null;

const defaultColor = {
  stroke: "black",
  fill: "white",
};

const yellow = {
  stroke: "black",
  fill: "green",
};

const fill = [];

function BpmnModeler(url) {
  const [diagram, diagramSet] = useState("");
  const [modeling, setModeling] = useState(null);
  const [upFile, upFileSet] = useState("");
  const [currentModeler, modelerSet] = useState(null);
  const container = document.getElementById("container");

  useEffect(() => {
    if (diagram.length === 0) {
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
            console.log("[modeler", currentModeler);
            var elementRegistry = currentModeler.get("elementRegistry");
            console.log(elementRegistry);
            //simulationSupport.triggerElement("Event_1sysx7h_di");
            elementRegistry.forEach(function (elem, gfx) {
              if (elem.type === "bpmn:Task") {
                fill.push(elem);
              }
            });
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

  return (
    <div className="bg-white">
      <Button
        type="primary"
        onClick={OnClick}
        style={{ background: "red", borderColor: "yellow" }}
      >
        Download
      </Button>
      <Upload
        {...props}
        beforeUpload={(file) => {
          const reader = new FileReader();

          reader.onload = (e) => {
            upFileSet(e.target.result);
            console.log("[Upload]", e.target.result);
            console.log(moddle.fromXML(e.target.result));
            diagramSet(e.target.result);
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
