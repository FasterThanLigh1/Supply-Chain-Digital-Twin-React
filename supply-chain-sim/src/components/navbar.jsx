import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import supplyChainIcon from "../../public/Image/supply-chain.png";
import { Menu, Space, Dropdown, Button } from "antd";
import {
  BuildOutlined,
  HomeOutlined,
  NodeIndexOutlined,
  DashboardOutlined,
  ClusterOutlined,
  UserOutlined,
  SettingOutlined,
  LogoutOutlined,
} from "@ant-design/icons";
import {
  simulationRoute,
  bpmnRoute,
  landingRoute,
  analysisRoute,
  digitalTwinRoute,
} from "../constants/route";
import supabase from "../config/supabaseClient";
import { useDispatch } from "react-redux";
import { setCurrentUser } from "../features/userSlice";

const iconProps = {
  size: "100%",
};

const dropDownItems = [
  {
    key: "1",
    label: <div>Yes</div>,
  },
];

const Navigation = () => {
  const [current, setCurrent] = useState("home");
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const onClick = (e) => {
    console.log("click ", e);
    setCurrent(e.key);
  };

  async function signOutUser() {
    const { error } = await supabase.auth.signOut();
    dispatch(setCurrentUser(null));
    navigate(landingRoute);
  }

  const items = [
    {
      label: <Link to={digitalTwinRoute}>Digital Twin</Link>,
      key: "twin",
      icon: <ClusterOutlined style={{ fontSize: iconProps.size }} />,
    },
    {
      label: <Link to={bpmnRoute}>Bpmn</Link>,
      key: "bpmn",
      icon: <BuildOutlined style={{ fontSize: iconProps.size }} />,
    },
    {
      label: <Link to={simulationRoute}>Simulation</Link>,
      key: "simulation",
      icon: <NodeIndexOutlined style={{ fontSize: iconProps.size }} />,
    },
    {
      label: <Link to={analysisRoute}>Analysis</Link>,
      key: "analysis",
      icon: <DashboardOutlined style={{ fontSize: iconProps.size }} />,
    },
    {
      label: <a onClick={() => signOutUser()} />,
      key: "logout",
      icon: <LogoutOutlined style={{ fontSize: iconProps.size }} />,
    },
  ];

  return (
    <nav className="sticky top-0 bg-white z-50 ">
      <div className="flex flex-nowrap items-center justify-between p-4 ">
        <a href="https://flowbite.com/" className="flex items-center">
          <img src={supplyChainIcon} className="h-8 mr-3" alt="Flowbite Logo" />
          <span className="self-center text-2xl font-semibold whitespace-nowrap dark:text-white">
            Digital Twin
          </span>
        </a>
        <button
          data-collapse-toggle="navbar-default"
          type="button"
          className="inline-flex items-center p-2 ml-3 text-sm text-gray-500 rounded-lg md:hidden hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200 dark:text-gray-400 dark:hover:bg-gray-700 dark:focus:ring-gray-600"
          aria-controls="navbar-default"
          aria-expanded="false"
        >
          <span className="sr-only">Open main menu</span>
          <svg
            className="w-6 h-6"
            aria-hidden="true"
            fill="currentColor"
            viewBox="0 0 20 20"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fillRule="evenodd"
              d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
              clipRule="evenodd"
            ></path>
          </svg>
        </button>
        <Menu
          className="text-2xl"
          selectedKeys={[current]}
          mode="horizontal"
          items={items}
          onClick={onClick}
          disabledOverflow
        />
      </div>
    </nav>
  );
};
export default Navigation;
