import { Spin, Row, Col } from "antd";

const LoadingScreen = () => {
  return (
    <Row
      justify="center"
      align="middle"
      style={{ height: "100%", width: "100%", display: "flex" }}
    >
      <Col>
        <Spin size="large" />
      </Col>
    </Row>
  );
};

export default LoadingScreen;
