import React from "react";
import { Card, Row, Col, Statistic, Typography, Spin, Alert } from "antd";
import {
    GlobalOutlined, ShopOutlined, TeamOutlined, CreditCardOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { adminListOrgs } from "../../Api";
import { useEffect, useState } from "react";

const { Title, Text } = Typography;

export default function SuperAdminHome() {
    const navigate = useNavigate();
    const [stats, setStats] = useState({ total: 0, active: 0, withPOS: 0, withHRM: 0 });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        adminListOrgs()
            .then((res: any) => {
                const data: any[] = res?.data?.data?.data ?? res?.data?.data ?? [];
                setStats({
                    total: data.length,
                    active: data.filter(o => o.isActive).length,
                    withPOS: data.filter(o => o.modules?.pos).length,
                    withHRM: data.filter(o => o.modules?.hrm).length,
                });
            })
            .finally(() => setLoading(false));
    }, []);

    const cards = [
        { title: "Total Organizations", value: stats.total, icon: <GlobalOutlined />, color: "#5240d6", link: "/superadmin/organizations" },
        { title: "Active Organizations", value: stats.active, icon: <ShopOutlined />, color: "#059669", link: "/superadmin/organizations" },
        { title: "Orgs with POS", value: stats.withPOS, icon: <CreditCardOutlined />, color: "#0284c7", link: "/superadmin/organizations" },
        { title: "Orgs with HRM", value: stats.withHRM, icon: <TeamOutlined />, color: "#d97706", link: "/superadmin/organizations" },
    ];

    return (
        <div>
            <Title level={4} style={{ marginBottom: 4 }}>Super Admin Dashboard</Title>
            <Text type="secondary" style={{ marginBottom: 24, display: "block" }}>
                Overview of all organizations on the platform.
            </Text>
            {loading ? (
                <Spin size="large" style={{ display: "block", margin: "40px auto" }} />
            ) : (
                <>
                    <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
                        {cards.map(c => (
                            <Col xs={12} md={6} key={c.title}>
                                <Card
                                    hoverable
                                    onClick={() => navigate(c.link)}
                                    style={{ borderRadius: 14, border: `1px solid ${c.color}25`, cursor: "pointer" }}
                                    bodyStyle={{ padding: "20px 24px" }}
                                >
                                    <Statistic
                                        title={<Text type="secondary" style={{ fontSize: 12 }}>{c.title}</Text>}
                                        value={c.value}
                                        valueStyle={{ color: c.color, fontSize: 32, fontWeight: 800 }}
                                        prefix={c.icon}
                                    />
                                </Card>
                            </Col>
                        ))}
                    </Row>
                    <Alert
                        message="Navigate to Organizations to manage module access and send invoices to each organization."
                        type="info"
                        showIcon
                    />
                </>
            )}
        </div>
    );
}
