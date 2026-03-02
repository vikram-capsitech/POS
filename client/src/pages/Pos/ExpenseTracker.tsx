import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Button,
  Card,
  Col,
  DatePicker,
  Flex,
  Form,
  Input,
  InputNumber,
  Modal,
  Row,
  Select,
  Space,
  Statistic,
  Table,
  Tag,
  Typography,
  message,
  Popconfirm,
  Divider,
} from "antd";
import {
  PlusOutlined,
  DeleteOutlined,
  EditOutlined,
  WalletOutlined,
} from "@ant-design/icons";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { getPosExpenses, createPosExpense, deletePosExpense } from "../../Api";
import { useAuthStore } from "../../Store/store";
import dayjs from "dayjs";
import type { ColumnsType } from "antd/es/table";

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

type Expense = {
  _id: string;
  category: string;
  amount: number;
  description?: string;
  date: string;
  paymentMethod: string;
  vendor?: string;
  addedBy?: { displayName?: string; userName?: string };
};

const CATEGORY_COLORS: Record<string, string> = {
  food: "#52c41a",
  utilities: "#1677ff",
  staff: "#722ed1",
  maintenance: "#fa8c16",
  marketing: "#eb2f96",
  rent: "#f5222d",
  other: "#8c8c8c",
};
const PAYMENT_ICONS: Record<string, string> = {
  cash: "💵",
  card: "💳",
  upi: "📱",
  bank_transfer: "🏦",
  other: "💰",
};

const money = (n: number) => `₹${Number(n || 0).toLocaleString("en-IN")}`;

