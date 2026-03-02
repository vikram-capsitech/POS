import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Badge,
  Button,
  Card,
  Col,
  Flex,
  Form,
  Input,
  InputNumber,
  Modal,
  Row,
  Select,
  Space,
  Switch,
  Table,
  Tag,
  Typography,
  message,
  Popconfirm,
  Divider,
  Upload,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  AppstoreOutlined,
} from "@ant-design/icons";
import {
  getMenuItems,
  createMenuItem,
  updateMenuItem,
  deleteMenuItem,
} from "../../Api";
import { useAuthStore } from "../../Store/store";
import { useParams } from "react-router-dom";
import type { ColumnsType } from "antd/es/table";

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
  description?: string;
  discount?: number;
};

const SPICE_LEVELS = [
  "None",
  "Mild",
  "Medium",
  "Hot",
  "Extra Hot",
  "Explosive",
];
const COMMON_CATEGORIES = [
  "Starters",
  "Main Course",
  "Breads",
  "Rice & Biryani",
  "Desserts",
  "Beverages",
  "Soups",
  "Salads",
  "Snacks",
  "Combos",
];

const money = (n?: number) => `₹${Number(n || 0).toLocaleString("en-IN")}`;

export default function MenuManager() {
  const { orgId } = useParams();
  const restaurantId = useAuthStore((s) => s.session.restaurantId);
  const [menu, setMenu] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [filterCat, setFilterCat] = useState<string>("All");
  const [filterVeg, setFilterVeg] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [saving, setSaving] = useState(false);
  const [form] = Form.useForm();

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res: any = await getMenuItems({ orgId: restaurantId || orgId });
      const items: MenuItem[] = res?.data?.data ?? res?.data ?? [];
      setMenu(items);
    } catch {
      message.error("Failed to load menu");
    } finally {
      setLoading(false);
    }
  }, [restaurantId, orgId]);

  useEffect(() => {
    load();
  }, [load]);

  const categories = useMemo(
    () => ["All", ...Array.from(new Set(menu.map((m) => m.category)))],
    [menu],
  );

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return menu.filter((m) => {
      const matchQ =
        !q ||
        m.name.toLowerCase().includes(q) ||
        m.category.toLowerCase().includes(q);
      const matchCat = filterCat === "All" || m.category === filterCat;
      const matchVeg =
        filterVeg === "all" || (filterVeg === "veg" ? m.isVeg : !m.isVeg);
      return matchQ && matchCat && matchVeg;
    });
  }, [menu, search, filterCat, filterVeg]);

  const openAdd = () => {
    setEditingItem(null);
    form.resetFields();
    setModalOpen(true);
  };
  const openEdit = (item: MenuItem) => {
    setEditingItem(item);
    form.setFieldsValue({ ...item });
    setModalOpen(true);
  };

  const handleSave = async () => {
    const values = await form.validateFields();
    setSaving(true);
    try {
      const formData = new FormData();
      Object.entries(values).forEach(([k, v]) => {
        if (v !== undefined && v !== null && k !== "image")
          formData.append(k, String(v));
      });
      if (values.image?.fileList?.[0]?.originFileObj) {
        formData.append("image", values.image.fileList[0].originFileObj);
      }
      if (editingItem) {
        await updateMenuItem(editingItem._id, formData);
        message.success("Menu item updated ✓");
      } else {
        await createMenuItem(formData);
        message.success("Menu item created ✓");
      }
      setModalOpen(false);
      form.resetFields();
      load();
    } catch (e: any) {
      message.error(e?.message || "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteMenuItem(id);
      message.success("Deleted");
      load();
    } catch {
      message.error("Failed to delete");
    }
  };

  const handleToggleAvailability = async (item: MenuItem) => {
    try {
      const fd = new FormData();
      fd.append("available", String(!item.available));
      await updateMenuItem(item._id, fd);
      message.success(
        `${item.name} marked as ${!item.available ? "available" : "hidden"}`,
      );
      load();
    } catch {
      message.error("Failed");
    }
  };

  const tableColumns: ColumnsType<MenuItem> = [
    {
      title: "Item",
      key: "name",
      render: (_, r) => (
        <Flex gap={10} align="center">
          {r.imageUrl ? (
            <img
              src={r.imageUrl}
              style={{
                width: 40,
                height: 40,
                borderRadius: 8,
                objectFit: "cover",
              }}
              alt={r.name}
            />
          ) : (
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: 8,
                background: "#f0f0f0",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 18,
              }}
            >
              {r.isVeg ? "🥗" : "🍗"}
            </div>
          )}
          <div>
            <Flex gap={6} align="center">
              <div
                style={{
                  width: 10,
                  height: 10,
                  border: `2px solid ${r.isVeg ? "#52c41a" : "#ff4d4f"}`,
                  borderRadius: 2,
                  background: r.isVeg ? "#52c41a" : "#ff4d4f",
                }}
              />
              <Text strong>{r.name}</Text>
            </Flex>
            <Text type="secondary" style={{ fontSize: 12 }}>
              {r.category}{" "}
              {r.description ? `• ${r.description.slice(0, 40)}…` : ""}
            </Text>
          </div>
        </Flex>
      ),
    },
    {
      title: "Price",
      dataIndex: "price",
      key: "price",
      width: 100,
      render: (v) => <Text strong>{money(v)}</Text>,
      sorter: (a, b) => a.price - b.price,
    },
    {
      title: "Prep",
      dataIndex: "prepTime",
      key: "pt",
      width: 90,
      render: (v) => (v ? `${v} min` : "—"),
    },
    {
      title: "Available",
      key: "avail",
      width: 120,
      render: (_, r) => (
        <Switch
          checked={r.available}
          onChange={() => handleToggleAvailability(r)}
          checkedChildren="On"
          unCheckedChildren="Off"
        />
      ),
    },
    {
      title: "Actions",
      key: "actions",
      width: 100,
      render: (_, r) => (
        <Space>
          <Button
            size="small"
            icon={<EditOutlined />}
            onClick={() => openEdit(r)}
          />
          <Popconfirm
            title="Delete this item?"
            onConfirm={() => handleDelete(r._id)}
          >
            <Button size="small" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: 20, background: "#f5f7fa", minHeight: "100vh" }}>
      <Flex justify="space-between" align="center" style={{ marginBottom: 20 }}>
        <Flex gap={10} align="center">
          <AppstoreOutlined style={{ fontSize: 24, color: "#fa8c16" }} />
          <Title level={4} style={{ margin: 0 }}>
            Menu Manager
          </Title>
          <Badge count={menu.length} style={{ backgroundColor: "#fa8c16" }} />
        </Flex>
        <Flex gap={10}>
          <Button
            icon={<AppstoreOutlined />}
            onClick={() => setViewMode(viewMode === "grid" ? "table" : "grid")}
          >
            {viewMode === "grid" ? "Table View" : "Grid View"}
          </Button>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={openAdd}
            style={{ borderRadius: 8 }}
          >
            Add Item
          </Button>
        </Flex>
      </Flex>

      {/* Filters */}
      <Flex gap={10} wrap="wrap" style={{ marginBottom: 16 }}>
        <Input
          prefix={<SearchOutlined />}
          placeholder="Search items…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ width: 240, borderRadius: 8 }}
          allowClear
        />
        <Select
          value={filterCat}
          onChange={setFilterCat}
          style={{ width: 160 }}
          options={categories.map((c) => ({ label: c, value: c }))}
        />
        <Select
          value={filterVeg}
          onChange={setFilterVeg}
          style={{ width: 130 }}
          options={[
            { label: "All", value: "all" },
            { label: "🥗 Veg Only", value: "veg" },
            { label: "🍗 Non-Veg Only", value: "nonveg" },
          ]}
        />
        <Text type="secondary" style={{ lineHeight: "32px" }}>
          {filtered.length} items
        </Text>
      </Flex>

      {viewMode === "table" ? (
        <Card style={{ borderRadius: 14 }}>
          <Table<MenuItem>
            rowKey="_id"
            loading={loading}
            dataSource={filtered}
            columns={tableColumns}
            pagination={{ pageSize: 15, showSizeChanger: true }}
            scroll={{ x: 800 }}
          />
        </Card>
      ) : (
        <Row gutter={[16, 16]}>
          {filtered.map((item) => (
            <Col xs={24} sm={12} md={8} lg={6} key={item._id}>
              <Card
                hoverable
                style={{ borderRadius: 14, overflow: "hidden" }}
                styles={{ body: { padding: 0 } }}
                cover={
                  item.imageUrl ? (
                    <img
                      src={item.imageUrl}
                      style={{ height: 140, objectFit: "cover", width: "100%" }}
                      alt={item.name}
                    />
                  ) : (
                    <Flex
                      align="center"
                      justify="center"
                      style={{
                        height: 100,
                        background: item.isVeg ? "#f6ffed" : "#fff1f0",
                      }}
                    >
                      <Text style={{ fontSize: 40 }}>
                        {item.isVeg ? "🥗" : "🍗"}
                      </Text>
                    </Flex>
                  )
                }
              >
                <div style={{ padding: "12px 14px" }}>
                  <Flex justify="space-between" align="flex-start">
                    <div>
                      <Flex gap={6} align="center">
                        <div
                          style={{
                            width: 10,
                            height: 10,
                            border: `2px solid ${item.isVeg ? "#52c41a" : "#ff4d4f"}`,
                            borderRadius: 2,
                            background: item.isVeg ? "#52c41a" : "#ff4d4f",
                          }}
                        />
                        <Text strong style={{ fontSize: 14 }}>
                          {item.name}
                        </Text>
                      </Flex>
                      <Text type="secondary" style={{ fontSize: 12 }}>
                        {item.category}
                      </Text>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <Text strong style={{ fontSize: 16, color: "#1677ff" }}>
                        {money(item.price)}
                      </Text>
                      {item.discount ? (
                        <Text
                          type="secondary"
                          style={{ fontSize: 11, display: "block" }}
                        >
                          {item.discount}% off
                        </Text>
                      ) : null}
                    </div>
                  </Flex>
                  {item.prepTime && (
                    <Text
                      type="secondary"
                      style={{ fontSize: 11, display: "block", marginTop: 4 }}
                    >
                      ⏱ {item.prepTime} min prep
                    </Text>
                  )}
                  <Divider style={{ margin: "10px 0 8px" }} />
                  <Flex justify="space-between" align="center">
                    <Switch
                      size="small"
                      checked={item.available}
                      onChange={() => handleToggleAvailability(item)}
                      checkedChildren="On"
                      unCheckedChildren="Off"
                    />
                    <Space>
                      <Button
                        size="small"
                        icon={<EditOutlined />}
                        onClick={() => openEdit(item)}
                      />
                      <Popconfirm
                        title="Delete?"
                        onConfirm={() => handleDelete(item._id)}
                      >
                        <Button size="small" danger icon={<DeleteOutlined />} />
                      </Popconfirm>
                    </Space>
                  </Flex>
                </div>
              </Card>
            </Col>
          ))}
        </Row>
      )}

      {/* Add/Edit Modal */}
      <Modal
        title={editingItem ? "Edit Menu Item" : "Add Menu Item"}
        open={modalOpen}
        onCancel={() => {
          setModalOpen(false);
          form.resetFields();
        }}
        onOk={handleSave}
        okText={editingItem ? "Save Changes" : "Add Item"}
        confirmLoading={saving}
        width={560}
      >
        <Form form={form} layout="vertical">
          <Row gutter={12}>
            <Col span={16}>
              <Form.Item
                name="name"
                label="Item Name"
                rules={[{ required: true }]}
              >
                <Input placeholder="e.g. Paneer Tikka" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="price"
                label="Price (₹)"
                rules={[{ required: true }]}
              >
                <InputNumber min={0} style={{ width: "100%" }} />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={12}>
            <Col span={12}>
              <Form.Item
                name="category"
                label="Category"
                rules={[{ required: true }]}
              >
                <Select
                  showSearch
                  allowClear
                  options={COMMON_CATEGORIES.map((c) => ({
                    label: c,
                    value: c,
                  }))}
                  placeholder="Select or type category"
                />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item name="prepTime" label="Prep Time (min)">
                <InputNumber min={0} style={{ width: "100%" }} />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item name="discount" label="Discount (%)">
                <InputNumber min={0} max={100} style={{ width: "100%" }} />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={12}>
            <Col span={8}>
              <Form.Item
                name="isVeg"
                label="Veg"
                valuePropName="checked"
                initialValue={true}
              >
                <Switch checkedChildren="Veg" unCheckedChildren="Non-Veg" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="available"
                label="Available"
                valuePropName="checked"
                initialValue={true}
              >
                <Switch checkedChildren="Yes" unCheckedChildren="No" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="spiceLevel" label="Spice Level">
                <Select
                  options={SPICE_LEVELS.map((s, i) => ({ label: s, value: i }))}
                  allowClear
                />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item name="description" label="Description">
            <Input.TextArea rows={2} placeholder="Item description" />
          </Form.Item>
          <Form.Item name="image" label="Image">
            <Upload
              listType="picture-card"
              maxCount={1}
              beforeUpload={() => false}
            >
              <div>
                <PlusOutlined />
                <div style={{ marginTop: 8 }}>Upload</div>
              </div>
            </Upload>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
