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
    FilterOutlined,
    CalendarOutlined,
    EyeOutlined,
    EditOutlined,
    LinkOutlined,
    HistoryOutlined,
} from "@ant-design/icons";
import { useNavigate, useParams } from "react-router-dom";
import dayjs from "dayjs";

import { fetchTasks, fetchUserLogs } from "../../../Api/index";
import { requestHandler } from "../../../Utils/index";
import { useEmployeeStore } from "../../../Store/store";
import TaskFilterDrawer from "../../../Components/TaskFilterDrawer";
import { Timeline } from "antd";

const { Title, Text } = Typography;

type TaskStatus = "Pending" | "In Progress" | "Completed" | "Rejected" | string;
type TaskPriority = "Low" | "Medium" | "High" | "Critical" | string;

export type TaskFilters = {
    category: string[];
    assignTo: string[];
    priority: string[];
    status: string[];
};

type TaskItem = {
    _id: string;
    organizationID?: string;

    title?: string;
    description?: string;

    assignTo?: Array<{ _id?: string; name?: string; displayName?: string }>;

    createdBy?: any;

    priority?: TaskPriority;

    deadline?: { startDate?: string; endDate?: string };

    voiceNote?: string | null;

    sop?: { _id?: string; title?: string } | string | null;

    category?: string;

    status?: TaskStatus;

    aiReview?: boolean;
    aiStatus?: "Pending" | "Under Review" | "Passed" | "Rejected" | string | null;

    startTime?: string;
    endTime?: string;
    totalTimeSpent?: number; // seconds
    estimatedTime?: number; // seconds
    isNew?: boolean;

    createdAt?: string;
    updatedAt?: string;
};

const priorityTag = (p?: string) => {
    const x = (p || "").toLowerCase();
    if (x === "critical") return <Tag color="red">Critical</Tag>;
    if (x === "high") return <Tag color="volcano">High</Tag>;
    if (x === "medium") return <Tag color="gold">Medium</Tag>;
    if (x === "low") return <Tag color="green">Low</Tag>;
    return <Tag>{p || "-"}</Tag>;
};

const statusTag = (s?: string) => {
    const x = (s || "").toLowerCase();
    if (x === "completed") return <Tag color="green">Completed</Tag>;
    if (x === "pending") return <Tag>Pending</Tag>;
    if (x === "in progress" || x === "in-progress") return <Tag color="blue">In Progress</Tag>;
    if (x === "rejected") return <Tag color="red">Rejected</Tag>;
    return <Tag>{s || "-"}</Tag>;
};

const aiTag = (aiReview?: boolean, aiStatus?: string | null) => {
    if (!aiReview) return <Tag>Off</Tag>;
    const s = (aiStatus || "Pending").toLowerCase();
    if (s === "passed") return <Tag color="green">AI Passed</Tag>;
    if (s === "rejected") return <Tag color="red">AI Rejected</Tag>;
    if (s === "under review") return <Tag color="blue">AI Review</Tag>;
    return <Tag color="gold">AI Pending</Tag>;
};

const fmtDateTime = (d?: string) => (d ? dayjs(d).format("YYYY-MM-DD HH:mm") : "-");
const fmtDue = (d?: string) => (d ? dayjs(d).format("YYYY-MM-DD [at] h:mm A") : "-");

const secondsToHms = (sec?: number) => {
    const s = Number(sec || 0);
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const r = s % 60;
    if (!s) return "-";
    return `${h}h ${m}m ${r}s`;
};

