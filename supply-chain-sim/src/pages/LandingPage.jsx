import React, { useState, useEffect } from "react";
import { Button, Row, Col, Checkbox, Form, Input } from "antd";
import { digitalTwinRoute } from "../constants/route";
import { motion } from "framer-motion";
import backgroundImage from "../../public/Image/background2.jpg";
import supabase from "../config/supabaseClient";
import { useDispatch } from "react-redux";
import { setCurrentUser } from "../features/userSlice";
import { useNavigate } from "react-router-dom";
import { openNotificationWithIcon } from "../constants/callback";
import { MESSAGE_TYPE } from "../constants";

function LandingPage() {
  const [user, setUser] = useState({});
  const [isRegiestered, setIsRegiestered] = useState(false);
  const disptach = useDispatch();
  const navigate = useNavigate();

  const onFinish = async (values) => {
    console.log("Success:", values);
    if (isRegiestered) {
      const { data, error } = await supabase.auth.signUp({
        email: values.username,
        password: values.password,
      });
      if (error) {
        console.log("Error:", error);
        openNotificationWithIcon(
          "Sign Up Error",
          error.toString(),
          MESSAGE_TYPE.ERROR,
          10
        );
      } else {
        openNotificationWithIcon(
          "Sign Up Success",
          "Please verify you email",
          MESSAGE_TYPE.SUCCESS,
          10
        );
      }
    } else {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: values.username,
        password: values.password,
      });
      if (error) {
        console.log("Error:", error);
        openNotificationWithIcon(
          "Sign In Error",
          error.toString(),
          MESSAGE_TYPE.ERROR,
          10
        );
      } else {
        sessionStorage.setItem("currentUser", values);
      }
    }
  };
  const onFinishFailed = (errorInfo) => {
    console.log("Failed:", errorInfo);
  };

  const [session, setSession] = useState(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    console.log("Success");
    async function GetUserData() {
      await supabase.auth.getUser().then((value) => {
        if (value.data?.user) {
          console.log(value.data?.user);
          setUser(value.data.user);
          disptach(setCurrentUser(value.data.user));
          onLoginSuccessfully();
        }
      });
    }

    GetUserData();
  }, [session]);

  const onLoginSuccessfully = () => {
    navigate(digitalTwinRoute);
  };

  return (
    <motion.div
      className="text-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 1 }}
      transition={{ duration: 0.75, ease: "easeOut" }}
    >
      <div
        style={{
          height: "100vh",
        }}
      >
        <Row>
          <Col
            span={16}
            style={{
              height: "100%",
              padding: "20px 10px 10px 30px",
            }}
          >
            <div
              style={{
                height: "100vh",
                backgroundImage: `url(${backgroundImage})`,
                backgroundSize: "cover",
                backgroundRepeat: "no-repeat",
                backgroundPosition: "center",
              }}
            >
              <div className="pt-40 h-full grid place-items-center h-screen pb-60">
                <h1 className="text-8xl mb-5 font-bold text-white bg-neutral-950 bg-opacity-50 w-10/12 rounded-lg p-8">
                  SUPPLY CHAIN
                  <h2 className="text-6xl font-bold text-amber-400">
                    DIGITAL TWIN
                  </h2>
                </h1>
              </div>
            </div>
          </Col>
          <Col
            span={8}
            style={{
              height: "100vh",
            }}
          >
            <div className="h-screen grid place-items-center text-left">
              <div className="w-full">
                <span className="text-left w-full ml-10">
                  <span
                    style={{
                      color: isRegiestered ? "black" : "rgb(251 191 36)",
                      fontSize: "1.25rem",
                      lineHeight: "1.75rem",
                    }}
                  >
                    <a
                      onClick={() => {
                        setIsRegiestered(false);
                      }}
                    >
                      Sign In
                    </a>
                  </span>
                  <span className="text-xl text-amber-400"> / </span>
                  <span
                    style={{
                      color: isRegiestered ? "rgb(251 191 36)" : "black",
                      fontSize: "1.25rem",
                      lineHeight: "1.75rem",
                    }}
                  >
                    <a
                      onClick={() => {
                        setIsRegiestered(true);
                      }}
                    >
                      Sign Up
                    </a>
                  </span>
                </span>
                <div className="grid place-items-center w-full mt-5 ml-20">
                  <Form
                    name="basic"
                    layout="vertical"
                    labelCol={{
                      span: 8,
                    }}
                    wrapperCol={{
                      span: 16,
                    }}
                    style={{
                      maxWidth: 600,
                      width: "100%",
                    }}
                    initialValues={{
                      remember: true,
                    }}
                    onFinish={onFinish}
                    onFinishFailed={onFinishFailed}
                    autoComplete="off"
                  >
                    <Form.Item
                      label="Email"
                      name="username"
                      rules={[
                        {
                          required: true,
                          message: "Please input your email!",
                        },
                      ]}
                    >
                      <Input />
                    </Form.Item>

                    <Form.Item
                      label="Password"
                      name="password"
                      rules={[
                        {
                          required: true,
                          message: "Please input your password!",
                        },
                      ]}
                    >
                      <Input.Password />
                    </Form.Item>

                    <Form.Item name="remember" valuePropName="checked">
                      <Checkbox>Remember me</Checkbox>
                    </Form.Item>

                    <Form.Item>
                      <Button
                        type="primary"
                        htmlType="submit"
                        style={{
                          backgroundColor: "rgb(251 191 36)",
                        }}
                        className="bg-amber-400"
                      >
                        Submit
                      </Button>
                    </Form.Item>
                  </Form>
                </div>
              </div>
            </div>
          </Col>
        </Row>
      </div>
    </motion.div>
  );
}

export default LandingPage;
