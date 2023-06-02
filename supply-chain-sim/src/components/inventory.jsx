import React, { useContext, useEffect, useRef, useState } from "react";
import axios from "axios";
import {
  Button,
  Table,
  Upload,
  message,
  Tabs,
  Form,
  Modal,
  Input,
  InputNumber,
} from "antd";
import { useDispatch, useSelector } from "react-redux";
import {
  selectDemand,
  selectInventory,
  setDemandSlice,
  setInventorySlice,
} from "../features/chosenSlice";
import { CURRENT_SIMULATION_DATA } from "../globalVariable";

const dataSource = [
  {
    key: "1",
    name: "Mike",
    age: 32,
    address: "10 Downing Street",
  },
  {
    key: "2",
    name: "John",
    age: 42,
    address: "10 Downing Street",
  },
];

const columns = [
  {
    title: "Name",
    dataIndex: "name",
    key: "name",
  },
  {
    title: "Quantity",
    dataIndex: "quantity",
    key: "quantity",
  },
  {
    title: "Price",
    dataIndex: "price",
    key: "price",
  },
];

function InventoryPanel(url) {
  const dispatch = useDispatch();
  const thisInventory = useSelector(selectInventory);
  const thisDemand = useSelector(selectDemand);
  const [openInventoryModal, setOpenInventoryModal] = useState(false);
  const [openDemandModal, setOpenDemandModal] = useState(false);
  const [inventory, setInventory] = useState([]);
  const [demand, setDemand] = useState([]);

  const onChange = (key) => {
    console.log(key);
  };

  useEffect(() => {
    dispatch(setInventorySlice(inventory));
    if (CURRENT_SIMULATION_DATA.currentAgent != null) {
      CURRENT_SIMULATION_DATA.currentAgent.inventory = inventory;
    }

    console.log(CURRENT_SIMULATION_DATA.currentAgent);
  }, [inventory]);

  useEffect(() => {
    dispatch(setDemandSlice(demand));
    if (CURRENT_SIMULATION_DATA.currentAgent != null) {
      CURRENT_SIMULATION_DATA.currentAgent.demand = demand;
    }
    console.log(CURRENT_SIMULATION_DATA.currentAgent);
  }, [demand]);

  useEffect(() => {
    setInventory(thisInventory);
    setDemand(thisDemand);
  }, [thisInventory]);

  const items = [
    {
      key: "1",
      label: `Inventory`,
      children: (
        <div>
          <Table dataSource={thisInventory} columns={columns} />
          <Button
            onClick={() => {
              setOpenInventoryModal(true);
            }}
          >
            Add inventory
          </Button>
        </div>
      ),
    },
    {
      key: "2",
      label: `Demand`,
      children: (
        <div>
          <Table dataSource={thisDemand} columns={columns} />
          <Button
            onClick={() => {
              setOpenDemandModal(true);
            }}
          >
            Add demand
          </Button>
        </div>
      ),
    },
  ];

  const onFinishAddInventory = (value) => {
    setOpenInventoryModal(false);
    const temp = {
      id: inventory.length + 1,
      name: value.name,
      quantity: value.quantity,
      price: value.price,
    };
    setInventory((prevArray) => [...prevArray, temp]);
  };

  const onFinishAddDemand = (value) => {
    setOpenDemandModal(false);
    const temp = {
      id: demand.length + 1,
      name: value.name,
      quantity: value.quantity,
      price: value.price,
    };
    setDemand((prevArray) => [...prevArray, temp]);
  };

  return (
    <div>
      <Tabs defaultActiveKey="1" items={items} onChange={onChange} />
      <Modal
        title="Inventory Item"
        open={openInventoryModal}
        onOk={() => {
          setOpenInventoryModal(false);
        }}
        onCancel={() => {
          setOpenInventoryModal(false);
        }}
        footer={[
          <Button form="inventoryForm" key="submit" htmlType="submit">
            Submit
          </Button>,
        ]}
      >
        <Form
          id="inventoryForm"
          name="basic"
          labelCol={{
            span: 8,
          }}
          wrapperCol={{
            span: 16,
          }}
          style={{
            maxWidth: 600,
          }}
          initialValues={{
            remember: true,
          }}
          onFinish={onFinishAddInventory}
          autoComplete="off"
        >
          <Form.Item
            label="Name"
            name="name"
            rules={[
              {
                required: true,
                message: "Please input item name!",
              },
            ]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            label="Quantity"
            name="quantity"
            rules={[
              {
                required: true,
                message: "Please input your password!",
              },
            ]}
          >
            <InputNumber />
          </Form.Item>

          <Form.Item
            label="Price"
            name="price"
            rules={[
              {
                required: true,
                message: "Please input item price",
              },
            ]}
          >
            <InputNumber />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="Demand Item"
        open={openDemandModal}
        onOk={() => {
          setOpenDemandModal(false);
        }}
        onCancel={() => {
          setOpenDemandModal(false);
        }}
        footer={[
          <Button form="demandForm" key="submit" htmlType="submit">
            Submit
          </Button>,
        ]}
      >
        <Form
          id="demandForm"
          name="basic"
          labelCol={{
            span: 8,
          }}
          wrapperCol={{
            span: 16,
          }}
          style={{
            maxWidth: 600,
          }}
          initialValues={{
            remember: true,
          }}
          onFinish={onFinishAddDemand}
          autoComplete="off"
        >
          <Form.Item
            label="Name"
            name="name"
            rules={[
              {
                required: true,
                message: "Please input item name!",
              },
            ]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            label="Quantity"
            name="quantity"
            rules={[
              {
                required: true,
                message: "Please input your password!",
              },
            ]}
          >
            <InputNumber />
          </Form.Item>

          <Form.Item
            label="Price"
            name="price"
            rules={[
              {
                required: true,
                message: "Please input item price",
              },
            ]}
          >
            <InputNumber />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
export default InventoryPanel;
