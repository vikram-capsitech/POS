import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Badge,
  Button,
  Card,
  Col,
  Drawer,
  Empty,
  Flex,
  Form,
  Input,
  InputNumber,
  List,
  Modal,
  Row,
  Select,
  Space,
  Spin,
  Tag,
  Tooltip,
  Typography,
  message,
  Divider,
} from "antd";
import {
  MinusCircleOutlined,
  PlusCircleOutlined,
  ShoppingCartOutlined,
  SearchOutlined,
  DeleteOutlined,
  CheckOutlined,
} from "@ant-design/icons";
import {
  getOrders,
  getTables,
  getMenuItems,
  createOrder,
  addOrderItems,
  updateOrder,
} from "../../Api";
import { useAuthStore } from "../../Store/store";
import { useParams } from "react-router-dom";
import dayjs from "dayjs";

const { Title, Text } = Typography;

type MenuItem = {
  _id: string;
  name: string;
  category: string;
  price: number;
  isVeg: boolean;
  available: boolean;
  imageUrl?: string;
  prepTime?: number;
  spiceLevel?: number;
};
type PosTable = {
  _id: string;
  number: number;
  seats: number;
  status: string;
  floor?: string;
  currentOrderID?: string | null;
};
type CartItem = {
  menuItem: string;
  name: string;
  price: number;
  quantity: number;
  customization?: string;
  specialRequest?: string;
};

const TABLE_COLORS: Record<
  string,
  { bg: string; border: string; text: string }
> = {
  available: { bg: "#f6ffed", border: "#52c41a", text: "#52c41a" },
  occupied: { bg: "#fff1f0", border: "#ff4d4f", text: "#ff4d4f" },
  reserved: { bg: "#fffbe6", border: "#faad14", text: "#faad14" },
  billing: { bg: "#f9f0ff", border: "#722ed1", text: "#722ed1" },
};

const money = (n: number) => `₹${Number(n || 0).toLocaleString("en-IN")}`;

