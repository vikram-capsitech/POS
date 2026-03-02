import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Badge,
  Button,
  Card,
  Col,
  Divider,
  Flex,
  Row,
  Select,
  Space,
  Statistic,
  Table,
  Tag,
  Typography,
  message,
  Drawer,
} from "antd";
import {
  ReloadOutlined,
  LinkOutlined,
  ShoppingCartOutlined,
} from "@ant-design/icons";
import { getOrders, updateOrder } from "../../Api";
import { useAuthStore } from "../../Store/store";
import dayjs from "dayjs";
import type { ColumnsType } from "antd/es/table";

const { Title, Text } = Typography;

type DeliveryOrder = {
  _id: string;
  createdAt: string;
  status: string;
  orderSource: string;
  total?: number;
  finalAmount?: number;
  items: Array<{
    menuItem?: { name?: string } | null;
    quantity: number;
    price: number;
  }>;
};

const SOURCE_CONFIG: Record<
  string,
  { color: string; bg: string; logo: string; label: string }
> = {
  zomato: { color: "#e23744", bg: "#fff0f1", logo: "🍕", label: "Zomato" },
  swiggy: { color: "#fc8019", bg: "#fff7f0", logo: "🛵", label: "Swiggy" },
  other: { color: "#722ed1", bg: "#f9f0ff", logo: "📦", label: "Other" },
  "dine-in": { color: "#52c41a", bg: "#f6ffed", logo: "🍽️", label: "Dine-In" },
  takeaway: { color: "#1677ff", bg: "#e6f4ff", logo: "🥡", label: "Takeaway" },
};

const STATUS_COLORS: Record<string, string> = {
  pending: "default",
  approved: "blue",
  preparing: "processing",
  ready: "success",
  served: "cyan",
  paid: "green",
  cancelled: "error",
};

const money = (n?: number) => `₹${Number(n || 0).toLocaleString("en-IN")}`;

