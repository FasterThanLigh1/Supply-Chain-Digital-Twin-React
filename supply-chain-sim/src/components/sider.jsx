import React, { useEffect } from "react";
import {
  FileOutlined,
  PieChartOutlined,
  UserOutlined,
  DesktopOutlined,
  TeamOutlined,
} from "@ant-design/icons";
import { Layout, Menu } from "antd";
import { useState } from "react";
import { CURRENT_GRAPH, curData } from "../globalVariable";
import { useDispatch, useSelector } from "react-redux";
import { setChosen } from "../features/chosenSlice";

const { Sider } = Layout;
function getItem(label, key, icon, children) {
  return {
    key,
    icon,
    children,
    label,
  };
}
export const items = [
  getItem("Option 1", "1", <PieChartOutlined />),
  getItem("Option 2", "2", <DesktopOutlined />),
  getItem("User", "sub1", <UserOutlined />, [
    getItem("Tom", "3"),
    getItem("Bill", "4"),
    getItem("Alex", "5"),
  ]),
  getItem("Team", "sub2", <TeamOutlined />, [
    getItem("Team 1", "6"),
    getItem("Team 2", "8"),
  ]),
  getItem("Files", "9", <FileOutlined />),
];

function CustomSider(colorBgContainer) {
  const dispatch = useDispatch();
  const [menuItem, setMenuItem] = useState(items);
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    const newItems = CURRENT_GRAPH.AdjList.map((item) => {
      return {
        label: item.data.name,
        key: item.id,
        icon: <UserOutlined />,
      };
    });
    setMenuItem(newItems);
  }, []);

  const onClickItem = (e) => {
    for (let i = 0; i < CURRENT_GRAPH.getLength(); i++) {
      if (CURRENT_GRAPH.AdjList[i].id == e.key) {
        console.log(CURRENT_GRAPH.AdjList[i].data);
        dispatch(
          setChosen({
            name: CURRENT_GRAPH.AdjList[i].data.name,
            x: CURRENT_GRAPH.AdjList[i].data.location.x,
            y: CURRENT_GRAPH.AdjList[i].data.location.y,
            inventory: CURRENT_GRAPH.AdjList[i].data.inventory,
            /* processes: CurrentGraph.AdjList[i].data.processes, */
            processes: [],
            type: CURRENT_GRAPH.AdjList[i].data.type,
            id: CURRENT_GRAPH.AdjList[i].data.id,
          })
        );
        curData.currentAgent = CURRENT_GRAPH.AdjList[i].data;
        console.log(curData.currentAgent);
        return;
      }
    }
  };

  return (
    <Sider
      style={{
        background: colorBgContainer,
      }}
      width={200}
    >
      <div
        style={{
          height: 16,
          margin: 16,
          color: "white",
        }}
      >
        AGENTS
      </div>
      <Menu
        style={{
          height: "100%",
        }}
        defaultSelectedKeys={["1"]}
        mode="inline"
        items={menuItem}
        onClick={onClickItem}
      />
    </Sider>
  );
}

export default CustomSider;
