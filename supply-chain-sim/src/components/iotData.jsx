import React, { useEffect, useState } from "react";
import { Space, Table, Tag } from "antd";
import supabase from "../config/supabaseClient";
import { SUPABASE_TABLE } from "../constants";

const salesColumns = [
  {
    title: "Status",
    dataIndex: "status",
    key: "status",
    render: (e) => {
      let color = "green";
      if (e == "OK") {
        color = "green";
      } else {
        color = "volcano";
      }
      return (
        <Tag color={color} key={e}>
          {e.toUpperCase()}
        </Tag>
      );
    },
  },
  {
    title: "Message",
    dataIndex: "message",
    key: "message",
  },
  {
    title: "Id",
    dataIndex: "id",
    key: "id",
  },
  {
    title: "Date",
    dataIndex: "updated_date",
    key: "updated_date",
  },
  {
    title: "IoT device ID",
    dataIndex: "iot_device_id",
    key: "iot_device_id",
  },
  {
    title: "Data",
    dataIndex: "data",
    key: "data",
    render: (e) => {
      return <div>{JSON.stringify(e)}</div>;
    },
  },
];

function IoTData() {
  const [data, setData] = useState([]);

  useEffect(() => {
    fetchSalesData();
  }, []);
  const fetchSalesData = async () => {
    const { data, error } = await supabase
      .from(SUPABASE_TABLE.IOT_DEVICES_HISTORY)
      .select()
      .order("updated_date", { ascending: false });
    if (error) {
      console.log(error);
    } else {
      console.log(data);
      setData(data);
    }
  };
  return (
    <Table
      columns={salesColumns}
      scroll={{
        x: 1300,
      }}
      dataSource={data}
    />
  );
}

export default IoTData;
