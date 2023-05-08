import React, { useEffect } from "react";
import { motion } from "framer-motion";
import Mapbox from "../components/mapbox";
import CustomSider from "../components/sider";
import {
  Breadcrumb,
  Layout,
  Menu,
  Typography,
  theme,
  Form,
  Input,
  Checkbox,
  Button,
  InputNumber,
  Space,
} from "antd";
import { useState } from "react";
const { Header, Content, Footer, Sider } = Layout;
import { useSelector, useDispatch } from "react-redux";
import { increment, selectCount } from "../features/counterSlice";
import { supplier, distributor, customer1 } from "../constants/test";
import { items } from "../components/sider";
import { g } from "../constants/test";

function SimulationPage() {
  const count = useSelector(selectCount);
  const dispatch = useDispatch();

  const {
    token: { colorBgContainer },
  } = theme.useToken();

  const onFinish = (values) => {
    console.log("Success:", values);
  };
  const onFinishFailed = (errorInfo) => {
    console.log("Failed:", errorInfo);
  };

  useEffect(() => {
    console.log("Hello world", count);
    dispatch(increment);
  }, []);
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
          >
            <div
              style={{
                minHeight: 400,
                minWidth: 1000,
                width: "auto",
                height: "auto",
                background: colorBgContainer,
              }}
            >
              <Mapbox graph={g} />
            </div>
          </Content>
          <Footer
            style={{
              textAlign: "center",
            }}
          >
            <div className="customer-footer">
              Ant Design ©2023 Created by Ant UED jfhajfhsdlajflkdsaf
              dsfjsadhfalsdjfhjladshjf sdafjhasdfkjhasdjkfhaskdf
              adsfjhsdakfkhasdkfhsd adbjfasdhfksdahjfsdahkfjasd
              dajfhaskfhsadkhfjksdahfjksdahfk
            </div>
          </Footer>
        </Layout>
        <Sider width={300}>
          <Space direction="vertical" size={10}>
            <div className="text-white">
              <Space size={5}>
                <Typography className="text-white">Name</Typography>
                <Input />
              </Space>
            </div>

            <div className="text-white">
              <Space size={5}>
                <Typography className="text-white">Type</Typography>
                <Input />
              </Space>
            </div>

            <div className="text-white">
              <Space size={5}>
                <Typography className="text-white">Longtitude</Typography>
                <Input />
              </Space>
            </div>

            <div className="text-white">
              <Space size={5}>
                <Typography className="text-white">Latitude</Typography>
                <Input />
              </Space>
            </div>
          </Space>
        </Sider>
      </Layout>
    </motion.div>
  );
}

export default SimulationPage;
