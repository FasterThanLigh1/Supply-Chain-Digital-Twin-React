import React, { useEffect } from "react";
import {
  Form,
  Space,
  Input,
  Typography,
  InputNumber,
  Button,
  List,
  Avatar,
  Modal,
  Select,
} from "antd";
import { MinusCircleOutlined, PlusOutlined } from "@ant-design/icons";
import { useState } from "react";
import {
  CURRENT_GRAPH,
  CURRENT_SIMULATION_DATA,
  TASK_DATA,
  VERTICES,
} from "../globalVariable";
import { useDispatch, useSelector } from "react-redux";
import {
  setLongitude,
  setLatitude,
  selectName,
  selectLongitude,
  selectLatitude,
  selectType,
  selectId,
} from "../features/chosenSlice";
import { Event, Gateway, Activity, Transportation } from "../constants/class";

const data = [
  {
    title: "Ant Design Title 1",
  },
  {
    title: "Ant Design Title 2",
  },
  {
    title: "Ant Design Title 3",
  },
  {
    title: "Ant Design Title 4",
  },
];

const taskOption = [
  {
    value: "jack",
    label: "Jack",
  },
  {
    value: "lucy",
    label: "Lucy",
  },
  {
    value: "Yiminghe",
    label: "yiminghe",
  },
  {
    value: "disabled",
    label: "Disabled",
    disabled: true,
  },
];

