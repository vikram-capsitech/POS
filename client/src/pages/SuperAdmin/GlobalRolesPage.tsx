import React, { useEffect, useState, useCallback } from "react";
import {
    Card, Table, Tag, Button, Modal, Form, Input, Switch, Space,
    Typography, Badge, Tooltip, Popconfirm, App, Spin, Empty,
    Row, Col, Statistic, Alert, Divider, Avatar,
} from "antd";
import type { TableColumnsType } from "antd";
import {
    PlusOutlined, EditOutlined, DeleteOutlined, GlobalOutlined,
    InfoCircleOutlined, CheckCircleOutlined, ClockCircleOutlined,
} from "@ant-design/icons";
import { getGlobalRoles, createGlobalRole, updateGlobalRole, deleteGlobalRole } from "../../Api";
import dayjs from "dayjs";

const { Title, Text, Paragraph } = Typography;

type GlobalRole = {
    _id: string;
    name: string;
    displayName: string;
    description?: string;
    isGlobal: boolean;
    isDefault: boolean;
    isActive: boolean;
    permissions: any[];
    createdBy?: { displayName?: string; email?: string };
    createdAt: string;
};

const ROLE_COLORS = [
    "#5240d6", "#0284c7", "#059669", "#d97706", "#db2777",
    "#7c3aed", "#0891b2", "#16a34a", "#ea580c", "#be185d",
];

function getRoleColor(name: string) {
    let hash = 0;
    for (let i = 0; i < name.length; i++) hash += name.charCodeAt(i);
    return ROLE_COLORS[hash % ROLE_COLORS.length];
}

