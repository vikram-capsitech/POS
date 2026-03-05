import React, { useEffect, useMemo, useState } from "react";
import {
    Button,
    Card,
    Checkbox,
    Col,
    Descriptions,
    Divider,
    Drawer,
    Empty,
    Flex,
    Input,
    Modal,
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
    DollarOutlined,
    CheckCircleOutlined,
    ClockCircleOutlined,
    EyeOutlined,
    SearchOutlined,
    ReloadOutlined,
    CheckOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";

import {
    hrmListSalaryRecords,
    hrmCreateSalaryRecord,
    hrmDeleteSalaryRecord,
    hrmListEmployees,
} from "../../../Api/index";
import { requestHandler } from "../../../Utils/index";

const { Title, Text } = Typography;

type SalaryRow = {
    employeeId: string;
    name: string;
    position: string;
    salary: number;
    advanceTaken: number;
    remainingSalary: number;
    salaryStatus: "Pending" | "Paid" | "Processing" | string;
    lastSalaryPaidDate?: string | null;
};

type Employee = {
    _id: string;
    displayName?: string;
    userName?: string;
    profile?: { jobRole?: string };
};

const MONTHS = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
];

const statusTag = (s?: string) => {
    if (s === "Paid") return <Tag color="green" icon={<CheckCircleOutlined />}>Paid</Tag>;
    if (s === "Processing") return <Tag color="blue" icon={<ClockCircleOutlined />}>Processing</Tag>;
    if (s === "Pending") return <Tag color="default">Pending</Tag>;
    return <Tag>{s || "-"}</Tag>;
};

