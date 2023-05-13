import React, { useEffect } from "react";
import { motion } from "framer-motion";
import Mapbox from "../components/mapbox";
import CustomSider from "../components/sider";
import { Layout, Typography, theme, Input, Space } from "antd";
import { useState } from "react";
const { Header, Content, Footer, Sider } = Layout;
import { useSelector, useDispatch } from "react-redux";
import { CurrentGraph } from "../globalVariable";
import Inspector from "../components/inspector";
import BpmnFooter from "../components/bpmnFooter";

function SimulationPage() {
  const dispatch = useDispatch();

  const {
    token: { colorBgContainer },
  } = theme.useToken();

  return (
    <motion.div
      className="container text-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 1 }}
      transition={{ duration: 0.75, ease: "easeOut" }}
    >
      <Layout
        style={{
          minHeight: "100vh",
        }}
      >
        <CustomSider />
        <Layout className="site-layout">
          {/* <Header
            style={{
              padding: 0,
              background: colorBgContainer,
              height: "0px",
            }}
          /> */}
          <Content
            /* style={{
              margin: "0 16px",
            }} */
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
              <Mapbox graph={CurrentGraph} />
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
            </div>
          </Footer>
        </Layout>
        <Inspector />
      </Layout>
    </motion.div>
  );
}

export default SimulationPage;