export default function GlobalRolesPage() {
    const { message } = App.useApp();
    const [roles, setRoles] = useState<GlobalRole[]>([]);
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [editingRole, setEditingRole] = useState<GlobalRole | null>(null);
    const [saving, setSaving] = useState(false);
    const [form] = Form.useForm();

    const fetchRoles = useCallback(async () => {
        setLoading(true);
        try {
            const res: any = await getGlobalRoles();
            const data: GlobalRole[] = res?.data?.data?.data ?? res?.data?.data ?? [];
            setRoles(Array.isArray(data) ? data : []);
        } catch {
            message.error("Failed to load global roles");
        } finally {
            setLoading(false);
        }
    }, [message]);

    useEffect(() => { fetchRoles(); }, [fetchRoles]);

    const openCreate = () => {
        setEditingRole(null);
        form.resetFields();
        form.setFieldsValue({ isActive: true });
        setModalOpen(true);
    };

    const openEdit = (role: GlobalRole) => {
        setEditingRole(role);
        form.resetFields();
        form.setFieldsValue({
            displayName: role.displayName,
            description: role.description,
            isActive: role.isActive,
        });
        setModalOpen(true);
    };

    const handleSave = async (values: any) => {
        setSaving(true);
        try {
            if (editingRole) {
                await updateGlobalRole(editingRole._id, {
                    displayName: values.displayName,
                    description: values.description,
                    isActive: values.isActive,
                });
                message.success("Global role updated");
            } else {
                await createGlobalRole({
                    name: values.name,
                    displayName: values.displayName || values.name,
                    description: values.description,
                });
                message.success(`Global role "${values.displayName || values.name}" created`);
            }
            setModalOpen(false);
            form.resetFields();
            fetchRoles();
        } catch (err: any) {
            message.error(err?.response?.data?.message || "Failed to save role");
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id: string) => {
        try {
            await deleteGlobalRole(id);
            message.success("Global role deleted");
            fetchRoles();
        } catch (err: any) {
            message.error(err?.response?.data?.message || "Cannot delete this role");
        }
    };

    const activeCount = roles.filter(r => r.isActive).length;
    const defaultCount = roles.filter(r => r.isDefault).length;

    const columns: TableColumnsType<GlobalRole> = [
        {
            title: "Role",
            key: "role",
            width: 240,
            render: (_, r) => {
                const color = getRoleColor(r.name);
                return (
                    <Space>
                        <Avatar
                            size={38}
                            style={{
                                background: `linear-gradient(135deg, ${color}, ${color}bb)`,
                                fontSize: 15,
                                fontWeight: 700,
                                flexShrink: 0,
                            }}
                        >
                            {(r.displayName || r.name)[0]?.toUpperCase()}
                        </Avatar>
                        <div>
                            <Text strong style={{ fontSize: 13, display: "block" }}>
                                {r.displayName || r.name}
                            </Text>
                            <Text
                                type="secondary"
                                style={{
                                    fontSize: 11,
                                    fontFamily: "monospace",
                                    background: "#f1f5f9",
                                    padding: "0 4px",
                                    borderRadius: 3,
                                }}
                            >
                                {r.name}
                            </Text>
                        </div>
                    </Space>
                );
            },
        },
        {
            title: "Description",
            dataIndex: "description",
            ellipsis: true,
            render: (d) =>
                d ? <Text style={{ fontSize: 13 }}>{d}</Text>
                    : <Text type="secondary" style={{ fontSize: 12 }}>No description</Text>,
        },
        {
            title: "Status",
            dataIndex: "isActive",
            width: 100,
            render: (v) => (
                <Badge
                    status={v ? "success" : "error"}
                    text={v ? "Active" : "Inactive"}
                />
            ),
        },
        {
            title: "Type",
            key: "type",
            width: 100,
            render: (_, r) =>
                r.isDefault
                    ? <Tag color="blue" icon={<CheckCircleOutlined />} style={{ borderRadius: 5 }}>System</Tag>
                    : <Tag color="purple" icon={<GlobalOutlined />} style={{ borderRadius: 5 }}>Custom</Tag>,
        },
        {
            title: "Created By",
            key: "createdBy",
            width: 140,
            render: (_, r) => (
                <Text style={{ fontSize: 12 }}>
                    {r.createdBy?.displayName || "System"}
                </Text>
            ),
        },
        {
            title: "Created",
            dataIndex: "createdAt",
            width: 120,
            render: (d) => (
                <Text style={{ fontSize: 12 }}>
                    {dayjs(d).format("DD MMM YYYY")}
                </Text>
            ),
        },
        {
            title: "Actions",
            key: "actions",
            width: 100,
            render: (_, r) => (
                <Space size={4}>
                    <Tooltip title={r.isDefault ? "Cannot edit system role" : "Edit role"}>
                        <Button
                            type="text"
                            size="small"
                            icon={<EditOutlined />}
                            onClick={() => openEdit(r)}
                            disabled={r.isDefault}
                        />
                    </Tooltip>
                    <Popconfirm
                        title="Delete global role?"
                        description={
                            <span>
                                This role will be removed from the platform.<br />
                                Users currently assigned this role must be re-assigned.
                            </span>
                        }
                        onConfirm={() => handleDelete(r._id)}
                        okButtonProps={{ danger: true }}
                        okText="Delete"
                    >
                        <Tooltip title={r.isDefault ? "Cannot delete system role" : "Delete role"}>
                            <Button
                                type="text"
                                size="small"
                                danger
                                icon={<DeleteOutlined />}
                                disabled={r.isDefault}
                            />
                        </Tooltip>
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    return (
        <div>
            {/* Page Header */}
            <div style={{ marginBottom: 24 }}>
                <Title level={4} style={{ margin: 0 }}>
                    <GlobalOutlined style={{ color: "#5240d6", marginRight: 8 }} />
                    Global Roles
                </Title>
                <Text type="secondary">
                    Platform-wide roles created by Super Admin. These roles are available to all organizations
                    and can be assigned to any employee across the platform.
                </Text>
            </div>

            {/* Stats */}
            <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
                {[
                    { label: "Total Roles", value: roles.length, color: "#5240d6", icon: <GlobalOutlined /> },
                    { label: "Active", value: activeCount, color: "#059669", icon: <CheckCircleOutlined /> },
                    { label: "System Defaults", value: defaultCount, color: "#0284c7", icon: <CheckCircleOutlined /> },
                    { label: "Custom Created", value: roles.length - defaultCount, color: "#d97706", icon: <ClockCircleOutlined /> },
                ].map(s => (
                    <Col xs={12} md={6} key={s.label}>
                        <Card
                            size="small"
                            style={{ borderRadius: 10, border: `1px solid ${s.color}18` }}
                            bodyStyle={{ padding: "14px 18px" }}
                        >
                            <Statistic
                                title={<Text type="secondary" style={{ fontSize: 12 }}>{s.label}</Text>}
                                value={s.value}
                                valueStyle={{ color: s.color, fontSize: 24, fontWeight: 800 }}
                                prefix={s.icon}
                            />
                        </Card>
                    </Col>
                ))}
            </Row>

            {/* Info Banner */}
            <Alert
                type="info"
                showIcon
                icon={<InfoCircleOutlined />}
                message="About Global Roles"
                description="Global roles are not tied to any specific organization. When an admin assigns a global role to an employee, that employee gets the permissions associated with that role within their organization. This allows you to define standard job roles (e.g., Waiter, Kitchen Staff, Cashier) that work across all restaurants on the platform."
                style={{ marginBottom: 20, borderRadius: 10 }}
            />

            {/* Main Table */}
            <Card
                title={
                    <Space>
                        <GlobalOutlined />
                        <span>All Global Roles</span>
                        <Tag style={{ borderRadius: 6 }}>{roles.length}</Tag>
                    </Space>
                }
                extra={
                    <Button
                        type="primary"
                        icon={<PlusOutlined />}
                        onClick={openCreate}
                        style={{ background: "#5240d6", borderColor: "#5240d6", borderRadius: 8 }}
                    >
                        Create Global Role
                    </Button>
                }
                style={{ borderRadius: 14 }}
                bodyStyle={{ padding: 0 }}
            >
                <Spin spinning={loading}>
                    {roles.length === 0 && !loading ? (
                        <Empty
                            description={
                                <div>
                                    <Text strong>No global roles yet</Text>
                                    <br />
                                    <Text type="secondary">
                                        Create your first global role that all organizations can use.
                                    </Text>
                                </div>
                            }
                            style={{ padding: "48px 0" }}
                        >
                            <Button
                                type="primary"
                                icon={<PlusOutlined />}
                                onClick={openCreate}
                                style={{ background: "#5240d6" }}
                            >
                                Create First Global Role
                            </Button>
                        </Empty>
                    ) : (
                        <Table
                            columns={columns}
                            dataSource={roles}
                            rowKey="_id"
                            size="middle"
                            scroll={{ x: 800 }}
                            pagination={{
                                pageSize: 15,
                                showSizeChanger: true,
                                showTotal: (t) => `${t} global roles`,
                            }}
                        />
                    )}
                </Spin>
            </Card>

            {/* Create / Edit Modal */}
            <Modal
                title={
                    <Space>
                        <Avatar
                            size={28}
                            style={{ background: "#5240d6" }}
                            icon={<GlobalOutlined />}
                        />
                        <span>
                            {editingRole ? `Edit Role: ${editingRole.displayName}` : "Create New Global Role"}
                        </span>
                    </Space>
                }
                open={modalOpen}
                footer={null}
                onCancel={() => { setModalOpen(false); form.resetFields(); }}
                width={500}
            >
                {!editingRole && (
                    <Alert
                        message="This role will be available to all organizations on the platform."
                        type="info"
                        showIcon
                        style={{ marginBottom: 16, borderRadius: 8 }}
                    />
                )}

                <Form form={form} layout="vertical" onFinish={handleSave}>
                    {/* Role name only for create */}
                    {!editingRole && (
                        <Form.Item
                            label={
                                <Space>
                                    Role Key (Internal Name)
                                    <Tooltip title="Used internally. Lowercase, no spaces. e.g. 'waiter', 'kitchen-staff'">
                                        <InfoCircleOutlined style={{ color: "#94a3b8" }} />
                                    </Tooltip>
                                </Space>
                            }
                            name="name"
                            rules={[
                                { required: true, message: "Role key is required" },
                                {
                                    pattern: /^[a-z0-9-]+$/,
                                    message: "Only lowercase letters, numbers, and hyphens allowed",
                                },
                            ]}
                        >
                            <Input
                                placeholder="e.g. waiter, kitchen-staff, floor-manager"
                                style={{ fontFamily: "monospace" }}
                            />
                        </Form.Item>
                    )}

                    <Form.Item
                        label="Display Name"
                        name="displayName"
                        rules={[{ required: true, message: "Display name is required" }]}
                    >
                        <Input placeholder="e.g. Waiter, Kitchen Staff, Floor Manager" />
                    </Form.Item>

                    <Form.Item label="Description" name="description">
                        <Input.TextArea
                            rows={3}
                            placeholder="Describe what this role is for and what access it implies…"
                        />
                    </Form.Item>

                    <Divider style={{ margin: "12px 0" }} />

                    <Form.Item
                        label="Status"
                        name="isActive"
                        valuePropName="checked"
                    >
                        <Switch
                            checkedChildren="Active"
                            unCheckedChildren="Inactive"
                            style={{ backgroundColor: undefined }}
                        />
                    </Form.Item>

                    <Form.Item style={{ marginBottom: 0 }}>
                        <Space style={{ width: "100%", justifyContent: "flex-end" }}>
                            <Button onClick={() => { setModalOpen(false); form.resetFields(); }}>
                                Cancel
                            </Button>
                            <Button
                                type="primary"
                                htmlType="submit"
                                loading={saving}
                                icon={editingRole ? <EditOutlined /> : <PlusOutlined />}
                                style={{ background: "#5240d6", borderColor: "#5240d6" }}
                            >
                                {editingRole ? "Update Role" : "Create Global Role"}
                            </Button>
                        </Space>
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
}
