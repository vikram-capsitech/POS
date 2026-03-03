import React, { useEffect, useState, useCallback } from "react";
import {
    Card, Table, Tag, Button, Modal, Form, Input, Switch, Space,
    Typography, Avatar, App, Spin, Empty, Popconfirm, Badge, Checkbox,
    Row, Col, Divider, Tooltip, Alert, Statistic,
} from "antd";
import type { TableColumnsType } from "antd";
import {
    PlusOutlined, EditOutlined, DeleteOutlined, KeyOutlined,
    InfoCircleOutlined, CheckCircleOutlined, LockOutlined,
} from "@ant-design/icons";
import {
    Monitor, ClipboardList, AlertCircle, GitPullRequest, Fingerprint,
    Ticket, FileText, Bot, DollarSign, User, Settings, LayoutDashboard,
} from "lucide-react";
import { adminCreateRole, adminListRoles, adminUpdateRole, adminDeleteRole } from "../../../Api";
import { useAuthStore } from "../../../Store/store";
import dayjs from "dayjs";

const { Title, Text, Paragraph } = Typography;

// ─────────────────────────────────────────────────────────────────────────────
// Page definitions — these are all the dashboard sections admin can grant
// ─────────────────────────────────────────────────────────────────────────────
type PageDef = {
    key: string;
    label: string;
    icon: React.ReactNode;
    module: string; // which org module must be enabled for this page to matter
    description: string;
};

const ALL_PAGES: PageDef[] = [
    { key: "dashboard", label: "Dashboard (Home)", icon: <LayoutDashboard size={16} />, module: "MAIN", description: "Overview stats and home screen" },
    { key: "pos", label: "POS", icon: <Monitor size={16} />, module: "POS", description: "Point of Sale terminal" },
    { key: "task", label: "Tasks", icon: <ClipboardList size={16} />, module: "MAIN", description: "Create and manage tasks" },
    { key: "sop", label: "SOP", icon: <FileText size={16} />, module: "MAIN", description: "Standard Operating Procedures" },
    { key: "issue", label: "Issue Raised", icon: <AlertCircle size={16} />, module: "MAIN", description: "Report and track issues" },
    { key: "request", label: "Requests", icon: <GitPullRequest size={16} />, module: "MAIN", description: "Leave and other requests" },
    { key: "attendance", label: "Attendance", icon: <Fingerprint size={16} />, module: "HRM", description: "Attendance tracking (HRM module)" },
    { key: "voucher", label: "Vouchers", icon: <Ticket size={16} />, module: "MAIN", description: "Manage vouchers and discounts" },
    { key: "ai-review", label: "AI Review", icon: <Bot size={16} />, module: "AI", description: "AI-powered performance insights" },
    { key: "salary-management", label: "Salary Management", icon: <DollarSign size={16} />, module: "PAYROLL", description: "Payroll and salary (Payroll module)" },
    { key: "user-profile", label: "User Profile", icon: <User size={16} />, module: "MAIN", description: "Employee's own profile page" },
];

// Colors for role avatars
const ROLE_COLORS = [
    "#5240d6", "#0284c7", "#059669", "#d97706", "#db2777",
    "#7c3aed", "#0891b2", "#16a34a", "#ea580c",
];
function roleColor(name: string) {
    let h = 0; for (const c of name) h += c.charCodeAt(0);
    return ROLE_COLORS[h % ROLE_COLORS.length];
}

// ─────────────────────────────────────────────────────────────────────────────

type Role = {
    _id: string;
    name: string;
    displayName: string;
    description?: string;
    pages: string[];
    isDefault: boolean;
    isActive: boolean;
    isGlobal?: boolean;
    createdAt: string;
};

