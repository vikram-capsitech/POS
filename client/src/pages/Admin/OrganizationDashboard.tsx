import React from 'react';
import { Card, Typography, Row, Col, Button } from 'antd';

const { Title, Text } = Typography;

const stats = [
    { label: 'Total Users', value: 120 },
    { label: 'Active Organizations', value: 8 },
    { label: 'Pending Requests', value: 3 },
    { label: 'Revenue', value: '$5,200' },
];

const OrganizationDashboard: React.FC = () => {
    return (
        <div style={{ padding: 32 }}>
            <Title level={2}>Organization Dashboard</Title>
            <Row gutter={[24, 24]} style={{ marginTop: 24 }}>
                {stats.map((stat) => (
                    <Col xs={24} sm={12} md={6} key={stat.label}>
                        <Card>
                            <Text type="secondary">{stat.label}</Text>
                            <Title level={3} style={{ margin: 0 }}>
                                {stat.value}
                            </Title>
                        </Card>
                    </Col>
                ))}
            </Row>
            <div style={{ marginTop: 40 }}>
                <Title level={4}>Quick Actions</Title>
                <Button type="primary" style={{ marginRight: 16 }}>
                    Add Organization
                </Button>
                <Button>View Reports</Button>
            </div>
        </div>
    );
};

export default OrganizationDashboard;