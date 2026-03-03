import React, { useEffect, useState, useCallback } from "react";
import {
    Tabs, Card, Typography, Button, Table, Tag, Space, Modal, Form, Input,
    Select, Switch, Row, Col, Avatar, App, Spin, Empty, Popconfirm, Badge,
    Descriptions, Divider, Alert,
} from "antd";
import type { TableColumnsType } from "antd";
import {
    PlusOutlined, EditOutlined, DeleteOutlined, UserOutlined,
    SafetyOutlined, KeyOutlined,
} from "@ant-design/icons";
import {
    adminListRoles, adminCreateRole, adminUpdateRole, adminDeleteRole,
    adminListOrgs, getMyProfile,
} from "../../Api";

const { Title, Text } = Typography;

type Role = {
    _id: string;
    name: string;
    displayName: string;
    organizationID: { _id: string; name: string } | string;
    permissions: any[];
    isDefault: boolean;
    isActive: boolean;
    createdAt: string;
};

// ── Roles Management ───────────────────────────────────────────────────────────

function RolesTab() {
    const { message } = App.useApp();
    const [roles, setRoles] = useState<Role[]>([]);
    const [orgs, setOrgs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [editingRole, setEditingRole] = useState<Role | null>(null);
    const [saving, setSaving] = useState(false);
    const [orgFilter, setOrgFilter] = useState<string>("all");
    const [form] = Form.useForm();

    const fetchRoles = useCallback(async () => {
        setLoading(true);
        try {
            const [rolesRes, orgsRes]: any[] = await Promise.all([
                adminListRoles(),
                adminListOrgs(),
            ]);
            const rolesData = rolesRes?.data?.data?.data ?? rolesRes?.data?.data ?? [];
            const orgsData = orgsRes?.data?.data?.data ?? orgsRes?.data?.data ?? [];
            setRoles(Array.isArray(rolesData) ? rolesData : []);
            setOrgs(Array.isArray(orgsData) ? orgsData : []);
        } catch {
            message.error("Failed to load roles");
        } finally {
            setLoading(false);
        }
    }, [message]);

    useEffect(() => { fetchRoles(); }, [fetchRoles]);

    const openModal = (role?: Role) => {
        setEditingRole(role ?? null);
        form.resetFields();
        if (role) {
            const orgId = typeof role.organizationID === "object" ? role.organizationID._id : role.organizationID;
            form.setFieldsValue({
                displayName: role.displayName,
                name: role.name,
                organizationID: orgId,
                isActive: role.isActive,
            });
        }
        setModalOpen(true);
    };

    const handleSave = async (values: any) => {
        setSaving(true);
        try {
            if (editingRole) {
                await adminUpdateRole(editingRole._id, values);
                message.success("Role updated");
            } else {
                await adminCreateRole(values);
                message.success("Role created");
            }
            setModalOpen(false);
            fetchRoles();
        } catch (err: any) {
            message.error(err?.response?.data?.message || "Failed to save role");
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id: string) => {
        try {
            await adminDeleteRole(id);
            message.success("Role deleted");
            fetchRoles();
        } catch (err: any) {
            message.error(err?.response?.data?.message || "Cannot delete this role");
        }
    };

    const filtered = roles.filter(r => {
        if (orgFilter === "all") return true;
        const orgId = typeof r.organizationID === "object" ? r.organizationID._id : r.organizationID;
        return orgId === orgFilter;
    });

    const columns: TableColumnsType<Role> = [
        {
            title: "Role",
            key: "role",
            render: (_, r) => (
                <Space>
                    <Avatar
                        size={32}
                        style={{ background: "#5240d6", fontSize: 13, fontWeight: 700 }}
                    >
                        {r.displayName?.[0]?.toUpperCase() || r.name?.[0]?.toUpperCase()}
                    </Avatar>
                    <div>
                        <Text strong style={{ fontSize: 13 }}>{r.displayName || r.name}</Text>
                        <Text type="secondary" style={{ fontSize: 12, display: "block" }}>{r.name}</Text>
                    </div>
                </Space>
            ),
        },
        {
            title: "Organization",
            key: "org",
            render: (_, r) => {
                const org = typeof r.organizationID === "object" ? r.organizationID : null;
                return <Text style={{ fontSize: 13 }}>{org?.name || "—"}</Text>;
            },
        },
        {
            title: "Status",
            dataIndex: "isActive",
            render: (v) => <Badge status={v ? "success" : "error"} text={v ? "Active" : "Inactive"} />,
        },
        {
            title: "Type",
            dataIndex: "isDefault",
            render: (v) => v
                ? <Tag color="blue" style={{ borderRadius: 6 }}>System</Tag>
                : <Tag color="purple" style={{ borderRadius: 6 }}>Custom</Tag>,
        },
        {
            title: "Actions",
            key: "actions",
            render: (_, r) => (
                <Space>
                    <Button
                        type="text"
                        size="small"
                        icon={<EditOutlined />}
                        onClick={() => openModal(r)}
                        disabled={r.isDefault}
                    />
                    <Popconfirm
                        title="Delete this role?"
                        description="Users with this role will lose their assignment."
                        onConfirm={() => handleDelete(r._id)}
                        okButtonProps={{ danger: true }}
                    >
                        <Button
                            type="text"
                            size="small"
                            danger
                            icon={<DeleteOutlined />}
                            disabled={r.isDefault}
                        />
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    return (
        <>
            <div style={{ display: "flex", gap: 12, marginBottom: 16, alignItems: "center" }}>
                <Select
                    style={{ width: 200 }}
                    value={orgFilter}
                    onChange={setOrgFilter}
                    options={[
                        { label: "All Organizations", value: "all" },
                        ...orgs.map(o => ({ label: o.name, value: o._id })),
                    ]}
                    placeholder="Filter by org"
                />
                <div style={{ flex: 1 }} />
                <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={() => openModal()}
                    style={{ background: "#5240d6", borderColor: "#5240d6", borderRadius: 8 }}
                >
                    New Role
                </Button>
            </div>

            <Spin spinning={loading}>
                <Table
                    columns={columns}
                    dataSource={filtered}
                    rowKey="_id"
                    size="small"
                    pagination={{ pageSize: 15, showSizeChanger: true }}
                />
            </Spin>

            <Modal
                title={editingRole ? `Edit Role: ${editingRole.displayName}` : "Create New Role"}
                open={modalOpen}
                footer={null}
                onCancel={() => setModalOpen(false)}
                width={440}
            >
                <Form form={form} layout="vertical" onFinish={handleSave}>
                    <Form.Item label="Display Name" name="displayName" rules={[{ required: true }]}>
                        <Input placeholder="e.g. Senior Waiter" />
                    </Form.Item>
                    <Form.Item label="Role Key" name="name" rules={[{ required: !editingRole }]} style={editingRole ? { display: "none" } : {}}>
                        <Input placeholder="e.g. senior-waiter (lowercase)" />
                    </Form.Item>
                    {!editingRole && (
                        <Form.Item label="Organization" name="organizationID" rules={[{ required: true }]}>
                            <Select
                                options={orgs.map(o => ({ label: o.name, value: o._id }))}
                                placeholder="Select organization"
                            />
                        </Form.Item>
                    )}
                    <Form.Item label="Status" name="isActive" valuePropName="checked" initialValue={true}>
                        <Switch checkedChildren="Active" unCheckedChildren="Inactive" />
                    </Form.Item>
                    <Form.Item style={{ marginBottom: 0 }}>
                        <Space style={{ width: "100%", justifyContent: "flex-end" }}>
                            <Button onClick={() => setModalOpen(false)}>Cancel</Button>
                            <Button
                                type="primary"
                                htmlType="submit"
                                loading={saving}
                                style={{ background: "#5240d6" }}
                            >
                                {editingRole ? "Update Role" : "Create Role"}
                            </Button>
                        </Space>
                    </Form.Item>
                </Form>
            </Modal>
        </>
    );
}

// ── Profile Tab ────────────────────────────────────────────────────────────────

function ProfileTab() {
    const { message } = App.useApp();
    const [profile, setProfile] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getMyProfile()
            .then((res: any) => {
                const data = res?.data?.data ?? res?.data;
                setProfile(data);
            })
            .catch(() => message.error("Failed to load profile"))
            .finally(() => setLoading(false));
    }, [message]);

    if (loading) return <Spin />;
    if (!profile) return <Empty description="Profile not found" />;

    return (
        <Row gutter={[20, 20]}>
            <Col xs={24} md={8}>
                <Card style={{ borderRadius: 12, textAlign: "center" }} bodyStyle={{ padding: "32px 20px" }}>
                    <Avatar size={80} icon={<UserOutlined />} style={{ background: "#5240d6", marginBottom: 16 }} />
                    <Title level={5} style={{ margin: 0 }}>{profile.displayName || profile.userName}</Title>
                    <Text type="secondary">{profile.email}</Text>
                    <Divider />
                    <Tag color="red" style={{ borderRadius: 6, padding: "4px 14px", fontSize: 13 }}>
                        🛡️ Super Admin
                    </Tag>
                </Card>
            </Col>
            <Col xs={24} md={16}>
                <Card title="Profile Details" style={{ borderRadius: 12 }}>
                    <Descriptions column={1} size="small" bordered>
                        <Descriptions.Item label="Username">{profile.userName}</Descriptions.Item>
                        <Descriptions.Item label="Email">{profile.email}</Descriptions.Item>
                        <Descriptions.Item label="Display Name">{profile.displayName || "—"}</Descriptions.Item>
                        <Descriptions.Item label="Phone">{profile.phoneNumber || "—"}</Descriptions.Item>
                        <Descriptions.Item label="System Role">
                            <Tag color="red">superadmin</Tag>
                        </Descriptions.Item>
                        <Descriptions.Item label="Email Verified">
                            <Badge status={profile.isEmailVerified ? "success" : "error"} text={profile.isEmailVerified ? "Verified" : "Not Verified"} />
                        </Descriptions.Item>
                        <Descriptions.Item label="Member Since">
                            {profile.createdAt ? new Date(profile.createdAt).toLocaleDateString("en-IN", { year: "numeric", month: "long", day: "numeric" }) : "—"}
                        </Descriptions.Item>
                    </Descriptions>
                    <Alert
                        message="Profile editing is available through the API. Contact your system administrator to update your profile."
                        type="info"
                        showIcon
                        style={{ marginTop: 16 }}
                    />
                </Card>
            </Col>
        </Row>
    );
}

// ── Main Settings Page ─────────────────────────────────────────────────────────

export default function SuperAdminSettings() {
    return (
        <div>
            <Title level={4} style={{ marginBottom: 24 }}>
                <SafetyOutlined style={{ color: "#5240d6", marginRight: 10 }} />
                Super Admin Settings
            </Title>
            <Tabs
                items={[
                    {
                        key: "profile",
                        label: (
                            <Space><UserOutlined />Profile</Space>
                        ),
                        children: <ProfileTab />,
                    },
                    {
                        key: "roles",
                        label: (
                            <Space><KeyOutlined />Roles Management</Space>
                        ),
                        children: (
                            <Card style={{ borderRadius: 12 }}>
                                <div style={{ marginBottom: 12 }}>
                                    <Title level={5} style={{ margin: 0 }}>Roles Management</Title>
                                    <Text type="secondary">
                                        Create and manage roles for each organization. Admins can assign these to their employees.
                                    </Text>
                                </div>
                                <Divider style={{ margin: "12px 0" }} />
                                <RolesTab />
                            </Card>
                        ),
                    },
                ]}
            />
        </div>
    );
}
