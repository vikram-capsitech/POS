import React, { useCallback, useEffect, useState } from "react";
import {
    Avatar,
    Badge,
    Button,
    Card,
    Col,
    Divider,
    Empty,
    Flex,
    Popconfirm,
    Row,
    Select,
    Skeleton,
    Space,
    Statistic,
    Tag,
    Tooltip,
    Typography,
} from "antd";
import {
    BellOutlined,
    CheckOutlined,
    CloseCircleOutlined,
    CheckCircleOutlined,
    DeleteOutlined,
    InfoCircleOutlined,
    ReloadOutlined,
    WarningOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import apiClient from "../../../Api";
import type { NotificationRecord } from "../../../Components/Notificationbell";

dayjs.extend(relativeTime);

const { Title, Text } = Typography;

// ─── Config (same as NotificationBell) ───────────────────────────────────────

const typeConfig = {
    info: { color: "#1677ff", bg: "#e6f4ff", border: "#91caff", icon: <InfoCircleOutlined style={{ color: "#1677ff" }} /> },
    success: { color: "#52c41a", bg: "#f6ffed", border: "#b7eb8f", icon: <CheckCircleOutlined style={{ color: "#52c41a" }} /> },
    error: { color: "#ff4d4f", bg: "#fff2f0", border: "#ffa39e", icon: <CloseCircleOutlined style={{ color: "#ff4d4f" }} /> },
    warning: { color: "#faad14", bg: "#fffbe6", border: "#ffe58f", icon: <WarningOutlined style={{ color: "#faad14" }} /> },
} as const;

const categoryColors: Record<string, string> = {
    task: "blue",
    sop: "geekblue",
    issue: "red",
    leave: "orange",
    advance: "purple",
    salary: "green",
    general: "default",
};

// ─── Notification card ────────────────────────────────────────────────────────

function NotificationCard({
    n,
    onRead,
    onDelete,
}: {
    n: NotificationRecord;
    onRead: (id: string) => void;
    onDelete: (id: string) => void;
}) {
    const cfg = typeConfig[n.type] ?? typeConfig.info;

    return (
        <div
            style={{
                display: "flex",
                gap: 14,
                padding: "16px 20px",
                background: n.read ? "#fff" : "#f0f7ff",
                borderLeft: `4px solid ${n.read ? "#f0f0f0" : cfg.color}`,
                borderRadius: 10,
                marginBottom: 8,
                transition: "all 0.2s",
                boxShadow: n.read ? "none" : "0 2px 8px rgba(22,119,255,0.07)",
            }}
        >
            {/* Icon */}
            <Avatar
                size={40}
                icon={cfg.icon}
                style={{
                    background: cfg.bg,
                    border: `1px solid ${cfg.border}`,
                    flexShrink: 0,
                }}
            />

            {/* Content */}
            <div style={{ flex: 1, minWidth: 0 }}>
                <Flex justify="space-between" align="flex-start" wrap="wrap" gap={4}>
                    <Space>
                        <Text strong style={{ fontSize: 14 }}>{n.title}</Text>
                        {!n.read && (
                            <Badge
                                status="processing"
                                color="#1677ff"
                                text={<Text style={{ fontSize: 11, color: "#1677ff" }}>New</Text>}
                            />
                        )}
                    </Space>
                    <Text type="secondary" style={{ fontSize: 12 }}>
                        {dayjs(n.createdAt).fromNow()} · {dayjs(n.createdAt).format("DD MMM YYYY, hh:mm A")}
                    </Text>
                </Flex>

                <Text style={{ fontSize: 13, display: "block", marginTop: 4, color: "#595959" }}>
                    {n.message}
                </Text>

                <Flex align="center" gap={8} style={{ marginTop: 10 }}>
                    <Tag color={categoryColors[n.category] ?? "default"} style={{ borderRadius: 20, fontSize: 11 }}>
                        {n.category}
                    </Tag>
                    <Tag
                        style={{
                            borderRadius: 20,
                            fontSize: 11,
                            color: cfg.color,
                            background: cfg.bg,
                            border: `1px solid ${cfg.border}`,
                        }}
                    >
                        {n.type}
                    </Tag>

                    <div style={{ marginLeft: "auto" }}>
                        <Space>
                            {!n.read && (
                                <Tooltip title="Mark as read">
                                    <Button
                                        size="small"
                                        icon={<CheckOutlined />}
                                        onClick={() => onRead(n._id)}
                                        style={{ borderRadius: 8, borderColor: "#1677ff", color: "#1677ff" }}
                                    >
                                        Mark read
                                    </Button>
                                </Tooltip>
                            )}
                            <Popconfirm
                                title="Delete this notification?"
                                onConfirm={() => onDelete(n._id)}
                                okButtonProps={{ danger: true }}
                                okText="Delete"
                            >
                                <Tooltip title="Delete">
                                    <Button
                                        size="small"
                                        danger
                                        icon={<DeleteOutlined />}
                                        style={{ borderRadius: 8 }}
                                    />
                                </Tooltip>
                            </Popconfirm>
                        </Space>
                    </div>
                </Flex>
            </div>
        </div>
    );
}

// ═════════════════════════════════════════════════════════════════════════════
//  Full Notifications Page
// ═════════════════════════════════════════════════════════════════════════════

type PageProps = { onBack?: () => void };

export default function NotificationsPage({ onBack }: PageProps) {
    const [notifications, setNotifications] = useState<NotificationRecord[]>([]);
    const [loading, setLoading] = useState(false);
    const [markingAll, setMarkingAll] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);

    // Filters
    const [filterRead, setFilterRead] = useState<"all" | "unread" | "read">("all");
    const [filterType, setFilterType] = useState<string | undefined>();
    const [filterCategory, setFilterCategory] = useState<string | undefined>();

    const fetchNotifications = useCallback(async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({ limit: "100" });
            if (filterRead === "unread") params.set("unreadOnly", "true");

            // GET /api/notifications
            const res: any = await apiClient.get(`/api/notifications?${params}`);
            setNotifications(res.data?.data ?? []);
            setUnreadCount(res.data?.unreadCount ?? 0);
        } catch {
            // silent
        } finally {
            setLoading(false);
        }
    }, [filterRead]);

    useEffect(() => {
        fetchNotifications();
    }, [fetchNotifications]);

    const handleRead = async (id: string) => {
        try {
            await apiClient.put(`/api/notifications/${id}/read`);
            setNotifications((prev) =>
                prev.map((n) => (n._id === id ? { ...n, read: true } : n))
            );
            setUnreadCount((c) => Math.max(0, c - 1));
        } catch { }
    };

    const handleDelete = async (id: string) => {
        try {
            await apiClient.delete(`/api/notifications/${id}`);
            const was = notifications.find((n) => n._id === id);
            setNotifications((prev) => prev.filter((n) => n._id !== id));
            if (was && !was.read) setUnreadCount((c) => Math.max(0, c - 1));
        } catch { }
    };

    const handleMarkAllRead = async () => {
        setMarkingAll(true);
        try {
            await apiClient.put("/api/notifications/read-all");
            setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
            setUnreadCount(0);
        } catch { }
        setMarkingAll(false);
    };

    // Apply client-side filters (type + category on top of server read filter)
    const visible = notifications.filter((n) => {
        if (filterRead === "read" && !n.read) return false;
        if (filterRead === "unread" && n.read) return false;
        if (filterType && n.type !== filterType) return false;
        if (filterCategory && n.category !== filterCategory) return false;
        return true;
    });

    // Stats
    const total = notifications.length;
    const readCount = notifications.filter((n) => n.read).length;

    return (
        <div style={{ padding: 24, margin: "0 auto" }}>
            {/* Header */}
            <Flex justify="space-between" align="flex-start" wrap="wrap" gap={12} style={{ marginBottom: 20 }}>
                <div>
                    <Space>
                        {onBack && (
                            <Button onClick={onBack} size="small" style={{ borderRadius: 8 }}>← Back</Button>
                        )}
                        <BellOutlined style={{ fontSize: 22, color: "#1677ff" }} />
                        <Title level={4} style={{ margin: 0 }}>Notifications</Title>
                    </Space>
                    <Text type="secondary" style={{ display: "block", marginTop: 2 }}>
                        Your activity feed and updates
                    </Text>
                </div>

                <Space wrap>
                    <Button
                        icon={<ReloadOutlined />}
                        onClick={fetchNotifications}
                        loading={loading}
                        style={{ borderRadius: 8 }}
                    >
                        Refresh
                    </Button>
                    {unreadCount > 0 && (
                        <Button
                            icon={<CheckOutlined />}
                            loading={markingAll}
                            onClick={handleMarkAllRead}
                            style={{ borderRadius: 8, borderColor: "#1677ff", color: "#1677ff" }}
                        >
                            Mark all read
                        </Button>
                    )}
                </Space>
            </Flex>

            {/* Stats */}
            <Row gutter={[12, 12]} style={{ marginBottom: 16 }}>
                {[
                    { label: "Total", value: total, color: "#595959", bg: "#fafafa", border: "#f0f0f0" },
                    { label: "Unread", value: unreadCount, color: "#1677ff", bg: "#e6f4ff", border: "#91caff" },
                    { label: "Read", value: readCount, color: "#52c41a", bg: "#f6ffed", border: "#b7eb8f" },
                ].map((s) => (
                    <Col xs={8} key={s.label}>
                        <Card
                            size="small"
                            style={{ borderRadius: 12, background: s.bg, border: `1px solid ${s.border}` }}
                            bodyStyle={{ padding: "12px 16px" }}
                        >
                            <Statistic
                                title={<Text style={{ fontSize: 12 }}>{s.label}</Text>}
                                value={s.value}
                                valueStyle={{ color: s.color, fontSize: 22 }}
                            />
                        </Card>
                    </Col>
                ))}
            </Row>

            {/* Filters */}
            <Card size="small" style={{ borderRadius: 12, marginBottom: 16 }} bodyStyle={{ padding: "12px 16px" }}>
                <Flex gap={12} wrap="wrap" align="center">
                    <Text type="secondary" style={{ fontSize: 13 }}>Filter:</Text>

                    <Select
                        value={filterRead}
                        onChange={setFilterRead}
                        style={{ width: 130 }}
                        size="small"
                        options={[
                            { value: "all", label: "All" },
                            { value: "unread", label: "Unread only" },
                            { value: "read", label: "Read only" },
                        ]}
                    />

                    <Select
                        value={filterType}
                        onChange={setFilterType}
                        allowClear
                        placeholder="Type"
                        style={{ width: 120 }}
                        size="small"
                        options={[
                            { value: "info", label: "Info" },
                            { value: "success", label: "Success" },
                            { value: "warning", label: "Warning" },
                            { value: "error", label: "Error" },
                        ]}
                    />

                    <Select
                        value={filterCategory}
                        onChange={setFilterCategory}
                        allowClear
                        placeholder="Category"
                        style={{ width: 140 }}
                        size="small"
                        options={[
                            { value: "task", label: "Task" },
                            { value: "sop", label: "SOP" },
                            { value: "issue", label: "Issue" },
                            { value: "leave", label: "Leave" },
                            { value: "advance", label: "Advance" },
                            { value: "salary", label: "Salary" },
                            { value: "general", label: "General" },
                        ]}
                    />

                    {(filterType || filterCategory || filterRead !== "all") && (
                        <Button
                            size="small"
                            type="text"
                            onClick={() => {
                                setFilterType(undefined);
                                setFilterCategory(undefined);
                                setFilterRead("all");
                            }}
                            style={{ color: "#ff4d4f" }}
                        >
                            Clear filters
                        </Button>
                    )}

                    <Text type="secondary" style={{ marginLeft: "auto", fontSize: 12 }}>
                        {visible.length} notification{visible.length !== 1 ? "s" : ""}
                    </Text>
                </Flex>
            </Card>

            {/* List */}
            {loading ? (
                <Space direction="vertical" style={{ width: "100%" }} size={10}>
                    <Skeleton active avatar paragraph={{ rows: 2 }} />
                    <Skeleton active avatar paragraph={{ rows: 2 }} />
                    <Skeleton active avatar paragraph={{ rows: 2 }} />
                </Space>
            ) : visible.length === 0 ? (
                <Empty
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                    description={
                        filterRead !== "all" || filterType || filterCategory
                            ? "No notifications match your filters"
                            : "You're all caught up! 🎉"
                    }
                />
            ) : (
                visible.map((n) => (
                    <NotificationCard
                        key={n._id}
                        n={n}
                        onRead={handleRead}
                        onDelete={handleDelete}
                    />
                ))
            )}
        </div>
    );
}