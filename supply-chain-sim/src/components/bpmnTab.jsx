import React from "react";
import ReactBpmn from "react-bpmn";

function BpmnTab() {
  return (
    <ReactBpmn
      url="/public/diagram2.bpmn"
      onShown={() => {
        console.log("show");
      }}
      onLoading={() => {
        console.log("Loading");
      }}
      onError={() => {
        console.log("error");
      }}
      style={{ height: "100%" }}
    />
  );
}

export default BpmnTab;
