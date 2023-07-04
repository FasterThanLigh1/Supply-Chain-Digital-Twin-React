import { Button, notification, Space } from "antd";
import { useState } from "react";
import { useEffect } from "react";
const Notification = (props) => {
  const [api, contextHolder] = notification.useNotification();
  const [description, setDescription] = useState("Default");

  useEffect(() => {
    if (props.trigger == null) return;
    console.log(props.trigger);
    setDescription(props.trigger.description);
    openNotificationWithIcon("warning");
  }, [props.trigger]);

  const openNotificationWithIcon = (type) => {
    if (description == "Default") return;
    api[type]({
      message: "Notification Title",
      description: description,
      duration: 30,
    });
  };
  return <>{contextHolder}</>;
};
export default Notification;
