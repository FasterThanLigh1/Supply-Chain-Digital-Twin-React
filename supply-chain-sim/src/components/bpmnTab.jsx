import React, { useState } from "react";
import MyReactBpmn from "./myBpmnReact";
import { useEffect } from "react";
import { SUPABASE_TABLE } from "../constants";
import supabase from "../config/supabaseClient";
import { Skeleton } from "antd";

function BpmnTab({ state }) {
  const [bpmn, setBpmn] = useState(null);

  useEffect(() => {
    api_fetchBpmn();
    console.log("STATE: ", state);
  }, []);

  useEffect(() => {
    console.log("State change: ", state);
  }, [state]);

  const api_fetchBpmn = async () => {
    const { data, error } = await supabase
      .from(SUPABASE_TABLE.ORGANIZATION_LIST)
      .select()
      .eq("id", "f308b795-826e-4a13-b6e2-28ce632b0a94");
    if (error) {
      setfetchError(error);
      console.log(error);
    } else {
      setBpmn(data[0].bpmn);
    }
  };

  return (
    <div>
      {bpmn ? (
        <MyReactBpmn
          diagramXML={bpmn}
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
      ) : (
        <Skeleton />
      )}
    </div>
  );
}

export default BpmnTab;
