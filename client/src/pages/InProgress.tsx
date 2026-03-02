import React from "react";
import { useParams } from "react-router-dom";
import { Card, Typography, Space, Button, Result } from "antd";
import { Construction } from "lucide-react";

const { Title, Text } = Typography;

const InProgress = ({ name }: { name?: string }) => {
    const { orgId } = useParams();

    return (
        <div style={{
            padding: "40px",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "100%",
            background: "transparent"
        }}>
            <Card
                style={{
                    width: 550,
                    textAlign: "center",
                    borderRadius: 20,
                    boxShadow: "0 20px 50px rgba(0,0,0,0.08)",
                    border: "none"
                }}
            >
                <Result
                    icon={<Construction size={64} color="#5240d6" style={{ margin: "0 auto" }} />}
                    title={<Title level={2} style={{ margin: 0 }}>{name || "Section"} is under Construction</Title>}
                    subTitle={
                        <Space direction="vertical" size="small">
                            <Text type="secondary" style={{ fontSize: 16 }}>
                                We are building something amazing for the <strong>{name}</strong> module.
                            </Text>
                            {orgId && <Text code style={{ fontSize: 12 }}>ID: {orgId}</Text>}
                        </Space>
                    }
                    extra={[
                        <Button type="primary" key="home" size="large" style={{ borderRadius: 10, padding: "0 32px" }}>
                            Return to Home
                        </Button>
                    ]}
                />
            </Card>
        </div>
    );
};

export default InProgress;
