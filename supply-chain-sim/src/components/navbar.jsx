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
    // {
    //   label: <Link to={digitalTwinRoute}>Digital Twin</Link>,
    //   key: "twin",
    //   icon: <ClusterOutlined style={{ fontSize: iconProps.size }} />,
    // },
    {
      label: <a onClick={() => signOutUser()}>Sign Out</a>,
      key: "logout",
      icon: <LogoutOutlined style={{ fontSize: iconProps.size }} />,
    },
  ];

  return (
    <nav className="sticky top-0 bg-amber-400 z-50 ">
      <div className="flex flex-nowrap items-center justify-between p-4 ">
        <a href="https://flowbite.com/" className="flex items-center">
          <img src={supplyChainIcon} className="h-8 mr-3" alt="Flowbite Logo" />
          <span className="self-center text-2xl whitespace-nowrap text-white font-bold">
            DIGITAL TWIN
          </span>
        </a>
        <Menu
          className="text-2xl bg-amber-400 text-white"
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
