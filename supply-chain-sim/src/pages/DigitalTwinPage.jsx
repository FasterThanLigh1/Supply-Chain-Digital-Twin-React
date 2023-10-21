import { Upload, Tabs, Skeleton, Drawer, FloatButton } from "antd";
import React, { useEffect, useState } from "react";
import RealtimeMap from "../components/realtimeMap";
import { useDispatch, useSelector } from "react-redux";
import { SUPABASE_TABLE } from "../constants";
import _ from "lodash";
import { selectUser } from "../features/userSlice";
import supabase from "../config/supabaseClient";
import SalesData from "../components/salesData";
import IoTData from "../components/iotData";
import BpmnTab from "../components/bpmnTab";

const { Dragger } = Upload;

function DigitalTwinPage() {
  const currentUser = useSelector(selectUser);
  const [sessionUser, setSessionUser] = useState(null);
  const [openDrawer, setOpenDrawer] = useState(false);
  const [organizationState, setOrganizationState] =
    useState("Prepare Material");

  useEffect(() => {
    console.log("Current user: ", currentUser);
    let data = sessionStorage.getItem("currentUser");
    console.log("Session user: ", data);
    setSessionUser(currentUser);
    if (currentUser == null) return;
  }, []);

  async function INSERTOrganization(name) {
    console.log("Success");
    const { error } = await supabase
      .from(SUPABASE_TABLE.ORGANIZATION_LIST)
      .insert({ name: name });
  }

  const onChange = (key) => {
    console.log(key);
  };
  const items = [
    {
      key: "1",
      label: "Real time",
      children: <RealtimeMap />,
    },
    // {
    //   key: "2",
    //   label: "Business process models",
    //   // children: <BpmnTab state={organizationState} />,
    //   children: (
    //     <button
    //       onClick={() => {
    //         setOpenDrawer(true);
    //         setOrganizationState("Something");
    //       }}
    //     >
    //       Test
    //     </button>
    //   ),
    // },
    {
      key: "2",
      label: "IoT Data History",
      children: <IoTData />,
    },
    {
      key: "3",
      label: "Sales History",
      children: <SalesData />,
    },
  ];

  return (
    <div>
      {sessionUser == null ? (
        <Skeleton />
      ) : (
        <div>
          <Tabs defaultActiveKey="1" items={items} onChange={onChange} />
          <FloatButton type="primary" onClick={() => setOpenDrawer(true)} />
          <Drawer
            title="Basic Drawer"
            placement="bottom"
            closable={false}
            onClose={() => {
              setOpenDrawer(false);
            }}
            open={openDrawer}
            key="bottom"
          >
            <BpmnTab state={organizationState} />
          </Drawer>
        </div>
      )}
    </div>
  );
}

export default DigitalTwinPage;
