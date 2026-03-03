import React, { useEffect, useState, useCallback, useMemo } from "react";
import {
    Card, Table, Tag, Button, Modal, Form, Select, DatePicker, Space,
    Typography, Avatar, App, Spin, Empty, Popconfirm, Badge, Statistic,
    Row, Col, Tooltip, Tabs, Calendar, Alert, TimePicker, Divider,
    Progress, Drawer, List, Timeline, Switch,
} from "antd";
import type { TableColumnsType } from "antd";
import type { Dayjs } from "dayjs";
import {
    UserOutlined, CheckCircleOutlined, ClockCircleOutlined,
    LogoutOutlined, LoginOutlined, PlusOutlined, DeleteOutlined,
    CalendarOutlined, TeamOutlined, AlertOutlined, InfoCircleOutlined,
    ReloadOutlined, FilterOutlined, DownloadOutlined,
} from "@ant-design/icons";
import {
    getAttendanceDaily, getAttendanceMonthly, attendanceManagerCheckIn,
    attendanceManagerCheckOut, deleteAttendanceRecord, hrmListEmployees,
} from "../../../Api";
import { useAuthStore } from "../../../Store/store";
import dayjs from "dayjs";
import duration from "dayjs/plugin/duration";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(duration);
dayjs.extend(relativeTime);

const { Title, Text } = Typography;

// ─── Types ────────────────────────────────────────────────────────────────────
type BreakRecord = { _id: string; breakStart: string; breakEnd: string | null; duration: number };
type AttendanceRecord = {
    _id: string;
    userID: { _id: string; displayName: string; profilePhoto?: string };
    date: string;
    checkIn: string | null;
    checkOut: string | null;
    breaks: BreakRecord[];
    hoursWorked: number;
    overtime: number;
    status: "On time" | "Late" | "Early" | "Absent" | "Authorized leave" | "Leave";
    dressCheck: boolean;
    dressReason: string;
};
type Employee = { _id: string; displayName: string; profilePhoto?: string };

// ─── Constants ────────────────────────────────────────────────────────────────
const STATUS_COLOR: Record<string, string> = {
    "On time": "green",
    "Late": "orange",
    "Early": "blue",
    "Absent": "red",
    "Authorized leave": "purple",
    "Leave": "cyan",
};

const STATUS_OPTIONS = [
    "On time", "Late", "Early", "Absent", "Authorized leave", "Leave",
];

function formatTime(d?: string | null) {
    if (!d) return "—";
    return dayjs(d).format("hh:mm A");
}

function calcHours(checkIn?: string | null, checkOut?: string | null) {
    if (!checkIn || !checkOut) return null;
    const diff = dayjs(checkOut).diff(dayjs(checkIn), "minute");
    const h = Math.floor(diff / 60);
    const m = diff % 60;
    return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

function totalBreakTime(breaks: BreakRecord[]) {
    const mins = breaks.reduce((s, b) => s + (b.duration || 0), 0);
    if (!mins) return "—";
    return `${Math.floor(mins / 60)}h ${mins % 60}m`;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function StatusDot({ status }: { status: string }) {
    const colorMap: Record<string, string> = {
        "On time": "#22c55e",
        "Late": "#f97316",
        "Early": "#3b82f6",
        "Absent": "#ef4444",
        "Authorized leave": "#a855f7",
        "Leave": "#06b6d4",
    };
    return (
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: colorMap[status] || "#94a3b8", flexShrink: 0 }} />
            <Tag color={STATUS_COLOR[status] || "default"} style={{ borderRadius: 5, margin: 0 }}>{status}</Tag>
        </div>
    );
}

