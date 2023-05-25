import React, { useContext, useEffect, useRef, useState } from "react";
import Modeler from "bpmn-js/lib/Viewer";
import KeyboardMoveModule from "diagram-js/lib/navigation/keyboard-move";
import MoveCanvasModule from "diagram-js/lib/navigation/movecanvas";
import ZoomScrollModule from "diagram-js/lib/navigation/zoomscroll";
import BpmnViewer from "bpmn-js";
import NavigatedViewer from "bpmn-js";
import "bpmn-js/dist/assets/diagram-js.css";
import "bpmn-js/dist/assets/bpmn-font/css/bpmn-embedded.css";
import axios from "axios";
import { Button, Upload, message } from "antd";
import "bpmn-js/dist/assets/diagram-js.css";

const defaultColor = {
  stroke: "black",
  fill: "white",
};

const yellow = {
  stroke: "black",
  fill: "green",
};

const fill = [];

function BpmnFooter(url) {
  const [diagram, diagramSet] = useState("");
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
          additionalModules: [
            KeyboardMoveModule,
            MoveCanvasModule,
            ZoomScrollModule,
          ],
          keyboard: {
            bindTo: document,
          },
        });

        //window.alert("WANT ME TO CONTINUE?");
        modelerSet(modeler);
        /* setBusiness(modeler);
        console.log(business); */
        modeler.importXML(diagram, (err) => {
          if (err) {
          } else {
            var elementRegistry = modeler.get("elementRegistry");
            var canvas = modeler.get("canvas");
            console.log(elementRegistry);
            elementRegistry.forEach(function (elem, gfx) {
              if (elem.type === "bpmn:StartEvent") {
                // do something with the task
                const businessObject = elem.businessObject;

                /* elem.di.set("stroke", yellow.stroke);
                elem.di.set("fill", yellow.fill); */
                /* elem.di.fill = yellow.fill; */
                console.log("Start", elem);
                canvas.addMarker(elem.id, "highlight");
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

  return (
    <div
      id="container"
      style={{
        border: "1px solid #000000",
        height: "400px",
        width: "100%",
        margin: "auto",
      }}
    />
  );
}
export default BpmnFooter;
