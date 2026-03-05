import React, { useEffect, useState, useCallback } from "react";
import {
    Table, Tag, Button, Input, Select, Space, Tooltip, Switch, Badge,
    Typography, Row, Col, Card, Statistic, Avatar, Dropdown, App, Spin,
} from "antd";
import type { MenuProps, TableColumnsType } from "antd";
import {
    SearchOutlined, EyeOutlined, MoreOutlined, ReloadOutlined,
    PlusOutlined, GlobalOutlined, ShopOutlined, SettingOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { adminListOrgs, updateOrgModules } from "../../Api";
import dayjs from "dayjs";

const { Title, Text } = Typography;

type Org = {
    _id: string;
    name: string;
    type: string;
    slug?: string;
    contactEmail?: string;
    contactPhone?: string;
    logo?: string | null;
    isActive: boolean;
    modules: { pos?: boolean; hrm?: boolean; inventory?: boolean; payroll?: boolean; ai?: boolean };
    ownedBy?: { displayName?: string; email?: string };
    createdAt: string;
    meta?: { lastInvoiceSent?: string; invoices?: any[] };
};

const MODULE_LABELS: Record<string, string> = {
    pos: "POS",
    hrm: "HRM",
    inventory: "Inventory",
    payroll: "Payroll",
    ai: "AI",
};

const MODULE_COLORS: Record<string, string> = {
    pos: "#5240d6",
    hrm: "#0284c7",
    inventory: "#059669",
    payroll: "#d97706",
    ai: "#db2777",
};

export default function OrganizationsTable() {
    const navigate = useNavigate();
    const { message } = App.useApp();

    const [orgs, setOrgs] = useState<Org[]>([]);
    const [filtered, setFiltered] = useState<Org[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchText, setSearchText] = useState("");
    const [statusFilter, setStatusFilter] = useState<string>("all");
    const [typeFilter, setTypeFilter] = useState<string>("all");
    const [moduleTogglingId, setModuleTogglingId] = useState<string | null>(null);

    const fetchOrgs = useCallback(async () => {
        setLoading(true);
        try {
            const res: any = await adminListOrgs();
            const data: Org[] = res?.data?.data?.data ?? res?.data?.data ?? res?.data ?? [];
            setOrgs(Array.isArray(data) ? data : []);
        } catch {
            message.error("Failed to load organizations");
        } finally {
            setLoading(false);
        }
    }, [message]);

    useEffect(() => { fetchOrgs(); }, [fetchOrgs]);

    useEffect(() => {
        let list = [...orgs];
        if (searchText) {
            const q = searchText.toLowerCase();
            list = list.filter(o =>
                o.name.toLowerCase().includes(q) ||
                o.contactEmail?.toLowerCase().includes(q) ||
                o.slug?.toLowerCase().includes(q)
            );
        }
        if (statusFilter !== "all") {
            list = list.filter(o => statusFilter === "active" ? o.isActive : !o.isActive);
        }
        if (typeFilter !== "all") {
            list = list.filter(o => o.type === typeFilter);
        }
        setFiltered(list);
    }, [orgs, searchText, statusFilter, typeFilter]);

    const handleModuleToggle = async (orgId: string, module: string, checked: boolean) => {
        setModuleTogglingId(orgId);
        try {
            await updateOrgModules(orgId, { [module]: checked });
            setOrgs(prev => prev.map(o =>
                o._id === orgId
                    ? { ...o, modules: { ...o.modules, [module]: checked } }
                    : o
            ));
            message.success(`${MODULE_LABELS[module]} ${checked ? "enabled" : "disabled"} for this organization`);
        } catch {
            message.error("Failed to update module");
        } finally {
            setModuleTogglingId(null);
        }
    };

    // Summary stats
    const totalActive = orgs.filter(o => o.isActive).length;
    const totalWithPOS = orgs.filter(o => o.modules?.pos).length;
    const totalWithHRM = orgs.filter(o => o.modules?.hrm).length;

    const columns: TableColumnsType<Org> = [
        {
            title: "Organization",
            key: "org",
            fixed: "left",
            width: 240,
            render: (_, record) => (
                <Space>
                    <Avatar
                        size={36}
                        src={record.logo || undefined}
                        style={{ background: "#5240d6", fontWeight: 700, flexShrink: 0 }}
                    >
                        {record.name[0]?.toUpperCase()}
                    </Avatar>
                    <div style={{ minWidth: 0 }}>
                        <Text strong style={{ display: "block", fontSize: 13 }}>{record.name}</Text>
                        <Text type="secondary" style={{ fontSize: 11 }}>{record.contactEmail || "—"}</Text>
                    </div>
                </Space>
            ),
        },
        {
            title: "Type",
            dataIndex: "type",
            width: 110,
            render: (type) => (
                <Tag style={{ textTransform: "capitalize", borderRadius: 6 }}>{type || "other"}</Tag>
            ),
        },
        {
            title: "Status",
            dataIndex: "isActive",
            width: 90,
            render: (active) => (
                <Badge
                    status={active ? "success" : "error"}
                    text={<Text style={{ fontSize: 12 }}>{active ? "Active" : "Inactive"}</Text>}
                />
            ),
        },
        {
            title: "Admin",
            key: "admin",
            width: 160,
            render: (_, record) => (
                <div>
                    <Text style={{ fontSize: 12 }}>{record.ownedBy?.displayName || "—"}</Text>
                    <Text type="secondary" style={{ fontSize: 11, display: "block" }}>{record.ownedBy?.email || ""}</Text>
                </div>
            ),
        },
        {
            title: "Modules",
            key: "modules",
            width: 280,
            render: (_, record) => (
                <Space size={4} wrap>
                    {Object.entries(MODULE_LABELS).map(([key, label]) => {
                        const enabled = record.modules?.[key as keyof typeof record.modules] ?? false;
                        return (
                            <Tooltip
                                key={key}
                                title={`${enabled ? "Disable" : "Enable"} ${label}`}
                                placement="top"
                            >
                                <Switch
                                    size="small"
                                    checked={enabled}
                                    loading={moduleTogglingId === record._id}
                                    onChange={(val) => handleModuleToggle(record._id, key, val)}
                                    style={{
                                        backgroundColor: enabled ? MODULE_COLORS[key] : undefined,
                                    }}
                                    checkedChildren={label}
                                    unCheckedChildren={label}
                                />
                            </Tooltip>
                        );
                    })}
                </Space>
            ),
        },
        {
            title: "Last Invoice",
            key: "invoice",
            width: 130,
            render: (_, record) => {
                const last = record.meta?.lastInvoiceSent;
                return last
                    ? <Text style={{ fontSize: 12 }}>{dayjs(last).format("DD MMM YYYY")}</Text>
                    : <Text type="secondary" style={{ fontSize: 12 }}>Never sent</Text>;
            },
        },
        {
            title: "Joined",
            dataIndex: "createdAt",
            width: 120,
            render: (d) => <Text style={{ fontSize: 12 }}>{dayjs(d).format("DD MMM YYYY")}</Text>,
        },
        {
            title: "Actions",
            key: "actions",
            fixed: "right",
            width: 80,
            render: (_, record) => {
                const items: MenuProps["items"] = [
                    {
                        key: "view",
                        icon: <EyeOutlined />,
                        label: "View Details",
                        onClick: () => navigate(`/superadmin/organizations/${record._id}`),
                    },
                    {
                        key: "settings",
                        icon: <SettingOutlined />,
                        label: "Settings",
                        onClick: () => navigate(`/superadmin/organizations/${record._id}?tab=settings`),
                    },
                ];
                return (
                    <Dropdown menu={{ items }} placement="bottomRight" trigger={["click"]}>
                        <Button type="text" icon={<MoreOutlined />} />
                    </Dropdown>
                );
            },
        },
    ];

    return (
        <div style={{ padding: "0 0 24px" }}>
            {/* Stats row */}
            <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
                {[
                    { title: "Total Organizations", value: orgs.length, icon: <GlobalOutlined />, color: "#5240d6" },
                    { title: "Active", value: totalActive, icon: <ShopOutlined />, color: "#059669" },
                    { title: "With POS", value: totalWithPOS, icon: <ShopOutlined />, color: "#0284c7" },
                    { title: "With HRM", value: totalWithHRM, icon: <GlobalOutlined />, color: "#d97706" },
                ].map(s => (
                    <Col xs={12} md={6} key={s.title}>
                        <Card
                            size="small"
                            style={{ borderRadius: 12, border: `1px solid ${s.color}20` }}
                            bodyStyle={{ padding: "16px 20px" }}
                        >
                            <Statistic
                                title={<Text type="secondary" style={{ fontSize: 12 }}>{s.title}</Text>}
                                value={s.value}
                                valueStyle={{ color: s.color, fontSize: 28, fontWeight: 800 }}
                            />
                        </Card>
                    </Col>
                ))}
            </Row>

            {/* Filters */}
            <Row gutter={[12, 12]} style={{ marginBottom: 16 }} align="middle">
                <Col flex="1">
                    <Input
                        prefix={<SearchOutlined style={{ color: "#94a3b8" }} />}
                        placeholder="Search by name, email or slug…"
                        value={searchText}
                        onChange={e => setSearchText(e.target.value)}
                        allowClear
                        style={{ borderRadius: 8 }}
                    />
                </Col>
                <Col>
                    <Select
                        value={statusFilter}
                        onChange={setStatusFilter}
                        style={{ width: 130 }}
                        options={[
                            { label: "All Status", value: "all" },
                            { label: "Active", value: "active" },
                            { label: "Inactive", value: "inactive" },
                        ]}
                    />
                </Col>
                <Col>
                    <Select
                        value={typeFilter}
                        onChange={setTypeFilter}
                        style={{ width: 130 }}
                        options={[
                            { label: "All Types", value: "all" },
                            { label: "Restaurant", value: "restaurant" },
                            { label: "Retail", value: "retail" },
                            { label: "Hospital", value: "hospital" },
                            { label: "Logistics", value: "logistics" },
                            { label: "Other", value: "other" },
                        ]}
                    />
                </Col>
                <Col>
                    <Button icon={<ReloadOutlined />} onClick={fetchOrgs} loading={loading}>
                        Refresh
                    </Button>
                </Col>
                <Col>
                    <Button
                        type="primary"
                        icon={<PlusOutlined />}
                        onClick={() => navigate("/superadmin/organizations/create")}
                        style={{ background: "#5240d6", borderColor: "#5240d6", borderRadius: 8 }}
                    >
                        Add Organization
                    </Button>
                </Col>
            </Row>

            {/* Table */}
            <Card bodyStyle={{ padding: 0 }} style={{ borderRadius: 12, overflow: "hidden" }}>
                <Spin spinning={loading}>
                    <Table
                        columns={columns}
                        dataSource={filtered}
                        rowKey="_id"
                        scroll={{ x: 1100 }}
                        pagination={{ pageSize: 10, showSizeChanger: true, showTotal: (t) => `${t} organizations` }}
                        onRow={(record) => ({
                            onDoubleClick: () => navigate(`/superadmin/organizations/${record._id}`),
                            style: { cursor: "pointer" },
                        })}
                    />
                </Spin>
            </Card>
        </div>
    );
}