export default function Task() {
    const navigate = useNavigate();
    const { orgId } = useParams();

    const { employees, fetchEmployees } = useEmployeeStore();
    const [loading, setLoading] = useState(false);

    const [tasks, setTasks] = useState<TaskItem[]>([]);
    const [totalPages, setTotalPages] = useState(1);
    const [currentPage, setCurrentPage] = useState(1);

    const [q, setQ] = useState("");
    const [activeCategory, setActiveCategory] = useState<string>("all");
    const [filterOpen, setFilterOpen] = useState(false);

    const [selectedFilters, setSelectedFilters] = useState<TaskFilters>({
        category: [],
        assignTo: [],
        priority: [],
        status: [],
    });

    // Drawer state
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [activeTask, setActiveTask] = useState<TaskItem | null>(null);
    const [taskLogs, setTaskLogs] = useState<any[]>([]);
    const [logsLoading, setLogsLoading] = useState(false);

    const pageSize = Number(import.meta.env.VITE_LIMIT || 10);

    useEffect(() => {
        fetchEmployees?.();
        loadTasks(1, q);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const hasAnyFilters = useMemo(
        () => Object.values(selectedFilters).some((arr) => (arr as any[]).length > 0),
        [selectedFilters]
    );

    const loadTasks = async (page = 1, search = "") => {
        setCurrentPage(page);

        const limit = pageSize;
        const filters = { search };

        requestHandler(
            () => fetchTasks({ page, limit, filters }) as any,
            setLoading,
            (data: any) => {
                setTasks(data?.tasks ?? data?.data?.tasks ?? []);
                setTotalPages(data?.totalPages ?? data?.data?.totalPages ?? 1);
            },
            (err) => message.error(err)
        );
    };

    const applyServerFilters = async (filters: TaskFilters, page = 1) => {
        setSelectedFilters(filters);
        setCurrentPage(page);

        const limit = pageSize;

        requestHandler(
            () => fetchTasks({ page, limit, filters }) as any,
            setLoading,
            (data: any) => {
                setTasks(data?.tasks ?? data?.data?.tasks ?? []);
                setTotalPages(data?.totalPages ?? data?.data?.totalPages ?? 1);
            },
            (err) => message.error(err)
        );
    };

    const clearFilters = () => {
        const cleared = { category: [], assignTo: [], priority: [], status: [] };
        setSelectedFilters(cleared);
        setActiveCategory("all");
        setFilterOpen(false);
        loadTasks(1, q);
    };

    // Client-side category + search
    const visibleTasks = useMemo(() => {
        let list = tasks;

        if (activeCategory !== "all") {
            list = list.filter((t) => (t.category || "").toLowerCase() === activeCategory.toLowerCase());
        }

        const query = q.trim().toLowerCase();
        if (query) {
            list = list.filter((t) => {
                const title = (t.title || "").toLowerCase();
                const desc = (t.description || "").toLowerCase();
                const cat = (t.category || "").toLowerCase();
                const assigned = (t.assignTo || []).some((a) =>
                    String(a?.displayName || a?.name || "").toLowerCase().includes(query)
                );
                return title.includes(query) || desc.includes(query) || cat.includes(query) || assigned;
            });
        }

        return list;
    }, [tasks, activeCategory, q]);

    const categories = useMemo(() => ["all", "Cleaning", "Kitchen", "Purchase", "Others"], []);

    const filterSections = useMemo(
        () => [
            { key: "category", label: "Category", options: ["Cleaning", "Kitchen", "Purchase", "Others"] },
            { key: "assignTo", label: "Assign To", dynamicOptions: employees || [] },
            { key: "priority", label: "Priority", options: ["Low", "Medium", "High", "Critical"] },
            { key: "status", label: "Status", options: ["Pending", "In Progress", "Completed", "Rejected"] },
        ],
        [employees]
    );

    const onPageChange = (page: number) => {
        if (hasAnyFilters) applyServerFilters(selectedFilters, page);
        else loadTasks(page, q);
    };

    const onSearch = () => {
        if (hasAnyFilters) applyServerFilters(selectedFilters, 1);
        else loadTasks(1, q);
    };

    const openDrawer = (task: TaskItem) => {
        setActiveTask(task);
        setDrawerOpen(true);
        loadTaskLogs(task._id);
    };

    const loadTaskLogs = async (taskId: string) => {
        requestHandler(
            () => fetchUserLogs({ module: "TASK", resourceID: taskId }) as any,
            setLogsLoading,
            (data: any) => {
                setTaskLogs(data?.logs || data?.data?.logs || []);
            },
            () => { }
        );
    };

    const columns: ColumnsType<TaskItem> = [
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
                        {r.isNew ? <Tag style={{ marginLeft: 8 }}>New</Tag> : null}
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
            title: "Assignee",
            key: "assignTo",
            width: 180,
            render: (_, r) => {
                const a = r.assignTo?.[0];
                return <Text>{a?.displayName || a?.name || "Unassigned"}</Text>;
            },
        },
        {
            title: "Priority",
            dataIndex: "priority",
            key: "priority",
            width: 120,
            render: (v) => priorityTag(v),
        },
        {
            title: "Status",
            dataIndex: "status",
            key: "status",
            width: 140,
            render: (v) => statusTag(v),
        },
        {
            title: "Due",
            key: "due",
            width: 200,
            render: (_, r) => (
                <Text type="secondary">
                    <CalendarOutlined /> {fmtDue(r.deadline?.endDate)}
                </Text>
            ),
        },
        {
            title: "AI",
            key: "ai",
            width: 140,
            render: (_, r) => aiTag(r.aiReview, r.aiStatus ?? null),
        },
        {
            title: "Actions",
            key: "actions",
            fixed: "right",
            width: 220,
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

                    <Tooltip title="Open full page">
                        <Button
                            size="small"
                            icon={<LinkOutlined />}
                            onClick={() => navigate(`/client/${orgId}/task/${r._id}`)}
                            style={{ borderRadius: 10 }}
                        />
                    </Tooltip>

                    <Tooltip title="Edit task">
                        <Button
                            size="small"
                            icon={<EditOutlined />}
                            onClick={() => navigate(`/client/${orgId}/task/${r._id}/edit`)}
                            style={{ borderRadius: 10 }}
                        />
                    </Tooltip>
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
                        <Title level={4} style={{ margin: 0 }}>
                            Task overview
                        </Title>
                        <Text type="secondary">Create, assign, and track daily operations.</Text>
                    </Space>

                    <Space wrap>
                        <Input
                            value={q}
                            onChange={(e) => setQ(e.target.value)}
                            onPressEnter={onSearch}
                            allowClear
                            prefix={<SearchOutlined />}
                            placeholder="Search title, description, assignee..."
                            style={{ width: 320 }}
                        />
                        <Button
                            icon={<FilterOutlined />}
                            onClick={() => setFilterOpen(true)}
                            style={{ borderRadius: 10 }}
                        >
                            Filters
                            {hasAnyFilters ? (
                                <Badge
                                    count={Object.values(selectedFilters).reduce((acc, arr) => acc + arr.length, 0)}
                                    style={{ marginLeft: 8 }}
                                />
                            ) : null}
                        </Button>
                        <Button
                            type="primary"
                            icon={<PlusOutlined />}
                            onClick={() => navigate(`/client/${orgId}/task/new`)}
                            style={{ borderRadius: 10 }}
                        >
                            Create task
                        </Button>
                    </Space>
                </Flex>

                <Divider style={{ margin: "12px 0" }} />

                <Flex justify="space-between" align="center" wrap="wrap" gap={12}>
                    <Segmented
                        value={activeCategory}
                        onChange={(v) => setActiveCategory(String(v))}
                        options={categories.map((c) => ({ label: c === "all" ? "All" : c, value: c }))}
                    />

                    <Space>
                        <Button onClick={onSearch} loading={loading} style={{ borderRadius: 10 }}>
                            Refresh
                        </Button>
                        {hasAnyFilters ? (
                            <Button danger onClick={clearFilters} style={{ borderRadius: 10 }}>
                                Clear filters
                            </Button>
                        ) : null}
                    </Space>
                </Flex>
            </Card>

            {/* Table */}
            <Card style={{ borderRadius: 16 }}>
                {loading ? (
                    <Space direction="vertical" style={{ width: "100%" }} size={12}>
                        <Skeleton active />
                        <Skeleton active />
                        <Skeleton active />
                    </Space>
                ) : visibleTasks.length === 0 ? (
                    <Empty description="No tasks found." image={Empty.PRESENTED_IMAGE_SIMPLE} />
                ) : (
                    <Table<TaskItem>
                        rowKey="_id"
                        columns={columns}
                        dataSource={visibleTasks}
                        pagination={false}
                        scroll={{ x: 1200 }}
                        onRow={(record) => ({
                            onDoubleClick: () => openDrawer(record),
                        })}
                    />
                )}

                <Divider style={{ margin: "16px 0" }} />

                <Flex justify="space-between" align="center" wrap="wrap" gap={12}>
                    <Text type="secondary">
                        Page {currentPage} of {totalPages}
                    </Text>

                    <Pagination
                        current={currentPage}
                        total={totalPages * pageSize}
                        pageSize={pageSize}
                        onChange={onPageChange}
                        showSizeChanger={false}
                    />
                </Flex>
            </Card>

            {/* Filter Drawer */}
            <TaskFilterDrawer
                open={filterOpen}
                onClose={() => setFilterOpen(false)}
                sections={filterSections}
                selected={selectedFilters}
                onApply={(filters) => applyServerFilters(filters as TaskFilters, 1)}
                onClear={clearFilters}
            />

            {/* View Drawer */}
            <Drawer
                open={drawerOpen}
                onClose={() => setDrawerOpen(false)}
                width={520}
                title={
                    <Space direction="vertical" size={2}>
                        <Text type="secondary" style={{ fontSize: 12 }}>
                            Task details
                        </Text>
                        <Text strong style={{ fontSize: 16 }}>
                            {activeTask?.title || "-"}
                        </Text>
                    </Space>
                }
                extra={
                    <Space>
                        <Button onClick={() => setDrawerOpen(false)} style={{ borderRadius: 10 }}>
                            Close
                        </Button>
                        {activeTask?._id ? (
                            <Button
                                type="primary"
                                icon={<LinkOutlined />}
                                style={{ borderRadius: 10 }}
                                onClick={() => navigate(`/client/${orgId}/task/${activeTask._id}/edit`)}
                            >
                                Edit Full
                            </Button>
                        ) : null}
                    </Space>
                }
            >
                {!activeTask ? (
                    <Empty description="No task selected" />
                ) : (
                    <Space direction="vertical" size={14} style={{ width: "100%" }}>
                        <Descriptions bordered size="small" column={1} styles={{ content: { background: "#fff" } }}>
                            <Descriptions.Item label="Task ID">
                                <Text code>{activeTask._id}</Text>
                            </Descriptions.Item>

                            <Descriptions.Item label="Category">
                                <Tag color="blue">{activeTask.category || "-"}</Tag>
                            </Descriptions.Item>

                            <Descriptions.Item label="Priority">{priorityTag(activeTask.priority)}</Descriptions.Item>

                            <Descriptions.Item label="Status">{statusTag(activeTask.status)}</Descriptions.Item>

                            <Descriptions.Item label="Assignee">
                                {activeTask.assignTo?.[0]?.displayName ||
                                    activeTask.assignTo?.[0]?.name ||
                                    "Unassigned"}
                            </Descriptions.Item>

                            <Descriptions.Item label="Deadline (start)">
                                {fmtDateTime(activeTask.deadline?.startDate)}
                            </Descriptions.Item>

                            <Descriptions.Item label="Deadline (end)">
                                {fmtDateTime(activeTask.deadline?.endDate)}
                            </Descriptions.Item>

                            <Descriptions.Item label="AI Review">
                                {aiTag(activeTask.aiReview, activeTask.aiStatus ?? null)}
                            </Descriptions.Item>

                            <Descriptions.Item label="Time Spent">
                                {secondsToHms(activeTask.totalTimeSpent)}
                            </Descriptions.Item>

                            <Descriptions.Item label="Estimated Time">
                                {secondsToHms(activeTask.estimatedTime)}
                            </Descriptions.Item>

                            <Descriptions.Item label="SOP">
                                {typeof activeTask.sop === "string"
                                    ? activeTask.sop
                                    : activeTask.sop?.title || activeTask.sop?._id || "-"}
                            </Descriptions.Item>

                            <Descriptions.Item label="Created">
                                {fmtDateTime(activeTask.createdAt)}
                            </Descriptions.Item>

                            <Descriptions.Item label="Updated">
                                {fmtDateTime(activeTask.updatedAt)}
                            </Descriptions.Item>
                        </Descriptions>

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
                                }}
                            >
                                {activeTask.description || "—"}
                            </div>
                        </div>

                        {activeTask.voiceNote ? (
                            <div>
                                <Text strong>Voice note</Text>
                                <div style={{ marginTop: 8 }}>
                                    <audio controls src={String(activeTask.voiceNote)} style={{ width: "100%" }} />
                                </div>
                            </div>
                        ) : null}

                        <Divider style={{ margin: "8px 0" }} />
                        <div>
                            <Flex align="center" gap={8} style={{ marginBottom: 12 }}>
                                <HistoryOutlined />
                                <Text strong>Activity History</Text>
                            </Flex>
                            {logsLoading ? (
                                <Skeleton active paragraph={{ rows: 2 }} />
                            ) : taskLogs.length === 0 ? (
                                <Text type="secondary" style={{ fontSize: 13, fontStyle: "italic" }}>
                                    No history records found for this task.
                                </Text>
                            ) : (
                                <Timeline
                                    mode="left"
                                    items={taskLogs.map((log) => ({
                                        label: dayjs(log.createdAt).format("MMM D, HH:mm"),
                                        children: (
                                            <div style={{ fontSize: 13 }}>
                                                <Text strong>{log.userID?.displayName || log.userID?.userName || "System"}</Text>{" "}
                                                <Text type="secondary">
                                                    {log.action.replace("TASK_", "").toLowerCase().replace("_", " ")}
                                                </Text>
                                                {log.details?.changes && Object.entries(log.details.changes).map(([field, change]: any) => (
                                                    <div key={field} style={{ marginTop: 2, fontSize: 11 }}>
                                                        <Text type="secondary" style={{ textTransform: "capitalize" }}>{field}: </Text>
                                                        <Tag color="default">{String(change.from || "none")}</Tag>
                                                        {" → "}
                                                        <Tag color="blue">{String(change.to || "none")}</Tag>
                                                    </div>
                                                ))}
                                                {log.details?.changedStatus && !log.details?.changes && (
                                                    <div style={{ marginTop: 2 }}>
                                                        <Tag color="default">{log.details.changedStatus.from}</Tag>
                                                        {" → "}
                                                        <Tag color="blue">{log.details.changedStatus.to}</Tag>
                                                    </div>
                                                )}
                                            </div>
                                        ),
                                    }))}
                                />
                            )}
                        </div>
                    </Space>
                )}
            </Drawer>
        </div>
    );
}