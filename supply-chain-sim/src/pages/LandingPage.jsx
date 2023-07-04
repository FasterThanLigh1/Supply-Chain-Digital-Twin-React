import React, { useState, useEffect } from "react";
import { Link, Route, Routes } from "react-router-dom";
import { Button, Row, Col, Checkbox, Form, Input } from "antd";
import { digitalTwinRoute, simulationRoute } from "../constants/route";
import { motion } from "framer-motion";
import backgroundImage from "../../public/Image/background.jpeg";
import officeImage from "../../public/Image/office.jpg";
import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import supabase from "../config/supabaseClient";
import { useDispatch } from "react-redux";
import { setCurrentUser } from "../features/userSlice";
import { useNavigate } from "react-router-dom";

function LandingPage() {
  const [user, setUser] = useState({});
  const disptach = useDispatch();
  const navigate = useNavigate();

  const onFinish = (values) => {
    console.log("Success:", values);
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
              <div className="pt-40 h-full">
                <h1 className="text-8xl mb-5 font-bold text-black">
                  SUPPLY CHAIN
                </h1>
                <h2 className="text-6xl font-bold text-black">DIGITAL TWIN</h2>
              </div>
            </div>
          </Col>
          <Col span={8}>
            <div className="pt-10 pr-10 pl-10">
              <Auth
                supabaseClient={supabase}
                appearance={{ theme: ThemeSupa }}
                providers={["google", "discord"]}
              />
            </div>
          </Col>
        </Row>
      </div>
    </motion.div>
  );
}

export default LandingPage;
