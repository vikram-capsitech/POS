import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Badge,
  Button,
  Card,
  Col,
  Empty,
  Flex,
  Row,
  Select,
  Space,
  Spin,
  Tag,
  Typography,
  message,
  theme,
} from "antd";
import { FireOutlined, ReloadOutlined } from "@ant-design/icons";
import { getOrders, updateOrder } from "../../Api";
import { useAuthStore } from "../../Store/store";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
dayjs.extend(relativeTime);

const { Title, Text } = Typography;

type KdsOrder = {
  _id: string;
  createdAt: string;
  tableID?: { number?: number } | string | null;
  orderSource?: string;
  status: string;
  items: Array<{
    menuItem?: { name?: string; category?: string } | null;
    quantity: number;
    specialRequest?: string;
    customization?: string;
  }>;
};

const ACTIVE_STATUSES = ["pending", "approved", "preparing"];

// Token-based urgency styling (no hard-coded colors)
const urgencyStyle = (
  createdAt: string,
  t: any,
): { border: string; bg: string; badge: "success" | "warning" | "error" } => {
  const mins = dayjs().diff(dayjs(createdAt), "minute");

  if (mins < 5)
    return {
      border: t.colorSuccess,
      bg: t.colorSuccessBg,
      badge: "success",
    };

  if (mins < 15)
    return {
      border: t.colorWarning,
      bg: t.colorWarningBg,
      badge: "warning",
    };

  return {
    border: t.colorError,
    bg: t.colorErrorBg,
    badge: "error",
  };
};

const STATUS_NEXT: Record<string, string | null> = {
  pending: "preparing",
  approved: "preparing",
  preparing: "ready",
  ready: null,
};