// ─── Main Component ────────────────────────────────────────────────────────────
export default function AttendancePage() {
    const { message } = App.useApp();
    const session = useAuthStore((s) => s.session);
    const isAdmin = session.role === "admin";

    // State
    const [selectedDate, setSelectedDate] = useState<Dayjs>(dayjs());
    const [dailyRecords, setDailyRecords] = useState<AttendanceRecord[]>([]);
    const [monthlyRecords, setMonthlyRecords] = useState<AttendanceRecord[]>([]);
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [loading, setLoading] = useState(false);
    const [monthLoading, setMonthLoading] = useState(false);
    const [activeTab, setActiveTab] = useState("daily");

    // Modal state
    const [checkInModal, setCheckInModal] = useState(false);
    const [checkOutModal, setCheckOutModal] = useState(false);
    const [selectedRecord, setSelectedRecord] = useState<AttendanceRecord | null>(null);
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [saving, setSaving] = useState(false);
    const [form] = Form.useForm();

    // Month picker for monthly view
    const [monthView, setMonthView] = useState<Dayjs>(dayjs());
    const [selectedEmployee, setSelectedEmployee] = useState<string | undefined>();

    // Load daily attendance
    const loadDaily = useCallback(async (date: Dayjs) => {
        setLoading(true);
        try {
            const res: any = await getAttendanceDaily({ date: date.format("YYYY-MM-DD") });
            const data = res?.data?.data?.data ?? res?.data?.data ?? [];
            setDailyRecords(Array.isArray(data) ? data : []);
        } catch {
            message.error("Failed to load attendance");
        } finally {
            setLoading(false);
        }
    }, [message]);

    // Load monthly attendance
    const loadMonthly = useCallback(async (m: Dayjs, empId?: string) => {
        setMonthLoading(true);
        try {
            const res: any = await getAttendanceMonthly({
                month: m.month(),
                year: m.year(),
                ...(empId ? { employeeId: empId } : {}),
            });
            const data = res?.data?.data?.data ?? res?.data?.data ?? [];
            setMonthlyRecords(Array.isArray(data) ? data : []);
        } catch {
            message.error("Failed to load monthly attendance");
        } finally {
            setMonthLoading(false);
        }
    }, [message]);

    // Load employees for dropdowns
    const loadEmployees = useCallback(async () => {
        try {
            const res: any = await hrmListEmployees({ limit: 200 });
            const data = res?.data?.data?.data ?? res?.data?.data ?? [];
            setEmployees(Array.isArray(data) ? data : []);
        } catch { /* silent */ }
    }, []);

    useEffect(() => {
        loadDaily(selectedDate);
        loadEmployees();
    }, [loadDaily, loadEmployees, selectedDate]);

    useEffect(() => {
        if (activeTab === "monthly") loadMonthly(monthView, selectedEmployee);
    }, [activeTab, monthView, selectedEmployee, loadMonthly]);

    // ── Stats ──────────────────────────────────────────────────────────────────
    const stats = useMemo(() => {
        const present = dailyRecords.filter(r => r.checkIn && r.status !== "Absent").length;
        const absent = dailyRecords.filter(r => r.status === "Absent").length;
        const late = dailyRecords.filter(r => r.status === "Late").length;
        const onLeave = dailyRecords.filter(r => r.status === "Leave" || r.status === "Authorized leave").length;
        const checkedOut = dailyRecords.filter(r => r.checkOut).length;
        const stillWorking = dailyRecords.filter(r => r.checkIn && !r.checkOut).length;
        return { present, absent, late, onLeave, checkedOut, stillWorking, total: dailyRecords.length };
    }, [dailyRecords]);

    // ── Actions ────────────────────────────────────────────────────────────────
    const handleManagerCheckIn = async (values: any) => {
        setSaving(true);
        try {
            await attendanceManagerCheckIn({
                employeeId: values.employeeId,
                date: values.date?.format("YYYY-MM-DD"),
                status: values.status || "On time",
            });
            message.success("Check-in recorded");
            setCheckInModal(false);
            form.resetFields();
            loadDaily(selectedDate);
        } catch (err: any) {
            message.error(err?.response?.data?.message || "Failed to check in");
        } finally {
            setSaving(false);
        }
    };

    const handleManagerCheckOut = async (values: any) => {
        setSaving(true);
        try {
            await attendanceManagerCheckOut({
                employeeId: values.employeeId,
                date: values.date?.format("YYYY-MM-DD"),
            });
            message.success("Check-out recorded");
            setCheckOutModal(false);
            form.resetFields();
            loadDaily(selectedDate);
        } catch (err: any) {
            message.error(err?.response?.data?.message || "Failed to check out");
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id: string) => {
        try {
            await deleteAttendanceRecord(id);
            message.success("Record deleted");
            loadDaily(selectedDate);
        } catch (err: any) {
            message.error(err?.response?.data?.message || "Cannot delete this record");
        }
    };

    // ── Monthly calendar cell renderer ────────────────────────────────────────
    const dateCellRender = (value: Dayjs) => {
        const dateStr = value.format("YYYY-MM-DD");
        const dayRecords = monthlyRecords.filter(r =>
            dayjs(r.date).format("YYYY-MM-DD") === dateStr
        );
        if (!dayRecords.length) return null;
        const statuses = dayRecords.map(r => r.status);
        const hasAbsent = statuses.includes("Absent");
        const hasLate = statuses.includes("Late");
        const hasPresent = statuses.some(s => s === "On time" || s === "Early");

        let dot = "#22c55e";
        if (hasAbsent) dot = "#ef4444";
        else if (hasLate) dot = "#f97316";
        else if (hasPresent) dot = "#22c55e";

        return (
            <div style={{ display: "flex", flexWrap: "wrap", gap: 2, marginTop: 4 }}>
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: dot }} />
                <Text style={{ fontSize: 10, color: "#64748b" }}>{dayRecords.length}</Text>
            </div>
        );
    };

    // ── Daily Table Columns ────────────────────────────────────────────────────
    const columns: TableColumnsType<AttendanceRecord> = [
        {
            title: "Employee",
            key: "user",
            width: 200,
            render: (_, r) => (
                <Space>
                    <Avatar
                        size={36}
                        src={r.userID?.profilePhoto}
                        icon={<UserOutlined />}
                        style={{ background: "#5240d6", flexShrink: 0 }}
                    />
                    <Text strong style={{ fontSize: 13 }}>
                        {r.userID?.displayName || "—"}
                    </Text>
                </Space>
            ),
        },
        {
            title: "Status",
            dataIndex: "status",
            width: 130,
            filters: STATUS_OPTIONS.map(s => ({ text: s, value: s })),
            onFilter: (v, r) => r.status === v,
            render: (s) => <StatusDot status={s} />,
        },
        {
            title: "Check In",
            dataIndex: "checkIn",
            width: 110,
            render: (d) => (
                <Space>
                    <LoginOutlined style={{ color: "#22c55e", fontSize: 13 }} />
                    <Text style={{ fontSize: 13 }}>{formatTime(d)}</Text>
                </Space>
            ),
        },
        {
            title: "Check Out",
            dataIndex: "checkOut",
            width: 110,
            render: (d, r) => d ? (
                <Space>
                    <LogoutOutlined style={{ color: "#ef4444", fontSize: 13 }} />
                    <Text style={{ fontSize: 13 }}>{formatTime(d)}</Text>
                </Space>
            ) : r.checkIn ? (
                <Tag icon={<ClockCircleOutlined />} color="processing">Still working</Tag>
            ) : <Text type="secondary">—</Text>,
        },
        {
            title: "Hours",
            key: "hours",
            width: 100,
            render: (_, r) => {
                const h = r.hoursWorked || 0;
                return (
                    <div>
                        <Text style={{ fontSize: 13, fontWeight: 600 }}>
                            {h > 0 ? `${h}h` : calcHours(r.checkIn, r.checkOut) || "—"}
                        </Text>
                        {r.overtime > 0 && (
                            <Tag color="gold" style={{ fontSize: 10, marginLeft: 4, padding: "0 4px" }}>
                                +{r.overtime}h OT
                            </Tag>
                        )}
                    </div>
                );
            },
        },
        {
            title: "Breaks",
            key: "breaks",
            width: 90,
            render: (_, r) => (
                <Text style={{ fontSize: 12, color: r.breaks?.length ? "#f59e0b" : "#94a3b8" }}>
                    {r.breaks?.length ? `${r.breaks.length} (${totalBreakTime(r.breaks)})` : "—"}
                </Text>
            ),
        },
        {
            title: "Dress ✓",
            dataIndex: "dressCheck",
            width: 80,
            render: (v, r) => v ? (
                <CheckCircleOutlined style={{ color: "#22c55e" }} />
            ) : (
                <Tooltip title={r.dressReason || "Dress check failed"}>
                    <AlertOutlined style={{ color: "#ef4444" }} />
                </Tooltip>
            ),
        },
        {
            title: "Actions",
            key: "actions",
            width: 100,
            render: (_, r) => (
                <Space size={4}>
                    <Tooltip title="View details">
                        <Button
                            type="text"
                            size="small"
                            icon={<InfoCircleOutlined />}
                            onClick={() => { setSelectedRecord(r); setDrawerOpen(true); }}
                        />
                    </Tooltip>
                    {isAdmin && (
                        <Popconfirm
                            title="Delete this attendance record?"
                            description="This will remove all check-in/out and break data for this entry."
                            onConfirm={() => handleDelete(r._id)}
                            okButtonProps={{ danger: true }}
                            okText="Delete"
                        >
                            <Tooltip title="Delete record">
                                <Button type="text" size="small" danger icon={<DeleteOutlined />} />
                            </Tooltip>
                        </Popconfirm>
                    )}
                </Space>
            ),
        },
    ];

    // ─────────────────────────────────────────────────────────────────────────────
    return (
        <div>
            {/* Page Header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 }}>
                <div>
                    <Title level={4} style={{ margin: 0 }}>
                        <CalendarOutlined style={{ color: "#5240d6", marginRight: 8 }} />
                        Attendance
                    </Title>
                    <Text type="secondary">Track and manage employee check-ins, breaks, and working hours.</Text>
                </div>
                {isAdmin && (
                    <Space>
                        <Button icon={<ReloadOutlined />} onClick={() => loadDaily(selectedDate)}>Refresh</Button>
                        <Button
                            type="primary"
                            icon={<LoginOutlined />}
                            onClick={() => { form.resetFields(); form.setFieldsValue({ date: selectedDate, status: "On time" }); setCheckInModal(true); }}
                            style={{ background: "#22c55e", borderColor: "#22c55e" }}
                        >
                            Mark Check-in
                        </Button>
                        <Button
                            icon={<LogoutOutlined />}
                            onClick={() => { form.resetFields(); form.setFieldsValue({ date: selectedDate }); setCheckOutModal(true); }}
                            danger
                        >
                            Mark Check-out
                        </Button>
                    </Space>
                )}
            </div>

            {/* ── STAT CARDS ── */}
            <Row gutter={[14, 14]} style={{ marginBottom: 20 }}>
                {[
                    { label: "Present", value: stats.present, color: "#22c55e", icon: <CheckCircleOutlined /> },
                    { label: "Absent", value: stats.absent, color: "#ef4444", icon: <AlertOutlined /> },
                    { label: "Late", value: stats.late, color: "#f97316", icon: <ClockCircleOutlined /> },
                    { label: "On Leave", value: stats.onLeave, color: "#a855f7", icon: <CalendarOutlined /> },
                    { label: "Still Working", value: stats.stillWorking, color: "#0284c7", icon: <TeamOutlined /> },
                    { label: "Checked Out", value: stats.checkedOut, color: "#059669", icon: <LogoutOutlined /> },
                ].map(s => (
                    <Col xs={12} sm={8} md={4} key={s.label}>
                        <Card
                            size="small"
                            style={{ borderRadius: 12, border: `1px solid ${s.color}20`, textAlign: "center" }}
                            bodyStyle={{ padding: "14px 10px" }}
                        >
                            <div style={{ fontSize: 24, color: s.color, marginBottom: 4 }}>{s.icon}</div>
                            <div style={{ fontSize: 22, fontWeight: 800, color: s.color, lineHeight: 1 }}>{s.value}</div>
                            <Text type="secondary" style={{ fontSize: 11 }}>{s.label}</Text>
                        </Card>
                    </Col>
                ))}
            </Row>

            {/* Attendance rate bar */}
            {stats.total > 0 && (
                <div style={{ marginBottom: 20 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                        <Text style={{ fontSize: 12 }} type="secondary">
                            Attendance rate — {selectedDate.format("ddd, DD MMM YYYY")}
                        </Text>
                        <Text strong style={{ fontSize: 12, color: "#5240d6" }}>
                            {Math.round((stats.present / stats.total) * 100)}%
                        </Text>
                    </div>
                    <Progress
                        percent={Math.round((stats.present / stats.total) * 100)}
                        strokeColor={{ from: "#5240d6", to: "#22c55e" }}
                        style={{ marginBottom: 0 }}
                        showInfo={false}
                    />
                </div>
            )}

            {/* ── TABS ── */}
            <Tabs
                activeKey={activeTab}
                onChange={setActiveTab}
                items={[
                    {
                        key: "daily",
                        label: <Space><TeamOutlined />Daily View</Space>,
                        children: (
                            <Card
                                title={
                                    <Space>
                                        <Text strong>Attendance on</Text>
                                        <DatePicker
                                            value={selectedDate}
                                            onChange={(d) => d && setSelectedDate(d)}
                                            allowClear={false}
                                            size="small"
                                            style={{ width: 150 }}
                                        />
                                        <Tag style={{ borderRadius: 6 }}>{dailyRecords.length} records</Tag>
                                    </Space>
                                }
                                style={{ borderRadius: 14 }}
                                bodyStyle={{ padding: 0 }}
                            >
                                <Spin spinning={loading}>
                                    {dailyRecords.length === 0 && !loading ? (
                                        <Empty
                                            description="No attendance records for this date."
                                            style={{ padding: "48px 0" }}
                                        >
                                            {isAdmin && (
                                                <Button
                                                    type="primary"
                                                    icon={<PlusOutlined />}
                                                    onClick={() => { form.resetFields(); form.setFieldsValue({ date: selectedDate, status: "On time" }); setCheckInModal(true); }}
                                                    style={{ background: "#5240d6" }}
                                                >
                                                    Add Attendance
                                                </Button>
                                            )}
                                        </Empty>
                                    ) : (
                                        <Table
                                            columns={columns}
                                            dataSource={dailyRecords}
                                            rowKey="_id"
                                            size="middle"
                                            scroll={{ x: 800 }}
                                            pagination={{ pageSize: 20, showSizeChanger: true, showTotal: t => `${t} employees` }}
                                        />
                                    )}
                                </Spin>
                            </Card>
                        ),
                    },
                    {
                        key: "monthly",
                        label: <Space><CalendarOutlined />Monthly View</Space>,
                        children: (
                            <>
                                <div style={{ display: "flex", gap: 12, marginBottom: 16, flexWrap: "wrap" }}>
                                    <DatePicker.MonthPicker
                                        value={monthView}
                                        onChange={(d) => d && setMonthView(d)}
                                        allowClear={false}
                                        style={{ width: 150 }}
                                        placeholder="Select month"
                                    />
                                    {isAdmin && (
                                        <Select
                                            style={{ width: 220 }}
                                            placeholder="Filter by employee"
                                            value={selectedEmployee}
                                            onChange={setSelectedEmployee}
                                            allowClear
                                            showSearch
                                            optionFilterProp="label"
                                            options={employees.map(e => ({ label: e.displayName, value: e._id }))}
                                        />
                                    )}
                                </div>
                                <Spin spinning={monthLoading}>
                                    <Card style={{ borderRadius: 14 }} bodyStyle={{ padding: 0 }}>
                                        <Calendar
                                            value={monthView}
                                            fullscreen={false}
                                            onPanelChange={(d) => setMonthView(d)}
                                            onSelect={(d) => {
                                                setSelectedDate(d);
                                                setActiveTab("daily");
                                                loadDaily(d);
                                            }}
                                            cellRender={dateCellRender}
                                        />
                                    </Card>
                                    {/* Monthly records table */}
                                    <Card
                                        title={
                                            <Space>
                                                <Text strong>{monthView.format("MMMM YYYY")} Records</Text>
                                                <Tag style={{ borderRadius: 6 }}>{monthlyRecords.length}</Tag>
                                            </Space>
                                        }
                                        style={{ borderRadius: 14, marginTop: 16 }}
                                        bodyStyle={{ padding: 0 }}
                                    >
                                        <Table
                                            columns={[
                                                {
                                                    title: "Date",
                                                    dataIndex: "date",
                                                    width: 120,
                                                    render: (d) => dayjs(d).format("ddd, DD MMM"),
                                                    sorter: (a, b) => dayjs(a.date).valueOf() - dayjs(b.date).valueOf(),
                                                    defaultSortOrder: "descend",
                                                },
                                                {
                                                    title: "Employee",
                                                    key: "user",
                                                    render: (_, r) => (
                                                        <Space>
                                                            <Avatar size={28} src={r.userID?.profilePhoto} icon={<UserOutlined />} style={{ background: "#5240d6" }} />
                                                            <Text style={{ fontSize: 13 }}>{r.userID?.displayName || "—"}</Text>
                                                        </Space>
                                                    ),
                                                },
                                                { title: "Status", dataIndex: "status", render: (s) => <StatusDot status={s} /> },
                                                { title: "Check In", dataIndex: "checkIn", render: (d) => formatTime(d) },
                                                { title: "Check Out", dataIndex: "checkOut", render: (d) => formatTime(d) },
                                                { title: "Hours", dataIndex: "hoursWorked", render: (h) => h > 0 ? `${h}h` : "—" },
                                            ]}
                                            dataSource={monthlyRecords}
                                            rowKey="_id"
                                            size="small"
                                            scroll={{ x: 700 }}
                                            pagination={{ pageSize: 20, showSizeChanger: true }}
                                        />
                                    </Card>
                                </Spin>
                            </>
                        ),
                    },
                ]}
            />

            {/* ── Mark Check-In Modal ── */}
            <Modal
                title={<Space><LoginOutlined style={{ color: "#22c55e" }} /><span>Mark Employee Check-in</span></Space>}
                open={checkInModal}
                footer={null}
                onCancel={() => { setCheckInModal(false); form.resetFields(); }}
                width={460}
            >
                <Alert
                    type="info"
                    showIcon
                    message="Manually mark an employee as checked-in. The check-in time will be set to now."
                    style={{ marginBottom: 16, borderRadius: 8 }}
                />
                <Form form={form} layout="vertical" onFinish={handleManagerCheckIn}>
                    <Form.Item label="Employee" name="employeeId" rules={[{ required: true }]}>
                        <Select
                            showSearch
                            optionFilterProp="label"
                            placeholder="Select employee"
                            options={employees.map(e => ({ label: e.displayName, value: e._id }))}
                        />
                    </Form.Item>
                    <Form.Item label="Date" name="date" rules={[{ required: true }]}>
                        <DatePicker style={{ width: "100%" }} allowClear={false} />
                    </Form.Item>
                    <Form.Item label="Status" name="status" initialValue="On time">
                        <Select options={STATUS_OPTIONS.map(s => ({ label: s, value: s }))} />
                    </Form.Item>
                    <Form.Item style={{ marginBottom: 0 }}>
                        <Space style={{ width: "100%", justifyContent: "flex-end" }}>
                            <Button onClick={() => { setCheckInModal(false); form.resetFields(); }}>Cancel</Button>
                            <Button type="primary" htmlType="submit" loading={saving} icon={<LoginOutlined />} style={{ background: "#22c55e", borderColor: "#22c55e" }}>
                                Record Check-in
                            </Button>
                        </Space>
                    </Form.Item>
                </Form>
            </Modal>

            {/* ── Mark Check-Out Modal ── */}
            <Modal
                title={<Space><LogoutOutlined style={{ color: "#ef4444" }} /><span>Mark Employee Check-out</span></Space>}
                open={checkOutModal}
                footer={null}
                onCancel={() => { setCheckOutModal(false); form.resetFields(); }}
                width={420}
            >
                <Form form={form} layout="vertical" onFinish={handleManagerCheckOut}>
                    <Form.Item label="Employee" name="employeeId" rules={[{ required: true }]}>
                        <Select
                            showSearch
                            optionFilterProp="label"
                            placeholder="Select employee"
                            options={employees.map(e => ({ label: e.displayName, value: e._id }))}
                        />
                    </Form.Item>
                    <Form.Item label="Date" name="date" rules={[{ required: true }]}>
                        <DatePicker style={{ width: "100%" }} allowClear={false} />
                    </Form.Item>
                    <Form.Item style={{ marginBottom: 0 }}>
                        <Space style={{ width: "100%", justifyContent: "flex-end" }}>
                            <Button onClick={() => { setCheckOutModal(false); form.resetFields(); }}>Cancel</Button>
                            <Button type="primary" htmlType="submit" loading={saving} icon={<LogoutOutlined />} danger>
                                Record Check-out
                            </Button>
                        </Space>
                    </Form.Item>
                </Form>
            </Modal>

            {/* ── Record Detail Drawer ── */}
            <Drawer
                title={
                    <Space>
                        <Avatar
                            size={32}
                            src={selectedRecord?.userID?.profilePhoto}
                            icon={<UserOutlined />}
                            style={{ background: "#5240d6" }}
                        />
                        <div>
                            <div style={{ fontWeight: 600, fontSize: 14 }}>{selectedRecord?.userID?.displayName}</div>
                            <div style={{ fontSize: 11, color: "#94a3b8" }}>
                                {selectedRecord ? dayjs(selectedRecord.date).format("ddd, DD MMMM YYYY") : ""}
                            </div>
                        </div>
                    </Space>
                }
                open={drawerOpen}
                onClose={() => { setDrawerOpen(false); setSelectedRecord(null); }}
                width={420}
            >
                {selectedRecord && (
                    <>
                        {/* Status */}
                        <div style={{ marginBottom: 20 }}>
                            <StatusDot status={selectedRecord.status} />
                        </div>

                        {/* Check-in / Check-out */}
                        <Row gutter={16} style={{ marginBottom: 20 }}>
                            <Col span={12}>
                                <Card size="small" style={{ borderRadius: 10, textAlign: "center" }}>
                                    <LoginOutlined style={{ color: "#22c55e", fontSize: 20, marginBottom: 4 }} />
                                    <div style={{ fontWeight: 700, fontSize: 18 }}>{formatTime(selectedRecord.checkIn)}</div>
                                    <Text type="secondary" style={{ fontSize: 12 }}>Check In</Text>
                                </Card>
                            </Col>
                            <Col span={12}>
                                <Card size="small" style={{ borderRadius: 10, textAlign: "center" }}>
                                    <LogoutOutlined style={{ color: "#ef4444", fontSize: 20, marginBottom: 4 }} />
                                    <div style={{ fontWeight: 700, fontSize: 18 }}>{formatTime(selectedRecord.checkOut)}</div>
                                    <Text type="secondary" style={{ fontSize: 12 }}>Check Out</Text>
                                </Card>
                            </Col>
                        </Row>

                        {/* Key stats */}
                        <Row gutter={12} style={{ marginBottom: 20 }}>
                            <Col span={12}>
                                <Statistic
                                    title="Hours Worked"
                                    value={selectedRecord.hoursWorked > 0 ? `${selectedRecord.hoursWorked}h` : calcHours(selectedRecord.checkIn, selectedRecord.checkOut) || "—"}
                                    valueStyle={{ fontSize: 20 }}
                                />
                            </Col>
                            <Col span={12}>
                                <Statistic
                                    title="Breaks"
                                    value={selectedRecord.breaks?.length || 0}
                                    suffix="break(s)"
                                    valueStyle={{ fontSize: 20 }}
                                />
                            </Col>
                        </Row>

                        <Divider>Dress Check</Divider>
                        <Space>
                            {selectedRecord.dressCheck
                                ? <Tag color="green" icon={<CheckCircleOutlined />}>Passed</Tag>
                                : <Tag color="red" icon={<AlertOutlined />}>Failed</Tag>
                            }
                            {!selectedRecord.dressCheck && selectedRecord.dressReason && (
                                <Text type="secondary" style={{ fontSize: 12 }}>{selectedRecord.dressReason}</Text>
                            )}
                        </Space>

                        {/* Break timeline */}
                        {selectedRecord.breaks?.length > 0 && (
                            <>
                                <Divider>Break Timeline</Divider>
                                <Timeline
                                    items={selectedRecord.breaks.map((b, i) => ({
                                        color: b.breakEnd ? "gray" : "orange",
                                        children: (
                                            <div>
                                                <Text strong style={{ fontSize: 12 }}>Break {i + 1}</Text>
                                                <br />
                                                <Text type="secondary" style={{ fontSize: 11 }}>
                                                    {formatTime(b.breakStart)} → {b.breakEnd ? formatTime(b.breakEnd) : "Ongoing"}
                                                    {b.duration > 0 && ` (${b.duration}m)`}
                                                </Text>
                                            </div>
                                        ),
                                    }))}
                                />
                            </>
                        )}

                        {isAdmin && (
                            <>
                                <Divider />
                                <Popconfirm
                                    title="Delete this attendance record?"
                                    onConfirm={() => { handleDelete(selectedRecord._id); setDrawerOpen(false); }}
                                    okButtonProps={{ danger: true }}
                                >
                                    <Button danger block icon={<DeleteOutlined />}>Delete Record</Button>
                                </Popconfirm>
                            </>
                        )}
                    </>
                )}
            </Drawer>
        </div>
    );
}
