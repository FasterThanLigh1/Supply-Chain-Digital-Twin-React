import React, { useEffect } from "react";
import {
  Layout,
  Menu,
  Space,
  Input,
  Typography,
  InputNumber,
  Button,
  List,
  Avatar,
  Modal,
} from "antd";
import { useState } from "react";
import { CURRENT_GRAPH, curData } from "../globalVariable";
import { useDispatch, useSelector } from "react-redux";
import {
  setChosen,
  setX,
  setY,
  selectName,
  selectX,
  selectY,
  selectInventory,
  selectProcesses,
  selectType,
  selectId,
} from "../features/chosenSlice";
import { Event, Gateway, Activity } from "../constants/class";

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

const { Sider } = Layout;

function Inspector() {
  const [listItem, setListItem] = useState(data);
  const [name, setName] = useState("default");
  const [duration, setDuration] = useState(0);

  const [openEvent, setOpenEvent] = useState(false);
  const [openActivity, setOpenActivity] = useState(false);
  const [openGateway, setOpenGateway] = useState(false);
  const [type, setType] = useState("default");
  const [startType, setStartType] = useState("default");
  const [startTime, setStartTime] = useState(0);

  const dispatch = useDispatch();
  const thisName = useSelector(selectName);
  const thisX = useSelector(selectX);
  const thisY = useSelector(selectY);
  const thisInventory = useSelector(selectInventory);
  const thisProcesses = useSelector(selectProcesses);
  const thisType = useSelector(selectType);
  const thisId = useSelector(selectId);

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
            curData.currentTask = CURRENT_GRAPH.AdjList[i].data.taskList[j];
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

  return (
    <div>
      <Sider width={300}>
        <Space direction="vertical" size={10}>
          <Input
            addonBefore={<Typography className="text-white">Name</Typography>}
            value={thisName}
          />
          <Input
            addonBefore={<Typography className="text-white">Type</Typography>}
            value={thisType}
          />
          <InputNumber
            addonBefore={
              <Typography className="text-white">Latitude</Typography>
            }
            defaultValue="0"
            value={thisX}
            min="-90"
            max="90"
            step="0.00000000000001"
            stringMode
            onChange={(e) => {
              curData.currentAgent.location.x = e;
              dispatch(setX(e));
            }}
          />
          <InputNumber
            addonBefore={
              <Typography className="text-white">Longtitude</Typography>
            }
            defaultValue="0"
            value={thisY}
            min="-180"
            max="180"
            step="0.00000000000001"
            stringMode
            onChange={(e) => {
              curData.currentAgent.location.y = e;
              dispatch(setY(e));
            }}
          />
        </Space>
        <Typography className="text-white">Task List:</Typography>
        <List
          itemLayout="horizontal"
          dataSource={listItem}
          renderItem={(item, index) => (
            <List.Item>
              <Button
                onClick={() => {
                  showModal(item.id);
                }}
                className="text-white"
              >
                {item.title}
              </Button>
            </List.Item>
          )}
        />
      </Sider>
      <Modal
        title={name}
        open={openEvent}
        onOk={() => {
          setOpenEvent(false);
        }}
        onCancel={() => {
          setOpenEvent(false);
        }}
      >
        <Space direction="vertical" size={10}>
          <Input addonBefore={<Typography>Type</Typography>} value={type} />
          <Input
            addonBefore={<Typography>Start Type</Typography>}
            value={startType}
          />
          <InputNumber
            addonBefore={<Typography>Start Time</Typography>}
            defaultValue="0"
            value={startTime}
            min="0"
            max="24"
            onChange={(e) => {
              console.log(e);
              setStartTime(e);
              curData.currentTask.startTime = e;
            }}
          />
        </Space>
      </Modal>
      <Modal
        title={name}
        open={openActivity}
        onOk={() => {
          setOpenActivity(false);
        }}
        onCancel={() => {
          setOpenActivity(false);
        }}
      >
        <InputNumber
          addonBefore={<Typography>Duration</Typography>}
          defaultValue="0"
          value={duration}
          onChange={(e) => {
            console.log(e);
            curData.currentTask.duration = e;
            setDuration(e);
          }}
        />
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
    </div>
  );
}

export default Inspector;
