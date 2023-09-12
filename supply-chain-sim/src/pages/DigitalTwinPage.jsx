import {
  Button,
  Upload,
  message,
  Row,
  Col,
  Space,
  Input,
  Tabs,
  Skeleton,
} from "antd";
import React, { useEffect, useState } from "react";
import RealtimeMap from "../components/realtimeMap";
import { useDispatch, useSelector } from "react-redux";
import {
  pushChildTwin,
  selectChildTwinArray,
  setMainTwin,
} from "../features/dtdlSlice";
import { InboxOutlined } from "@ant-design/icons";
import { DTDL_CONTENT_ATTRIBUTES, SUPABASE_TABLE } from "../constants";
import _ from "lodash";
import { selectUser } from "../features/userSlice";
import supabase from "../config/supabaseClient";
import SalesData from "../components/salesData";
import IoTData from "../components/iotData";
import BpmnTab from "../components/bpmnTab";

const { Dragger } = Upload;

function DigitalTwinPage() {
  const dispatch = useDispatch();
  const thisChildTwinArray = useSelector(selectChildTwinArray);
  const currentUser = useSelector(selectUser);
  const [organizationIdRender, setOrganizationIdRender] = useState(null);
  const [sessionUser, setSessionUser] = useState(null);
  const [organizationId, setOrganizationId] = useState(null);
  const [organizationName, setOrganizationName] = useState(null);

  useEffect(() => {
    console.log("Current user: ", currentUser);
    let data = sessionStorage.getItem("currentUser");
    console.log("Session user: ", data);
    setSessionUser(currentUser);
    if (currentUser == null) return;
    api_fetchUserById(currentUser.id);
  }, []);

  const api_fetchUserById = async (id) => {
    console.log("Fecthing user");
    const { data, error } = await supabase
      .from(SUPABASE_TABLE.USER_LIST)
      .select()
      .eq("id", id);
    if (error) {
      console.log(error);
    } else {
      console.log("Cur user from user list:", data);
      console.log("Organization id: ", data[0].organizationId);
      setOrganizationIdRender(data[0].organization_id);
    }
  };

  const onImport = (e) => {
    console.log(e);
    var myObject = JSON.parse(e);
    const data = constructData(myObject.contents);
    constructConnections(myObject.contents);
    dispatch(
      pushChildTwin({
        schema: myObject,
        data: data,
      })
    );
    console.log(myObject);
  };

  const onImportMain = (e) => {
    console.log(e);
    var myObject = JSON.parse(e);
    dispatch(setMainTwin(myObject));
    console.log(myObject);
  };

  useEffect(() => {
    console.log(thisChildTwinArray);
  }, [thisChildTwinArray]);

  const constructData = (schema) => {
    const constructedProperties = schema.reduce((acc, cur) => {
      if (cur["@type"] == DTDL_CONTENT_ATTRIBUTES.PROPERTY) {
        if (cur["schema"].hasOwnProperty("@type")) {
          const temp = cur["schema"]["fields"].reduce(
            (acc2, cur2) => ({ ...acc2, [cur2.name]: "default" }),
            {}
          );
          return { ...acc, [cur.name]: temp };
        } else {
          return {
            ...acc,
            [cur.name]: "default",
            supplier: null,
            target: null,
          };
        }
      }
      return { ...acc };
    }, {});
    return constructedProperties;
  };

  const constructConnections = (schema) => {
    console.log("Constructing Connections: ", schema);
    for (let i = 0; i < schema.length; i++) {
      if (schema[i].type == DTDL_CONTENT_ATTRIBUTES.RELATIONSHIP) {
      }
    }
  };

  const getSchemaFromId = (childTwinArray, id) => {
    console.log(childTwinArray);
    for (let i = 0; i < childTwinArray.length; i++) {
      if (childTwinArray[i].schema["@id"] == id) {
        return childTwinArray[i];
      }
    }
    return null;
  };

  async function INSERTOrganization(name) {
    console.log("Success");
    const { error } = await supabase
      .from(SUPABASE_TABLE.ORGANIZATION_LIST)
      .insert({ name: name });
  }

  async function UPDATEUserOrganization(id) {
    const { error } = await supabase
      .from(SUPABASE_TABLE.USER_LIST)
      .update({ organization_id: id })
      .eq("id", currentUser.id);
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
    {
      key: "2",
      label: "Business process models",
      children: <BpmnTab />,
    },
    {
      key: "3",
      label: "IoT Data History",
      children: <IoTData />,
    },
    {
      key: "4",
      label: "Sales History",
      children: <SalesData />,
    },
  ];

  return (
    <div>
      {sessionUser == null ? (
        <Skeleton />
      ) : (
        // <div>
        //   <Space direction="vertical">
        //     <div>Not part of any organization</div>
        //     <div>Join a organization</div>
        //     <Input
        //       placeholder="Input Id"
        //       onChange={(e) => {
        //         setOrganizationId(e.target.value);
        //       }}
        //     />
        //     <Button
        //       onClick={() => {
        //         UPDATEUserOrganization(organizationId);
        //       }}
        //     >
        //       Join
        //     </Button>
        //   </Space>
        // </div>
        <div>
          <Tabs defaultActiveKey="1" items={items} onChange={onChange} />
        </div>
      )}
    </div>
  );
}

export default DigitalTwinPage;
