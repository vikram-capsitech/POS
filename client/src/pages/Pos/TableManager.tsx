import React, { useCallback, useEffect, useState } from "react";
import {
  Button,
  Card,
  Col,
  Form,
  Input,
  InputNumber,
  Modal,
  Popconfirm,
  Row,
  Select,
  Space,
  Tag,
  Typography,
  message,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import { getTables, createTable, updateTable, deleteTable } from "../../Api";
import { useParams } from "react-router-dom";

const { Title, Text } = Typography;

const STATUS_COLORS: Record<string, string> = {
  available: "green",
  occupied: "red",
  reserved: "orange",
  billing: "blue",
  cleaning: "purple",
};

const FLOORS = ["Ground", "First", "Second", "Third", "Terrace"];
const SHAPES = ["square", "round", "rectangle"];

type TableItem = {
  _id: string;
  number: number;
  seats: number;
  floor?: string;
  shape?: string;
  status: string;
};

export default function TableManager() {
  const { orgId } = useParams();
  const [tables, setTables] = useState<TableItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<TableItem | null>(null);
  const [saving, setSaving] = useState(false);
  const [form] = Form.useForm();

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res: any = await getTables();
      setTables(res?.data?.data ?? res?.data ?? []);
    } catch {
      message.error("Failed to load tables");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const openAdd = () => {
    setEditingItem(null);
    form.resetFields();
    form.setFieldsValue({ floor: "Ground", shape: "square" });
    setModalOpen(true);
  };

  const openEdit = (item: TableItem) => {
    setEditingItem(item);
    form.setFieldsValue({ ...item });
    setModalOpen(true);
  };

  const handleSave = async () => {
    const values = await form.validateFields();
    setSaving(true);
    try {
      if (editingItem) {
        await updateTable(editingItem._id, values);
        message.success("Table updated");
      } else {
        await createTable(values);
        message.success("Table created");
      }
      setModalOpen(false);
      load();
    } catch (err: any) {
      message.error(err?.response?.data?.message || "Failed to save table");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteTable(id);
      message.success("Table deleted");
      load();
    } catch (err: any) {
      message.error(err?.response?.data?.message || "Failed to delete table");
    }
  };

  return (
    <div style={{ padding: 24 }}>
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 24,
        }}
      >
        <div>
          <Title level={4} style={{ margin: 0 }}>
            Table Manager
          </Title>
          <Text type="secondary">{tables.length} tables configured</Text>
        </div>
        <Button type="primary" icon={<PlusOutlined />} onClick={openAdd}>
          Add Table
        </Button>
      </div>

      {/* Table Cards */}
      <Row gutter={[16, 16]}>
        {loading
          ? Array.from({ length: 6 }).map((_, i) => (
              <Col key={i} xs={12} sm={8} md={6} lg={4}>
                <Card loading style={{ borderRadius: 12 }} />
              </Col>
            ))
          : tables.map((table) => (
              <Col key={table._id} xs={12} sm={8} md={6} lg={4}>
                <Card
                  style={{ borderRadius: 12, textAlign: "center" }}
                  bodyStyle={{ padding: "16px 12px" }}
                  actions={[
                    <EditOutlined
                      key="edit"
                      onClick={() => openEdit(table)}
                    />,
                    <Popconfirm
                      key="delete"
                      title="Delete this table?"
                      onConfirm={() => handleDelete(table._id)}
                      okText="Delete"
                      okButtonProps={{ danger: true }}
                    >
                      <DeleteOutlined style={{ color: "#ff4d4f" }} />
                    </Popconfirm>,
                  ]}
                >
                  <div
                    style={{
                      width: 52,
                      height: 52,
                      borderRadius: table.shape === "round" ? "50%" : 8,
                      background: "#f5f5f5",
                      border: "2px solid #e8e8e8",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      margin: "0 auto 10px",
                    }}
                  >
                    <Text strong style={{ fontSize: 18 }}>
                      {table.number}
                    </Text>
                  </div>
                  <Text strong style={{ display: "block" }}>
                    Table {table.number}
                  </Text>
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    {table.seats} seats
                    {table.floor ? ` · ${table.floor}` : ""}
                  </Text>
                  <div style={{ marginTop: 8 }}>
                    <Tag
                      color={STATUS_COLORS[table.status] ?? "default"}
                      style={{ borderRadius: 6, textTransform: "capitalize" }}
                    >
                      {table.status}
                    </Tag>
                  </div>
                </Card>
              </Col>
            ))}
      </Row>

      {!loading && tables.length === 0 && (
        <div style={{ textAlign: "center", padding: "60px 0" }}>
          <Text type="secondary">No tables yet. Add your first table.</Text>
        </div>
      )}

      {/* Add / Edit Modal */}
      <Modal
        open={modalOpen}
        title={editingItem ? "Edit Table" : "Add Table"}
        onCancel={() => setModalOpen(false)}
        onOk={handleSave}
        okText={editingItem ? "Update" : "Create"}
        confirmLoading={saving}
        destroyOnClose
      >
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
          <Space style={{ width: "100%" }} size={16}>
            <Form.Item
              name="number"
              label="Table Number"
              rules={[{ required: true, message: "Required" }]}
              style={{ flex: 1, marginBottom: 12 }}
            >
              <InputNumber
                min={1}
                style={{ width: "100%" }}
                placeholder="e.g. 1"
              />
            </Form.Item>
            <Form.Item
              name="seats"
              label="Seats"
              rules={[{ required: true, message: "Required" }]}
              style={{ flex: 1, marginBottom: 12 }}
            >
              <InputNumber
                min={1}
                max={20}
                style={{ width: "100%" }}
                placeholder="e.g. 4"
              />
            </Form.Item>
          </Space>
          <Form.Item name="floor" label="Floor" style={{ marginBottom: 12 }}>
            <Select placeholder="Select floor">
              {FLOORS.map((f) => (
                <Select.Option key={f} value={f}>
                  {f}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item name="shape" label="Shape" style={{ marginBottom: 0 }}>
            <Select placeholder="Select shape">
              {SHAPES.map((s) => (
                <Select.Option key={s} value={s}>
                  {s.charAt(0).toUpperCase() + s.slice(1)}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
