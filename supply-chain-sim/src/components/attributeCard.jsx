import React from "react";
import { Row, Col } from "antd";
import Card from "antd/es/card/Card";

function AttributeCard(props) {
  return (
    <Card
      title={
        <Row>
          <Col span={6}>
            <props.icon className="text-2xl" />
          </Col>
          <Col span={18}>{props.title}</Col>
        </Row>
      }
      bordered={false}
      className="m-4"
    >
      <Row>
        <Col span={10}>{props.content}</Col>
        <Col span={14}>{props.unit}</Col>
      </Row>
    </Card>
  );
}

export default AttributeCard;
