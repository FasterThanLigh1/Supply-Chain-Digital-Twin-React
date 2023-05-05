import React, { useContext, useEffect, useRef, useState } from "react";
import Modeler from "bpmn-js/lib/Modeler";
import "bpmn-js/dist/assets/diagram-js.css";
import "bpmn-js/dist/assets/bpmn-font/css/bpmn-embedded.css";
import axios from "axios";
import { Button, Upload, message } from "antd";
import BpmnModdle from "bpmn-moddle";

const moddle = new BpmnModdle();

function BpmnModeler(url) {
  const [diagram, diagramSet] = useState("");
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
          keyboard: {
            bindTo: document,
          },
        });
        modelerSet(modeler);
        /* setBusiness(modeler);
        console.log(business); */
        modeler.importXML(diagram, (err) => {
          if (err) {
          } else {
            var elementRegistry = modeler.get("elementRegistry");
            elementRegistry.forEach(function (elem, gfx) {
              if (elem.businessObject.$instanceOf("bpmn:StartEvent")) {
                // do something with the task
                //console.log(elem);
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
            elementRegistry.forEach(function (elem, gfx) {
              if (
                elem.businessObject.$instanceOf("bpmn:IntermediateThrowEvent")
              ) {
                console.log(
                  "Throw immediate event: " + elem.businessObject.name
                );
              }
              if (elem.businessObject.$instanceOf("bpmn:ExclusiveGateway")) {
                console.log(
                  "Throw exclusive gateway: " + elem.businessObject.name
                );
              }
              if (elem.businessObject.$instanceOf("bpmn:Participant")) {
                //console.log(elem);

                // do something with the task
                console.log(elem.businessObject.name);
                elem.children.sort(function (a, b) {
                  return a.x - b.x;
                });
                /* elem.children.sort(function (a, b) {
                  return a.y - b.y;
                }); */
                console.log(elem.children);
                console.log("[id]:", elem.businessObject.id);
                const split = elem.businessObject.name.split("|");
                split[0] = split[0].trim();
                split[1] = split[1].trim();
                var p = new Pools(
                  elem.x,
                  elem.y,
                  "",
                  "",
                  [],
                  [],
                  "",
                  0,
                  0,
                  split[1],
                  split[0],
                  [],
                  undefined,
                  elem.businessObject.id
                );
                elem.children.forEach((item) => {
                  let temp = {
                    name: item.businessObject.name,
                    id: item.id,
                    type: item.type,
                  };
                  if (temp.type === "bpmn:StartEvent") {
                    p.startEvent = temp;
                    p.unstructuredSeq.push(temp);
                  } else if (temp.type === "bpmn:EndEvent") {
                    p.endEvent = temp;
                    p.unstructuredSeq.push(temp);
                  } else if (temp.type === "bpmn:Task") {
                    p.tasks.push(temp);
                    p.unstructuredSeq.push(temp);
                  } else if (temp.type === "bpmn:SequenceFlow") {
                    p.sequenceFlow.push(temp);
                  } else if (temp.type === "bpmn:IntermediateCatchEvent") {
                    p.unstructuredSeq.push(temp);
                  } else if (temp.type === "bpmn:ParallelGateway") {
                    p.unstructuredSeq.push(temp);
                  } else if (temp.type === "bpmn:DataStoreReference") {
                    p.database = temp;
                  }
                });
                console.log("Unstructred:");
                console.log(p.unstructuredSeq);
                p.thisPool = elem;
                console.log(elem);
                console.log(p);
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
      <Button type="primary" onClick={OnClick}>
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
        <Button type="primary">Import</Button>
      </Upload>
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
