import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Navigate, useParams } from "react-router-dom";
import {
  Badge,
  Button,
  Card,
  Col,
  DatePicker,
  Flex,
  Row,
  Segmented,
  Space,
  Statistic,
  Table,
  Tag,
  Tabs,
  Typography,
  message,
  Divider,
  Avatar,
  theme,
} from "antd";
import {
  DollarOutlined,
  ShoppingCartOutlined,
  TableOutlined,
  FireOutlined,
  ReloadOutlined,
  RiseOutlined,
  WalletOutlined,
  LinkOutlined,
  AppstoreOutlined,
  TeamOutlined,
} from "@ant-design/icons";
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { useAuthStore } from "../../Store/store";
import { getOrders, getTables, getMenuItems, getPosExpenses } from "../../Api";
import dayjs, { Dayjs } from "dayjs";
import type { ColumnsType } from "antd/es/table";

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;
const { useToken } = theme;

// ── Role-Based Redirect ───────────────────────────────────────────────────────
export default function PosDashboard() {
  const role = useAuthStore((s) => s.session.role);
  const orgAccess = useAuthStore((s) => s.session.orgAccess);
  const restaurantId = useAuthStore((s) => s.session.restaurantId);
  const { orgId } = useParams();
  const effectiveOrgId = orgId || restaurantId || "";
  const roleName = orgAccess?.[effectiveOrgId]?.roleName?.toLowerCase() || "";
  const effectiveRole = role?.toLowerCase() || roleName;

  // Redirect waiter/employee/kitchen roles to their specific view
  if (effectiveRole === "waiter" || effectiveRole === "employee")
    return <Navigate to={`/pos/${effectiveOrgId}/waiter`} replace />;
  if (effectiveRole === "kitchen")
    return <Navigate to={`/pos/${effectiveOrgId}/kitchen`} replace />;

  // Admin/Manager → full dashboard
  return <AdminPosDashboard />;
}

// ── Types ─────────────────────────────────────────────────────────────────────
type Order = {
  _id: string;
  createdAt?: string;
  status?: string;
  total?: number;
  finalAmount?: number;
  orderSource?: string;
  items?: any[];
  tableID?: any;
};
type PosTable = {
  _id: string;
  number?: number;
  seats?: number;
  status?: string;
  floor?: string;
};
type MenuItemT = {
  _id: string;
  name: string;
  category?: string;
  price?: number;
  isVeg?: boolean;
  available?: boolean;
};

type PeriodKey = "today" | "week" | "month" | "custom";
const money = (n?: number) => `₹${Number(n || 0).toLocaleString("en-IN")}`;

const STATUS_COLORS: Record<string, string> = {
  pending: "#faad14",
  approved: "#1677ff",
  preparing: "#13c2c2",
  ready: "#52c41a",
  served: "#722ed1",
  paid: "#52c41a",
  cancelled: "#ff4d4f",
};
const TABLE_STATUS_COLORS: Record<string, string> = {
  available: "#52c41a",
  occupied: "#ff4d4f",
  reserved: "#faad14",
  billing: "#722ed1",
};
const SOURCE_LABELS: Record<string, string> = {
  "dine-in": "🍽️ Dine-In",
  takeaway: "🥡 Takeaway",
  zomato: "🍕 Zomato",
  swiggy: "🛵 Swiggy",
  other: "📦 Other",
};

