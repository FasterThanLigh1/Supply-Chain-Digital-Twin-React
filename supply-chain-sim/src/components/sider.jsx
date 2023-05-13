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
import { CurrentGraph, curData } from "../globalVariable";
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

function CustomSider() {
  const dispatch = useDispatch();
  const [menuItem, setMenuItem] = useState(items);
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    const newItems = CurrentGraph.AdjList.map((item) => {
      return {
        label: item.data.name,
        key: item.id,
        icon: <UserOutlined />,
      };
    });
    setMenuItem(newItems);
  }, []);

  const onClickItem = (e) => {
    for (let i = 0; i < CurrentGraph.getLength(); i++) {
      if (CurrentGraph.AdjList[i].id == e.key) {
        console.log(CurrentGraph.AdjList[i].data);
        dispatch(
          setChosen({
            name: CurrentGraph.AdjList[i].data.name,
            x: CurrentGraph.AdjList[i].data.location.x,
            y: CurrentGraph.AdjList[i].data.location.y,
            inventory: CurrentGraph.AdjList[i].data.inventory,
            /* processes: CurrentGraph.AdjList[i].data.processes, */
            processes: [],
            type: CurrentGraph.AdjList[i].data.type,
            id: CurrentGraph.AdjList[i].data.id,
          })
        );
        curData.currentAgent = CurrentGraph.AdjList[i].data;
        console.log(curData.currentAgent);
        return;
      }
    }
  };

  return (
    <Sider
      collapsible
      collapsed={collapsed}
      onCollapse={(value) => setCollapsed(value)}
    >
      <div
        style={{
          height: 32,
          margin: 16,
          background: "rgba(255, 255, 255, 0.2)",
        }}
      >
        Agents
      </div>
      <Menu
        theme="dark"
        defaultSelectedKeys={["1"]}
        mode="inline"
        items={menuItem}
        onClick={onClickItem}
      />
    </Sider>
  );
}

export default CustomSider;