function Inspector() {
  const [listItem, setListItem] = useState(data);
  const [name, setName] = useState("default");
  const [duration, setDuration] = useState(0);
  const [tempCallbacks, setTempCallbacks] = useState([]);
  const [transportPlaceOption, setTransportPlaceOption] = useState([]);

  const [openEvent, setOpenEvent] = useState(false);
  const [openActivity, setOpenActivity] = useState(false);
  const [openGateway, setOpenGateway] = useState(false);
  const [openTransportation, setOpenTransportation] = useState(false);
  const [type, setType] = useState("default");
  const [startType, setStartType] = useState("default");
  const [startTime, setStartTime] = useState(0);
  const [taskOptions, setTaskOptions] = useState(taskOption);

  const dispatch = useDispatch();
  const thisName = useSelector(selectName);
  const thisLongitude = useSelector(selectLongitude);
  const thisLatitude = useSelector(selectLatitude);
  const thisType = useSelector(selectType);
  const thisId = useSelector(selectId);

  const onFinish = (values) => {
    console.log("Received values of form:", values);
    var tempSrc = null;
    var tempDest = null;
    for (let i = 0; i < VERTICES.length; i++) {
      if (VERTICES[i].name == values.transportation[0].source) {
        tempSrc = VERTICES[i];
      } else if (VERTICES[i].name == values.transportation[0].destination) {
        tempDest = VERTICES[i];
      }
    }
    const transportation = new Transportation(
      values.transportation[0].name,
      "Truck",
      tempSrc,
      tempDest,
      values.transportation[0].capacity,
      []
    );
    CURRENT_SIMULATION_DATA.currentAgent.customerDemand.push({
      demand: tempDest.demand,
      transport: transportation,
    });
    CURRENT_SIMULATION_DATA.currentAgent.transport.push(transportation);
    console.log("After update: ", CURRENT_SIMULATION_DATA.currentAgent);
  };

  useEffect(() => {
    const tempTaskOption = TASK_DATA.tasks.map((e) => {
      return {
        value: e.name,
        label: e.name,
      };
    });
    setTaskOptions(tempTaskOption);
    console.log(VERTICES);
    const tempLocationOption = VERTICES.map((e) => {
      return {
        value: e.name,
        label: e.name,
      };
    });
    setTransportPlaceOption(tempLocationOption);
  }, []);

  const showModal = (id) => {
    console.log(id);
    for (let i = 0; i < CURRENT_GRAPH.AdjList.length; i++) {
      if (thisId == CURRENT_GRAPH.AdjList[i].data.id) {
        for (
          let j = 0;
          j < CURRENT_GRAPH.AdjList[i].data.taskList.length;
          j++
        ) {
          if (CURRENT_GRAPH.AdjList[i].data.taskList[j].id == id) {
            setName(CURRENT_GRAPH.AdjList[i].data.taskList[j].name);
            CURRENT_SIMULATION_DATA.currentTask =
              CURRENT_GRAPH.AdjList[i].data.taskList[j];
            console.log(CURRENT_GRAPH.AdjList[i].data.taskList[j]);
            if (CURRENT_GRAPH.AdjList[i].data.taskList[j] instanceof Event) {
              console.log("Event");
              setOpenEvent(true);
              setDuration(0);
              setType(CURRENT_GRAPH.AdjList[i].data.taskList[j].type);
              setStartType(CURRENT_GRAPH.AdjList[i].data.taskList[j].startType);
              setStartTime(CURRENT_GRAPH.AdjList[i].data.taskList[j].startTime);
            } else if (
              CURRENT_GRAPH.AdjList[i].data.taskList[j] instanceof Gateway
            ) {
              console.log("Gateway");
              setOpenGateway(true);
              setType(CURRENT_GRAPH.AdjList[i].data.taskList[j].type);
            } else if (
              CURRENT_GRAPH.AdjList[i].data.taskList[j] instanceof Activity
            ) {
              console.log("Activity");
              setDuration(CURRENT_GRAPH.AdjList[i].data.taskList[j].duration);
              setOpenActivity(true);
            } else {
              console.log("def");
            }
          }
        }
      }
    }
  };

  useEffect(() => {
    for (let i = 0; i < CURRENT_GRAPH.AdjList.length; i++) {
      if (thisId == CURRENT_GRAPH.AdjList[i].data.id) {
        console.log(CURRENT_GRAPH.AdjList[i].data.taskList);
        const newListItem = CURRENT_GRAPH.AdjList[i].data.taskList.map(
          (task) => {
            return {
              title: task.name,
              id: task.id,
            };
          }
        );
        setListItem(newListItem);
      }
    }
  }, [thisName]);

  const onChooseTask = (values) => {
    console.log(values);
    const callbackTest = [];
    //CLear array:
    callbackTest.length = 0;
    for (let i = 0; i < values.length; i++) {
      for (let j = 0; j < TASK_DATA.tasks.length; j++) {
        if (values[i] == TASK_DATA.tasks[j].name) {
          callbackTest.push({
            name: "TASK_DATA.tasks[j].name",
            callback: TASK_DATA.tasks[j].callback,
          });
        }
      }
    }
    setTempCallbacks(callbackTest);
    console.log("After: ", callbackTest);
  };

  const setCallback = () => {
    console.log(tempCallbacks);
    CURRENT_SIMULATION_DATA.currentTask.actionCallback = tempCallbacks;
    console.log(CURRENT_SIMULATION_DATA.currentTask);
    //CURRENT_SIMULATION_DATA.currentTask.actionCallback;
  };

  return (
    <div>
      <Space direction="vertical" size={10}>
        <Input addonBefore={<Typography>Name</Typography>} value={thisName} />
        <Input addonBefore={<Typography>Type</Typography>} value={thisType} />
        <InputNumber
          addonBefore={<Typography>Latitude</Typography>}
          defaultValue="0"
          value={thisLatitude}
          min="-90"
          max="90"
          step="0.00000000000001"
          stringMode
          onChange={(e) => {
            CURRENT_SIMULATION_DATA.currentAgent.location.latitude = e;
            dispatch(setLatitude(e));
          }}
        />
        <InputNumber
          addonBefore={<Typography>Longtitude</Typography>}
          defaultValue="0"
          value={thisLongitude}
          min="-180"
          max="180"
          step="0.00000000000001"
          stringMode
          onChange={(e) => {
            CURRENT_SIMULATION_DATA.currentAgent.location.longitude = e;
            dispatch(setLongitude(e));
          }}
        />
        <Button
          onClick={() => {
            setOpenTransportation(true);
          }}
        >
          Transportation Data
        </Button>
      </Space>

      <Typography>Task List:</Typography>
      <List
        itemLayout="horizontal"
        dataSource={listItem}
        renderItem={(item, index) => (
          <List.Item>
            <Button
              onClick={() => {
                showModal(item.id);
              }}
            >
              {item.title}
            </Button>
          </List.Item>
        )}
      />
      <Modal
        title={name}
        open={openEvent}
        onOk={() => {
          setOpenEvent(false);
          setCallback();
        }}
        onCancel={() => {
          setOpenEvent(false);
        }}
      >
        <Space direction="vertical" size={10}>
          <Input
            style={{ width: "100%" }}
            addonBefore={<Typography>Type</Typography>}
            value={type}
          />
          <Input
            style={{ width: "100%" }}
            addonBefore={<Typography>Start Type</Typography>}
            value={startType}
          />
          <InputNumber
            style={{ width: "100%" }}
            addonBefore={<Typography>Start Time</Typography>}
            defaultValue="0"
            value={startTime}
            min="0"
            max="24"
            onChange={(e) => {
              console.log(e);
              setStartTime(e);
              CURRENT_SIMULATION_DATA.currentTask.startTime = e;
            }}
          />
          <Select
            mode="multiple"
            allowClear
            placeholder="Select Tasks"
            style={{ width: "100%" }}
            options={taskOptions}
            onChange={onChooseTask}
          />
        </Space>
      </Modal>
      <Modal
        title={name}
        open={openActivity}
        onOk={() => {
          setOpenActivity(false);
          setCallback();
        }}
        onCancel={() => {
          setOpenActivity(false);
        }}
      >
        <Space direction="vertical" size={10}>
          <InputNumber
            addonBefore={<Typography>Duration</Typography>}
            defaultValue="0"
            value={duration}
            onChange={(e) => {
              console.log(e);
              CURRENT_SIMULATION_DATA.currentTask.duration = e;
              setDuration(e);
            }}
          />
          <Select
            mode="multiple"
            allowClear
            placeholder="Select Tasks"
            style={{ width: "100%" }}
            options={taskOptions}
            onChange={onChooseTask}
          />
        </Space>
      </Modal>
      <Modal
        title={name}
        open={openGateway}
        onOk={() => {
          setOpenGateway(false);
        }}
        onCancel={() => {
          setOpenGateway(false);
        }}
      >
        <Input addonBefore={<Typography>Type</Typography>} value={type} />
      </Modal>
      <Modal
        title={name}
        open={openTransportation}
        onOk={() => {
          setOpenTransportation(false);
        }}
        onCancel={() => {
          setOpenTransportation(false);
        }}
      >
        <Form
          name="dynamic_form_nest_item"
          onFinish={onFinish}
          style={{
            maxWidth: 600,
          }}
          autoComplete="off"
        >
          <Form.List name="transportation">
            {(fields, { add, remove }) => (
              <>
                {fields.map(({ key, name, ...restField }) => (
                  <Space
                    key={key}
                    style={{
                      display: "flex",
                      marginBottom: 8,
                    }}
                    align="baseline"
                  >
                    <Form.Item
                      {...restField}
                      name={[name, "name"]}
                      rules={[
                        {
                          required: true,
                          message: "Missing name",
                        },
                      ]}
                    >
                      <Input placeholder="Name" />
                    </Form.Item>
                    <Form.Item
                      {...restField}
                      name={[name, "source"]}
                      rules={[
                        {
                          required: true,
                          message: "Missing source",
                        },
                      ]}
                    >
                      <Select
                        options={transportPlaceOption}
                        placeholder="Source"
                      />
                    </Form.Item>
                    <Form.Item
                      {...restField}
                      name={[name, "destination"]}
                      rules={[
                        {
                          required: true,
                          message: "Missing destination",
                        },
                      ]}
                    >
                      <Select
                        options={transportPlaceOption}
                        placeholder="Destination"
                      />
                    </Form.Item>
                    <Form.Item
                      {...restField}
                      name={[name, "capacity"]}
                      rules={[
                        {
                          required: true,
                          message: "Missing capacity",
                        },
                      ]}
                    >
                      <InputNumber placeholder="capacity" />
                    </Form.Item>
                    <MinusCircleOutlined onClick={() => remove(name)} />
                  </Space>
                ))}
                <Form.Item>
                  <Button
                    type="dashed"
                    onClick={() => add()}
                    block
                    icon={<PlusOutlined />}
                  >
                    Add field
                  </Button>
                </Form.Item>
              </>
            )}
          </Form.List>
          <Form.Item>
            <Button type="primary" htmlType="submit">
              Submit
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}

export default Inspector;