// ── Admin Dashboard ───────────────────────────────────────────────────────────
function AdminPosDashboard() {
  const { token } = useToken();
  const { orgId } = useParams();
  const restaurantId = useAuthStore((s) => s.session.restaurantId);

  const [loading, setLoading] = useState(false);
  const [period, setPeriod] = useState<PeriodKey>("today");
  const [range, setRange] = useState<[Dayjs, Dayjs]>([
    dayjs().startOf("day"),
    dayjs().endOf("day"),
  ]);

  const [orders, setOrders] = useState<Order[]>([]);
  const [tables, setTables] = useState<PosTable[]>([]);
  const [menu, setMenu] = useState<MenuItemT[]>([]);
  const [expenses, setExpenses] = useState<any[]>([]);

  useEffect(() => {
    if (period === "today")
      setRange([dayjs().startOf("day"), dayjs().endOf("day")]);
    if (period === "week")
      setRange([dayjs().startOf("week"), dayjs().endOf("week")]);
    if (period === "month")
      setRange([dayjs().startOf("month"), dayjs().endOf("month")]);
  }, [period]);

  const fetchAll = useCallback(async () => {
    const sid = restaurantId || orgId;
    if (!sid) return;
    setLoading(true);
    try {
      const [oRes, tRes, mRes, eRes] = await Promise.all([
        getOrders({ restaurantId: sid }),
        getTables(),
        getMenuItems({ orgId: sid }),
        getPosExpenses({
          startDate: range[0].toISOString(),
          endDate: range[1].toISOString(),
        }),
      ]);
      setOrders((oRes as any)?.data?.data ?? (oRes as any)?.data ?? []);
      setTables((tRes as any)?.data?.data ?? (tRes as any)?.data ?? []);
      setMenu((mRes as any)?.data?.data ?? (mRes as any)?.data ?? []);
      setExpenses(((eRes as any)?.data?.data?.expenses ?? []) as any[]);
    } catch {
      message.error("Failed to load dashboard");
    } finally {
      setLoading(false);
    }
  }, [restaurantId, orgId, range[0].valueOf(), range[1].valueOf()]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  // ── KPIs ──────────────────────────────────────────────────────────────────
  const kpis = useMemo(() => {
    const inRange = (d?: string) => {
      if (!d) return true;
      const ts = dayjs(d).valueOf();
      return ts >= range[0].valueOf() && ts <= range[1].valueOf();
    };
    const rangedOrders = orders.filter((o) => inRange(o.createdAt));
    const revenue = rangedOrders.reduce(
      (a, o) => a + (Number(o.finalAmount ?? o.total) || 0),
      0,
    );
    const count = rangedOrders.length;
    const aov = count ? revenue / count : 0;
    const activeOrders = orders.filter((o) =>
      ["pending", "approved", "preparing", "ready"].includes(o.status ?? ""),
    ).length;
    const occupied = tables.filter((t) => t.status === "occupied").length;
    const occupancyPct = tables.length
      ? Math.round((occupied / tables.length) * 100)
      : 0;
    const totalExpenses = expenses.reduce((a, e) => a + e.amount, 0);
    return {
      revenue,
      count,
      aov,
      activeOrders,
      occupied,
      totalTables: tables.length,
      occupancyPct,
      totalExpenses,
    };
  }, [orders, tables, expenses, range]);

  // ── Chart Data ────────────────────────────────────────────────────────────
  const statusPieData = useMemo(() => {
    const counts: Record<string, number> = {};
    orders.forEach((o) => {
      counts[o.status ?? "unknown"] = (counts[o.status ?? "unknown"] ?? 0) + 1;
    });
    return Object.entries(counts).map(([k, v]) => ({ name: k, value: v }));
  }, [orders]);

  const topItems = useMemo(() => {
    const counts: Record<
      string,
      { name: string; qty: number; revenue: number }
    > = {};
    orders.forEach((o) => {
      (o.items ?? []).forEach((i: any) => {
        const name = i.menuItem?.name ?? i.name ?? "Item";
        if (!counts[name]) counts[name] = { name, qty: 0, revenue: 0 };
        counts[name].qty += i.quantity ?? 1;
        counts[name].revenue += (i.price ?? 0) * (i.quantity ?? 1);
      });
    });
    return Object.values(counts)
      .sort((a, b) => b.qty - a.qty)
      .slice(0, 6);
  }, [orders]);

  const sourceData = useMemo(() => {
    const d: Record<string, number> = {};
    orders.forEach((o) => {
      const s = o.orderSource ?? "dine-in";
      d[s] = (d[s] ?? 0) + (o.finalAmount ?? o.total ?? 0);
    });
    return Object.entries(d).map(([k, v]) => ({
      name: SOURCE_LABELS[k] ?? k,
      value: Math.round(v),
    }));
  }, [orders]);

  const recentOrders = useMemo(
    () =>
      [...orders]
        .sort(
          (a, b) => dayjs(b.createdAt).valueOf() - dayjs(a.createdAt).valueOf(),
        )
        .slice(0, 8),
    [orders],
  );

  const orderColumns: ColumnsType<Order> = [
    {
      title: "Order",
      key: "id",
      width: 110,
      render: (_, r) => (
        <Space direction="vertical" size={0}>
          <Text strong>#{r._id.slice(-6)}</Text>
          <Text type="secondary" style={{ fontSize: 11 }}>
            {dayjs(r.createdAt).format("HH:mm")}
          </Text>
        </Space>
      ),
    },
    {
      title: "Source",
      key: "src",
      width: 110,
      render: (_, r) => (
        <Text style={{ fontSize: 12 }}>
          {SOURCE_LABELS[r.orderSource ?? ""] ?? r.orderSource ?? "—"}
        </Text>
      ),
    },
    {
      title: "Table",
      key: "table",
      width: 90,
      render: (_, r) =>
        r.tableID ? (
          <Tag icon={<TableOutlined />}>
            {typeof r.tableID === "object" ? r.tableID.number : "—"}
          </Tag>
        ) : (
          <Tag>Takeaway</Tag>
        ),
    },
    {
      title: "Items",
      key: "items",
      width: 70,
      render: (_, r) => r.items?.length ?? 0,
    },
    {
      title: "Total",
      key: "total",
      width: 110,
      render: (_, r) => <Text strong>{money(r.finalAmount ?? r.total)}</Text>,
    },
    {
      title: "Status",
      key: "status",
      width: 110,
      render: (_, r) => (
        <Tag color={STATUS_COLORS[r.status ?? ""] ?? "default"}>
          {(r.status ?? "—").toUpperCase()}
        </Tag>
      ),
    },
  ];

  // Theme-aware KPI card data (semantic accent colours)
  const KPI_CARDS = [
    { title: "Revenue",       value: money(kpis.revenue),       icon: <DollarOutlined />,       accentColor: token.colorPrimary },
    { title: "Orders",        value: kpis.count,                icon: <ShoppingCartOutlined />,  accentColor: token.colorInfo },
    { title: "Avg Order",     value: money(kpis.aov),           icon: <RiseOutlined />,          accentColor: token.colorSuccess },
    { title: "Active Orders", value: kpis.activeOrders,         icon: <FireOutlined />,          accentColor: token.colorWarning },
    { title: "Occupancy",     value: `${kpis.occupancyPct}%`,  icon: <TableOutlined />,         accentColor: token.colorError },
    { title: "Expenses",      value: money(kpis.totalExpenses), icon: <WalletOutlined />,        accentColor: token.colorTextSecondary },
  ];

  return (
    <div style={{ padding: "16px 20px", background: token.colorBgLayout, minHeight: "100vh" }}>
      {/* Header */}
      <Flex
        justify="space-between"
        align="center"
        wrap="wrap"
        gap={12}
        style={{ marginBottom: 20 }}
      >
        <Space direction="vertical" size={2}>
          <Title level={4} style={{ margin: 0 }}>
            POS Dashboard
          </Title>
          <Text type="secondary">Point of Sale — Admin View</Text>
        </Space>
        <Space wrap>
          <Segmented
            value={period}
            onChange={(v) => setPeriod(v as PeriodKey)}
            options={[
              { label: "Today", value: "today" },
              { label: "Week", value: "week" },
              { label: "Month", value: "month" },
              { label: "Custom", value: "custom" },
            ]}
          />
          <RangePicker
            value={range}
            onChange={(v) => {
              if (!v) return;
              setPeriod("custom");
              setRange([v[0]!, v[1]!]);
            }}
            allowClear={false}
          />
          <Button
            icon={<ReloadOutlined />}
            onClick={fetchAll}
            loading={loading}
          >
            Refresh
          </Button>
        </Space>
      </Flex>

      {/* KPI Row */}
      <Row gutter={[14, 14]} style={{ marginBottom: 20 }}>
        {KPI_CARDS.map((c, i) => (
          <Col xs={24} sm={12} lg={4} key={i}>
            <Card
              style={{
                borderRadius: 14,
                background: token.colorBgContainer,
                border: `1.5px solid ${token.colorBorderSecondary}`,
                overflow: "hidden",
                position: "relative",
              }}
              styles={{ body: { padding: "16px 18px" } }}
            >
              {/* Left accent bar */}
              <div style={{
                position: "absolute", left: 0, top: 0, bottom: 0,
                width: 4, background: c.accentColor,
                borderRadius: "14px 0 0 14px",
              }} />
              <div style={{ marginLeft: 8 }}>
                <Flex justify="space-between" align="flex-start">
                  <Statistic
                    title={<Text type="secondary" style={{ fontSize: 11, fontWeight: 600 }}>{c.title}</Text>}
                    value={c.value}
                    valueStyle={{ color: token.colorText, fontSize: 20, fontWeight: 700 }}
                  />
                  <div style={{
                    width: 36, height: 36, borderRadius: 9,
                    background: `${c.accentColor}18`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 16, color: c.accentColor, flexShrink: 0,
                  }}>
                    {c.icon}
                  </div>
                </Flex>
              </div>
            </Card>
          </Col>
        ))}
      </Row>

      {/* Quick Navigation */}
      <Card style={{ borderRadius: 14, marginBottom: 20 }}>
        <Text strong style={{ display: "block", marginBottom: 12 }}>
          Quick Navigation
        </Text>
        <Flex gap={10} wrap="wrap">
          {[
            { label: "🛎️ Waiter View", path: `/pos/${orgId}/waiter` },
            { label: "🔥 Kitchen Display", path: `/pos/${orgId}/kitchen` },
            { label: "📋 Menu Manager", path: `/pos/${orgId}/menu` },
            { label: "🛵 Delivery Hub", path: `/pos/${orgId}/delivery` },
            { label: "💸 Expenses", path: `/pos/${orgId}/expenses` },
          ].map((a) => (
            <Button
              key={a.path}
              href={a.path}
              style={{ borderRadius: 10, fontWeight: 600 }}
            >
              {a.label}
            </Button>
          ))}
        </Flex>
      </Card>

      {/* Charts Row */}
      <Row gutter={[16, 16]} style={{ marginBottom: 20 }}>
        {/* Top Items */}
        <Col xs={24} lg={12}>
          <Card title="Top Selling Items" style={{ borderRadius: 14 }}>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={topItems} margin={{ left: -20 }}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="rgba(0,0,0,0.05)"
                />
                <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar
                  dataKey="qty"
                  name="Qty Sold"
                  fill={token.colorPrimary}
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </Col>
        {/* Order Status Pie */}
        <Col xs={24} sm={12} lg={6}>
          <Card title="Order Status" style={{ borderRadius: 14 }}>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={statusPieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {statusPieData.map((e) => (
                    <Cell key={e.name} fill={STATUS_COLORS[e.name] ?? "#ccc"} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend
                  iconType="circle"
                  iconSize={8}
                  wrapperStyle={{ fontSize: 11 }}
                />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </Col>
        {/* Revenue by Source */}
        <Col xs={24} sm={12} lg={6}>
          <Card title="Revenue by Source" style={{ borderRadius: 14 }}>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={sourceData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="value"
                >
                  {sourceData.map((_, i) => (
                    <Cell
                      key={i}
                      fill={
                        ["#667eea", "#f5576c", "#fc8019", "#e23744", "#52c41a"][
                          i % 5
                        ]
                      }
                    />
                  ))}
                </Pie>
                <Tooltip formatter={((v: number) => money(v)) as any} />
                <Legend
                  iconType="circle"
                  iconSize={8}
                  wrapperStyle={{ fontSize: 11 }}
                />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        {/* Live Tables */}
        <Col xs={24} lg={10}>
          <Card
            title={
              <Flex gap={8} align="center">
                <TableOutlined />
                <span>Live Tables</span>
                <Badge
                  count={`${kpis.occupied}/${kpis.totalTables}`}
                  style={{ backgroundColor: "#ff4d4f" }}
                />
              </Flex>
            }
            style={{ borderRadius: 14 }}
          >
            <Row gutter={[10, 10]}>
              {tables.slice(0, 12).map((t) => (
                <Col xs={8} sm={6} key={t._id}>
                  <div
                    style={{
                      padding: "10px 8px",
                      borderRadius: 10,
                      background: `${TABLE_STATUS_COLORS[t.status ?? "available"]}18`,
                      border: `1.5px solid ${TABLE_STATUS_COLORS[t.status ?? "available"]}`,
                      textAlign: "center",
                    }}
                  >
                    <Text
                      strong
                      style={{
                        fontSize: 15,
                        color: TABLE_STATUS_COLORS[t.status ?? "available"],
                      }}
                    >
                      T{t.number}
                    </Text>
                    <Text
                      type="secondary"
                      style={{ fontSize: 11, display: "block" }}
                    >
                      {t.status}
                    </Text>
                  </div>
                </Col>
              ))}
            </Row>
            {tables.length > 12 && (
              <Text
                type="secondary"
                style={{ fontSize: 12, display: "block", marginTop: 8 }}
              >
                +{tables.length - 12} more
              </Text>
            )}
          </Card>
        </Col>

        {/* Recent Orders */}
        <Col xs={24} lg={14}>
          <Card title="Recent Orders" style={{ borderRadius: 14 }}>
            <Table<Order>
              rowKey="_id"
              size="small"
              loading={loading}
              columns={orderColumns}
              dataSource={recentOrders}
              pagination={false}
              scroll={{ x: 650 }}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
}
