import React from "react";
import { motion } from "framer-motion";
import {
  LaptopOutlined,
  NotificationOutlined,
  UserOutlined,
  DribbbleOutlined,
  TwitterOutlined,
  InstagramOutlined,
  GithubOutlined,
} from "@ant-design/icons";
import {
  Button,
  Row,
  Col,
  Typography,
  Form,
  Input,
  Switch,
  Breadcrumb,
  Layout,
  Menu,
  theme,
  Select,
} from "antd";
import { useState } from "react";
import CustomSider from "../components/sider";
import LineChart from "../components/lineChart";
import Dashboard from "../components/dashboard";
import Axios from "axios";
import { useEffect } from "react";

const { Header, Content, Footer, Sider } = Layout;

const items2 = [UserOutlined, LaptopOutlined, NotificationOutlined].map(
  (icon, index) => {
    const key = String(index + 1);
    return {
      key: `sub${key}`,
      icon: React.createElement(icon),
      label: `subnav ${key}`,
      children: new Array(4).fill(null).map((_, j) => {
        const subKey = index * 4 + j + 1;
        return {
          key: subKey,
          label: `option${subKey}`,
        };
      }),
    };
  }
);

function AnalyticPage() {
  const [simulationOption, setSimulationOption] = useState([]);
  const [menuItem, setMenuItem] = useState([]);
  const [curSimId, setCurSimId] = useState(null);
  const [analyticsData, setAnalyticsData] = useState([]);

  useEffect(() => {
    Axios.get("http://localhost:8080/get_simulation_list").then((response) => {
      console.log(response.data);
      const temp = response.data.map((e) => {
        return {
          value: e.SimulationKey,
          label: e.SimulationKey,
        };
      });
      setSimulationOption(temp);
    });
  }, []);

  const {
    token: { colorBgContainer },
  } = theme.useToken();

  const handleChange = (value) => {
    console.log(`selected ${value}`);

    Axios.get(`http://localhost:8080/get_participants/${value}`).then(
      (response) => {
        console.log(response.data);
        const temp = response.data.map((e) => {
          return {
            key: e.ParticipantKey,
            label: e.ParticipantKey,
          };
        });
        setCurSimId(value);
        setMenuItem(temp);
      }
    );
  };

  const onClickParticipant = (value) => {
    console.log(`selected ${value.key}`);
    Axios.get(
      `http://localhost:8080/get_statistic/${curSimId}/${value.key}`
    ).then((response) => {
      console.log(response.data);
      setAnalyticsData(response.data);
    });
  };

  return (
    <motion.div
      className="text-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 1 }}
      transition={{ duration: 0.75, ease: "easeOut" }}
    >
      <Layout
        className="layout-default layout-signin"
        style={{ width: "100%" }}
      >
        <Content
          style={{
            padding: "0 50px",
            width: "100%",
          }}
        >
          <Breadcrumb
            style={{
              margin: "16px 0",
            }}
            items={[
              {
                title: "Home",
              },
              {
                title: "Analytics",
              },
            ]}
          />
          <Layout
            style={{
              padding: "24px 0",
              background: colorBgContainer,
            }}
          >
            <Sider
              style={{
                background: colorBgContainer,
              }}
              width={200}
            >
              <Typography>Choose Simulation</Typography>
              <Select
                style={{
                  width: "100%",
                }}
                options={simulationOption}
                onChange={handleChange}
              />
              <Menu
                mode="inline"
                defaultSelectedKeys={["1"]}
                defaultOpenKeys={["sub1"]}
                style={{
                  height: "100%",
                }}
                onClick={onClickParticipant}
                items={menuItem}
              />
            </Sider>
            <Content
              style={{
                padding: "0 24px",
                minHeight: 280,
              }}
            >
              <Dashboard data={analyticsData} />
            </Content>
          </Layout>
        </Content>
        <Footer
          style={{
            textAlign: "center",
          }}
        >
          Ant Design ©2023 Created by Ant UED
        </Footer>
      </Layout>
    </motion.div>
  );
}

export default AnalyticPage;
