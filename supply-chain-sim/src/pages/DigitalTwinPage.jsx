import { Button, Upload, message, Row, Col, Space, Input } from "antd";
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

const { Dragger } = Upload;

function DigitalTwinPage() {
  const dispatch = useDispatch();
  const thisChildTwinArray = useSelector(selectChildTwinArray);
  const currentUser = useSelector(selectUser);
  const [organizationIdRender, setOrganizationIdRender] = useState(null);
  const [organizationId, setOrganizationId] = useState(null);
  const [organizationName, setOrganizationName] = useState(null);

  useEffect(() => {
    console.log("Current user: ", currentUser);
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

  const childProps = {
    name: "file",
    multiple: true,
    action: "https://www.mocky.io/v2/5cc8019d300000980a055e76",
    onChange(info) {
      const { status } = info.file;
      if (status !== "uploading") {
        console.log(info.file, info.fileList);
      }
      if (status === "done") {
        message.success(`${info.file.name} file uploaded successfully.`);
        let reader = new FileReader();
        reader.onload = (e) => {
          console.log(e.target.result);
          onImport(e.target.result);
        };
        reader.readAsText(info.file.originFileObj);
      } else if (status === "error") {
        message.error(`${info.file.name} file upload failed.`);
      }
    },
    onDrop(e) {
      console.log("Dropped files", e.dataTransfer.files);
    },
  };

  const mainProps = {
    name: "file",
    action: "https://www.mocky.io/v2/5cc8019d300000980a055e76",
    onChange(info) {
      const { status } = info.file;
      if (status !== "uploading") {
        console.log(info.file, info.fileList);
      }
      if (status === "done") {
        message.success(`${info.file.name} file uploaded successfully.`);
        let reader = new FileReader();
        reader.onload = (e) => {
          console.log(e.target.result);
          onImportMain(e.target.result);
        };
        reader.readAsText(info.file.originFileObj);
      } else if (status === "error") {
        message.error(`${info.file.name} file upload failed.`);
      }
    },
    onDrop(e) {
      console.log("Dropped files", e.dataTransfer.files);
    },
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

  return (
    <div>
      {organizationIdRender == null ? (
        <div>
          <Space direction="vertical">
            <div>Not part of any organization</div>
            <div>Join a organization</div>
            <Input
              placeholder="Input Id"
              onChange={(e) => {
                setOrganizationId(e.target.value);
              }}
            />
            <Button
              onClick={() => {
                UPDATEUserOrganization(organizationId);
              }}
            >
              Join
            </Button>
            <div>Create an orgnazation</div>
            <Input
              placeholder="Name"
              addonBefore="NAME"
              onChange={(e) => {
                console.log(e.target.value);
                setOrganizationName(e.target.value);
              }}
            />
            <Dragger {...childProps}>
              <p className="ant-upload-drag-icon">
                <InboxOutlined />
              </p>
              <p className="ant-upload-text">
                Click or drag file to this area to upload
              </p>
              <p className="ant-upload-hint">
                Support for a single or bulk upload. Strictly prohibited from
                uploading company data or other banned files.
              </p>
            </Dragger>
            {/* <Row>
              <Col span={12}>
                <Dragger {...childProps}>
                  <p className="ant-upload-drag-icon">
                    <InboxOutlined />
                  </p>
                  <p className="ant-upload-text">
                    Click or drag file to this area to upload
                  </p>
                  <p className="ant-upload-hint">
                    Support for a single or bulk upload. Strictly prohibited
                    from uploading company data or other banned files.
                  </p>
                </Dragger>
              </Col>
              <Col span={12}>
                <Dragger {...mainProps}>
                  <p className="ant-upload-drag-icon">
                    <InboxOutlined />
                  </p>
                  <p className="ant-upload-text">
                    Click or drag file to this area to upload
                  </p>
                  <p className="ant-upload-hint">
                    Support for a single or bulk upload. Strictly prohibited
                    from uploading company data or other banned files.
                  </p>
                </Dragger>
              </Col>
            </Row> */}
            <Button
              onClick={() => {
                console.log("Yes");
                INSERTOrganization(organizationName);
              }}
            >
              Create
            </Button>
          </Space>
        </div>
      ) : (
        <div>
          {/* <Dragger {...childProps}>
            <p className="ant-upload-drag-icon">
              <InboxOutlined />
            </p>
            <p className="ant-upload-text">
              Click or drag file to this area to upload
            </p>
            <p className="ant-upload-hint">
              Support for a single or bulk upload. Strictly prohibited from
              uploading company data or other banned files.
            </p>
          </Dragger> */}
          <RealtimeMap />
        </div>
      )}
    </div>
  );
}

export default DigitalTwinPage;
