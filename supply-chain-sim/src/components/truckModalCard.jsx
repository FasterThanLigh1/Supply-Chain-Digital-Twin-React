import React from "react";
import { Typography, Card, Row, Col } from "antd";

function TruckModalCard({ title, data, unit }) {
  const { Title, Text } = Typography;
  return (
    <Card bordered={false} className="criclebox ">
      <div className="number">
        <Row align="middle" gutter={[24, 0]}>
          <Col xs={18}>
            <span>{title}</span>
            <Title level={3}>
              {data}
              <small className="bnb2">{unit}</small>
            </Title>
          </Col>
        </Row>
      </div>
    </Card>
  );
}

export default TruckModalCard;
