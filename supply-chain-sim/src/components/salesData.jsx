import React, { useEffect, useState } from "react";
import { Space, Table, Tag } from "antd";
import supabase from "../config/supabaseClient";

const salesColumns = [
  {
    title: "Id",
    dataIndex: "id",
    key: "id",
  },
  {
    title: "Date",
    dataIndex: "created_at",
    key: "created_at",
    render: (e) => {
      return <div>{Date(e)}</div>;
    },
  },
  {
    title: "ParticipantId",
    dataIndex: "participant_id",
    key: "participant_id",
  },
  {
    title: "Ticket Number",
    dataIndex: "ticket_number",
    key: "ticket_number",
  },
  {
    title: "Article",
    dataIndex: "article",
    key: "article",
  },
  {
    title: "Quantity",
    dataIndex: "quantity",
    key: "quantity",
  },
  {
    title: "Price",
    dataIndex: "unit_price",
    key: "unit_price",
  },
];

function SalesData() {
  const [data, setData] = useState([]);

  useEffect(() => {
    fetchSalesData();
  }, []);
  const fetchSalesData = async () => {
    const { data, error } = await supabase
      .from("sales")
      .select()
      .order("created_at", { ascending: false });
    if (error) {
      console.log(error);
    } else {
      setData(data);
    }
  };
  return <Table columns={salesColumns} dataSource={data} />;
}

export default SalesData;
