import WelcomeBanner from "../Assets/Images/WelcomeBanner.png";
import { Card, Col, Row, Typography, Image, Button } from "antd";
import {
  MessageOutlined,
  TeamOutlined,
  CloudSyncOutlined,
  RocketOutlined,
  SmileOutlined,
} from "@ant-design/icons";
import { motion } from "framer-motion";
import { LogoIcon } from "../Assets/CustomAntIcons";

const { Title, Paragraph } = Typography;

const features = [
  {
    icon: <MessageOutlined style={{ fontSize: 32, color: "#1890ff" }} />,
    title: "Real-Time Chat",
    description: "Stay connected with instant messaging and notifications.",
  },
  {
    icon: <TeamOutlined style={{ fontSize: 32, color: "#1890ff" }} />,
    title: "Team Collaboration",
    description: "Create workspaces, channels, and collaborate efficiently.",
  },
  {
    icon: <CloudSyncOutlined style={{ fontSize: 32, color: "#1890ff" }} />,
    title: "Cross-Platform Sync",
    description: "Access your chats anywhere, on any device.",
  },
  {
    icon: <RocketOutlined style={{ fontSize: 32, color: "#1890ff" }} />,
    title: "Fast and Lightweight",
    description: "Built for speed and optimized for performance.",
  },
  {
    icon: <SmileOutlined style={{ fontSize: 32, color: "#1890ff" }} />,
    title: "User-Friendly UI",
    description: "A modern, intuitive interface that anyone can use.",
  },
];

const LandingPage = () => {
  return (
    <div
      style={{
        padding: "100px 0px",
        margin: "0 auto",
        overflow: "scroll",
        background:
          "linear-gradient(135deg, #f4f7fd 0%, #e6f0ff 50%, #f0f0ff 100%)",
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        style={{ textAlign: "center", marginBottom: 60 }}
      >
        <Title style={{ fontSize: "3rem", fontWeight: "bold" }}>
          Welcome to Scraawl
        </Title>
        <Paragraph style={{ fontSize: "1.2rem" }}>
          A smarter, faster, and more intuitive way to communicate with your
          team.
        </Paragraph>
        <Button
          type="primary"
          size="large"
          style={{
            background: "linear-gradient(135deg, #42e695, #3bb2b8)",
            border: "none",
            borderRadius: "30px",
            padding: "12px 28px",
            fontSize: "16px",
            fontWeight: "bold",
            color: "#fff",
            transition:
              "transform 0.2s ease-in-out, box-shadow 0.3s ease-in-out",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "scale(1.05)";
            e.currentTarget.style.boxShadow =
              "0 12px 25px rgba(0, 242, 254, 0.5)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "scale(1)";
            e.currentTarget.style.boxShadow =
              "0 8px 20px rgba(0, 242, 254, 0.3)";
          }}
          onClick={() => (window.location.href = "/auth/verify")}
        >
          Get Started
        </Button>
      </motion.div>

      <Row justify="center" style={{ marginBottom: 40 }}>
        <Col span={24} style={{ textAlign: "center" }}>
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 1 }}
            viewport={{ once: true }}
          >
            <Image
              src={WelcomeBanner}
              alt="Main Banner"
              preview={false}
              style={{
                height: "auto",
                maxHeight: 400,
                //borderRadius: 8,
                //boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
              }}
            />
          </motion.div>
        </Col>
      </Row>

      <Row
        gutter={[24, 24]}
        justify="center"
        style={{
          padding: "50px",
          background: "linear-gradient(135deg, #E3FDFD 0%, #FFE6FA 100%)",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: "-50px",
            left: "-50px",
            width: "200px",
            height: "200px",
            background: "#D0F0FD",
            borderRadius: "50%",
            filter: "blur(60px)",
            zIndex: 0,
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: "-60px",
            right: "-60px",
            width: "150px",
            height: "150px",
            background: "#FFDDEE",
            borderRadius: "50%",
            filter: "blur(50px)",
            zIndex: 0,
          }}
        />
        {features.map((feature, index) => (
          <Col xs={24} sm={12} md={8} key={index}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.2, duration: 0.6 }}
              viewport={{ once: true }}
            >
              <Card
                hoverable
                bordered={false}
                style={{ textAlign: "center", borderRadius: 12 }}
              >
                {feature.icon}
                <Title level={4} style={{ marginTop: 16 }}>
                  {feature.title}
                </Title>
                <Paragraph>{feature.description}</Paragraph>
              </Card>
            </motion.div>
          </Col>
        ))}
      </Row>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        whileInView={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
        style={{ marginTop: 80, textAlign: "center" }}
      >
        <Title level={3}>
          Start your team communication journey with Scraawl
        </Title>
        <Paragraph>
          Empower your workspace with seamless communication and collaboration.
        </Paragraph>
        <Button
          type="primary"
          size="large"
          style={{
            background: "linear-gradient(135deg, #42e695, #3bb2b8)",
            border: "none",
            borderRadius: "30px",
            padding: "12px 28px",
            fontSize: "16px",
            fontWeight: "bold",
            color: "#fff",
            transition:
              "transform 0.2s ease-in-out, box-shadow 0.3s ease-in-out",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "scale(1.05)";
            e.currentTarget.style.boxShadow =
              "0 12px 25px rgba(0, 242, 254, 0.5)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "scale(1)";
            e.currentTarget.style.boxShadow =
              "0 8px 20px rgba(0, 242, 254, 0.3)";
          }}
          onClick={() => (window.location.href = "/auth/verify")}
        >
          Join Now
        </Button>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
        style={{ marginTop: 100, textAlign: "center" }}
      >
        <Title level={4}>Trusted by Teams Worldwide</Title>
        <Paragraph style={{ maxWidth: 700, margin: "0 auto" }}>
          Scraawl is designed to scale with your team, from startups to
          enterprises. Bring everyone together in one place.
        </Paragraph>
        {/* <Image
          preview={false}
          width={600}
          src="https://cdn.pixabay.com/photo/2022/03/14/21/04/video-call-7069010_1280.png"
          alt="Team Chat"
          style={{ marginTop: 20, borderRadius: 12 }}
        /> */}
        <LogoIcon style={{ marginTop: 20, borderRadius: 12 }} />
      </motion.div>
    </div>
  );
};

export default LandingPage;
