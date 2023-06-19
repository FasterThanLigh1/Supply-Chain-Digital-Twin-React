import { Button, Upload, message, Row, Col } from "antd";
import React, { useEffect } from "react";
import RealtimeMap from "../components/realtimeMap";
import { useDispatch, useSelector } from "react-redux";
import {
  pushChildTwin,
  selectChildTwinArray,
  setMainTwin,
} from "../features/dtdlSlice";
import { InboxOutlined } from "@ant-design/icons";
import { DTDL_CONTENT_ATTRIBUTES } from "../constants";
const { Dragger } = Upload;

function DigitalTwinPage() {
  const dispatch = useDispatch();
  const thisChildTwinArray = useSelector(selectChildTwinArray);

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
    constructData(myObject.contents);
    dispatch(pushChildTwin(myObject));
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
    console.log(
      "[Constructing] ",
      schema.reduce((acc, cur) => {
        if (cur["@type"] == DTDL_CONTENT_ATTRIBUTES.PROPERTY) {
          if (cur["schema"].hasOwnProperty("@type")) {
            const temp = cur["schema"]["fields"].reduce(
              (acc2, cur2) => ({ ...acc2, [cur2.name]: "default" }),
              {}
            );
            return { ...acc, [cur.name]: temp };
          } else {
            return { ...acc, [cur.name]: "default" };
          }
        }
        return { ...acc };
      }, {})
    );
  };

  return (
    <div>
      <Row>
        <Col span={12}>
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
              Support for a single or bulk upload. Strictly prohibited from
              uploading company data or other banned files.
            </p>
          </Dragger>
        </Col>
      </Row>
      <RealtimeMap />
    </div>
  );
}

export default DigitalTwinPage;
