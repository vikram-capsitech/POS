import React, { useCallback, useEffect, useRef, useState } from "react";
import {
    Avatar,
    Badge,
    Button,
    Divider,
    Dropdown,
    Empty,
    Flex,
    Space,
    Spin,
    Tag,
    Tooltip,
    Typography,
} from "antd";
import {
    BellOutlined,
    CheckOutlined,
    DeleteOutlined,
    CheckCircleOutlined,
    InfoCircleOutlined,
    CloseCircleOutlined,
    WarningOutlined,
    ArrowRightOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import apiClient from "../Api";

dayjs.extend(relativeTime);

const { Text, Title } = Typography;

// ─── Types ────────────────────────────────────────────────────────────────────

type NotificationType = "info" | "error" | "success" | "warning";
type NotificationCategory =
    | "task"
    | "sop"
    | "issue"
    | "leave"
    | "advance"
    | "salary"
    | "general";

export type NotificationRecord = {
    _id: string;
    type: NotificationType;
    category: NotificationCategory;
    title: string;
    message: string;
    read: boolean;
    data?: Record<string, any>;
    createdAt: string;
    sender?: { _id: string; displayName?: string; userName?: string } | null;
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

const typeConfig: Record<
    NotificationType,
    { color: string; bg: string; border: string; icon: React.ReactNode }
> = {
    info: {
        color: "#1677ff",
        bg: "#e6f4ff",
        border: "#91caff",
        icon: <InfoCircleOutlined style={{ color: "#1677ff" }} />,
    },
    success: {
        color: "#52c41a",
        bg: "#f6ffed",
        border: "#b7eb8f",
        icon: <CheckCircleOutlined style={{ color: "#52c41a" }} />,
    },
    error: {
        color: "#ff4d4f",
        bg: "#fff2f0",
        border: "#ffa39e",
        icon: <CloseCircleOutlined style={{ color: "#ff4d4f" }} />,
    },
    warning: {
        color: "#faad14",
        bg: "#fffbe6",
        border: "#ffe58f",
        icon: <WarningOutlined style={{ color: "#faad14" }} />,
    },
};

const categoryLabel: Record<NotificationCategory, string> = {
    task: "Task",
    sop: "SOP",
    issue: "Issue",
    leave: "Leave",
    advance: "Advance",
    salary: "Salary",
    general: "General",
};

// ─── Single notification row ──────────────────────────────────────────────────

function NotificationRow({
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
                gap: 10,
                padding: "10px 14px",
                background: n.read ? "transparent" : "#fafcff",
                borderLeft: n.read ? "3px solid transparent" : `3px solid ${cfg.color}`,
                transition: "background 0.2s",
                cursor: "default",
            }}
        >
            {/* Icon */}
            <Avatar
                size={34}
                icon={cfg.icon}
                style={{
                    background: cfg.bg,
                    border: `1px solid ${cfg.border}`,
                    flexShrink: 0,
                    marginTop: 2,
                }}
            />

            {/* Body */}
            <div style={{ flex: 1, minWidth: 0 }}>
                <Flex justify="space-between" align="flex-start" gap={4}>
                    <Text
                        strong
                        style={{
                            fontSize: 13,
                            color: n.read ? "#595959" : "#141414",
                            lineHeight: 1.4,
                        }}
                        ellipsis={{ tooltip: n.title }}
                    >
                        {n.title}
                    </Text>
                    <Text
                        type="secondary"
                        style={{ fontSize: 11, whiteSpace: "nowrap", flexShrink: 0 }}
                    >
                        {dayjs(n.createdAt).fromNow()}
                    </Text>
                </Flex>

                <Text
                    type="secondary"
                    style={{ fontSize: 12, display: "block", marginTop: 2, lineHeight: 1.4 }}
                >
                    {n.message.length > 80 ? n.message.slice(0, 80) + "…" : n.message}
                </Text>

                <Flex align="center" gap={6} style={{ marginTop: 6 }}>
                    <Tag
                        style={{
                            fontSize: 10,
                            padding: "0 6px",
                            borderRadius: 20,
                            margin: 0,
                            color: cfg.color,
                            background: cfg.bg,
                            border: `1px solid ${cfg.border}`,
                        }}
                    >
                        {categoryLabel[n.category] ?? n.category}
                    </Tag>

                    {!n.read && (
                        <Tooltip title="Mark as read">
                            <Button
                                type="text"
                                size="small"
                                icon={<CheckOutlined style={{ fontSize: 11 }} />}
                                onClick={(e) => { e.stopPropagation(); onRead(n._id); }}
                                style={{ padding: "0 4px", height: 20, fontSize: 11, color: "#1677ff" }}
                            >
                                Read
                            </Button>
                        </Tooltip>
                    )}

                    <Tooltip title="Delete">
                        <Button
                            type="text"
                            size="small"
                            danger
                            icon={<DeleteOutlined style={{ fontSize: 11 }} />}
                            onClick={(e) => { e.stopPropagation(); onDelete(n._id); }}
                            style={{ padding: "0 4px", height: 20, marginLeft: "auto" }}
                        />
                    </Tooltip>
                </Flex>
            </div>

            {/* Unread dot */}
            {!n.read && (
                <div
                    style={{
                        width: 7,
                        height: 7,
                        borderRadius: "50%",
                        background: "#1677ff",
                        flexShrink: 0,
                        marginTop: 6,
                    }}
                />
            )}
        </div>
    );
}