export default function DeliveryHub() {
  const restaurantId = useAuthStore((s) => s.session.restaurantId);
  const [orders, setOrders] = useState<DeliveryOrder[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeSource, setActiveSource] = useState<string>("all");
  const [selectedOrder, setSelectedOrder] = useState<DeliveryOrder | null>(
    null,
  );
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [updating, setUpdating] = useState(false);

  const fetchOrders = useCallback(async () => {
    if (!restaurantId) return;
    setLoading(true);
    try {
      const res: any = await getOrders({ restaurantId });
      const all: DeliveryOrder[] = res?.data?.data ?? res?.data ?? [];
      setOrders(all);
    } catch {
      message.error("Failed to load orders");
    } finally {
      setLoading(false);
    }
  }, [restaurantId]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const sourceStats = useMemo(() => {
    const stats: Record<string, { count: number; revenue: number }> = {};
    orders.forEach((o) => {
      const src = o.orderSource ?? "other";
      if (!stats[src]) stats[src] = { count: 0, revenue: 0 };
      stats[src].count++;
      stats[src].revenue += o.finalAmount ?? o.total ?? 0;
    });
    return stats;
  }, [orders]);

  const filteredOrders = useMemo(() => {
    if (activeSource === "all") return orders;
    return orders.filter((o) => o.orderSource === activeSource);
  }, [orders, activeSource]);

  const handleStatusUpdate = async (orderId: string, status: string) => {
    setUpdating(true);
    try {
      await updateOrder(orderId, { status });
      message.success(`Order ${status} ✓`);
      fetchOrders();
      setDrawerOpen(false);
    } catch {
      message.error("Failed to update status");
    } finally {
      setUpdating(false);
    }
  };

  const columns: ColumnsType<DeliveryOrder> = [
    {
      title: "Order",
      key: "id",
      width: 140,
      render: (_, r) => (
        <div>
          <Text strong>#{r._id.slice(-6)}</Text>
          <Text type="secondary" style={{ fontSize: 11, display: "block" }}>
            {dayjs(r.createdAt).format("DD MMM, HH:mm")}
          </Text>
        </div>
      ),
    },
    {
      title: "Source",
      dataIndex: "orderSource",
      key: "src",
      width: 120,
      render: (v) => {
        const cfg = SOURCE_CONFIG[v] ?? SOURCE_CONFIG.other;
        return (
          <Tag
            style={{
              background: cfg.bg,
              color: cfg.color,
              border: `1px solid ${cfg.color}`,
              fontWeight: 600,
            }}
          >
            {cfg.logo} {cfg.label}
          </Tag>
        );
      },
    },
    {
      title: "Items",
      key: "items",
      width: 80,
      render: (_, r) => r.items?.length ?? 0,
    },
    {
      title: "Amount",
      key: "amt",
      width: 120,
      render: (_, r) => <Text strong>{money(r.finalAmount ?? r.total)}</Text>,
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      width: 130,
      render: (v) => (
        <Tag color={STATUS_COLORS[v] ?? "default"}>{v?.toUpperCase()}</Tag>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      width: 200,
      render: (_, r) => (
        <Flex gap={6}>
          <Button
            size="small"
            onClick={() => {
              setSelectedOrder(r);
              setDrawerOpen(true);
            }}
          >
            View
          </Button>
          {r.status === "pending" && (
            <Button
              size="small"
              type="primary"
              onClick={() => handleStatusUpdate(r._id, "preparing")}
            >
              Accept & Prepare
            </Button>
          )}
          {r.status === "ready" && (
            <Button
              size="small"
              style={{ background: "#52c41a", color: "#fff", border: "none" }}
              onClick={() => handleStatusUpdate(r._id, "served")}
            >
              Mark Served
            </Button>
          )}
        </Flex>
      ),
    },
  ];

  return (
    <div style={{ padding: 20, background: "#f5f7fa", minHeight: "100vh" }}>
      <Flex justify="space-between" align="center" style={{ marginBottom: 20 }}>
        <Flex gap={10} align="center">
          <ShoppingCartOutlined style={{ fontSize: 24, color: "#1677ff" }} />
          <Title level={4} style={{ margin: 0 }}>
            Delivery Hub
          </Title>
          <Tag color="blue">All Channels</Tag>
        </Flex>
        <Button
          icon={<ReloadOutlined />}
          onClick={fetchOrders}
          loading={loading}
          style={{ borderRadius: 8 }}
        >
          Refresh
        </Button>
      </Flex>

      {/* Integration Info Banner */}
      <Card
        style={{
          borderRadius: 14,
          marginBottom: 20,
          background: "linear-gradient(135deg,#667eea,#764ba2)",
          border: "none",
        }}
        styles={{ body: { padding: "16px 20px" } }}
      >
        <Flex justify="space-between" align="center" wrap="wrap" gap={12}>
          <div>
            <Text strong style={{ color: "#fff", fontSize: 16 }}>
              <LinkOutlined /> Online Delivery Integration
            </Text>
            <Text
              style={{
                color: "rgba(255,255,255,0.8)",
                fontSize: 13,
                display: "block",
                marginTop: 4,
              }}
            >
              Orders from Zomato, Swiggy, and other platforms automatically
              appear here when integrated via webhook. Set your restaurant's
              webhook URL in each platform's partner dashboard.
            </Text>
          </div>
          <Flex gap={8}>
            {["🍕 Zomato", "🛵 Swiggy"].map((p) => (
              <Tag
                key={p}
                style={{
                  background: "rgba(255,255,255,0.2)",
                  color: "#fff",
                  border: "1px solid rgba(255,255,255,0.3)",
                  padding: "4px 10px",
                  borderRadius: 8,
                }}
              >
                {p}
              </Tag>
            ))}
          </Flex>
        </Flex>
      </Card>

      {/* Source Stats */}
      <Row gutter={[16, 16]} style={{ marginBottom: 20 }}>
        {Object.entries(sourceStats).map(([src, stats]) => {
          const cfg = SOURCE_CONFIG[src] ?? SOURCE_CONFIG.other;
          return (
            <Col xs={12} sm={8} md={6} lg={4} key={src}>
              <Card
                hoverable
                onClick={() =>
                  setActiveSource(src === activeSource ? "all" : src)
                }
                style={{
                  borderRadius: 14,
                  border: `2px solid ${activeSource === src ? cfg.color : "#f0f0f0"}`,
                  background: cfg.bg,
                  cursor: "pointer",
                }}
                styles={{ body: { padding: "12px 16px" } }}
              >
                <Text style={{ fontSize: 20 }}>{cfg.logo}</Text>
                <Text
                  strong
                  style={{ display: "block", color: cfg.color, fontSize: 14 }}
                >
                  {cfg.label}
                </Text>
                <Text style={{ fontSize: 13 }}>{stats.count} orders</Text>
                <Text
                  type="secondary"
                  style={{ fontSize: 12, display: "block" }}
                >
                  {money(stats.revenue)}
                </Text>
              </Card>
            </Col>
          );
        })}
        <Col xs={12} sm={8} md={6} lg={4}>
          <Card
            hoverable
            onClick={() => setActiveSource("all")}
            style={{
              borderRadius: 14,
              border: `2px solid ${activeSource === "all" ? "#1677ff" : "#f0f0f0"}`,
              cursor: "pointer",
            }}
            styles={{ body: { padding: "12px 16px" } }}
          >
            <Text style={{ fontSize: 20 }}>📋</Text>
            <Text
              strong
              style={{ display: "block", color: "#1677ff", fontSize: 14 }}
            >
              All Orders
            </Text>
            <Text style={{ fontSize: 13 }}>{orders.length} total</Text>
            <Text type="secondary" style={{ fontSize: 12, display: "block" }}>
              {money(
                orders.reduce((a, o) => a + (o.finalAmount ?? o.total ?? 0), 0),
              )}
            </Text>
          </Card>
        </Col>
      </Row>

      {/* Orders Table */}
      <Card
        title={
          <Flex gap={8} align="center">
            <Text strong>Orders</Text>
            {activeSource !== "all" && (
              <Tag color="blue">
                {SOURCE_CONFIG[activeSource]?.label ?? activeSource}
              </Tag>
            )}
            <Badge
              count={filteredOrders.length}
              style={{ backgroundColor: "#1677ff" }}
            />
          </Flex>
        }
        style={{ borderRadius: 14 }}
      >
        <Table<DeliveryOrder>
          rowKey="_id"
          loading={loading}
          dataSource={filteredOrders}
          columns={columns}
          pagination={{ pageSize: 12, showSizeChanger: true }}
          scroll={{ x: 900 }}
        />
      </Card>

      {/* Order Detail Drawer */}
      <Drawer
        title={`Order #${selectedOrder?._id.slice(-6)} — ${SOURCE_CONFIG[selectedOrder?.orderSource ?? ""]?.label ?? selectedOrder?.orderSource}`}
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        width={420}
      >
        {selectedOrder && (
          <Space direction="vertical" size={12} style={{ width: "100%" }}>
            <Flex justify="space-between">
              <Text type="secondary">Status</Text>
              <Tag color={STATUS_COLORS[selectedOrder.status]}>
                {selectedOrder.status.toUpperCase()}
              </Tag>
            </Flex>
            <Flex justify="space-between">
              <Text type="secondary">Time</Text>
              <Text>
                {dayjs(selectedOrder.createdAt).format("DD MMM YYYY, HH:mm")}
              </Text>
            </Flex>
            <Divider style={{ margin: "8px 0" }} />
            <Text strong>Items</Text>
            {selectedOrder.items.map((item, idx) => (
              <Flex key={idx} justify="space-between">
                <Text>
                  {item.menuItem?.name ?? "Item"} ×{item.quantity}
                </Text>
                <Text>{money(item.price * item.quantity)}</Text>
              </Flex>
            ))}
            <Divider style={{ margin: "8px 0" }} />
            <Flex justify="space-between">
              <Text strong>Total</Text>
              <Text strong style={{ fontSize: 18 }}>
                {money(selectedOrder.finalAmount ?? selectedOrder.total)}
              </Text>
            </Flex>
            <Space
              direction="vertical"
              size={8}
              style={{ width: "100%", marginTop: 8 }}
            >
              {selectedOrder.status === "pending" && (
                <Button
                  block
                  type="primary"
                  loading={updating}
                  onClick={() =>
                    handleStatusUpdate(selectedOrder._id, "preparing")
                  }
                >
                  Accept & Start Preparing
                </Button>
              )}
              {selectedOrder.status === "preparing" && (
                <Button
                  block
                  style={{
                    background: "#52c41a",
                    color: "#fff",
                    border: "none",
                  }}
                  loading={updating}
                  onClick={() => handleStatusUpdate(selectedOrder._id, "ready")}
                >
                  Mark Ready for Pickup
                </Button>
              )}
              {selectedOrder.status === "ready" && (
                <Button
                  block
                  style={{
                    background: "#1677ff",
                    color: "#fff",
                    border: "none",
                  }}
                  loading={updating}
                  onClick={() =>
                    handleStatusUpdate(selectedOrder._id, "served")
                  }
                >
                  Mark Delivered/Served
                </Button>
              )}
              {!["cancelled", "paid", "served"].includes(
                selectedOrder.status,
              ) && (
                <Button
                  block
                  danger
                  loading={updating}
                  onClick={() =>
                    handleStatusUpdate(selectedOrder._id, "cancelled")
                  }
                >
                  Cancel Order
                </Button>
              )}
            </Space>
          </Space>
        )}
      </Drawer>
    </div>
  );
}
