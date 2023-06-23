import React, { useEffect } from "react";
import { motion } from "framer-motion";
import Mapbox from "../components/mapbox";
import CustomSider from "../components/sider";
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
} from "antd";
import {
  LaptopOutlined,
  NotificationOutlined,
  UserOutlined,
  DribbbleOutlined,
  TwitterOutlined,
  InstagramOutlined,
  GithubOutlined,
} from "@ant-design/icons";
import { useState } from "react";
const { Header, Content, Footer, Sider } = Layout;
import { useSelector, useDispatch } from "react-redux";
import { CURRENT_GRAPH } from "../globalVariable";
import Inspector from "../components/inspector";
import BpmnFooter from "../components/bpmnFooter";
import Axios from "axios";
import { MAIN_COLOR } from "../constants";
import InventoryPanel from "../components/inventory";

function SimulationPage() {
  const dispatch = useDispatch();
  const colorBgContainer = MAIN_COLOR;
  return (
    <motion.div
      className="text-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 1 }}
      transition={{ duration: 0.75, ease: "easeOut" }}
    >
      {/* <Layout
        style={{
          minHeight: "100vh",
        }}
      >
        <CustomSider />
        <Layout className="site-layout">
          <Content
            style={{
              textAlign: "center",
              height: 480,
              wdith: 1100,
            }}
          >
            <div
              style={{
                background: colorBgContainer,
              }}
            >
              <Mapbox graph={CURRENT_GRAPH} />
            </div>
          </Content>
          <Footer
            style={{
              textAlign: "center",
              height: 480,
            }}
          >
            <div className="customer-footer">
              <BpmnFooter />
              <Button onClick={testSubmit}>Yes</Button>
            </div>
          </Footer>
        </Layout>
        <Inspector />
      </Layout> */}
      <Layout className="layout-default layout-signin">
        <Content
          style={{
            padding: "0 50px",
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
                title: "Simulation",
              },
            ]}
          />
          <Layout
            style={{
              padding: "24px 0 24px",
              borderWidth: "1px",
              borderStyle: "solid",
              borderColor: "blue",
              background: colorBgContainer,
            }}
          >
            <CustomSider colorBgContainer={colorBgContainer} />
            <Content
              style={{
                padding: "0 24px",
                minHeight: 280,
              }}
            >
              <Mapbox graph={CURRENT_GRAPH} />
            </Content>
          </Layout>
          <Layout
            style={{
              padding: "24px 0 24px",
              borderWidth: "1px",
              borderStyle: "solid",
              borderColor: "blue",
              background: colorBgContainer,
            }}
          >
            <Sider
              style={{
                background: colorBgContainer,
              }}
              width={200}
              height={1000}
            >
              <Inspector />
            </Sider>
            <Content
              style={{
                padding: "0 24px",
                minHeight: 280,
              }}
            >
              <BpmnFooter />
              <InventoryPanel />
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

export default SimulationPage;