export default function AdminRolesPage() {
    const { message } = App.useApp();
    const session = useAuthStore((s) => s.session);
    const orgModules: string[] = session.modules ?? [];

    const [roles, setRoles] = useState<Role[]>([]);
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [editingRole, setEditingRole] = useState<Role | null>(null);
    const [saving, setSaving] = useState(false);
    const [selectedPages, setSelectedPages] = useState<string[]>([]);
    const [isActive, setIsActive] = useState(true);
    const [form] = Form.useForm();

    const fetchRoles = useCallback(async () => {
        setLoading(true);
        try {
            const res: any = await adminListRoles();
            const data: Role[] = res?.data?.data?.data ?? res?.data?.data ?? [];
            setRoles(Array.isArray(data) ? data : []);
        } catch {
            message.error("Failed to load roles");
        } finally {
            setLoading(false);
        }
    }, [message]);

    useEffect(() => { fetchRoles(); }, [fetchRoles]);

    const openCreate = () => {
        setEditingRole(null);
        setSelectedPages([]);
        setIsActive(true);
        form.resetFields();
        setModalOpen(true);
    };

    const openEdit = (role: Role) => {
        setEditingRole(role);
        setSelectedPages(Array.isArray(role.pages) ? role.pages : []);
        setIsActive(role.isActive);
        form.setFieldsValue({
            displayName: role.displayName,
            name: role.name,
            description: role.description,
        });
        setModalOpen(true);
    };

    const handleSave = async (values: any) => {
        setSaving(true);
        try {
            const payload = {
                displayName: values.displayName,
                name: values.name,
                description: values.description || "",
                pages: selectedPages,
                isActive,
            };

            if (editingRole) {
                await adminUpdateRole(editingRole._id, payload);
                message.success("Role updated");
            } else {
                await adminCreateRole(payload);
                message.success(`Role "${values.displayName}" created`);
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
            await adminDeleteRole(id);
            message.success("Role deleted");
            fetchRoles();
        } catch (err: any) {
            message.error(err?.response?.data?.message || "Cannot delete this role");
        }
    };

    const togglePage = (key: string) => {
        setSelectedPages(prev =>
            prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]
        );
    };

    const selectAll = () => setSelectedPages(ALL_PAGES.map(p => p.key));
    const clearAll = () => setSelectedPages([]);

    const columns: TableColumnsType<Role> = [
        {
            title: "Role",
            key: "role",
            width: 220,
            render: (_, r) => {
                const color = roleColor(r.name);
                return (
                    <Space>
                        <Avatar size={38} style={{ background: color, fontWeight: 700, fontSize: 14 }}>
                            {(r.displayName || r.name)[0]?.toUpperCase()}
                        </Avatar>
                        <div>
                            <Text strong style={{ fontSize: 13 }}>{r.displayName || r.name}</Text>
                            <Text type="secondary" style={{ fontSize: 11, display: "block", fontFamily: "monospace" }}>
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
            render: (d) => d
                ? <Text style={{ fontSize: 13 }}>{d}</Text>
                : <Text type="secondary">—</Text>,
        },
        {
            title: "Page Access",
            key: "pages",
            width: 260,
            render: (_, r) => {
                if (!r.pages?.length) {
                    return r.isDefault
                        ? <Tag color="blue">Full Access</Tag>
                        : <Tag color="orange">No Pages Set</Tag>;
                }
                const shown = r.pages.slice(0, 3);
                const rest = r.pages.length - 3;
                return (
                    <Space size={4} wrap>
                        {shown.map(p => {
                            const def = ALL_PAGES.find(x => x.key === p);
                            return (
                                <Tag key={p} color="purple" style={{ borderRadius: 4, fontSize: 11 }}>
                                    {def?.label || p}
                                </Tag>
                            );
                        })}
                        {rest > 0 && <Tag color="default">+{rest} more</Tag>}
                    </Space>
                );
            },
        },
        {
            title: "Type",
            key: "type",
            width: 95,
            render: (_, r) => r.isDefault
                ? <Tag color="blue" icon={<CheckCircleOutlined />} style={{ borderRadius: 5 }}>System</Tag>
                : <Tag color="purple" icon={<KeyOutlined />} style={{ borderRadius: 5 }}>Custom</Tag>,
        },
        {
            title: "Status",
            dataIndex: "isActive",
            width: 90,
            render: (v) => <Badge status={v ? "success" : "error"} text={v ? "Active" : "Inactive"} />,
        },
        {
            title: "Created",
            dataIndex: "createdAt",
            width: 110,
            render: (d) => <Text style={{ fontSize: 12 }}>{dayjs(d).format("DD MMM YY")}</Text>,
        },
        {
            title: "Actions",
            key: "actions",
            width: 90,
            render: (_, r) => (
                <Space size={4}>
                    <Tooltip title={r.isDefault ? "System roles cannot be edited" : "Edit role"}>
                        <Button type="text" size="small" icon={<EditOutlined />} onClick={() => openEdit(r)} disabled={r.isDefault} />
                    </Tooltip>
                    <Popconfirm
                        title="Delete this role?"
                        description="Employees using this role will lose their assigned access."
                        onConfirm={() => handleDelete(r._id)}
                        okButtonProps={{ danger: true }}
                        okText="Delete"
                    >
                        <Tooltip title={r.isDefault ? "System roles cannot be deleted" : "Delete"}>
                            <Button type="text" size="small" danger icon={<DeleteOutlined />} disabled={r.isDefault} />
                        </Tooltip>
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    const activeCount = roles.filter(r => r.isActive).length;
    const customCount = roles.filter(r => !r.isDefault).length;

    // Which pages to show in the modal — only those whose module is enabled for this org
    const availablePages = ALL_PAGES.filter(p =>
        p.module === "MAIN" || orgModules.includes(p.module)
    );

    return (
        <div>
            {/* Header */}
            <div style={{ marginBottom: 24 }}>
                <Title level={4} style={{ margin: 0 }}>
                    <KeyOutlined style={{ color: "#5240d6", marginRight: 8 }} />
                    Role Management
                </Title>
                <Text type="secondary">
                    Create custom roles for your organization. Each role defines which pages and features employees can access.
                </Text>
            </div>

            {/* Stats */}
            <Row gutter={[16, 16]} style={{ marginBottom: 20 }}>
                {[
                    { label: "Total Roles", value: roles.length, color: "#5240d6" },
                    { label: "Active", value: activeCount, color: "#059669" },
                    { label: "Custom Roles", value: customCount, color: "#d97706" },
                ].map(s => (
                    <Col xs={8} key={s.label}>
                        <Card size="small" style={{ borderRadius: 10, border: `1px solid ${s.color}1a` }} bodyStyle={{ padding: "12px 18px" }}>
                            <Statistic title={<Text type="secondary" style={{ fontSize: 12 }}>{s.label}</Text>} value={s.value} valueStyle={{ color: s.color, fontSize: 22, fontWeight: 800 }} />
                        </Card>
                    </Col>
                ))}
            </Row>

            <Alert
                type="info"
                showIcon
                icon={<InfoCircleOutlined />}
                message="How roles work"
                description='Create a role (e.g. "Manager"), select which pages it can access (Tasks, SOP, Attendance…), then assign it to employees in the Employee section. Employees will only see what you allow.'
                style={{ marginBottom: 20, borderRadius: 10 }}
            />

            {/* Table */}
            <Card
                title={<Space><KeyOutlined /><span>Organization Roles</span><Tag style={{ borderRadius: 6 }}>{roles.length}</Tag></Space>}
                extra={
                    <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}
                        style={{ background: "#5240d6", borderColor: "#5240d6", borderRadius: 8 }}>
                        Create Role
                    </Button>
                }
                style={{ borderRadius: 14 }}
                bodyStyle={{ padding: 0 }}
            >
                <Spin spinning={loading}>
                    {roles.length === 0 && !loading ? (
                        <Empty description="No roles yet. Create your first custom role." style={{ padding: "48px 0" }}>
                            <Button type="primary" icon={<PlusOutlined />} onClick={openCreate} style={{ background: "#5240d6" }}>
                                Create First Role
                            </Button>
                        </Empty>
                    ) : (
                        <Table
                            columns={columns}
                            dataSource={roles}
                            rowKey="_id"
                            size="middle"
                            scroll={{ x: 900 }}
                            pagination={{ pageSize: 15, showSizeChanger: true, showTotal: t => `${t} roles` }}
                        />
                    )}
                </Spin>
            </Card>

            {/* ── Create / Edit Modal ─────────────────────────────────────── */}
            <Modal
                title={
                    <Space>
                        <Avatar size={28} style={{ background: "#5240d6" }} icon={<KeyOutlined />} />
                        <span>{editingRole ? `Edit: ${editingRole.displayName}` : "Create New Role"}</span>
                    </Space>
                }
                open={modalOpen}
                footer={null}
                onCancel={() => { setModalOpen(false); form.resetFields(); }}
                width={680}
            >
                <Form form={form} layout="vertical" onFinish={handleSave}>
                    <Row gutter={16}>
                        <Col xs={24} md={12}>
                            <Form.Item
                                label="Display Name"
                                name="displayName"
                                rules={[{ required: true, message: "Display name is required" }]}
                            >
                                <Input placeholder="e.g. Manager, Head Waiter, Kitchen Lead" />
                            </Form.Item>
                        </Col>
                        <Col xs={24} md={12}>
                            {!editingRole && (
                                <Form.Item
                                    label={
                                        <Space>
                                            Role Key
                                            <Tooltip title="Lowercase, no spaces. e.g. manager, head-waiter">
                                                <InfoCircleOutlined style={{ color: "#94a3b8" }} />
                                            </Tooltip>
                                        </Space>
                                    }
                                    name="name"
                                    rules={[
                                        { required: true, message: "Role key is required" },
                                        { pattern: /^[a-z0-9-]+$/, message: "Lowercase, numbers and hyphens only" },
                                    ]}
                                >
                                    <Input placeholder="e.g. head-waiter" style={{ fontFamily: "monospace" }} />
                                </Form.Item>
                            )}
                        </Col>
                    </Row>

                    <Form.Item label="Description" name="description">
                        <Input.TextArea rows={2} placeholder="What does this role do? (optional)" />
                    </Form.Item>

                    <Divider style={{ margin: "8px 0 16px" }}>
                        <Space>
                            <LockOutlined />
                            <Text strong>Page Access Control</Text>
                        </Space>
                    </Divider>

                    <div style={{ marginBottom: 8, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <Text type="secondary" style={{ fontSize: 13 }}>
                            Select which pages this role can access:
                        </Text>
                        <Space>
                            <Button size="small" type="link" onClick={selectAll}>Select All</Button>
                            <Button size="small" type="link" danger onClick={clearAll}>Clear All</Button>
                        </Space>
                    </div>

                    <div
                        style={{
                            border: "1px solid #e2e8f0",
                            borderRadius: 10,
                            padding: 16,
                            background: "#fafbff",
                            maxHeight: 340,
                            overflowY: "auto",
                        }}
                    >
                        <Row gutter={[8, 8]}>
                            {availablePages.map(page => {
                                const checked = selectedPages.includes(page.key);
                                return (
                                    <Col xs={24} sm={12} key={page.key}>
                                        <div
                                            onClick={() => togglePage(page.key)}
                                            style={{
                                                display: "flex",
                                                alignItems: "flex-start",
                                                gap: 12,
                                                padding: "10px 12px",
                                                borderRadius: 8,
                                                border: `1.5px solid ${checked ? "#5240d6" : "#e2e8f0"}`,
                                                background: checked ? "#f0eeff" : "#ffffff",
                                                cursor: "pointer",
                                                transition: "all 0.15s",
                                                userSelect: "none",
                                            }}
                                        >
                                            <Checkbox checked={checked} onChange={() => togglePage(page.key)} style={{ marginTop: 2 }} />
                                            <div style={{ flex: 1, minWidth: 0 }}>
                                                <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 2 }}>
                                                    <span style={{ color: checked ? "#5240d6" : "#64748b" }}>{page.icon}</span>
                                                    <Text strong style={{ fontSize: 13, color: checked ? "#5240d6" : "inherit" }}>
                                                        {page.label}
                                                    </Text>
                                                    {page.module !== "MAIN" && (
                                                        <Tag style={{ fontSize: 10, lineHeight: "14px", padding: "0 4px", borderRadius: 3 }} color="blue">
                                                            {page.module}
                                                        </Tag>
                                                    )}
                                                </div>
                                                <Text type="secondary" style={{ fontSize: 11 }}>{page.description}</Text>
                                            </div>
                                        </div>
                                    </Col>
                                );
                            })}
                        </Row>
                    </div>

                    {selectedPages.length === 0 && (
                        <Alert
                            type="warning"
                            showIcon
                            message="No pages selected — employees with this role won't see any pages."
                            style={{ marginTop: 12, borderRadius: 8 }}
                        />
                    )}

                    {selectedPages.includes("pos") && !selectedPages.some(p => p !== "pos") && (
                        <Alert
                            type="info"
                            showIcon
                            message='POS-only role detected — employees will be sent directly to the POS screen and will not see the main dashboard sidebar.'
                            style={{ marginTop: 12, borderRadius: 8 }}
                        />
                    )}

                    <Divider style={{ margin: "14px 0" }} />

                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <Space>
                            <Text style={{ fontSize: 13 }}>Active Status:</Text>
                            <Switch
                                checked={isActive}
                                onChange={setIsActive}
                                checkedChildren="Active"
                                unCheckedChildren="Inactive"
                            />
                        </Space>
                        <Space>
                            <Button onClick={() => { setModalOpen(false); form.resetFields(); }}>Cancel</Button>
                            <Button
                                type="primary"
                                htmlType="submit"
                                loading={saving}
                                icon={editingRole ? <EditOutlined /> : <PlusOutlined />}
                                style={{ background: "#5240d6", borderColor: "#5240d6" }}
                            >
                                {editingRole ? "Update Role" : "Create Role"}
                            </Button>
                        </Space>
                    </div>
                </Form>
            </Modal>
        </div>
    );
}
