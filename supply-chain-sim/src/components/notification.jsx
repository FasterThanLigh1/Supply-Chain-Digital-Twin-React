import { Button, notification, Space } from "antd";
import { useState } from "react";
import { useEffect } from "react";
import { MESSAGE_TYPE } from "../constants";
const Notification = (props) => {
  const [api, contextHolder] = notification.useNotification();
  const [description, setDescription] = useState("Default");

  useEffect(() => {
    if (props.trigger == null) return;
    console.log(props.trigger);
    setDescription(props.trigger.description);
    openNotificationWithIcon("warning");
  }, [props.trigger]);

  const openNotificationWithIcon = (
    type = MESSAGE_TYPE.INFO,
    msg = "Default",
    duration = 30
  ) => {
    if (description == "Default") return;
    api[type]({
      message: msg,
      description: description,
      duration: duration,
    });
  };
  return <>{contextHolder}</>;
};
export default Notification;