// ═════════════════════════════════════════════════════════════════════════════
//  Main Bell Component
// ═════════════════════════════════════════════════════════════════════════════

type Props = {
    /** Called when user clicks "View all" — use this to navigate to a full notifications page */
    onViewAll?: () => void;
};

export default function NotificationBell({ onViewAll }: Props) {
    const [open, setOpen] = useState(false);
    const [notifications, setNotifications] = useState<NotificationRecord[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(false);
    const [markingAll, setMarkingAll] = useState(false);

    // Track IDs already shown in "toast" so we don't re-show them
    const seenIds = useRef<Set<string>>(new Set());
    // Latest 2 new notifications to show as callouts
    const [callouts, setCallouts] = useState<NotificationRecord[]>([]);

    // ─── Fetch ────────────────────────────────────────────────────────────────

    const fetchNotifications = useCallback(async (silent = false) => {
        if (!silent) setLoading(true);
        try {
            // GET /api/notifications?limit=20
            const res: any = await apiClient.get("/api/notifications?limit=20");
            const data: NotificationRecord[] = res.data?.data ?? [];
            const count: number = res.data?.unreadCount ?? 0;

            // Detect new notifications (unread + not yet seen)
            const newOnes = data.filter(
                (n) => !n.read && !seenIds.current.has(n._id)
            );

            if (newOnes.length > 0 && seenIds.current.size > 0) {
                // Show up to 2 callouts
                setCallouts(newOnes.slice(0, 2));
                // Auto-dismiss after 5 s
                setTimeout(() => setCallouts([]), 5000);
            }

            // Mark all fetched as seen
            data.forEach((n) => seenIds.current.add(n._id));

            setNotifications(data);
            setUnreadCount(count);
        } catch {
            // silent fail — don't disrupt UX
        } finally {
            if (!silent) setLoading(false);
        }
    }, []);

    // Initial load + poll every 30 s
    useEffect(() => {
        fetchNotifications();
        const interval = setInterval(() => fetchNotifications(true), 30_000);
        return () => clearInterval(interval);
    }, [fetchNotifications]);

    // ─── Actions ──────────────────────────────────────────────────────────────

    const handleRead = async (id: string) => {
        try {
            // PUT /api/notifications/:id/read
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
            // PUT /api/notifications/read-all
            await apiClient.put("/api/notifications/read-all");
            setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
            setUnreadCount(0);
        } catch { }
        setMarkingAll(false);
    };

    // ─── Dropdown content ─────────────────────────────────────────────────────

    const dropdownContent = (
        <div
            style={{
                width: 380,
                maxHeight: 520,
                borderRadius: 14,
                boxShadow: "0 8px 32px rgba(0,0,0,0.14)",
                background: "#fff",
                overflow: "hidden",
                display: "flex",
                flexDirection: "column",
            }}
        >
            {/* Header */}
            <Flex
                justify="space-between"
                align="center"
                style={{ padding: "14px 16px 10px" }}
            >
                <Space>
                    <Title level={5} style={{ margin: 0 }}>
                        Notifications
                    </Title>
                    {unreadCount > 0 && (
                        <Tag
                            color="blue"
                            style={{ borderRadius: 20, fontSize: 11, padding: "0 7px" }}
                        >
                            {unreadCount} new
                        </Tag>
                    )}
                </Space>

                {unreadCount > 0 && (
                    <Button
                        type="text"
                        size="small"
                        loading={markingAll}
                        icon={<CheckOutlined />}
                        onClick={handleMarkAllRead}
                        style={{ fontSize: 12, color: "#1677ff" }}
                    >
                        Mark all read
                    </Button>
                )}
            </Flex>

            <Divider style={{ margin: 0 }} />

            {/* List */}
            <div style={{ flex: 1, overflowY: "auto", maxHeight: 400 }}>
                {loading ? (
                    <Flex justify="center" style={{ padding: 32 }}>
                        <Spin />
                    </Flex>
                ) : notifications.length === 0 ? (
                    <Empty
                        image={Empty.PRESENTED_IMAGE_SIMPLE}
                        description="You're all caught up!"
                        style={{ padding: "32px 0" }}
                    />
                ) : (
                    notifications.map((n, i) => (
                        <React.Fragment key={n._id}>
                            <NotificationRow
                                n={n}
                                onRead={handleRead}
                                onDelete={handleDelete}
                            />
                            {i < notifications.length - 1 && (
                                <Divider style={{ margin: 0, borderColor: "#f0f0f0" }} />
                            )}
                        </React.Fragment>
                    ))
                )}
            </div>

            {/* Footer */}
            {notifications.length > 0 && onViewAll && (
                <>
                    <Divider style={{ margin: 0 }} />
                    <div style={{ padding: "10px 14px" }}>
                        <Button
                            type="link"
                            block
                            icon={<ArrowRightOutlined />}
                            onClick={() => { setOpen(false); onViewAll(); }}
                            style={{ color: "#1677ff", fontWeight: 500 }}
                        >
                            View all notifications
                        </Button>
                    </div>
                </>
            )}
        </div>
    );

    // ─── Render ───────────────────────────────────────────────────────────────

    return (
        <>
            {/* ── Callout toasts (up to 2 new notifications) ── */}
            <div
                style={{
                    position: "fixed",
                    bottom: 24,
                    right: 24,
                    zIndex: 1100,
                    display: "flex",
                    flexDirection: "column",
                    gap: 10,
                    pointerEvents: callouts.length ? "auto" : "none",
                }}
            >
                {callouts.map((n) => {
                    const cfg = typeConfig[n.type] ?? typeConfig.info;
                    return (
                        <div
                            key={n._id}
                            style={{
                                width: 320,
                                background: "#fff",
                                borderRadius: 12,
                                boxShadow: "0 6px 24px rgba(0,0,0,0.13)",
                                borderLeft: `4px solid ${cfg.color}`,
                                padding: "12px 14px",
                                display: "flex",
                                gap: 10,
                                animation: "slideInRight 0.35s ease",
                            }}
                        >
                            <Avatar
                                size={32}
                                icon={cfg.icon}
                                style={{ background: cfg.bg, border: `1px solid ${cfg.border}`, flexShrink: 0 }}
                            />
                            <div style={{ flex: 1, minWidth: 0 }}>
                                <Text strong style={{ fontSize: 13, display: "block" }}>
                                    {n.title}
                                </Text>
                                <Text type="secondary" style={{ fontSize: 12 }}>
                                    {n.message.length > 60 ? n.message.slice(0, 60) + "…" : n.message}
                                </Text>
                            </div>
                            <Button
                                type="text"
                                size="small"
                                icon={<CheckOutlined style={{ fontSize: 11 }} />}
                                onClick={() => {
                                    handleRead(n._id);
                                    setCallouts((prev) => prev.filter((c) => c._id !== n._id));
                                }}
                                style={{ alignSelf: "flex-start", padding: "0 4px", color: "#1677ff" }}
                            />
                        </div>
                    );
                })}
            </div>

            {/* ── Bell icon in header ── */}
            <Dropdown
                open={open}
                onOpenChange={(v) => {
                    setOpen(v);
                    if (v) fetchNotifications();
                }}
                dropdownRender={() => dropdownContent}
                trigger={["click"]}
                placement="bottomRight"
                arrow={{ pointAtCenter: true }}
            >
                <Badge
                    count={unreadCount}
                    size="small"
                    offset={[-2, 2]}
                    style={{ cursor: "pointer" }}
                >
                    <Button
                        type="text"
                        icon={
                            <BellOutlined
                                style={{
                                    fontSize: 20,
                                    color: unreadCount > 0 ? "#1677ff" : undefined,
                                }}
                            />
                        }
                        style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            borderRadius: 8,
                            background: unreadCount > 0 ? "#e6f4ff" : undefined,
                        }}
                    />
                </Badge>
            </Dropdown>

            {/* Callout animation keyframes */}
            <style>{`
        @keyframes slideInRight {
          from { opacity: 0; transform: translateX(60px); }
          to   { opacity: 1; transform: translateX(0); }
        }
      `}</style>
        </>
    );
}