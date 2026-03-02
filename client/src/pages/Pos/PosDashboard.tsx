import React, { useEffect, useMemo, useState } from "react";
import {
  Card,
  Col,
  DatePicker,
  Divider,
  Flex,
  Input,
  Row,
  Segmented,
  Space,
  Statistic,
  Table,
  Tag,
  Typography,
  Button,
  message,
  Tabs,
  Badge,
  List,
  Avatar,
  Select,
  Modal,
  Form,
  InputNumber,
  Switch,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import {
  ReloadOutlined,
  SearchOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  DollarOutlined,
  ShoppingCartOutlined,
  TableOutlined,
  FireOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import { useParams } from "react-router-dom";
import dayjs, { Dayjs } from "dayjs";

import { getOrders, getTables, getMenuItems /* createMenuItem, createTable */ } from "../../Api";
import { useAuthStore } from "../../Store/store";

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

type OrderStatus = "pending" | "preparing" | "ready" | "paid" | "cancelled" | string;

type Order = {
  _id: string;
  createdAt?: string;
  tableId?: string;
  tableNumber?: number | string;
  waiterName?: string;
  total?: number;
  status?: OrderStatus;
  items?: Array<{ name?: string; qty?: number; price?: number }>;
};

type PosTableStatus = "available" | "occupied" | "reserved" | "blocked" | string;
type PosTable = {
  _id: string;
  number?: number | string;
  seats?: number;
  status?: PosTableStatus;
  currentOrderId?: string;
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

const statusTag = (status?: string) => {
  const s = (status || "").toLowerCase();
  if (s === "paid") return <Tag color="green">Paid</Tag>;
  if (s === "ready") return <Tag color="blue">Ready</Tag>;
  if (s === "preparing") return <Tag color="gold">Preparing</Tag>;
  if (s === "pending") return <Tag>Pending</Tag>;
  if (s === "cancelled") return <Tag color="red">Cancelled</Tag>;
  return <Tag>{status || "-"}</Tag>;
};

const tableBadge = (status?: string) => {
  const s = (status || "").toLowerCase();
  if (s === "occupied") return <Badge status="error" text="Occupied" />;
  if (s === "available") return <Badge status="success" text="Available" />;
  if (s === "reserved") return <Badge status="warning" text="Reserved" />;
  if (s === "blocked") return <Badge status="default" text="Blocked" />;
  return <Badge status="processing" text={status || "Unknown"} />;
};

const money = (n?: number) => `₹${Number(n || 0).toLocaleString("en-IN")}`;

export default function PosDashboard() {
  const { orgId } = useParams();

  const restaurantId = useAuthStore((s) => s.session.restaurantId);
  const updateSession = useAuthStore((s) => s.updateSession);

  const [loading, setLoading] = useState(false);

  const [period, setPeriod] = useState<PeriodKey>("today");
  const [range, setRange] = useState<[Dayjs, Dayjs]>(() => [
    dayjs().startOf("day"),
    dayjs().endOf("day"),
  ]);

  const [orders, setOrders] = useState<Order[]>([]);
  const [tables, setTables] = useState<PosTable[]>([]);
  const [menu, setMenu] = useState<MenuItemT[]>([]);

  const [orderSearch, setOrderSearch] = useState("");
  const [menuSearch, setMenuSearch] = useState("");

  // dialogs
  const [openMenuModal, setOpenMenuModal] = useState(false);
  const [openTableModal, setOpenTableModal] = useState(false);
  const [menuForm] = Form.useForm();
  const [tableForm] = Form.useForm();

  // Period → range
  useEffect(() => {
    if (period === "today") setRange([dayjs().startOf("day"), dayjs().endOf("day")]);
    if (period === "week") setRange([dayjs().startOf("week"), dayjs().endOf("week")]);
    if (period === "month") setRange([dayjs().startOf("month"), dayjs().endOf("month")]);
  }, [period]);

  const fetchAll = async () => {
    if (!orgId) return;
    setLoading(true);
    try {
      const from = range[0].toISOString();
      const to = range[1].toISOString();

      // If your backend expects restaurantID, pass it as well (org == restaurant)
      const scopeId = restaurantId || orgId;

      const [oRes, tRes, mRes] = await Promise.all([
        getOrders({ orgId: scopeId, from, to }),
        getTables(),
        getMenuItems({ orgId: scopeId }),
      ]);

      const o = (oRes as any)?.data?.data ?? (oRes as any)?.data ?? [];
      const t = (tRes as any)?.data?.data ?? (tRes as any)?.data ?? [];
      const m = (mRes as any)?.data?.data ?? (mRes as any)?.data ?? [];

      setOrders(o);
      setTables(t);
      setMenu(m);

      // keep selected scope in store (optional)
      if (!restaurantId && scopeId) updateSession({ restaurantId: scopeId });
    } catch (e: any) {
      message.error(e?.message || "Failed to load POS dashboard");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orgId, restaurantId, range[0].valueOf(), range[1].valueOf()]);

  const kpis = useMemo(() => {
    const inRange = (d?: string) => {
      if (!d) return true;
      const ts = dayjs(d).valueOf();
      return ts >= range[0].valueOf() && ts <= range[1].valueOf();
    };

    const filteredOrders = orders.filter((o) => inRange(o.createdAt));
    const revenue = filteredOrders.reduce((acc, o) => acc + (Number(o.total) || 0), 0);
    const count = filteredOrders.length;
    const aov = count ? revenue / count : 0;

    const occupied = tables.filter((t) => (t.status || "").toLowerCase() === "occupied").length;
    const totalTables = tables.length || 1;
    const occupancyPct = Math.round((occupied / totalTables) * 100);

    const kitchenLoad = filteredOrders.filter((o) =>
      ["pending", "preparing"].includes((o.status || "").toLowerCase())
    ).length;

    return { revenue, count, aov, occupied, totalTables, occupancyPct, kitchenLoad };
  }, [orders, tables, range]);

  const recentOrders = useMemo(() => {
    const q = orderSearch.trim().toLowerCase();
    const list = [...orders].sort((a, b) => {
      const ta = a.createdAt ? dayjs(a.createdAt).valueOf() : 0;
      const tb = b.createdAt ? dayjs(b.createdAt).valueOf() : 0;
      return tb - ta;
    });

    if (!q) return list.slice(0, 20);

    return list
      .filter((o) => {
        const id = (o._id || "").toLowerCase();
        const status = (o.status || "").toLowerCase();
        const waiter = (o.waiterName || "").toLowerCase();
        const table = String(o.tableNumber ?? o.tableId ?? "").toLowerCase();
        return id.includes(q) || status.includes(q) || waiter.includes(q) || table.includes(q);
      })
      .slice(0, 50);
  }, [orders, orderSearch]);

  const filteredMenu = useMemo(() => {
    const q = menuSearch.trim().toLowerCase();
    if (!q) return menu;
    return menu.filter((m) => (m.name || "").toLowerCase().includes(q) || (m.category || "").toLowerCase().includes(q));
  }, [menu, menuSearch]);

  const orderColumns: ColumnsType<Order> = [
    {
      title: "Order",
      key: "order",
      width: 220,
      render: (_, r) => (
        <Space direction="vertical" size={2}>
          <Text strong>#{r._id?.slice(-6) || "-"}</Text>
          <Text type="secondary" style={{ fontSize: 12 }}>
            {r.createdAt ? dayjs(r.createdAt).format("DD MMM, HH:mm") : "-"}
          </Text>
        </Space>
      ),
    },
    {
      title: "Table",
      key: "table",
      width: 140,
      render: (_, r) => <Tag icon={<TableOutlined />}>{r.tableNumber ?? r.tableId ?? "-"}</Tag>,
    },
    {
      title: "Waiter",
      dataIndex: "waiterName",
      key: "waiterName",
      width: 180,
      render: (v) => v || "-",
    },
    {
      title: "Items",
      key: "items",
      width: 90,
      render: (_, r) => <Text>{r.items?.length ?? 0}</Text>,
    },
    {
      title: "Total",
      dataIndex: "total",
      key: "total",
      width: 140,
      render: (v) => <Text strong>{money(v)}</Text>,
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      width: 140,
      render: (v) => statusTag(v),
    },
  ];

  const menuColumns: ColumnsType<MenuItemT> = [
    {
      title: "Item",
      key: "name",
      render: (_, r) => (
        <Space direction="vertical" size={2}>
          <Text strong>{r.name}</Text>
          <Text type="secondary" style={{ fontSize: 12 }}>
            {r.category || "Uncategorized"} • {r.isVeg ? "Veg" : "Non-Veg"}
          </Text>
        </Space>
      ),
    },
    {
      title: "Price",
      dataIndex: "price",
      key: "price",
      width: 130,
      render: (v) => <Text>{money(v)}</Text>,
    },
    {
      title: "Availability",
      key: "available",
      width: 160,
      render: (_, r) =>
        r.available ? (
          <Tag color="green" icon={<CheckCircleOutlined />}>Available</Tag>
        ) : (
          <Tag color="red" icon={<CloseCircleOutlined />}>Hidden</Tag>
        ),
    },
  ];

  // --- Actions (wiring left as stub where API not shown) ---
  const handleCreateMenuItem = async () => {
    const values = await menuForm.validateFields();
    message.info("Wire createMenuItem(values) here");
    setOpenMenuModal(false);
    menuForm.resetFields();
    // await fetchAll();
  };

  const handleCreateTable = async () => {
    const values = await tableForm.validateFields();
    message.info("Wire createTable(values) here");
    setOpenTableModal(false);
    tableForm.resetFields();
    // await fetchAll();
  };

  return (
    <Space direction="vertical" size={16} style={{ width: "100%" }}>
      {/* Header */}
      <Card style={{ borderRadius: 16 }}>
        <Flex justify="space-between" align="center" wrap="wrap" gap={12}>
          <Space direction="vertical" size={2}>
            <Title level={4} style={{ margin: 0 }}>POS Dashboard</Title>
            <Text type="secondary">
              Org: <Text code>{orgId}</Text>
            </Text>
          </Space>

          <Space wrap>
            <Segmented
              value={period}
              onChange={(v) => setPeriod(v as PeriodKey)}
              options={[
                { label: "Today", value: "today" },
                { label: "This week", value: "week" },
                { label: "This month", value: "month" },
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
            <Button icon={<ReloadOutlined />} onClick={fetchAll} loading={loading}>
              Refresh
            </Button>
          </Space>
        </Flex>

        <Divider style={{ margin: "12px 0" }} />

        {/* Optional scope selector (if you later support multi-org in POS) */}
        <Flex justify="space-between" align="center" wrap="wrap" gap={12}>
          <Text type="secondary">
            Scope: <Text code>{restaurantId || orgId}</Text>
          </Text>
          <Space>
            <Button icon={<PlusOutlined />} onClick={() => setOpenTableModal(true)}>
              Add Table
            </Button>
            <Button type="primary" icon={<PlusOutlined />} onClick={() => setOpenMenuModal(true)}>
              Add Menu Item
            </Button>
          </Space>
        </Flex>
      </Card>

      {/* KPIs */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <Card style={{ borderRadius: 16 }}>
            <Statistic
              title="Revenue"
              value={kpis.revenue}
              prefix={<DollarOutlined />}
              formatter={(v) => money(Number(v))}
            />
            <Text type="secondary" style={{ fontSize: 12 }}>
              Range: {range[0].format("DD MMM")} → {range[1].format("DD MMM")}
            </Text>
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card style={{ borderRadius: 16 }}>
            <Statistic title="Orders" value={kpis.count} prefix={<ShoppingCartOutlined />} />
            <Text type="secondary" style={{ fontSize: 12 }}>
              Avg order value: {money(kpis.aov)}
            </Text>
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card style={{ borderRadius: 16 }}>
            <Statistic title="Occupancy" value={kpis.occupancyPct} suffix="%" prefix={<TableOutlined />} />
            <Text type="secondary" style={{ fontSize: 12 }}>
              {kpis.occupied} / {kpis.totalTables} tables occupied
            </Text>
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card style={{ borderRadius: 16 }}>
            <Statistic title="Kitchen Load" value={kpis.kitchenLoad} prefix={<FireOutlined />} />
            <Text type="secondary" style={{ fontSize: 12 }}>
              Pending + Preparing orders
            </Text>
          </Card>
        </Col>
      </Row>

      {/* Tabs */}
      <Card style={{ borderRadius: 16 }}>
        <Tabs
          defaultActiveKey="overview"
          items={[
            {
              key: "overview",
              label: "Overview",
              children: (
                <Row gutter={[16, 16]}>
                  <Col xs={24} lg={10}>
                    <Card title="Live Tables" extra={<Text type="secondary">{tables.length} total</Text>} style={{ borderRadius: 16 }}>
                      <Row gutter={[12, 12]}>
                        {tables.slice(0, 12).map((t) => (
                          <Col xs={12} sm={8} key={t._id}>
                            <Card size="small" style={{ borderRadius: 12 }}>
                              <Space direction="vertical" size={2}>
                                <Text strong>Table {t.number ?? "-"}</Text>
                                <Text type="secondary" style={{ fontSize: 12 }}>
                                  Seats: {t.seats ?? "-"}
                                </Text>
                                {tableBadge(t.status)}
                              </Space>
                            </Card>
                          </Col>
                        ))}
                      </Row>
                      {tables.length > 12 ? (
                        <>
                          <Divider />
                          <Text type="secondary">Showing first 12 tables</Text>
                        </>
                      ) : null}
                    </Card>
                  </Col>

                  <Col xs={24} lg={14}>
                    <Card
                      title="Menu Quick View"
                      style={{ borderRadius: 16 }}
                      extra={
                        <Input
                          allowClear
                          prefix={<SearchOutlined />}
                          placeholder="Search menu..."
                          value={menuSearch}
                          onChange={(e) => setMenuSearch(e.target.value)}
                          style={{ width: 280 }}
                        />
                      }
                    >
                      <List
                        dataSource={filteredMenu.slice(0, 8)}
                        renderItem={(m) => (
                          <List.Item
                            actions={[
                              m.available ? <Tag color="green">Available</Tag> : <Tag color="red">Hidden</Tag>,
                            ]}
                          >
                            <List.Item.Meta
                              avatar={<Avatar>{m.name?.[0]?.toUpperCase()}</Avatar>}
                              title={
                                <Space>
                                  <Text strong>{m.name}</Text>
                                  {m.isVeg ? <Tag color="green">Veg</Tag> : <Tag color="red">Non-Veg</Tag>}
                                </Space>
                              }
                              description={`${m.category || "Uncategorized"} • ${money(m.price)}`}
                            />
                          </List.Item>
                        )}
                      />
                      {filteredMenu.length > 8 ? (
                        <>
                          <Divider />
                          <Text type="secondary">Showing first 8 items</Text>
                        </>
                      ) : null}
                    </Card>
                  </Col>

                  <Col xs={24}>
                    <Card
                      title="Recent Orders"
                      style={{ borderRadius: 16 }}
                      extra={
                        <Input
                          allowClear
                          prefix={<SearchOutlined />}
                          placeholder="Search order id / status / waiter / table..."
                          value={orderSearch}
                          onChange={(e) => setOrderSearch(e.target.value)}
                          style={{ width: 360 }}
                        />
                      }
                    >
                      <Table<Order>
                        rowKey="_id"
                        size="middle"
                        loading={loading}
                        columns={orderColumns}
                        dataSource={recentOrders}
                        pagination={{ pageSize: 10, showSizeChanger: true }}
                        scroll={{ x: 900 }}
                      />
                    </Card>
                  </Col>
                </Row>
              ),
            },
            {
              key: "orders",
              label: "Orders",
              children: (
                <Card style={{ borderRadius: 16 }} bodyStyle={{ padding: 0 }}>
                  <Flex justify="space-between" align="center" style={{ padding: 16 }} wrap="wrap" gap={12}>
                    <Title level={5} style={{ margin: 0 }}>Orders</Title>
                    <Input
                      allowClear
                      prefix={<SearchOutlined />}
                      placeholder="Search..."
                      value={orderSearch}
                      onChange={(e) => setOrderSearch(e.target.value)}
                      style={{ width: 320 }}
                    />
                  </Flex>
                  <Table<Order>
                    rowKey="_id"
                    loading={loading}
                    columns={orderColumns}
                    dataSource={recentOrders}
                    pagination={{ pageSize: 12, showSizeChanger: true }}
                    scroll={{ x: 900 }}
                  />
                </Card>
              ),
            },
            {
              key: "tables",
              label: "Tables",
              children: (
                <Row gutter={[16, 16]}>
                  {tables.map((t) => (
                    <Col xs={12} sm={8} md={6} lg={4} key={t._id}>
                      <Card style={{ borderRadius: 16 }} hoverable>
                        <Space direction="vertical" size={2}>
                          <Text strong>Table {t.number ?? "-"}</Text>
                          <Text type="secondary" style={{ fontSize: 12 }}>
                            Seats: {t.seats ?? "-"}
                          </Text>
                          {tableBadge(t.status)}
                        </Space>
                      </Card>
                    </Col>
                  ))}
                </Row>
              ),
            },
            {
              key: "menu",
              label: "Menu",
              children: (
                <Space direction="vertical" size={12} style={{ width: "100%" }}>
                  <Flex justify="space-between" align="center" wrap="wrap" gap={12}>
                    <Input
                      allowClear
                      prefix={<SearchOutlined />}
                      placeholder="Search menu by name/category..."
                      value={menuSearch}
                      onChange={(e) => setMenuSearch(e.target.value)}
                      style={{ width: 360 }}
                    />
                    <Button type="primary" icon={<PlusOutlined />} onClick={() => setOpenMenuModal(true)}>
                      Add Item
                    </Button>
                  </Flex>

                  <Table<MenuItemT>
                    rowKey="_id"
                    loading={loading}
                    columns={menuColumns}
                    dataSource={filteredMenu}
                    pagination={{ pageSize: 10, showSizeChanger: true }}
                    scroll={{ x: 700 }}
                  />
                </Space>
              ),
            },
            {
              key: "inventory",
              label: "Inventory",
              children: (
                <Card style={{ borderRadius: 16 }}>
                  <Text type="secondary">
                    Inventory tab is ready. Wire your endpoints:
                    list requests, approve/reject, low-stock summary.
                  </Text>
                </Card>
              ),
            },
          ]}
        />
      </Card>

      {/* Add Menu Item Modal */}
      <Modal
        open={openMenuModal}
        onCancel={() => setOpenMenuModal(false)}
        onOk={handleCreateMenuItem}
        okText="Create"
        title="Add Menu Item"
      >
        <Form form={menuForm} layout="vertical">
          <Form.Item name="name" label="Item name" rules={[{ required: true }]}>
            <Input placeholder="Paneer Tikka" />
          </Form.Item>

          <Row gutter={12}>
            <Col span={12}>
              <Form.Item name="price" label="Price" rules={[{ required: true }]}>
                <InputNumber min={0} style={{ width: "100%" }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="category" label="Category">
                <Input placeholder="Starters" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={12}>
            <Col span={12}>
              <Form.Item name="isVeg" label="Veg" valuePropName="checked" initialValue={true}>
                <Switch />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="available" label="Available" valuePropName="checked" initialValue={true}>
                <Switch />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>

      {/* Add Table Modal */}
      <Modal
        open={openTableModal}
        onCancel={() => setOpenTableModal(false)}
        onOk={handleCreateTable}
        okText="Create"
        title="Add Table"
      >
        <Form form={tableForm} layout="vertical">
          <Row gutter={12}>
            <Col span={12}>
              <Form.Item name="number" label="Table number" rules={[{ required: true }]}>
                <InputNumber min={1} style={{ width: "100%" }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="seats" label="Seats" rules={[{ required: true }]}>
                <InputNumber min={1} style={{ width: "100%" }} />
              </Form.Item>
            </Col>
          </Row>
          <Text type="secondary" style={{ fontSize: 12 }}>
            {"Wire createTable({ number, seats, orgId }) in handleCreateTable()"}
          </Text>
        </Form>
      </Modal>
    </Space>
  );
}