export default function KitchenDisplay() {
  const { token } = theme.useToken();

  const restaurantId = useAuthStore((s) => s.session.restaurantId);
  const [orders, setOrders] = useState<KdsOrder[]>([]);
  const [loading, setLoading] = useState(false);
  const [updating, setUpdating] = useState<string | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchOrders = useCallback(async () => {
    if (!restaurantId) return;
    setLoading(true);
    try {
      const res: any = await getOrders({ restaurantId });
      const all: KdsOrder[] = res?.data?.data ?? res?.data ?? [];
      setOrders(all.filter((o) => ACTIVE_STATUSES.includes(o.status)));
    } catch {
      // silent refresh
    } finally {
      setLoading(false);
    }
  }, [restaurantId]);

  useEffect(() => {
    fetchOrders();
    intervalRef.current = setInterval(fetchOrders, 30_000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [fetchOrders]);

  const handleAction = async (order: KdsOrder) => {
    const next = STATUS_NEXT[order.status];
    if (!next) return;
    setUpdating(order._id);
    try {
      await updateOrder(order._id, { status: next });
      message.success(`Order marked as ${next}`);
      fetchOrders();
    } catch {
      message.error("Failed to update status");
    } finally {
      setUpdating(null);
    }
  };

  const allCategories = Array.from(
    new Set(
      orders.flatMap((o) =>
        o.items.map((i) => i.menuItem?.category ?? "Uncategorized"),
      ),
    ),
  );

  const displayed = orders
    .filter((o) => {
      if (categoryFilter === "all") return true;
      return o.items.some(
        (i) => (i.menuItem?.category ?? "Uncategorized") === categoryFilter,
      );
    })
    .sort(
      (a, b) => dayjs(a.createdAt).valueOf() - dayjs(b.createdAt).valueOf(),
    );

  const tableLabel = (o: KdsOrder) => {
    if (!o.tableID) return o.orderSource ?? "Takeaway";
    if (typeof o.tableID === "object")
      return `Table ${o.tableID.number ?? "?"}`;
    return `Table ${o.tableID}`;
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        padding: 16,
        background: token.colorBgLayout,
        color: token.colorText,
      }}
    >
      {/* Header */}
      <Flex justify="space-between" align="center" style={{ marginBottom: 16 }}>
        <Flex gap={10} align="center">
          <FireOutlined style={{ color: token.colorError, fontSize: 24 }} />
          <Title level={4} style={{ margin: 0, color: token.colorText }}>
            Kitchen Display System
          </Title>
          <Tag color={loading ? "processing" : "success"}>
            {loading ? "Refreshing…" : `${displayed.length} active`}
          </Tag>
        </Flex>

        <Flex gap={10} align="center">
          <Select
            value={categoryFilter}
            onChange={setCategoryFilter}
            style={{ width: 160 }}
            options={[
              { label: "All Items", value: "all" },
              ...allCategories.map((c) => ({ label: c, value: c })),
            ]}
          />
          <Button
            icon={<ReloadOutlined />}
            onClick={fetchOrders}
            loading={loading}
            style={{
              background: token.colorBgContainer,
              color: token.colorText,
              borderColor: token.colorBorder,
            }}
          >
            Refresh
          </Button>
        </Flex>
      </Flex>

      {/* Legend */}
      <Flex gap={16} style={{ marginBottom: 16 }}>
        {[
          { color: token.colorSuccess, label: "< 5 min — Fresh" },
          { color: token.colorWarning, label: "5–15 min — Hurry" },
          { color: token.colorError, label: "> 15 min — Urgent!" },
        ].map((l) => (
          <Flex key={l.label} gap={6} align="center">
            <div
              style={{
                width: 12,
                height: 12,
                borderRadius: "50%",
                background: l.color,
              }}
            />
            <Text style={{ color: token.colorTextSecondary, fontSize: 12 }}>
              {l.label}
            </Text>
          </Flex>
        ))}
      </Flex>

      {/* Order cards */}
      {displayed.length === 0 ? (
        <Flex align="center" justify="center" style={{ height: 400 }}>
          <Empty
            description={
              <Text style={{ color: token.colorTextSecondary }}>
                No active orders — kitchen is clear!
              </Text>
            }
          />
        </Flex>
      ) : (
        <Row gutter={[16, 16]}>
          {displayed.map((order) => {
            const { border, bg } = urgencyStyle(order.createdAt, token);
            const mins = dayjs().diff(dayjs(order.createdAt), "minute");
            const next = STATUS_NEXT[order.status];
            const isUpdating = updating === order._id;

            return (
              <Col key={order._id} xs={24} sm={12} lg={8} xl={6}>
                <Card
                  style={{
                    borderRadius: token.borderRadiusLG,
                    border: `2px solid ${border}`,
                    background: bg,
                    color: token.colorText,
                    boxShadow: token.boxShadowTertiary,
                  }}
                  styles={{
                    body: { padding: 16 },
                  }}
                >
                  {/* Card Header */}
                  <Flex
                    justify="space-between"
                    align="center"
                    style={{ marginBottom: 12 }}
                  >
                    <Flex gap={8} align="center">
                      <div
                        style={{
                          width: 10,
                          height: 10,
                          borderRadius: "50%",
                          background: border,
                        }}
                      />
                      <Text
                        strong
                        style={{ color: token.colorText, fontSize: 16 }}
                      >
                        {tableLabel(order)}
                      </Text>
                    </Flex>

                    <Space
                      direction="vertical"
                      size={0}
                      style={{ alignItems: "flex-end" }}
                    >
                      <Tag
                        color={
                          order.status === "pending"
                            ? "default"
                            : order.status === "preparing"
                              ? "processing"
                              : "success"
                        }
                      >
                        {order.status.toUpperCase()}
                      </Tag>
                      <Text
                        style={{
                          color: token.colorTextSecondary,
                          fontSize: 11,
                        }}
                      >
                        {mins}m ago
                      </Text>
                    </Space>
                  </Flex>

                  {/* Items */}
                  <div style={{ marginBottom: 14 }}>
                    {order.items.map((item, idx) => (
                      <Flex
                        key={idx}
                        justify="space-between"
                        align="flex-start"
                        style={{ marginBottom: 6 }}
                      >
                        <div>
                          <Text
                            style={{ color: token.colorText, fontSize: 14 }}
                          >
                            {item.menuItem?.name ?? "Item"}
                          </Text>

                          {(item.specialRequest || item.customization) && (
                            <Text
                              style={{
                                color: token.colorTextSecondary,
                                fontSize: 11,
                                display: "block",
                              }}
                            >
                              {item.specialRequest || item.customization}
                            </Text>
                          )}
                        </div>

                        <Badge
                          count={`×${item.quantity}`}
                          style={{
                            backgroundColor: token.colorFillSecondary,
                            color: token.colorText,
                            fontSize: 13,
                            fontWeight: 700,
                            boxShadow: "none",
                          }}
                        />
                      </Flex>
                    ))}
                  </div>

                  {/* Action button */}
                  {next ? (
                    <Button
                      block
                      type="primary"
                      loading={isUpdating}
                      onClick={() => handleAction(order)}
                      style={{
                        background: border,
                        borderColor: border,
                        borderRadius: token.borderRadiusLG,
                        fontWeight: 700,
                      }}
                    >
                      {isUpdating
                        ? "Updating…"
                        : next === "preparing"
                          ? "Start Preparing"
                          : "Mark Ready ✓"}
                    </Button>
                  ) : (
                    <Tag
                      color="success"
                      style={{
                        width: "100%",
                        textAlign: "center",
                        padding: "6px 0",
                        borderRadius: token.borderRadiusLG,
                      }}
                    >
                      Ready for Pickup ✓
                    </Tag>
                  )}
                </Card>
              </Col>
            );
          })}
        </Row>
      )}

      {loading && orders.length === 0 && (
        <Flex align="center" justify="center" style={{ height: 400 }}>
          <Spin size="large" />
        </Flex>
      )}
    </div>
  );
}