export default function ExpenseTracker() {
  const restaurantId = useAuthStore((s) => s.session.restaurantId);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [byCategory, setByCategory] = useState<
    Array<{ _id: string; total: number; count: number }>
  >([]);
  const [loading, setLoading] = useState(false);
  const [openModal, setOpenModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form] = Form.useForm();
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs, dayjs.Dayjs]>([
    dayjs().startOf("month"),
    dayjs().endOf("month"),
  ]);

  const fetchExpenses = useCallback(async () => {
    if (!restaurantId) return;
    setLoading(true);
    try {
      const res: any = await getPosExpenses({
        startDate: dateRange[0].toISOString(),
        endDate: dateRange[1].toISOString(),
      });
      const data = res?.data?.data ?? res?.data;
      setExpenses(data?.expenses ?? []);
      setByCategory(data?.byCategory ?? []);
    } catch {
      message.error("Failed to load expenses");
    } finally {
      setLoading(false);
    }
  }, [restaurantId, dateRange]);

  useEffect(() => {
    fetchExpenses();
  }, [fetchExpenses]);

  const totals = useMemo(
    () => ({
      total: expenses.reduce((acc, e) => acc + e.amount, 0),
      today: expenses
        .filter((e) => dayjs(e.date).isSame(dayjs(), "day"))
        .reduce((acc, e) => acc + e.amount, 0),
      topCategory: byCategory[0]?._id ?? "—",
    }),
    [expenses, byCategory],
  );

  const chartData = byCategory.map((c) => ({
    category: c._id.charAt(0).toUpperCase() + c._id.slice(1),
    amount: c.total,
    color: CATEGORY_COLORS[c._id] ?? "#8c8c8c",
  }));

  const handleAdd = async () => {
    const values = await form.validateFields();
    setSaving(true);
    try {
      await createPosExpense({ ...values, date: values.date?.toISOString() });
      message.success("Expense recorded ✓");
      setOpenModal(false);
      form.resetFields();
      fetchExpenses();
    } catch (e: any) {
      message.error(e?.message || "Failed");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deletePosExpense(id);
      message.success("Deleted");
      fetchExpenses();
    } catch {
      message.error("Failed to delete");
    }
  };

  const columns: ColumnsType<Expense> = [
    {
      title: "Date",
      dataIndex: "date",
      key: "date",
      width: 120,
      render: (v) => dayjs(v).format("DD MMM YYYY"),
    },
    {
      title: "Category",
      dataIndex: "category",
      key: "category",
      width: 120,
      render: (v) => (
        <Tag
          color={CATEGORY_COLORS[v] ?? "default"}
          style={{ textTransform: "capitalize" }}
        >
          {v}
        </Tag>
      ),
    },
    {
      title: "Description",
      key: "desc",
      render: (_, r) => (
        <div>
          <Text>{r.description || "—"}</Text>
          {r.vendor && (
            <Text type="secondary" style={{ fontSize: 12, display: "block" }}>
              Vendor: {r.vendor}
            </Text>
          )}
        </div>
      ),
    },
    {
      title: "Payment",
      dataIndex: "paymentMethod",
      key: "pm",
      width: 110,
      render: (v) => (
        <span>
          {PAYMENT_ICONS[v] ?? "💰"} {v?.replace("_", " ")}
        </span>
      ),
    },
    {
      title: "Amount",
      dataIndex: "amount",
      key: "amount",
      width: 120,
      render: (v) => (
        <Text strong style={{ color: "#ff4d4f" }}>
          {money(v)}
        </Text>
      ),
      sorter: (a, b) => a.amount - b.amount,
    },
    {
      title: "Added By",
      key: "by",
      width: 120,
      render: (_, r) => r.addedBy?.displayName ?? r.addedBy?.userName ?? "—",
    },
    {
      title: "",
      key: "actions",
      width: 60,
      render: (_, r) => (
        <Popconfirm
          title="Delete this expense?"
          onConfirm={() => handleDelete(r._id)}
        >
          <Button size="small" danger icon={<DeleteOutlined />} />
        </Popconfirm>
      ),
    },
  ];

  return (
    <div style={{ padding: 20, background: "#f5f7fa", minHeight: "100vh" }}>
      <Flex justify="space-between" align="center" style={{ marginBottom: 20 }}>
        <Flex gap={10} align="center">
          <WalletOutlined style={{ fontSize: 24, color: "#722ed1" }} />
          <Title level={4} style={{ margin: 0 }}>
            Expense Tracker
          </Title>
        </Flex>
        <Flex gap={10}>
          <RangePicker
            value={dateRange}
            onChange={(v) => v && setDateRange([v[0]!, v[1]!])}
            allowClear={false}
            style={{ borderRadius: 8 }}
          />
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setOpenModal(true)}
            style={{ borderRadius: 8 }}
          >
            Add Expense
          </Button>
        </Flex>
      </Flex>

      {/* Summary cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: 20 }}>
        {[
          {
            title: "Period Total",
            value: money(totals.total),
            bg: "linear-gradient(135deg,#f093fb,#f5576c)",
            icon: "💸",
          },
          {
            title: "Today's Expenses",
            value: money(totals.today),
            bg: "linear-gradient(135deg,#4facfe,#00f2fe)",
            icon: "📅",
          },
          {
            title: "Top Category",
            value: totals.topCategory,
            bg: "linear-gradient(135deg,#43e97b,#38f9d7)",
            icon: "📊",
          },
          {
            title: "Transactions",
            value: expenses.length,
            bg: "linear-gradient(135deg,#fa709a,#fee140)",
            icon: "🧾",
          },
        ].map((s, i) => (
          <Col xs={24} sm={12} lg={6} key={i}>
            <Card
              style={{ borderRadius: 14, background: s.bg, border: "none" }}
              styles={{ body: { padding: "18px 22px" } }}
            >
              <Text
                style={{
                  color: "rgba(255,255,255,0.85)",
                  fontSize: 13,
                  display: "block",
                }}
              >
                {s.icon} {s.title}
              </Text>
              <Text strong style={{ color: "#fff", fontSize: 26 }}>
                {s.value}
              </Text>
            </Card>
          </Col>
        ))}
      </Row>

      <Row gutter={[16, 16]} style={{ marginBottom: 20 }}>
        {/* Bar chart */}
        <Col xs={24} lg={10}>
          <Card title="Expenses by Category" style={{ borderRadius: 14 }}>
            {chartData.length === 0 ? (
              <Flex align="center" justify="center" style={{ height: 180 }}>
                <Text type="secondary">No data for selected period</Text>
              </Flex>
            ) : (
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={chartData} margin={{ left: -20 }}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="rgba(0,0,0,0.05)"
                  />
                  <XAxis dataKey="category" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip formatter={((v: number) => money(v)) as any} />
                  <Bar dataKey="amount" radius={[4, 4, 0, 0]}>
                    {chartData.map((entry, idx) => (
                      <Cell key={idx} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </Card>
        </Col>
        {/* By category list */}
        <Col xs={24} lg={14}>
          <Card title="Category Breakdown" style={{ borderRadius: 14 }}>
            {byCategory.map((c) => (
              <Flex
                key={c._id}
                justify="space-between"
                align="center"
                style={{ padding: "8px 0", borderBottom: "1px solid #f0f0f0" }}
              >
                <Flex gap={8} align="center">
                  <div
                    style={{
                      width: 12,
                      height: 12,
                      borderRadius: "50%",
                      background: CATEGORY_COLORS[c._id] ?? "#ccc",
                    }}
                  />
                  <Text style={{ textTransform: "capitalize" }}>{c._id}</Text>
                  <Tag>{c.count} entries</Tag>
                </Flex>
                <Text
                  strong
                  style={{ color: CATEGORY_COLORS[c._id] ?? "#333" }}
                >
                  {money(c.total)}
                </Text>
              </Flex>
            ))}
          </Card>
        </Col>
      </Row>

      {/* Expense table */}
      <Card title="All Expenses" style={{ borderRadius: 14 }}>
        <Table<Expense>
          rowKey="_id"
          loading={loading}
          dataSource={expenses}
          columns={columns}
          pagination={{ pageSize: 15, showSizeChanger: true }}
          scroll={{ x: 900 }}
        />
      </Card>

      {/* Add Expense Modal */}
      <Modal
        title="Record Expense"
        open={openModal}
        onCancel={() => {
          setOpenModal(false);
          form.resetFields();
        }}
        onOk={handleAdd}
        okText="Save Expense"
        confirmLoading={saving}
        width={500}
      >
        <Form form={form} layout="vertical">
          <Row gutter={12}>
            <Col span={12}>
              <Form.Item
                name="category"
                label="Category"
                rules={[{ required: true }]}
              >
                <Select
                  options={Object.keys(CATEGORY_COLORS).map((c) => ({
                    label: c.charAt(0).toUpperCase() + c.slice(1),
                    value: c,
                  }))}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="amount"
                label="Amount (₹)"
                rules={[{ required: true }]}
              >
                <InputNumber min={0} style={{ width: "100%" }} prefix="₹" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={12}>
            <Col span={12}>
              <Form.Item
                name="paymentMethod"
                label="Payment Method"
                initialValue="cash"
              >
                <Select
                  options={[
                    "cash",
                    "card",
                    "upi",
                    "bank_transfer",
                    "other",
                  ].map((v) => ({
                    label: PAYMENT_ICONS[v] + " " + v.replace("_", " "),
                    value: v,
                  }))}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="date" label="Date" initialValue={dayjs()}>
                <DatePicker style={{ width: "100%" }} />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item name="vendor" label="Vendor (optional)">
            <Input placeholder="e.g. Local Grocery" />
          </Form.Item>
          <Form.Item name="description" label="Description">
            <Input.TextArea
              rows={2}
              placeholder="Brief note about this expense"
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
