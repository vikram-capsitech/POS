import { useEffect, useMemo, useState } from "react";
import {
    Avatar,
    Badge,
    Button,
    Card,
    Col,
    DatePicker,
    Descriptions,
    Divider,
    Drawer,
    Empty,
    Flex,
    Form,
    Input,
    InputNumber,
    Modal,
    Popconfirm,
    Row,
    Select,
    Skeleton,
    Space,
    Statistic,
    Table,
    Tag,
    Tooltip,
    Typography,
    message,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import {
    DeleteOutlined,
    EditOutlined,
    EyeOutlined,
    GiftOutlined,
    PlusOutlined,
    ReloadOutlined,
    SearchOutlined,
    TeamOutlined,
    UserOutlined,
    FilterOutlined,
    CheckCircleOutlined,
    CloseCircleOutlined,
    CalendarOutlined,
    TrophyOutlined,
} from "@ant-design/icons";
import dayjs, { Dayjs } from "dayjs";
import {
    voucherCreate,
    voucherDelete,
    voucherList,
    voucherUpdate,
    hrmListEmployees as fetchEmployees,
} from "../../../Api/index";
import { requestHandler } from "../../../Utils/index";
import { Employee } from "../../../Interfaces/Employee";

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;
const { TextArea } = Input;

// ─── Types ────────────────────────────────────────────────────────────────────

type AssignType = "ALL" | "SPECIFIC";
type VoucherStatus = "Active" | "Inactive";

type VoucherTimeline = {
    startDate: string;
    endDate: string;
};

type VoucherRecord = {
    _id: string;
    title: string;
    description?: string;
    coins: number;
    assignType: AssignType;
    assignTo: { _id: string; name: string }[];
    status: VoucherStatus;
    timeline: VoucherTimeline;
    createdBy?: { _id: string; name: string; role?: string };
    createdAt: string;
    updatedAt: string;
};

type FormValues = {
    title: string;
    description?: string;
    coins: number;
    assignType: AssignType;
    assignTo?: string[];
    status: VoucherStatus;
    timeline: [Dayjs, Dayjs];
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

const isExpired = (v: VoucherRecord) =>
    dayjs(v.timeline.endDate).isBefore(dayjs());

const isLive = (v: VoucherRecord) =>
    v.status === "Active" &&
    dayjs(v.timeline.startDate).isBefore(dayjs()) &&
    dayjs(v.timeline.endDate).isAfter(dayjs());

const fmtDate = (d?: string) => (d ? dayjs(d).format("DD MMM YYYY") : "-");

const statusBadge = (v: VoucherRecord) => {
    if (v.status === "Inactive")
        return <Badge status="default" text={<Text type="secondary">Inactive</Text>} />;
    if (isExpired(v))
        return <Badge status="error" text={<Text type="danger">Expired</Text>} />;
    if (isLive(v))
        return <Badge status="success" text={<Text style={{ color: "#52c41a" }}>Live</Text>} />;
    return <Badge status="warning" text={<Text style={{ color: "#faad14" }}>Scheduled</Text>} />;
};

const coinTag = (coins: number) => (
    <Tag
        icon={<TrophyOutlined />}
        color="gold"
        style={{ fontWeight: 600, fontSize: 13, padding: "2px 10px", borderRadius: 20 }}
    >
        {coins} coins
    </Tag>
);

// ─── Main Component ───────────────────────────────────────────────────────────

export default function VoucherManagement() {
    const [vouchers, setVouchers] = useState<VoucherRecord[]>([]);
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [loading, setLoading] = useState(false);
    const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });

    // Filters
    const [filterStatus, setFilterStatus] = useState<string | undefined>();
    const [filterMonthYear, setFilterMonthYear] = useState<string | undefined>();
    const [search, setSearch] = useState("");

    // Create / Edit Modal
    const [modalOpen, setModalOpen] = useState(false);
    const [editingVoucher, setEditingVoucher] = useState<VoucherRecord | null>(null);
    const [form] = Form.useForm<FormValues>();
    const assignTypeWatch = Form.useWatch("assignType", form);
    const [submitting, setSubmitting] = useState(false);

    // View Drawer
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [activeVoucher, setActiveVoucher] = useState<VoucherRecord | null>(null);

    // ─── Load data ──────────────────────────────────────────────────────────

    const loadVouchers = (page = 1) => {
        const params: Record<string, any> = {
            page,
            limit: pagination.pageSize,
        };
        if (filterStatus) params.status = filterStatus;
        if (filterMonthYear) params.monthYear = filterMonthYear;

        requestHandler(
            () => voucherList(params) as any,
            setLoading,
            (data: any) => {
                setVouchers(data?.data ?? []);
                setPagination((p) => ({
                    ...p,
                    current: page,
                    total: data?.pagination?.total ?? 0,
                }));
            },
            (err) => message.error(err)
        );
    };

    // Load employees for SPECIFIC assign type dropdown
    const loadEmployees = () => {
        requestHandler(
            () => fetchEmployees() as any,
            setLoading,
            (data: any) => {
                const list = data?.data?.data ?? [];
                setEmployees(Array.isArray(list) ? list : []);
            },
            (err: string) => message.error(err)
        );
    };

    useEffect(() => {
        loadVouchers();
        loadEmployees();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [filterStatus, filterMonthYear]);

    // ─── Stats ───────────────────────────────────────────────────────────────

    const stats = useMemo(() => {
        const active = vouchers.filter((v) => v.status === "Active").length;
        const live = vouchers.filter(isLive).length;
        const expired = vouchers.filter(isExpired).length;
        const totalCoins = vouchers.reduce((a, v) => a + v.coins, 0);
        return { active, live, expired, totalCoins };
    }, [vouchers]);

    // ─── Filtered table data ─────────────────────────────────────────────────

    const visibleData = useMemo(() => {
        if (!search.trim()) return vouchers;
        const q = search.toLowerCase();
        return vouchers.filter(
            (v) =>
                v.title.toLowerCase().includes(q) ||
                v.description?.toLowerCase().includes(q)
        );
    }, [vouchers, search]);

    // ─── Open modal ──────────────────────────────────────────────────────────

    const openCreate = () => {
        setEditingVoucher(null);
        form.resetFields();
        form.setFieldsValue({ assignType: "ALL", status: "Active" });
        setModalOpen(true);
    };

    const openEdit = (v: VoucherRecord) => {
        setEditingVoucher(v);
        form.setFieldsValue({
            title: v.title,
            description: v.description,
            coins: v.coins,
            assignType: v.assignType,
            assignTo: v.assignTo?.map((e) => e._id),
            status: v.status,
            timeline: [dayjs(v.timeline.startDate), dayjs(v.timeline.endDate)],
        });
        setModalOpen(true);
    };

    // ─── Submit ──────────────────────────────────────────────────────────────

    const handleSubmit = async () => {
        try {
            const values = await form.validateFields();
            const payload = {
                title: values.title,
                description: values.description,
                coins: values.coins,
                assignType: values.assignType,
                assignTo: values.assignType === "SPECIFIC" ? values.assignTo : [],
                status: values.status,
                timeline: {
                    startDate: values.timeline[0].toISOString(),
                    endDate: values.timeline[1].toISOString(),
                },
            };

            const apiCall = editingVoucher
                ? () => voucherUpdate(editingVoucher._id, payload as any) as any
                : () => voucherCreate(payload as any) as any;

            requestHandler(
                apiCall,
                setSubmitting,
                () => {
                    message.success(
                        editingVoucher
                            ? "Voucher updated successfully"
                            : "Voucher created successfully"
                    );
                    setModalOpen(false);
                    loadVouchers(pagination.current);
                },
                (err) => message.error(err)
            );
        } catch {
            // validation error — antd handles display
        }
    };

    // ─── Delete ──────────────────────────────────────────────────────────────

    const handleDelete = (id: string) => {
        requestHandler(
            () => voucherDelete(id) as any,
            null,
            () => {
                message.success("Voucher deleted");
                loadVouchers(pagination.current);
            },
            (err) => message.error(err)
        );
    };

    // ─── View drawer ─────────────────────────────────────────────────────────

    const openView = (v: VoucherRecord) => {
        setActiveVoucher(v);
        setDrawerOpen(true);
    };

    // ─── Columns ─────────────────────────────────────────────────────────────

    const columns: ColumnsType<VoucherRecord> = [
        {
            title: "Voucher",
            key: "title",
            width: 240,
            render: (_, r) => (
                <Space>
                    <Avatar
                        size={38}
                        icon={<GiftOutlined />}
                        style={{
                            background: isLive(r)
                                ? "#f6ffed"
                                : r.status === "Inactive"
                                    ? "#f5f5f5"
                                    : "#fffbe6",
                            color: isLive(r)
                                ? "#52c41a"
                                : r.status === "Inactive"
                                    ? "#8c8c8c"
                                    : "#faad14",
                            border: `1.5px solid ${isLive(r) ? "#b7eb8f" : r.status === "Inactive" ? "#d9d9d9" : "#ffe58f"}`,
                            flexShrink: 0,
                        }}
                    />
                    <Space direction="vertical" size={0}>
                        <Text strong style={{ fontSize: 14 }}>{r.title}</Text>
                        {r.description && (
                            <Text type="secondary" style={{ fontSize: 12 }} ellipsis={{ tooltip: r.description }}>
                                {r.description.length > 40
                                    ? r.description.slice(0, 40) + "…"
                                    : r.description}
                            </Text>
                        )}
                    </Space>
                </Space>
            ),
        },
        {
            title: "Coins",
            dataIndex: "coins",
            key: "coins",
            width: 130,
            render: (v) => coinTag(v),
            sorter: (a, b) => a.coins - b.coins,
        },
        {
            title: "Assign",
            key: "assign",
            width: 120,
            render: (_, r) =>
                r.assignType === "ALL" ? (
                    <Tag icon={<TeamOutlined />} color="blue">All Employees</Tag>
                ) : (
                    <Tooltip
                        title={
                            r.assignTo?.length
                                ? r.assignTo.map((e) => e.name).join(", ")
                                : "No employees assigned"
                        }
                    >
                        <Tag icon={<UserOutlined />} color="purple">
                            {r.assignTo?.length ?? 0} Specific
                        </Tag>
                    </Tooltip>
                ),
        },
        {
            title: "Timeline",
            key: "timeline",
            width: 200,
            render: (_, r) => (
                <Space direction="vertical" size={0}>
                    <Text style={{ fontSize: 12 }}>
                        <CalendarOutlined style={{ marginRight: 4, color: "#52c41a" }} />
                        {fmtDate(r.timeline.startDate)}
                    </Text>
                    <Text type="secondary" style={{ fontSize: 12 }}>
                        → {fmtDate(r.timeline.endDate)}
                    </Text>
                </Space>
            ),
        },
        {
            title: "Status",
            key: "status",
            width: 120,
            render: (_, r) => statusBadge(r),
            filters: [
                { text: "Live", value: "live" },
                { text: "Scheduled", value: "scheduled" },
                { text: "Expired", value: "expired" },
                { text: "Inactive", value: "inactive" },
            ],
        },
        {
            title: "Created",
            key: "created",
            width: 130,
            render: (_, r) => (
                <Space direction="vertical" size={0}>
                    <Text style={{ fontSize: 12 }}>{fmtDate(r.createdAt)}</Text>
                    {r.createdBy?.name && (
                        <Text type="secondary" style={{ fontSize: 11 }}>
                            by {r.createdBy.name}
                        </Text>
                    )}
                </Space>
            ),
        },
        {
            title: "Actions",
            key: "actions",
            fixed: "right",
            width: 120,
            render: (_, r) => (
                <Space>
                    <Tooltip title="View">
                        <Button
                            size="small"
                            icon={<EyeOutlined />}
                            onClick={() => openView(r)}
                            style={{ borderRadius: 8 }}
                        />
                    </Tooltip>
                    <Tooltip title="Edit">
                        <Button
                            size="small"
                            icon={<EditOutlined />}
                            onClick={() => openEdit(r)}
                            style={{ borderRadius: 8 }}
                        />
                    </Tooltip>
                    <Popconfirm
                        title="Delete this voucher?"
                        description="This action cannot be undone."
                        onConfirm={() => handleDelete(r._id)}
                        okText="Delete"
                        okButtonProps={{ danger: true }}
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
            ),
        },
    ];

    // ─── Render ───────────────────────────────────────────────────────────────

    return (
        <div style={{ padding: 16 }}>

            {/* ── Header ── */}
            <Card style={{ borderRadius: 16, marginBottom: 12 }}>
                <Flex justify="space-between" align="center" wrap="wrap" gap={12}>
                    <Space direction="vertical" size={2}>
                        <Space>
                            <GiftOutlined style={{ fontSize: 20, color: "#722ed1" }} />
                            <Title level={4} style={{ margin: 0 }}>Voucher Management</Title>
                        </Space>
                        <Text type="secondary">
                            Create and manage reward vouchers redeemable by employees using their coins.
                        </Text>
                    </Space>

                    <Space wrap>
                        <Select
                            allowClear
                            placeholder="Filter by status"
                            value={filterStatus}
                            onChange={setFilterStatus}
                            style={{ width: 160 }}
                            suffixIcon={<FilterOutlined />}
                            options={[
                                { value: "Active", label: "Active" },
                                { value: "Inactive", label: "Inactive" },
                            ]}
                        />
                        <DatePicker
                            picker="month"
                            placeholder="Filter by month"
                            onChange={(d) =>
                                setFilterMonthYear(d ? d.format("YYYY-MM") : undefined)
                            }
                            style={{ width: 160 }}
                        />
                        <Button
                            icon={<ReloadOutlined />}
                            onClick={() => loadVouchers(1)}
                            loading={loading}
                            style={{ borderRadius: 10 }}
                        >
                            Refresh
                        </Button>
                        <Button
                            type="primary"
                            icon={<PlusOutlined />}
                            onClick={openCreate}
                            style={{
                                borderRadius: 10,
                                background: "#722ed1",
                                borderColor: "#722ed1",
                            }}
                        >
                            Create Voucher
                        </Button>
                    </Space>
                </Flex>
            </Card>

            {/* ── Stats ── */}
            <Row gutter={[12, 12]} style={{ marginBottom: 12 }}>
                {[
                    {
                        label: "Total Vouchers",
                        value: vouchers.length,
                        color: "#722ed1",
                        bg: "#f9f0ff",
                        border: "#d3adf7",
                    },
                    {
                        label: "Live Now",
                        value: stats.live,
                        color: "#52c41a",
                        bg: "#f6ffed",
                        border: "#b7eb8f",
                    },
                    {
                        label: "Inactive / Expired",
                        value: stats.expired + (vouchers.length - stats.active),
                        color: "#ff4d4f",
                        bg: "#fff2f0",
                        border: "#ffa39e",
                    },
                    {
                        label: "Total Coins Pool",
                        value: stats.totalCoins,
                        color: "#faad14",
                        bg: "#fffbe6",
                        border: "#ffe58f",
                        prefix: "🏆",
                    },
                ].map((s) => (
                    <Col xs={12} sm={6} key={s.label}>
                        <Card
                            style={{
                                borderRadius: 14,
                                border: `1px solid ${s.border}30`,
                                background: s.bg,
                            }}
                            bodyStyle={{ padding: "16px 20px" }}
                        >
                            <Statistic
                                title={<Text style={{ fontSize: 12 }}>{s.label}</Text>}
                                value={s.value}
                                prefix={s.prefix}
                                valueStyle={{ color: s.color, fontSize: 22 }}
                            />
                        </Card>
                    </Col>
                ))}
            </Row>

            {/* ── Table ── */}
            <Card style={{ borderRadius: 16 }}>
                <Flex
                    justify="space-between"
                    align="center"
                    wrap="wrap"
                    gap={12}
                    style={{ marginBottom: 14 }}
                >
                    <Text strong style={{ fontSize: 15 }}>All Vouchers</Text>
                    <Input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        allowClear
                        prefix={<SearchOutlined />}
                        placeholder="Search by title or description..."
                        style={{ width: 280 }}
                    />
                </Flex>

                {loading ? (
                    <Space direction="vertical" style={{ width: "100%" }} size={12}>
                        <Skeleton active />
                        <Skeleton active />
                        <Skeleton active />
                    </Space>
                ) : visibleData.length === 0 ? (
                    <Empty
                        image={Empty.PRESENTED_IMAGE_SIMPLE}
                        description="No vouchers found. Create your first voucher!"
                    >
                        <Button
                            type="primary"
                            icon={<PlusOutlined />}
                            onClick={openCreate}
                            style={{ background: "#722ed1", borderColor: "#722ed1" }}
                        >
                            Create Voucher
                        </Button>
                    </Empty>
                ) : (
                    <Table<VoucherRecord>
                        rowKey="_id"
                        columns={columns}
                        dataSource={visibleData}
                        scroll={{ x: 1100 }}
                        pagination={{
                            current: pagination.current,
                            pageSize: pagination.pageSize,
                            total: pagination.total,
                            showSizeChanger: false,
                            showTotal: (total) => `${total} vouchers`,
                            onChange: loadVouchers,
                        }}
                        onRow={(r) => ({
                            onDoubleClick: () => openView(r),
                            style: { cursor: "pointer" },
                        })}
                    />
                )}
            </Card>

            {/* ── Create / Edit Modal ── */}
            <Modal
                open={modalOpen}
                onCancel={() => {
                    setModalOpen(false);
                    form.resetFields();
                }}
                onOk={handleSubmit}
                confirmLoading={submitting}
                okText={editingVoucher ? "Save Changes" : "Create Voucher"}
                okButtonProps={{
                    style: { background: "#722ed1", borderColor: "#722ed1" },
                }}
                cancelText="Cancel"
                width={580}
                title={
                    <Space>
                        <GiftOutlined style={{ color: "#722ed1" }} />
                        <Text strong style={{ fontSize: 16 }}>
                            {editingVoucher ? "Edit Voucher" : "Create New Voucher"}
                        </Text>
                    </Space>
                }
                destroyOnClose
            >
                <Divider style={{ margin: "12px 0 20px" }} />
                <Form form={form} layout="vertical" requiredMark="optional">
                    {/* Title */}
                    <Form.Item
                        name="title"
                        label="Voucher Title"
                        rules={[{ required: true, message: "Title is required" }]}
                    >
                        <Input
                            placeholder="e.g. Free Lunch Voucher, Coffee on Us"
                            prefix={<GiftOutlined style={{ color: "#722ed1" }} />}
                        />
                    </Form.Item>

                    {/* Description */}
                    <Form.Item name="description" label="Description">
                        <TextArea
                            rows={2}
                            placeholder="Optional — describe what this voucher offers"
                            showCount
                            maxLength={200}
                        />
                    </Form.Item>

                    {/* Coins + Status row */}
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item
                                name="coins"
                                label="Coins Required"
                                rules={[
                                    { required: true, message: "Coins value is required" },
                                    { type: "number", min: 1, message: "Must be at least 1" },
                                ]}
                            >
                                <InputNumber
                                    min={1}
                                    style={{ width: "100%" }}
                                    prefix={<TrophyOutlined style={{ color: "#faad14" }} />}
                                    placeholder="e.g. 100"
                                />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                name="status"
                                label="Status"
                                rules={[{ required: true }]}
                            >
                                <Select
                                    options={[
                                        {
                                            value: "Active",
                                            label: (
                                                <Space>
                                                    <CheckCircleOutlined style={{ color: "#52c41a" }} />
                                                    Active
                                                </Space>
                                            ),
                                        },
                                        {
                                            value: "Inactive",
                                            label: (
                                                <Space>
                                                    <CloseCircleOutlined style={{ color: "#8c8c8c" }} />
                                                    Inactive
                                                </Space>
                                            ),
                                        },
                                    ]}
                                />
                            </Form.Item>
                        </Col>
                    </Row>

                    {/* Timeline */}
                    <Form.Item
                        name="timeline"
                        label="Active Timeline"
                        rules={[{ required: true, message: "Start and end date are required" }]}
                    >
                        <RangePicker
                            style={{ width: "100%" }}
                            showTime={{ format: "HH:mm" }}
                            format="DD MMM YYYY HH:mm"
                            placeholder={["Start Date", "End Date"]}
                            disabledDate={(d) => d && d.isBefore(dayjs().startOf("day"))}
                        />
                    </Form.Item>

                    {/* Assign Type */}
                    <Form.Item
                        name="assignType"
                        label="Assign To"
                        rules={[{ required: true }]}
                    >
                        <Select
                            options={[
                                {
                                    value: "ALL",
                                    label: (
                                        <Space>
                                            <TeamOutlined style={{ color: "#1677ff" }} />
                                            All Employees
                                        </Space>
                                    ),
                                },
                                {
                                    value: "SPECIFIC",
                                    label: (
                                        <Space>
                                            <UserOutlined style={{ color: "#722ed1" }} />
                                            Specific Employees
                                        </Space>
                                    ),
                                },
                            ]}
                        />
                    </Form.Item>

                    {/* Specific employees — only shown when SPECIFIC */}
                    {assignTypeWatch === "SPECIFIC" && (
                        <Form.Item
                            name="assignTo"
                            label="Select Employees"
                            rules={[
                                {
                                    required: true,
                                    message: "Please select at least one employee",
                                },
                            ]}
                        >
                            <Select
                                mode="multiple"
                                placeholder="Search and select employees..."
                                showSearch
                                optionFilterProp="label"
                                options={(employees || [])
                                    .filter((e) => e?.profile?.jobRole === "employee" || !e?.profile?.jobRole)
                                    .map((e) => ({
                                        value: e._id,
                                        label: e.displayName || e.userName,
                                    }))}
                                notFoundContent={
                                    <Empty
                                        image={Empty.PRESENTED_IMAGE_SIMPLE}
                                        description="No employees found"
                                    />
                                }
                            />
                        </Form.Item>
                    )}
                </Form>
            </Modal>

            {/* ── View Drawer ── */}
            <Drawer
                open={drawerOpen}
                onClose={() => setDrawerOpen(false)}
                width={480}
                title={
                    <Space>
                        <GiftOutlined style={{ color: "#722ed1" }} />
                        <Space direction="vertical" size={0}>
                            <Text strong style={{ fontSize: 15 }}>
                                {activeVoucher?.title}
                            </Text>
                            <Text type="secondary" style={{ fontSize: 12 }}>
                                Voucher Details
                            </Text>
                        </Space>
                    </Space>
                }
                extra={
                    activeVoucher && (
                        <Button
                            icon={<EditOutlined />}
                            size="small"
                            onClick={() => {
                                setDrawerOpen(false);
                                openEdit(activeVoucher);
                            }}
                        >
                            Edit
                        </Button>
                    )
                }
            >
                {!activeVoucher ? (
                    <Empty description="No voucher selected" />
                ) : (
                    <Space direction="vertical" size={20} style={{ width: "100%" }}>
                        {/* Status & coins hero */}
                        <Card
                            style={{
                                borderRadius: 14,
                                background: "linear-gradient(135deg, #f9f0ff 0%, #efdbff 100%)",
                                border: "1px solid #d3adf7",
                            }}
                            bodyStyle={{ padding: 20 }}
                        >
                            <Flex justify="space-between" align="center">
                                <Space direction="vertical" size={4}>
                                    <Text strong style={{ fontSize: 20 }}>
                                        {activeVoucher.title}
                                    </Text>
                                    {activeVoucher.description && (
                                        <Text type="secondary">{activeVoucher.description}</Text>
                                    )}
                                    <div style={{ marginTop: 6 }}>{statusBadge(activeVoucher)}</div>
                                </Space>
                                <div style={{ textAlign: "center" }}>
                                    <TrophyOutlined
                                        style={{ fontSize: 32, color: "#faad14", display: "block" }}
                                    />
                                    <Text strong style={{ fontSize: 22, color: "#722ed1" }}>
                                        {activeVoucher.coins}
                                    </Text>
                                    <br />
                                    <Text type="secondary" style={{ fontSize: 11 }}>
                                        coins
                                    </Text>
                                </div>
                            </Flex>
                        </Card>

                        <Descriptions
                            bordered
                            size="small"
                            column={1}
                            styles={{ content: { background: "#fff" } }}
                        >
                            <Descriptions.Item label="Assign Type">
                                {activeVoucher.assignType === "ALL" ? (
                                    <Tag icon={<TeamOutlined />} color="blue">
                                        All Employees
                                    </Tag>
                                ) : (
                                    <Tag icon={<UserOutlined />} color="purple">
                                        Specific Employees
                                    </Tag>
                                )}
                            </Descriptions.Item>

                            {activeVoucher.assignType === "SPECIFIC" && (
                                <Descriptions.Item label="Assigned To">
                                    {activeVoucher.assignTo?.length ? (
                                        <Space wrap>
                                            {activeVoucher.assignTo.map((e) => (
                                                <Tag key={e._id}>{e.name}</Tag>
                                            ))}
                                        </Space>
                                    ) : (
                                        <Text type="secondary">—</Text>
                                    )}
                                </Descriptions.Item>
                            )}

                            <Descriptions.Item label="Start Date">
                                {fmtDate(activeVoucher.timeline.startDate)}
                            </Descriptions.Item>

                            <Descriptions.Item label="End Date">
                                <Text
                                    style={{
                                        color: isExpired(activeVoucher) ? "#ff4d4f" : undefined,
                                    }}
                                >
                                    {fmtDate(activeVoucher.timeline.endDate)}
                                    {isExpired(activeVoucher) && (
                                        <Text type="danger"> (Expired)</Text>
                                    )}
                                </Text>
                            </Descriptions.Item>

                            <Descriptions.Item label="Status">
                                {activeVoucher.status === "Active" ? (
                                    <Tag color="green" icon={<CheckCircleOutlined />}>
                                        Active
                                    </Tag>
                                ) : (
                                    <Tag icon={<CloseCircleOutlined />}>Inactive</Tag>
                                )}
                            </Descriptions.Item>

                            <Descriptions.Item label="Created By">
                                {activeVoucher.createdBy?.name ?? "—"}
                            </Descriptions.Item>

                            <Descriptions.Item label="Created On">
                                {fmtDate(activeVoucher.createdAt)}
                            </Descriptions.Item>

                            <Descriptions.Item label="Last Updated">
                                {fmtDate(activeVoucher.updatedAt)}
                            </Descriptions.Item>
                        </Descriptions>

                        <Flex gap={10}>
                            <Button
                                block
                                icon={<EditOutlined />}
                                onClick={() => {
                                    setDrawerOpen(false);
                                    openEdit(activeVoucher);
                                }}
                            >
                                Edit Voucher
                            </Button>
                            <Popconfirm
                                title="Delete this voucher?"
                                onConfirm={() => {
                                    handleDelete(activeVoucher._id);
                                    setDrawerOpen(false);
                                }}
                                okText="Delete"
                                okButtonProps={{ danger: true }}
                            >
                                <Button block danger icon={<DeleteOutlined />}>
                                    Delete
                                </Button>
                            </Popconfirm>
                        </Flex>
                    </Space>
                )}
            </Drawer>
        </div>
    );
}