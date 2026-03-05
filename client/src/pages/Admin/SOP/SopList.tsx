import React, { useEffect, useMemo, useState } from "react";
import {
    Badge,
    Button,
    Card,
    Divider,
    Drawer,
    Empty,
    Flex,
    Input,
    Popconfirm,
    Segmented,
    Space,
    Table,
    Tag,
    Typography,
    message,
    Pagination,
    Skeleton,
    Descriptions,
    Tooltip,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import {
    PlusOutlined,
    SearchOutlined,
    EyeOutlined,
    EditOutlined,
    DeleteOutlined,
    BookOutlined,
    ClockCircleOutlined,
    ThunderboltOutlined,
} from "@ant-design/icons";
import { useNavigate, useParams } from "react-router-dom";
import dayjs from "dayjs";

import {
    hrmListSops,
    hrmDeleteSop,
} from "../../../Api/index";
import { requestHandler } from "../../../Utils/index";

const { Title, Text } = Typography;

type SopItem = {
    _id: string;
    title: string;
    description?: string;
    category: string;
    status: "Active" | "Review" | "Draft";
    difficultyLevel?: "Easy" | "Medium" | "Hard";
    estimatedTime?: string;
    owner?: { _id?: string; name?: string; displayName?: string } | string;
    steps?: Array<{ id?: number; name?: string; items?: string[] }>;
    voiceNote?: string | null;
    createdAt?: string;
    updatedAt?: string;
};

const statusTag = (s?: string) => {
    if (s === "Active") return <Tag color="green">Active</Tag>;
    if (s === "Review") return <Tag color="gold">Review</Tag>;
    if (s === "Draft") return <Tag color="default">Draft</Tag>;
    return <Tag>{s || "-"}</Tag>;
};

const difficultyTag = (d?: string) => {
    if (d === "Easy") return <Tag color="green">Easy</Tag>;
    if (d === "Medium") return <Tag color="orange">Medium</Tag>;
    if (d === "Hard") return <Tag color="red">Hard</Tag>;
    return <Tag>{d || "-"}</Tag>;
};

const fmtDate = (d?: string) => (d ? dayjs(d).format("MMM DD, YYYY") : "-");

const CATEGORIES = ["All", "Cleaning", "Kitchen", "Maintenance", "Purchase", "Others"];

export default function SopList() {
    const navigate = useNavigate();
    const { orgId } = useParams();

    const [loading, setLoading] = useState(false);
    const [deleteLoading, setDeleteLoading] = useState<string | null>(null);
    const [sops, setSops] = useState<SopItem[]>([]);
    const [total, setTotal] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);

    const [q, setQ] = useState("");
    const [activeCategory, setActiveCategory] = useState("All");

    const [drawerOpen, setDrawerOpen] = useState(false);
    const [activeSop, setActiveSop] = useState<SopItem | null>(null);

    const pageSize = Number(import.meta.env.VITE_LIMIT || 10);

    useEffect(() => {
        loadSops(1);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const loadSops = async (page = 1) => {
        setCurrentPage(page);
        const params: any = { page, limit: pageSize };
        if (q.trim()) params.search = q.trim();
        if (activeCategory !== "All") params.category = activeCategory;

        requestHandler(
            () => hrmListSops(params) as any,
            setLoading,
            (data: any) => {
                const list = data?.data?.sops ?? data?.sops ?? [];
                setSops(Array.isArray(list) ? list : []);
                setTotal(data?.data?.total ?? data?.total ?? 0);
            },
            (err) => message.error(err)
        );
    };

    const handleDelete = (id: string) => {
        requestHandler(
            () => hrmDeleteSop(id) as any,
            (v) => setDeleteLoading(v ? id : null),
            () => {
                message.success("SOP deleted successfully");
                loadSops(currentPage);
            },
            (err) => message.error(err)
        );
    };

    const openDrawer = (sop: SopItem) => {
        setActiveSop(sop);
        setDrawerOpen(true);
    };

    const visibleSops = useMemo(() => {
        let list = sops;
        const query = q.trim().toLowerCase();
        if (query) {
            list = list.filter(
                (s) =>
                    (s.title || "").toLowerCase().includes(query) ||
                    (s.category || "").toLowerCase().includes(query) ||
                    (s.description || "").toLowerCase().includes(query)
            );
        }
        if (activeCategory !== "All") {
            list = list.filter(
                (s) => (s.category || "").toLowerCase() === activeCategory.toLowerCase()
            );
        }
        return list;
    }, [sops, q, activeCategory]);

    const columns: ColumnsType<SopItem> = [
        {
            title: "Title",
            dataIndex: "title",
            key: "title",
            width: 260,
            render: (v, r) => (
                <Space direction="vertical" size={2}>
                    <Text strong style={{ fontSize: 14 }}>
                        {v || "-"}
                    </Text>
                    <Text type="secondary" style={{ fontSize: 12 }}>
                        #{r._id?.slice(-6)}
                    </Text>
                </Space>
            ),
        },
        {
            title: "Category",
            dataIndex: "category",
            key: "category",
            width: 140,
            render: (v) => <Tag color="blue">{v || "-"}</Tag>,
        },
        {
            title: "Status",
            dataIndex: "status",
            key: "status",
            width: 120,
            render: (v) => statusTag(v),
        },
        {
            title: "Difficulty",
            dataIndex: "difficultyLevel",
            key: "difficultyLevel",
            width: 120,
            render: (v) => difficultyTag(v),
        },
        {
            title: "Est. Time",
            dataIndex: "estimatedTime",
            key: "estimatedTime",
            width: 120,
            render: (v) => (
                <Text type="secondary">
                    <ClockCircleOutlined style={{ marginRight: 4 }} />
                    {v || "-"}
                </Text>
            ),
        },
        {
            title: "Steps",
            key: "steps",
            width: 90,
            render: (_, r) => (
                <Badge count={r.steps?.length || 0} showZero color="blue" />
            ),
        },
        {
            title: "Created",
            key: "createdAt",
            width: 130,
            render: (_, r) => <Text type="secondary">{fmtDate(r.createdAt)}</Text>,
        },
        {
            title: "Actions",
            key: "actions",
            fixed: "right",
            width: 200,
            render: (_, r) => (
                <Space>
                    <Button
                        size="small"
                        icon={<EyeOutlined />}
                        onClick={() => openDrawer(r)}
                        style={{ borderRadius: 10 }}
                    >
                        View
                    </Button>
                    <Tooltip title="Edit SOP">
                        <Button
                            size="small"
                            icon={<EditOutlined />}
                            onClick={() => navigate(`/client/${orgId}/sop/${r._id}/edit`)}
                            style={{ borderRadius: 10 }}
                        />
                    </Tooltip>
                    <Popconfirm
                        title="Delete this SOP?"
                        description="This action cannot be undone."
                        okText="Delete"
                        okButtonProps={{ danger: true }}
                        cancelText="Cancel"
                        onConfirm={() => handleDelete(r._id)}
                    >
                        <Tooltip title="Delete">
                            <Button
                                size="small"
                                danger
                                icon={<DeleteOutlined />}
                                loading={deleteLoading === r._id}
                                style={{ borderRadius: 10 }}
                            />
                        </Tooltip>
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    return (
        <div style={{ padding: 16 }}>
            {/* Header */}
            <Card style={{ borderRadius: 16, marginBottom: 12 }}>
                <Flex justify="space-between" align="center" wrap="wrap" gap={12}>
                    <Space direction="vertical" size={2}>
                        <Space>
                            <BookOutlined style={{ fontSize: 20, color: "#1677ff" }} />
                            <Title level={4} style={{ margin: 0 }}>
                                SOP Management
                            </Title>
                        </Space>
                        <Text type="secondary">
                            Create and manage Standard Operating Procedures for your organization.
                        </Text>
                    </Space>

                    <Space wrap>
                        <Input
                            value={q}
                            onChange={(e) => setQ(e.target.value)}
                            onPressEnter={() => loadSops(1)}
                            allowClear
                            prefix={<SearchOutlined />}
                            placeholder="Search title, category..."
                            style={{ width: 280 }}
                        />
                        <Button
                            type="primary"
                            icon={<PlusOutlined />}
                            onClick={() => navigate(`/client/${orgId}/sop/new`)}
                            style={{ borderRadius: 10 }}
                        >
                            Create SOP
                        </Button>
                    </Space>
                </Flex>

                <Divider style={{ margin: "12px 0" }} />

                <Flex justify="space-between" align="center" wrap="wrap" gap={12}>
                    <Segmented
                        value={activeCategory}
                        onChange={(v) => {
                            setActiveCategory(String(v));
                        }}
                        options={CATEGORIES.map((c) => ({ label: c, value: c }))}
                    />
                    <Button
                        onClick={() => loadSops(1)}
                        loading={loading}
                        style={{ borderRadius: 10 }}
                    >
                        Refresh
                    </Button>
                </Flex>
            </Card>

            {/* Summary Cards */}
            <Flex gap={12} wrap="wrap" style={{ marginBottom: 12 }}>
                {[
                    {
                        label: "Total SOPs",
                        value: total,
                        color: "#1677ff",
                        bg: "#e6f4ff",
                    },
                    {
                        label: "Active",
                        value: sops.filter((s) => s.status === "Active").length,
                        color: "#52c41a",
                        bg: "#f6ffed",
                    },
                    {
                        label: "In Review",
                        value: sops.filter((s) => s.status === "Review").length,
                        color: "#faad14",
                        bg: "#fffbe6",
                    },
                    {
                        label: "Drafts",
                        value: sops.filter((s) => s.status === "Draft").length,
                        color: "#8c8c8c",
                        bg: "#f5f5f5",
                    },
                ].map((item) => (
                    <Card
                        key={item.label}
                        style={{
                            borderRadius: 14,
                            flex: "1 1 140px",
                            minWidth: 140,
                            border: `1px solid ${item.color}30`,
                            background: item.bg,
                        }}
                        bodyStyle={{ padding: "14px 18px" }}
                    >
                        <Text type="secondary" style={{ fontSize: 12 }}>
                            {item.label}
                        </Text>
                        <div
                            style={{
                                fontSize: 26,
                                fontWeight: 700,
                                color: item.color,
                                lineHeight: 1.2,
                            }}
                        >
                            {item.value}
                        </div>
                    </Card>
                ))}
            </Flex>

            {/* Table */}
            <Card style={{ borderRadius: 16 }}>
                {loading ? (
                    <Space direction="vertical" style={{ width: "100%" }} size={12}>
                        <Skeleton active />
                        <Skeleton active />
                        <Skeleton active />
                    </Space>
                ) : visibleSops.length === 0 ? (
                    <Empty
                        description="No SOPs found. Create your first SOP!"
                        image={Empty.PRESENTED_IMAGE_SIMPLE}
                    >
                        <Button
                            type="primary"
                            icon={<PlusOutlined />}
                            onClick={() => navigate(`/client/${orgId}/sop/new`)}
                        >
                            Create SOP
                        </Button>
                    </Empty>
                ) : (
                    <Table<SopItem>
                        rowKey="_id"
                        columns={columns}
                        dataSource={visibleSops}
                        pagination={false}
                        scroll={{ x: 1100 }}
                        onRow={(record) => ({
                            onDoubleClick: () => openDrawer(record),
                            style: { cursor: "pointer" },
                        })}
                    />
                )}

                <Divider style={{ margin: "16px 0" }} />

                <Flex justify="space-between" align="center" wrap="wrap" gap={12}>
                    <Text type="secondary">
                        Showing {visibleSops.length} of {total} SOPs
                    </Text>
                    <Pagination
                        current={currentPage}
                        total={total}
                        pageSize={pageSize}
                        onChange={(page) => loadSops(page)}
                        showSizeChanger={false}
                    />
                </Flex>
            </Card>

            {/* View Drawer */}
            <Drawer
                open={drawerOpen}
                onClose={() => setDrawerOpen(false)}
                width={560}
                title={
                    <Space direction="vertical" size={2}>
                        <Text type="secondary" style={{ fontSize: 12 }}>
                            SOP Details
                        </Text>
                        <Text strong style={{ fontSize: 16 }}>
                            {activeSop?.title || "-"}
                        </Text>
                    </Space>
                }
                extra={
                    <Space>
                        <Button onClick={() => setDrawerOpen(false)} style={{ borderRadius: 10 }}>
                            Close
                        </Button>
                        {activeSop?._id ? (
                            <Button
                                type="primary"
                                icon={<EditOutlined />}
                                style={{ borderRadius: 10 }}
                                onClick={() => {
                                    setDrawerOpen(false);
                                    navigate(`/client/${orgId}/sop/${activeSop._id}/edit`);
                                }}
                            >
                                Edit
                            </Button>
                        ) : null}
                    </Space>
                }
            >
                {!activeSop ? (
                    <Empty description="No SOP selected" />
                ) : (
                    <Space direction="vertical" size={16} style={{ width: "100%" }}>
                        <Descriptions bordered size="small" column={1} styles={{ content: { background: "#fff" } }}>
                            <Descriptions.Item label="SOP ID">
                                <Text code>{activeSop._id}</Text>
                            </Descriptions.Item>
                            <Descriptions.Item label="Category">
                                <Tag color="blue">{activeSop.category || "-"}</Tag>
                            </Descriptions.Item>
                            <Descriptions.Item label="Status">
                                {statusTag(activeSop.status)}
                            </Descriptions.Item>
                            <Descriptions.Item label="Difficulty">
                                {difficultyTag(activeSop.difficultyLevel)}
                            </Descriptions.Item>
                            <Descriptions.Item label="Estimated Time">
                                <Text>
                                    <ClockCircleOutlined style={{ marginRight: 4 }} />
                                    {activeSop.estimatedTime || "-"}
                                </Text>
                            </Descriptions.Item>
                            <Descriptions.Item label="Created">
                                {fmtDate(activeSop.createdAt)}
                            </Descriptions.Item>
                            <Descriptions.Item label="Last Updated">
                                {fmtDate(activeSop.updatedAt)}
                            </Descriptions.Item>
                        </Descriptions>

                        {activeSop.description && (
                            <div>
                                <Text strong>Description</Text>
                                <div
                                    style={{
                                        marginTop: 6,
                                        padding: 12,
                                        border: "1px solid rgba(2,6,23,.08)",
                                        borderRadius: 12,
                                        background: "rgba(2,6,23,.02)",
                                        whiteSpace: "pre-wrap",
                                        fontSize: 13,
                                    }}
                                >
                                    {activeSop.description}
                                </div>
                            </div>
                        )}

                        {activeSop.steps && activeSop.steps.length > 0 && (
                            <div>
                                <Flex align="center" gap={8} style={{ marginBottom: 10 }}>
                                    <ThunderboltOutlined />
                                    <Text strong>Steps ({activeSop.steps.length})</Text>
                                </Flex>
                                <Space direction="vertical" style={{ width: "100%" }} size={10}>
                                    {activeSop.steps.map((step, idx) => (
                                        <Card
                                            key={step.id ?? idx}
                                            size="small"
                                            style={{
                                                borderRadius: 10,
                                                border: "1px solid rgba(22,119,255,.2)",
                                                background: "rgba(22,119,255,.03)",
                                            }}
                                        >
                                            <Text strong style={{ color: "#1677ff" }}>
                                                Step {idx + 1}: {step.name || "Unnamed"}
                                            </Text>
                                            {step.items && step.items.length > 0 && (
                                                <ul style={{ marginTop: 6, paddingLeft: 20, marginBottom: 0 }}>
                                                    {step.items.map((item, i) => (
                                                        <li key={i} style={{ fontSize: 13 }}>
                                                            {item}
                                                        </li>
                                                    ))}
                                                </ul>
                                            )}
                                        </Card>
                                    ))}
                                </Space>
                            </div>
                        )}

                        {activeSop.voiceNote && (
                            <div>
                                <Text strong>Voice Note</Text>
                                <div style={{ marginTop: 8 }}>
                                    <audio controls src={String(activeSop.voiceNote)} style={{ width: "100%" }} />
                                </div>
                            </div>
                        )}
                    </Space>
                )}
            </Drawer>
        </div>
    );
}
