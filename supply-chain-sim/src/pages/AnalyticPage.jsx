import React from "react";
import { motion } from "framer-motion";
import { Layout, Menu, theme } from "antd";
import { useState } from "react";
import CustomSider from "../components/sider";
const { Header, Content, Footer, Sider } = Layout;
function AnalyticPage() {
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
          <Header
            style={{
              padding: 0,
              background: colorBgContainer,
            }}
          />
          <Content
            style={{
              margin: "0 16px",
            }}
          >
            <div
              style={{
                padding: 24,
                minHeight: 360,
                background: colorBgContainer,
              }}
            >
              Bill is a cat.
            </div>
          </Content>
          <Footer
            style={{
              textAlign: "center",
            }}
          >
            Ant Design ©2023 Created by Ant UED
          </Footer>
        </Layout>
      </Layout>
    </motion.div>
  );
}

export default AnalyticPage;