const fmt = (n: number) =>
    n?.toLocaleString("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }) ?? "₹0";

const fmtDate = (d?: string | null) =>
    d ? dayjs(d).format("MMM DD, YYYY") : "-";

export default function SalaryManagement() {
    const now = dayjs();
    const [selectedMonth, setSelectedMonth] = useState(now.month()); // 0-indexed
    const [selectedYear, setSelectedYear] = useState(now.year());

    const [loading, setLoading] = useState(false);
    const [salaryData, setSalaryData] = useState<SalaryRow[]>([]);

    // For bulk pay
    const [allEmployees, setAllEmployees] = useState<Employee[]>([]);
    const [payModalOpen, setPayModalOpen] = useState(false);
    const [selectedEmpIds, setSelectedEmpIds] = useState<string[]>([]);
    const [payStatus, setPayStatus] = useState<"Paid" | "Processing">("Paid");
    const [payLoading, setPayLoading] = useState(false);

    // View drawer
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [activeRow, setActiveRow] = useState<SalaryRow | null>(null);

    const [q, setQ] = useState("");

    useEffect(() => {
        loadSalaryData();
        loadEmployees();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedMonth, selectedYear]);

    const loadSalaryData = () => {
        requestHandler(
            () =>
                hrmListSalaryRecords({
                    month: selectedMonth,
                    year: selectedYear,
                }) as any,
            setLoading,
            (data: any) => {
                const list = data?.data ?? data?.data?.data ?? [];
                setSalaryData(Array.isArray(list) ? list : []);
            },
            (err) => message.error(err)
        );
    };

    const loadEmployees = () => {
        requestHandler(
            () => hrmListEmployees() as any,
            null,
            (data: any) => {
                const list = data?.data?.data ?? data?.data ?? [];
                setAllEmployees(Array.isArray(list) ? list : []);
            },
            () => { }
        );
    };

    const handleBulkPay = () => {
        if (!selectedEmpIds.length) {
            message.warning("Please select at least one employee.");
            return;
        }
        requestHandler(
            () =>
                hrmCreateSalaryRecord({
                    employee: selectedEmpIds,
                    status: payStatus,
                }) as any,
            setPayLoading,
            (data: any) => {
                const skipped = data?.data?.skippedEmployees?.length ?? 0;
                const processed = (data?.data?.salaryRecords ?? []).length;
                if (skipped > 0) {
                    message.warning(
                        `Processed: ${processed}. Skipped ${skipped} already-paid employee(s).`
                    );
                } else {
                    message.success(`Salary processed for ${processed} employee(s).`);
                }
                setPayModalOpen(false);
                setSelectedEmpIds([]);
                loadSalaryData();
            },
            (err) => message.error(err)
        );
    };

    const visibleData = useMemo(() => {
        if (!q.trim()) return salaryData;
        const query = q.toLowerCase();
        return salaryData.filter(
            (r) =>
                r.name?.toLowerCase().includes(query) ||
                r.position?.toLowerCase().includes(query)
        );
    }, [salaryData, q]);

    // Summary stats
    const totalPayroll = useMemo(
        () => salaryData.reduce((acc, r) => acc + (r.salary || 0), 0),
        [salaryData]
    );
    const paidCount = useMemo(
        () => salaryData.filter((r) => r.salaryStatus === "Paid").length,
        [salaryData]
    );
    const pendingCount = useMemo(
        () => salaryData.filter((r) => r.salaryStatus === "Pending").length,
        [salaryData]
    );
    const totalAdvance = useMemo(
        () => salaryData.reduce((acc, r) => acc + (r.advanceTaken || 0), 0),
        [salaryData]
    );

    const columns: ColumnsType<SalaryRow> = [
        {
            title: "Employee",
            key: "name",
            width: 200,
            render: (_, r) => (
                <Space direction="vertical" size={0}>
                    <Text strong>{r.name || "-"}</Text>
                    <Text type="secondary" style={{ fontSize: 12 }}>
                        {r.position || "-"}
                    </Text>
                </Space>
            ),
        },
        {
            title: "Base Salary",
            dataIndex: "salary",
            key: "salary",
            width: 140,
            render: (v) => <Text strong style={{ color: "#1677ff" }}>{fmt(v)}</Text>,
        },
        {
            title: "Advance Taken",
            dataIndex: "advanceTaken",
            key: "advanceTaken",
            width: 140,
            render: (v) => (
                <Text style={{ color: v > 0 ? "#ff4d4f" : "#8c8c8c" }}>{fmt(v)}</Text>
            ),
        },
        {
            title: "Remaining Salary",
            dataIndex: "remainingSalary",
            key: "remainingSalary",
            width: 160,
            render: (v) => (
                <Text strong style={{ color: "#52c41a" }}>
                    {fmt(v)}
                </Text>
            ),
        },
        {
            title: "Status",
            dataIndex: "salaryStatus",
            key: "salaryStatus",
            width: 130,
            render: (v) => statusTag(v),
        },
        {
            title: "Last Paid",
            key: "lastPaid",
            width: 140,
            render: (_, r) => (
                <Text type="secondary">{fmtDate(r.lastSalaryPaidDate)}</Text>
            ),
        },
        {
            title: "Actions",
            key: "actions",
            fixed: "right",
            width: 100,
            render: (_, r) => (
                <Space>
                    <Tooltip title="View details">
                        <Button
                            size="small"
                            icon={<EyeOutlined />}
                            onClick={() => {
                                setActiveRow(r);
                                setDrawerOpen(true);
                            }}
                            style={{ borderRadius: 10 }}
                        />
                    </Tooltip>
                </Space>
            ),
        },
    ];

    const yearOptions = useMemo(() => {
        const years = [];
        const current = dayjs().year();
        for (let y = current - 2; y <= current + 1; y++) {
            years.push({ value: y, label: String(y) });
        }
        return years;
    }, []);

    // Employees unpaid this month
    const unpaidEmployees = useMemo(() => {
        const paidIds = new Set(
            salaryData.filter((r) => r.salaryStatus === "Paid").map((r) => r.employeeId)
        );
        return allEmployees.filter((e) => !paidIds.has(e._id));
    }, [salaryData, allEmployees]);

    return (
        <div style={{ padding: 16 }}>
            {/* Header */}
            <Card style={{ borderRadius: 16, marginBottom: 12 }}>
                <Flex justify="space-between" align="center" wrap="wrap" gap={12}>
                    <Space direction="vertical" size={2}>
                        <Space>
                            <DollarOutlined style={{ fontSize: 20, color: "#52c41a" }} />
                            <Title level={4} style={{ margin: 0 }}>
                                Salary Management
                            </Title>
                        </Space>
                        <Text type="secondary">
                            View salary summary, process payroll, and manage monthly compensation.
                        </Text>
                    </Space>

                    <Space wrap>
                        <Select
                            value={selectedMonth}
                            onChange={setSelectedMonth}
                            options={MONTHS.map((m, i) => ({ value: i, label: m }))}
                            style={{ width: 140 }}
                        />
                        <Select
                            value={selectedYear}
                            onChange={setSelectedYear}
                            options={yearOptions}
                            style={{ width: 100 }}
                        />
                        <Button
                            icon={<ReloadOutlined />}
                            onClick={loadSalaryData}
                            loading={loading}
                            style={{ borderRadius: 10 }}
                        >
                            Refresh
                        </Button>
                        <Button
                            type="primary"
                            icon={<CheckOutlined />}
                            onClick={() => setPayModalOpen(true)}
                            style={{ borderRadius: 10, background: "#52c41a", borderColor: "#52c41a" }}
                        >
                            Process Payroll
                        </Button>
                    </Space>
                </Flex>

                <Divider style={{ margin: "12px 0" }} />

                <Text type="secondary" style={{ fontSize: 13 }}>
                    Showing salary data for{" "}
                    <Text strong>
                        {MONTHS[selectedMonth]} {selectedYear}
                    </Text>
                </Text>
            </Card>

            {/* Stats */}
            <Row gutter={[12, 12]} style={{ marginBottom: 12 }}>
                <Col xs={12} sm={6}>
                    <Card style={{ borderRadius: 14, border: "1px solid #1677ff30", background: "#e6f4ff" }} bodyStyle={{ padding: "16px 20px" }}>
                        <Statistic
                            title={<Text style={{ fontSize: 12 }}>Total Payroll</Text>}
                            value={totalPayroll}
                            prefix="₹"
                            valueStyle={{ color: "#1677ff", fontSize: 22 }}
                            formatter={(v) => Number(v).toLocaleString("en-IN")}
                        />
                    </Card>
                </Col>
                <Col xs={12} sm={6}>
                    <Card style={{ borderRadius: 14, border: "1px solid #52c41a30", background: "#f6ffed" }} bodyStyle={{ padding: "16px 20px" }}>
                        <Statistic
                            title={<Text style={{ fontSize: 12 }}>Paid</Text>}
                            value={paidCount}
                            suffix={<Text type="secondary" style={{ fontSize: 13 }}>/ {salaryData.length}</Text>}
                            valueStyle={{ color: "#52c41a", fontSize: 22 }}
                        />
                    </Card>
                </Col>
                <Col xs={12} sm={6}>
                    <Card style={{ borderRadius: 14, border: "1px solid #faad1430", background: "#fffbe6" }} bodyStyle={{ padding: "16px 20px" }}>
                        <Statistic
                            title={<Text style={{ fontSize: 12 }}>Pending</Text>}
                            value={pendingCount}
                            valueStyle={{ color: "#faad14", fontSize: 22 }}
                        />
                    </Card>
                </Col>
                <Col xs={12} sm={6}>
                    <Card style={{ borderRadius: 14, border: "1px solid #ff4d4f30", background: "#fff2f0" }} bodyStyle={{ padding: "16px 20px" }}>
                        <Statistic
                            title={<Text style={{ fontSize: 12 }}>Total Advances</Text>}
                            value={totalAdvance}
                            prefix="₹"
                            valueStyle={{ color: "#ff4d4f", fontSize: 22 }}
                            formatter={(v) => Number(v).toLocaleString("en-IN")}
                        />
                    </Card>
                </Col>
            </Row>

            {/* Table */}
            <Card style={{ borderRadius: 16 }}>
                <Flex justify="space-between" align="center" wrap="wrap" gap={12} style={{ marginBottom: 14 }}>
                    <Text strong style={{ fontSize: 15 }}>
                        Employee Salary Summary
                    </Text>
                    <Input
                        value={q}
                        onChange={(e) => setQ(e.target.value)}
                        allowClear
                        prefix={<SearchOutlined />}
                        placeholder="Search by name or position..."
                        style={{ width: 260 }}
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
                        description={`No salary data for ${MONTHS[selectedMonth]} ${selectedYear}. Add employees or change the period.`}
                        image={Empty.PRESENTED_IMAGE_SIMPLE}
                    />
                ) : (
                    <Table<SalaryRow>
                        rowKey="employeeId"
                        columns={columns}
                        dataSource={visibleData}
                        pagination={false}
                        scroll={{ x: 1000 }}
                        onRow={(r) => ({
                            onDoubleClick: () => {
                                setActiveRow(r);
                                setDrawerOpen(true);
                            },
                            style: { cursor: "pointer" },
                        })}
                        rowClassName={(r) =>
                            r.salaryStatus === "Paid" ? "" : "salary-row-pending"
                        }
                    />
                )}
            </Card>

            {/* Process Payroll Modal */}
            <Modal
                title={
                    <Space>
                        <DollarOutlined style={{ color: "#52c41a" }} />
                        <Text strong>Process Payroll</Text>
                    </Space>
                }
                open={payModalOpen}
                onCancel={() => {
                    setPayModalOpen(false);
                    setSelectedEmpIds([]);
                }}
                onOk={handleBulkPay}
                confirmLoading={payLoading}
                okText="Process Salary"
                okButtonProps={{
                    style: { background: "#52c41a", borderColor: "#52c41a" },
                }}
                width={560}
            >
                <Space direction="vertical" style={{ width: "100%" }} size={14}>
                    <div>
                        <Text type="secondary" style={{ fontSize: 13 }}>
                            Processing for:{" "}
                            <Text strong>
                                {MONTHS[selectedMonth]} {selectedYear}
                            </Text>
                        </Text>
                    </div>

                    <div>
                        <Flex justify="space-between" align="center" style={{ marginBottom: 8 }}>
                            <Text strong>Payment Status</Text>
                        </Flex>
                        <Select
                            value={payStatus}
                            onChange={(v) => setPayStatus(v as any)}
                            style={{ width: "100%" }}
                            options={[
                                { value: "Paid", label: "Mark as Paid" },
                                { value: "Processing", label: "Mark as Processing" },
                            ]}
                        />
                    </div>

                    <div>
                        <Flex justify="space-between" align="center" style={{ marginBottom: 8 }}>
                            <Text strong>
                                Select Employees{" "}
                                <Text type="secondary" style={{ fontWeight: 400 }}>
                                    ({unpaidEmployees.length} unpaid this month)
                                </Text>
                            </Text>
                            <Button
                                size="small"
                                type="link"
                                onClick={() =>
                                    setSelectedEmpIds(
                                        selectedEmpIds.length === unpaidEmployees.length
                                            ? []
                                            : unpaidEmployees.map((e) => e._id)
                                    )
                                }
                            >
                                {selectedEmpIds.length === unpaidEmployees.length
                                    ? "Deselect All"
                                    : "Select All"}
                            </Button>
                        </Flex>

                        {unpaidEmployees.length === 0 ? (
                            <Text type="secondary" style={{ fontStyle: "italic" }}>
                                All employees have been paid this month. 🎉
                            </Text>
                        ) : (
                            <div
                                style={{
                                    maxHeight: 260,
                                    overflowY: "auto",
                                    border: "1px solid rgba(2,6,23,.08)",
                                    borderRadius: 10,
                                    padding: 10,
                                }}
                            >
                                <Checkbox.Group
                                    value={selectedEmpIds}
                                    onChange={(v) => setSelectedEmpIds(v as string[])}
                                    style={{ width: "100%" }}
                                >
                                    <Row gutter={[0, 6]}>
                                        {unpaidEmployees.map((emp) => (
                                            <Col span={24} key={emp._id}>
                                                <Checkbox value={emp._id}>
                                                    <Text>
                                                        {emp.displayName || emp.userName}
                                                    </Text>
                                                    {emp.profile?.jobRole && (
                                                        <Text type="secondary" style={{ marginLeft: 6, fontSize: 12 }}>
                                                            ({emp.profile.jobRole})
                                                        </Text>
                                                    )}
                                                </Checkbox>
                                            </Col>
                                        ))}
                                    </Row>
                                </Checkbox.Group>
                            </div>
                        )}
                    </div>

                    {selectedEmpIds.length > 0 && (
                        <Card
                            size="small"
                            style={{
                                borderRadius: 10,
                                background: "#f6ffed",
                                border: "1px solid #b7eb8f",
                            }}
                        >
                            <Text>
                                <CheckCircleOutlined style={{ color: "#52c41a", marginRight: 6 }} />
                                <Text strong>{selectedEmpIds.length}</Text> employee(s) selected for{" "}
                                <Text strong>{payStatus}</Text> status.
                            </Text>
                        </Card>
                    )}
                </Space>
            </Modal>

            {/* View Drawer */}
            <Drawer
                open={drawerOpen}
                onClose={() => setDrawerOpen(false)}
                width={480}
                title={
                    <Space direction="vertical" size={2}>
                        <Text type="secondary" style={{ fontSize: 12 }}>
                            Salary Details
                        </Text>
                        <Text strong style={{ fontSize: 16 }}>
                            {activeRow?.name || "-"}
                        </Text>
                    </Space>
                }
            >
                {!activeRow ? (
                    <Empty description="No record selected" />
                ) : (
                    <Space direction="vertical" size={16} style={{ width: "100%" }}>
                        <Descriptions bordered size="small" column={1} styles={{ content: { background: "#fff" } }}>
                            <Descriptions.Item label="Employee">
                                <Text strong>{activeRow.name}</Text>
                            </Descriptions.Item>
                            <Descriptions.Item label="Position">
                                <Tag color="blue">{activeRow.position || "-"}</Tag>
                            </Descriptions.Item>
                            <Descriptions.Item label="Month">
                                <Text>
                                    {MONTHS[selectedMonth]} {selectedYear}
                                </Text>
                            </Descriptions.Item>
                            <Descriptions.Item label="Base Salary">
                                <Text strong style={{ color: "#1677ff" }}>
                                    {fmt(activeRow.salary)}
                                </Text>
                            </Descriptions.Item>
                            <Descriptions.Item label="Advance Taken">
                                <Text style={{ color: "#ff4d4f" }}>
                                    {fmt(activeRow.advanceTaken)}
                                </Text>
                            </Descriptions.Item>
                            <Descriptions.Item label="Remaining Salary">
                                <Text strong style={{ color: "#52c41a" }}>
                                    {fmt(activeRow.remainingSalary)}
                                </Text>
                            </Descriptions.Item>
                            <Descriptions.Item label="Salary Status">
                                {statusTag(activeRow.salaryStatus)}
                            </Descriptions.Item>
                            <Descriptions.Item label="Last Paid Date">
                                {fmtDate(activeRow.lastSalaryPaidDate)}
                            </Descriptions.Item>
                        </Descriptions>

                        {/* Deduction Breakdown */}
                        <Card
                            size="small"
                            style={{ borderRadius: 12, background: "#fafafa" }}
                            title={<Text strong style={{ fontSize: 13 }}>Breakdown</Text>}
                        >
                            <Flex justify="space-between" style={{ padding: "4px 0" }}>
                                <Text type="secondary">Base Salary</Text>
                                <Text>{fmt(activeRow.salary)}</Text>
                            </Flex>
                            <Divider style={{ margin: "6px 0" }} />
                            <Flex justify="space-between" style={{ padding: "4px 0" }}>
                                <Text type="secondary">Advance Deduction</Text>
                                <Text style={{ color: "#ff4d4f" }}>- {fmt(activeRow.advanceTaken)}</Text>
                            </Flex>
                            <Divider style={{ margin: "6px 0" }} />
                            <Flex justify="space-between" style={{ padding: "4px 0" }}>
                                <Text strong>Net Payable</Text>
                                <Text strong style={{ color: "#52c41a", fontSize: 15 }}>
                                    {fmt(activeRow.remainingSalary)}
                                </Text>
                            </Flex>
                        </Card>
                    </Space>
                )}
            </Drawer>
        </div>
    );
}