export default function WaiterView() {
  const { orgId } = useParams();
  const restaurantId = useAuthStore((s) => s.session.restaurantId);
  const session = useAuthStore((s) => s.session);

  const [tables, setTables] = useState<PosTable[]>([]);
  const [menu, setMenu] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Order terminal
  const [selectedTable, setSelectedTable] = useState<PosTable | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [menuSearch, setMenuSearch] = useState("");
  const [menuCategory, setMenuCategory] = useState<string>("All");
  const [placing, setPlacing] = useState(false);
  const [tableOrders, setTableOrders] = useState<any[]>([]);
  const [activeOrderId, setActiveOrderId] = useState<string | null>(null);
  const [billModal, setBillModal] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const sid = restaurantId || orgId;
      const [tRes, mRes] = await Promise.all([
        getTables(),
        getMenuItems({ orgId: sid }),
      ]);
      const t: PosTable[] = tRes?.data?.data ?? tRes?.data ?? [];
      const m: MenuItem[] = mRes?.data?.data ?? mRes?.data ?? [];
      setTables(t);
      setMenu(m.filter((i) => i.available));
    } catch {
      message.error("Failed to load tables/menu");
    } finally {
      setLoading(false);
    }
  }, [restaurantId, orgId]);

  useEffect(() => {
    load();
  }, [load]);

  const openTable = async (table: PosTable) => {
    setSelectedTable(table);
    setCart([]);
    setTableOrders([]);
    setActiveOrderId(null);
    setDrawerOpen(true);
    // Fetch existing order for table
    try {
      const res: any = await getOrders({ restaurantId: restaurantId || orgId });
      const all: any[] = res?.data?.data ?? res?.data ?? [];
      const forTable = all.filter(
        (o) =>
          (o.tableID === table._id || o.tableID?._id === table._id) &&
          !["paid", "cancelled"].includes(o.status),
      );
      setTableOrders(forTable);
      if (forTable.length > 0) setActiveOrderId(forTable[0]._id);
    } catch {}
  };

  const categories = useMemo(
    () => ["All", ...Array.from(new Set(menu.map((m) => m.category)))],
    [menu],
  );

  const filteredMenu = useMemo(() => {
    const q = menuSearch.toLowerCase();
    return menu.filter((m) => {
      const matchesQ = !q || m.name.toLowerCase().includes(q);
      const matchesCat = menuCategory === "All" || m.category === menuCategory;
      return matchesQ && matchesCat;
    });
  }, [menu, menuSearch, menuCategory]);

  const addToCart = (item: MenuItem) => {
    setCart((prev) => {
      const existing = prev.find((c) => c.menuItem === item._id);
      if (existing)
        return prev.map((c) =>
          c.menuItem === item._id ? { ...c, quantity: c.quantity + 1 } : c,
        );
      return [
        ...prev,
        { menuItem: item._id, name: item.name, price: item.price, quantity: 1 },
      ];
    });
  };
  const removeFromCart = (menuItemId: string) => {
    setCart((prev) => {
      const existing = prev.find((c) => c.menuItem === menuItemId);
      if (existing && existing.quantity > 1)
        return prev.map((c) =>
          c.menuItem === menuItemId ? { ...c, quantity: c.quantity - 1 } : c,
        );
      return prev.filter((c) => c.menuItem !== menuItemId);
    });
  };
  const clearCart = () => setCart([]);

  const cartTotal = useMemo(
    () => cart.reduce((acc, i) => acc + i.price * i.quantity, 0),
    [cart],
  );

  const placeOrder = async () => {
    if (cart.length === 0) {
      message.warning("Cart is empty");
      return;
    }
    if (!selectedTable) return;
    setPlacing(true);
    try {
      const payload = {
        tableID: selectedTable._id,
        organizationID: restaurantId || orgId,
        items: cart.map((c) => ({
          menuItem: c.menuItem,
          quantity: c.quantity,
          price: c.price,
          customization: c.customization,
          specialRequest: c.specialRequest,
        })),
        total: cartTotal,
        finalAmount: cartTotal,
        waiterID: session.userId,
        orderSource: "dine-in",
      };

      if (activeOrderId) {
        await addOrderItems(activeOrderId, {
          items: payload.items,
          total: cartTotal,
        });
        message.success("Items added to existing order!");
      } else {
        const res: any = await createOrder(payload);
        const newOrder = res?.data?.data ?? res?.data;
        setActiveOrderId(newOrder?._id ?? null);
        message.success("Order placed! 🎉");
      }
      clearCart();
      load();
    } catch (e: any) {
      message.error(e?.message || "Failed to place order");
    } finally {
      setPlacing(false);
    }
  };

  const markBillPaid = async () => {
    if (!activeOrderId) return;
    try {
      await updateOrder(activeOrderId, { status: "paid" });
      message.success("Bill settled ✓");
      setBillModal(false);
      setDrawerOpen(false);
      load();
    } catch {
      message.error("Failed to update");
    }
  };

  if (loading)
    return (
      <Flex align="center" justify="center" style={{ height: "60vh" }}>
        <Spin size="large" />
      </Flex>
    );

  return (
    <div style={{ padding: 20, background: "#f5f7fa", minHeight: "100vh" }}>
      <Flex justify="space-between" align="center" style={{ marginBottom: 20 }}>
        <Title level={4} style={{ margin: 0 }}>
          Table View
        </Title>
        <Button icon={<SearchOutlined />} onClick={load}>
          Refresh
        </Button>
      </Flex>

      {/* Floor label chips */}
      <Flex gap={8} wrap="wrap" style={{ marginBottom: 16 }}>
        {Object.entries(TABLE_COLORS).map(([s, c]) => (
          <Tag
            key={s}
            color={
              s === "available"
                ? "success"
                : s === "occupied"
                  ? "error"
                  : s === "reserved"
                    ? "warning"
                    : "purple"
            }
            style={{ textTransform: "capitalize", fontWeight: 600 }}
          >
            {tables.filter((t) => t.status === s).length} {s}
          </Tag>
        ))}
      </Flex>

      {/* Tables Grid */}
      {tables.length === 0 ? (
        <Empty description="No tables configured — ask admin to add tables" />
      ) : (
        <Row gutter={[16, 16]}>
          {tables.map((table) => {
            const colors = TABLE_COLORS[table.status] ?? TABLE_COLORS.available;
            return (
              <Col xs={12} sm={8} md={6} lg={4} key={table._id}>
                <Card
                  hoverable
                  onClick={() => openTable(table)}
                  style={{
                    borderRadius: 14,
                    border: `2px solid ${colors.border}`,
                    background: colors.bg,
                    cursor: "pointer",
                    textAlign: "center",
                  }}
                  styles={{ body: { padding: 16 } }}
                >
                  <div style={{ fontSize: 28, marginBottom: 6 }}>
                    {table.status === "available"
                      ? "🍽️"
                      : table.status === "occupied"
                        ? "🔴"
                        : table.status === "reserved"
                          ? "🟡"
                          : "💜"}
                  </div>
                  <Text
                    strong
                    style={{
                      fontSize: 16,
                      color: colors.text,
                      display: "block",
                    }}
                  >
                    Table {table.number}
                  </Text>
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    {table.seats} seats • {table.floor ?? "Ground"}
                  </Text>
                  <div style={{ marginTop: 6 }}>
                    <Tag
                      color={
                        table.status === "available"
                          ? "success"
                          : table.status === "occupied"
                            ? "error"
                            : "warning"
                      }
                      style={{ textTransform: "capitalize" }}
                    >
                      {table.status}
                    </Tag>
                  </div>
                </Card>
              </Col>
            );
          })}
        </Row>
      )}

      {/* Order Drawer */}
      <Drawer
        title={
          <Flex justify="space-between" align="center">
            <span>Table {selectedTable?.number} — Order Terminal</span>
            {activeOrderId && (
              <Button danger size="small" onClick={() => setBillModal(true)}>
                💰 Bill & Pay
              </Button>
            )}
          </Flex>
        }
        open={drawerOpen}
        onClose={() => {
          setDrawerOpen(false);
          setCart([]);
        }}
        width={Math.min(window.innerWidth, 900)}
        styles={{ body: { padding: 0 } }}
        destroyOnClose
      >
        <Row style={{ height: "100%" }}>
          {/* Menu panel */}
          <Col
            xs={24}
            md={14}
            style={{
              borderRight: "1px solid #f0f0f0",
              padding: 16,
              overflowY: "auto",
              height: "calc(100vh - 100px)",
            }}
          >
            <Flex gap={8} style={{ marginBottom: 12 }}>
              <Input
                prefix={<SearchOutlined />}
                placeholder="Search menu…"
                value={menuSearch}
                onChange={(e) => setMenuSearch(e.target.value)}
                style={{ flex: 1 }}
                allowClear
              />
              <Select
                value={menuCategory}
                onChange={setMenuCategory}
                style={{ width: 130 }}
                options={categories.map((c) => ({ label: c, value: c }))}
              />
            </Flex>

            {categories
              .filter(
                (c) =>
                  c !== "All" && (menuCategory === "All" || menuCategory === c),
              )
              .map((cat) => {
                const items = filteredMenu.filter((m) => m.category === cat);
                if (items.length === 0) return null;
                return (
                  <div key={cat} style={{ marginBottom: 16 }}>
                    <Text
                      strong
                      style={{
                        fontSize: 13,
                        color: "#666",
                        display: "block",
                        marginBottom: 8,
                        textTransform: "uppercase",
                      }}
                    >
                      {cat}
                    </Text>
                    <Row gutter={[8, 8]}>
                      {items.map((item) => {
                        const inCart = cart.find(
                          (c) => c.menuItem === item._id,
                        );
                        return (
                          <Col xs={24} sm={12} key={item._id}>
                            <Card
                              size="small"
                              style={{ borderRadius: 10, cursor: "pointer" }}
                              styles={{ body: { padding: "10px 12px" } }}
                            >
                              <Flex justify="space-between" align="center">
                                <div style={{ flex: 1 }}>
                                  <Flex gap={6} align="center">
                                    <div
                                      style={{
                                        width: 10,
                                        height: 10,
                                        borderRadius: "50%",
                                        border: `2px solid ${item.isVeg ? "#52c41a" : "#ff4d4f"}`,
                                        background: item.isVeg
                                          ? "#52c41a"
                                          : "#ff4d4f",
                                      }}
                                    />
                                    <Text strong style={{ fontSize: 13 }}>
                                      {item.name}
                                    </Text>
                                  </Flex>
                                  <Text
                                    type="secondary"
                                    style={{ fontSize: 12 }}
                                  >
                                    {money(item.price)}
                                  </Text>
                                </div>
                                {inCart ? (
                                  <Flex gap={6} align="center">
                                    <MinusCircleOutlined
                                      style={{
                                        fontSize: 18,
                                        color: "#ff4d4f",
                                        cursor: "pointer",
                                      }}
                                      onClick={() => removeFromCart(item._id)}
                                    />
                                    <Text strong>{inCart.quantity}</Text>
                                    <PlusCircleOutlined
                                      style={{
                                        fontSize: 18,
                                        color: "#52c41a",
                                        cursor: "pointer",
                                      }}
                                      onClick={() => addToCart(item)}
                                    />
                                  </Flex>
                                ) : (
                                  <Button
                                    size="small"
                                    type="primary"
                                    icon={<PlusCircleOutlined />}
                                    onClick={() => addToCart(item)}
                                    style={{ borderRadius: 8 }}
                                  >
                                    Add
                                  </Button>
                                )}
                              </Flex>
                            </Card>
                          </Col>
                        );
                      })}
                    </Row>
                  </div>
                );
              })}
          </Col>

          {/* Cart panel */}
          <Col
            xs={24}
            md={10}
            style={{
              padding: 16,
              display: "flex",
              flexDirection: "column",
              height: "calc(100vh - 100px)",
            }}
          >
            <Flex
              justify="space-between"
              align="center"
              style={{ marginBottom: 12 }}
            >
              <Title level={5} style={{ margin: 0 }}>
                <ShoppingCartOutlined /> Cart ({cart.length} items)
              </Title>
              {cart.length > 0 && (
                <Button
                  size="small"
                  danger
                  icon={<DeleteOutlined />}
                  onClick={clearCart}
                >
                  Clear
                </Button>
              )}
            </Flex>

            {/* Active order items */}
            {tableOrders.length > 0 && (
              <div
                style={{
                  marginBottom: 12,
                  padding: 10,
                  background: "#f6ffed",
                  borderRadius: 10,
                  border: "1px solid #b7eb8f",
                }}
              >
                <Text strong style={{ fontSize: 12, color: "#52c41a" }}>
                  Active Order Items
                </Text>
                {tableOrders[0].items?.map((i: any, idx: number) => (
                  <Flex
                    key={idx}
                    justify="space-between"
                    style={{ fontSize: 12, marginTop: 4 }}
                  >
                    <Text>
                      {i.menuItem?.name ?? "Item"} ×{i.quantity}
                    </Text>
                    <Text>
                      ₹{(i.price * i.quantity).toLocaleString("en-IN")}
                    </Text>
                  </Flex>
                ))}
              </div>
            )}

            {cart.length === 0 ? (
              <Flex align="center" justify="center" style={{ flex: 1 }}>
                <Empty
                  description="Add items from the menu"
                  imageStyle={{ height: 60 }}
                />
              </Flex>
            ) : (
              <div style={{ flex: 1, overflowY: "auto" }}>
                {cart.map((item) => (
                  <Flex
                    key={item.menuItem}
                    justify="space-between"
                    align="center"
                    style={{
                      padding: "8px 0",
                      borderBottom: "1px solid #f0f0f0",
                    }}
                  >
                    <div>
                      <Text strong style={{ fontSize: 13 }}>
                        {item.name}
                      </Text>
                      <Text
                        type="secondary"
                        style={{ fontSize: 12, display: "block" }}
                      >
                        {money(item.price)} × {item.quantity}
                      </Text>
                    </div>
                    <Flex gap={8} align="center">
                      <Text strong>{money(item.price * item.quantity)}</Text>
                      <MinusCircleOutlined
                        style={{ color: "#ff4d4f", cursor: "pointer" }}
                        onClick={() => removeFromCart(item.menuItem)}
                      />
                    </Flex>
                  </Flex>
                ))}
              </div>
            )}

            {/* Total & Place Order */}
            <div
              style={{
                marginTop: 12,
                paddingTop: 12,
                borderTop: "2px solid #f0f0f0",
              }}
            >
              <Flex
                justify="space-between"
                align="center"
                style={{ marginBottom: 14 }}
              >
                <Text strong style={{ fontSize: 16 }}>
                  Total
                </Text>
                <Text strong style={{ fontSize: 20, color: "#1677ff" }}>
                  {money(cartTotal)}
                </Text>
              </Flex>
              <Button
                block
                type="primary"
                size="large"
                loading={placing}
                disabled={cart.length === 0}
                onClick={placeOrder}
                icon={<CheckOutlined />}
                style={{ borderRadius: 10, fontWeight: 700 }}
              >
                {activeOrderId ? "Add to Order" : "Place Order"}
              </Button>
            </div>
          </Col>
        </Row>
      </Drawer>

      {/* Bill Modal */}
      <Modal
        title={`Bill — Table ${selectedTable?.number}`}
        open={billModal}
        onOk={markBillPaid}
        onCancel={() => setBillModal(false)}
        okText="Mark as Paid ✓"
        okButtonProps={{ style: { background: "#52c41a", border: "none" } }}
      >
        <Text>Confirm payment received for Table {selectedTable?.number}?</Text>
        {tableOrders.length > 0 && (
          <div style={{ marginTop: 12 }}>
            {tableOrders[0].items?.map((i: any, idx: number) => (
              <Flex key={idx} justify="space-between">
                <Text>
                  {i.menuItem?.name ?? "Item"} ×{i.quantity}
                </Text>
                <Text>₹{(i.price * i.quantity).toLocaleString("en-IN")}</Text>
              </Flex>
            ))}
            <Divider style={{ margin: "8px 0" }} />
            <Flex justify="space-between">
              <Text strong>Total</Text>
              <Text strong>
                ₹{tableOrders[0].total?.toLocaleString("en-IN") ?? 0}
              </Text>
            </Flex>
          </div>
        )}
      </Modal>
    </div>
  );
}
