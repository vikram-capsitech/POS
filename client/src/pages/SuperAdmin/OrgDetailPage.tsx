import { useEffect, useState, useCallback } from "react";
import {
  Row,
  Col,
  Card,
  Typography,
  Button,
  Tag,
  Badge,
  Descriptions,
  Table,
  Modal,
  Form,
  Input,
  DatePicker,
  InputNumber,
  Space,
  Switch,
  Tabs,
  Statistic,
  Alert,
  App,
  Spin,
  Empty,
  Timeline,
} from "antd";
import type { TableColumnsType } from "antd";
import {
  ArrowLeftOutlined,
  MailOutlined,
  SettingOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  ExclamationCircleOutlined,
  DollarOutlined,
  UserOutlined,
  TeamOutlined,
  AppstoreOutlined,
} from "@ant-design/icons";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import {
  getOrgDetail,
  sendInvoiceEmail,
  updateOrgModules,
  updateOrganization,
} from "../../Api";
import dayjs from "dayjs";
import { useAppStore } from "../../Store/app.store";

const { Title, Text } = Typography;

const MODULE_CONFIG = [
  {
    key: "pos",
    label: "POS (Point of Sale)",
    desc: "Orders, tables, kitchen display, delivery",
    color: "#5240d6",
  },
  {
    key: "hrm",
    label: "HRM (Human Resources)",
    desc: "Attendance, leave, salary management",
    color: "#0284c7",
  },
  {
    key: "inventory",
    label: "Inventory",
    desc: "Stock management, purchase orders",
    color: "#059669",
  },
  {
    key: "payroll",
    label: "Payroll",
    desc: "Automated salary processing",
    color: "#d97706",
  },
  {
    key: "ai",
    label: "AI Review",
    desc: "AI-powered insights and reviews",
    color: "#db2777",
  },
];

type OrgDetail = {
  org: any;
  stats: { employeeCount: number; adminCount: number; roleCount: number };
  invoices: any[];
  lastInvoiceSent: string | null;
};

export default function OrgDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { showSnackbar } = useAppStore();

  const [data, setData] = useState<OrgDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(
    searchParams.get("tab") || "overview",
  );
  const [invoiceModalOpen, setInvoiceModalOpen] = useState(false);
  const [sendingInvoice, setSendingInvoice] = useState(false);
  const [togglingModule, setTogglingModule] = useState<string | null>(null);
  const [form] = Form.useForm();

  const fetchDetail = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const res: any = await getOrgDetail(id);
      const payload = res?.data?.data ?? res?.data;
      setData(payload);
    } catch {
      showSnackbar("Failed to load organization details", "error");
    } finally {
      setLoading(false);
    }
  }, [id, showSnackbar]);

  useEffect(() => {
    fetchDetail();
  }, [fetchDetail]);

  const handleModuleToggle = async (moduleKey: string, checked: boolean) => {
    if (!id) return;
    setTogglingModule(moduleKey);
    try {
      await updateOrgModules(id, { [moduleKey]: checked });
      setData((prev) =>
        prev
          ? {
              ...prev,
              org: {
                ...prev.org,
                modules: { ...prev.org.modules, [moduleKey]: checked },
              },
            }
          : prev,
      );
      const label = MODULE_CONFIG.find((m) => m.key === moduleKey)?.label.split(
        " ",
      )[0];
      showSnackbar(`${label} ${checked ? "enabled" : "disabled"}`, "success");
    } catch {
      showSnackbar("Failed to update module", "error");
    } finally {
      setTogglingModule(null);
    }
  };

  const handleSendInvoice = async (values: any) => {
    if (!id) return;
    setSendingInvoice(true);
    try {
      const payload = {
        invoiceAmount: values.amount,
        dueDate: values.dueDate
          ? dayjs(values.dueDate).toISOString()
          : undefined,
        notes: values.notes,
      };
      const res: any = await sendInvoiceEmail(id, payload);
      const sentTo =
        res?.data?.data?.adminEmail || res?.data?.adminEmail || "admin";
      showSnackbar(`Invoice sent to ${sentTo}!`, "success");
      setInvoiceModalOpen(false);
      form.resetFields();
      fetchDetail();
    } catch (err: any) {
      showSnackbar(
        err?.response?.data?.message || "Failed to send invoice",
        "error",
      );
    } finally {
      setSendingInvoice(false);
    }
  };

  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: 400,
        }}
      >
        <Spin size="large" />
      </div>
    );
  }

  if (!data) {
    return <Empty description="Organization not found" />;
  }

  const { org, stats, invoices } = data;
  const enabledModules = Object.entries(org.modules || {})
    .filter(([, v]) => v)
    .map(([k]) => k);

  const invoiceColumns: TableColumnsType<any> = [
    {
      title: "Sent At",
      dataIndex: "sentAt",
      render: (d) => dayjs(d).format("DD MMM YYYY, hh:mm A"),
      width: 180,
    },
    {
      title: "Amount",
      dataIndex: "amount",
      render: (v) => (v ? `₹${v.toLocaleString()}` : "—"),
      width: 120,
    },
    {
      title: "Due Date",
      dataIndex: "dueDate",
      render: (d) => {
        if (!d) return <Text type="secondary">—</Text>;
        const isPast = dayjs(d).isBefore(dayjs());
        return (
          <Tag color={isPast ? "error" : "warning"}>
            {dayjs(d).format("DD MMM YYYY")}
          </Tag>
        );
      },
      width: 140,
    },
    { title: "Sent To", dataIndex: "sentTo", width: 200 },
    { title: "Notes", dataIndex: "notes", ellipsis: true },
  ];

  const paymentStatus = (() => {
    if (!invoices.length)
      return {
        label: "No Invoices",
        color: "default",
        icon: <ClockCircleOutlined />,
      };
    const lastInvoice = invoices[invoices.length - 1];
    if (!lastInvoice.dueDate)
      return { label: "Paid", color: "success", icon: <CheckCircleOutlined /> };
    const isOverdue = dayjs(lastInvoice.dueDate).isBefore(dayjs());
    if (isOverdue)
      return {
        label: "Overdue",
        color: "error",
        icon: <ExclamationCircleOutlined />,
      };
    return {
      label: "Due Soon",
      color: "warning",
      icon: <ClockCircleOutlined />,
    };
  })();

  return (
    <div>
      {/* Top bar */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 16,
          marginBottom: 24,
        }}
      >
        <Button
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate("/superadmin/organizations")}
          style={{ borderRadius: 8 }}
        >
          Back to Organizations
        </Button>
        <div style={{ flex: 1 }}>
          <Title level={4} style={{ margin: 0 }}>
            {org.name}
          </Title>
          <Text type="secondary">{org.slug || org._id}</Text>
        </div>
        <Badge status={paymentStatus.color as any} text="" />
        <Tag
          color={paymentStatus.color}
          icon={paymentStatus.icon}
          style={{ borderRadius: 6, padding: "4px 10px" }}
        >
          {paymentStatus.label}
        </Tag>
        <Button
          type="primary"
          icon={<MailOutlined />}
          onClick={() => setInvoiceModalOpen(true)}
          style={{
            background: "#5240d6",
            borderColor: "#5240d6",
            borderRadius: 8,
          }}
        >
          Send Invoice
        </Button>
      </div>

      {/* Stats summary */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        {[
          {
            title: "Employees",
            value: stats.employeeCount,
            icon: <TeamOutlined />,
            color: "#5240d6",
          },
          {
            title: "Admins",
            value: stats.adminCount,
            icon: <UserOutlined />,
            color: "#0284c7",
          },
          {
            title: "Roles",
            value: stats.roleCount,
            icon: <SettingOutlined />,
            color: "#059669",
          },
          {
            title: "Active Modules",
            value: enabledModules.length,
            icon: <AppstoreOutlined />,
            color: "#d97706",
          },
          {
            title: "Invoices Sent",
            value: invoices.length,
            icon: <DollarOutlined />,
            color: "#db2777",
          },
        ].map((s) => (
          <Col xs={12} sm={8} md={6} lg={4} key={s.title}>
            <Card
              size="small"
              style={{ borderRadius: 10, border: `1px solid ${s.color}20` }}
              bodyStyle={{ padding: "14px 16px" }}
            >
              <Statistic
                title={
                  <Text type="secondary" style={{ fontSize: 11 }}>
                    {s.title}
                  </Text>
                }
                value={s.value}
                valueStyle={{ color: s.color, fontSize: 22, fontWeight: 800 }}
                prefix={s.icon}
              />
            </Card>
          </Col>
        ))}
      </Row>

      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        style={{ marginBottom: 0 }}
        items={[
          {
            key: "overview",
            label: "Overview",
            children: (
              <Row gutter={[20, 20]}>
                <Col xs={24} md={14}>
                  <Card
                    title="Organization Details"
                    style={{ borderRadius: 12 }}
                    bodyStyle={{ padding: "16px 20px" }}
                  >
                    <Descriptions column={1} size="small" bordered>
                      <Descriptions.Item label="Name">
                        {org.name}
                      </Descriptions.Item>
                      <Descriptions.Item label="Type">
                        <Tag style={{ textTransform: "capitalize" }}>
                          {org.type}
                        </Tag>
                      </Descriptions.Item>
                      <Descriptions.Item label="Contact Email">
                        {org.contactEmail || "—"}
                      </Descriptions.Item>
                      <Descriptions.Item label="Contact Phone">
                        {org.contactPhone || "—"}
                      </Descriptions.Item>
                      <Descriptions.Item label="Address">
                        {org.address || "—"}
                      </Descriptions.Item>
                      <Descriptions.Item label="Admin">
                        {org.ownedBy?.displayName || "—"}
                        {org.ownedBy?.email && (
                          <Text type="secondary" style={{ marginLeft: 8 }}>
                            ({org.ownedBy.email})
                          </Text>
                        )}
                      </Descriptions.Item>
                      <Descriptions.Item label="Status">
                        <Badge
                          status={org.isActive ? "success" : "error"}
                          text={org.isActive ? "Active" : "Inactive"}
                        />
                      </Descriptions.Item>
                      <Descriptions.Item label="Created">
                        {dayjs(org.createdAt).format("DD MMM YYYY")}
                      </Descriptions.Item>
                      <Descriptions.Item label="Last Invoice Sent">
                        {data.lastInvoiceSent
                          ? dayjs(data.lastInvoiceSent).format(
                              "DD MMM YYYY, hh:mm A",
                            )
                          : "Never"}
                      </Descriptions.Item>
                    </Descriptions>
                  </Card>
                </Col>
                <Col xs={24} md={10}>
                  <Card
                    title="Active Modules"
                    style={{ borderRadius: 12 }}
                    bodyStyle={{ padding: "16px 20px" }}
                  >
                    {enabledModules.length === 0 ? (
                      <Alert
                        message="No modules enabled for this organization"
                        type="warning"
                        showIcon
                      />
                    ) : (
                      <Space wrap>
                        {enabledModules.map((key) => {
                          const cfg = MODULE_CONFIG.find((m) => m.key === key);
                          return (
                            <Tag
                              key={key}
                              color={cfg?.color}
                              style={{
                                borderRadius: 6,
                                padding: "4px 12px",
                                fontSize: 13,
                              }}
                            >
                              {cfg?.label.split(" ")[0]}
                            </Tag>
                          );
                        })}
                      </Space>
                    )}
                  </Card>

                  {invoices.length > 0 && (
                    <Card
                      title="Invoice Timeline"
                      style={{ borderRadius: 12, marginTop: 16 }}
                      bodyStyle={{ padding: "16px 20px" }}
                    >
                      <Timeline
                        items={invoices
                          .slice(-5)
                          .reverse()
                          .map((inv: any) => ({
                            color:
                              inv.dueDate &&
                              dayjs(inv.dueDate).isBefore(dayjs())
                                ? "red"
                                : "blue",
                            children: (
                              <div>
                                <Text strong>
                                  ₹{inv.amount?.toLocaleString() || "0"}
                                </Text>
                                {" · "}
                                <Text type="secondary" style={{ fontSize: 12 }}>
                                  Sent {dayjs(inv.sentAt).format("DD MMM YYYY")}
                                </Text>
                                {inv.dueDate && (
                                  <div>
                                    <Tag
                                      color={
                                        dayjs(inv.dueDate).isBefore(dayjs())
                                          ? "error"
                                          : "warning"
                                      }
                                      style={{ marginTop: 4, fontSize: 11 }}
                                    >
                                      Due:{" "}
                                      {dayjs(inv.dueDate).format("DD MMM YYYY")}
                                    </Tag>
                                  </div>
                                )}
                              </div>
                            ),
                          }))}
                      />
                    </Card>
                  )}
                </Col>
              </Row>
            ),
          },
          {
            key: "modules",
            label: "Module Access",
            children: (
              <Card
                style={{ borderRadius: 12 }}
                bodyStyle={{ padding: "20px 24px" }}
              >
                <Title level={5} style={{ marginBottom: 4 }}>
                  Module Feature Control
                </Title>
                <Text
                  type="secondary"
                  style={{ marginBottom: 20, display: "block" }}
                >
                  Toggle which features this organization can access. Changes
                  take effect immediately.
                </Text>
                <Row gutter={[16, 16]}>
                  {MODULE_CONFIG.map((cfg) => {
                    const enabled = org.modules?.[cfg.key] ?? false;
                    return (
                      <Col xs={24} sm={12} key={cfg.key}>
                        <Card
                          size="small"
                          style={{
                            borderRadius: 10,
                            border: `1.5px solid ${enabled ? cfg.color + "60" : "#e8edf2"}`,
                            background: enabled ? cfg.color + "08" : "#fafbfc",
                            transition: "all 0.2s",
                          }}
                          bodyStyle={{ padding: "14px 18px" }}
                        >
                          <div
                            style={{
                              display: "flex",
                              alignItems: "flex-start",
                              justifyContent: "space-between",
                              gap: 12,
                            }}
                          >
                            <div>
                              <Text
                                strong
                                style={{
                                  display: "block",
                                  color: enabled ? cfg.color : "#374151",
                                  fontSize: 14,
                                }}
                              >
                                {cfg.label}
                              </Text>
                              <Text type="secondary" style={{ fontSize: 12 }}>
                                {cfg.desc}
                              </Text>
                            </div>
                            <Switch
                              checked={enabled}
                              loading={togglingModule === cfg.key}
                              onChange={(val) =>
                                handleModuleToggle(cfg.key, val)
                              }
                              style={{
                                backgroundColor: enabled
                                  ? cfg.color
                                  : undefined,
                                flexShrink: 0,
                              }}
                            />
                          </div>
                        </Card>
                      </Col>
                    );
                  })}
                </Row>
              </Card>
            ),
          },
          {
            key: "invoices",
            label: `Invoices (${invoices.length})`,
            children: (
              <Card
                style={{ borderRadius: 12 }}
                title="Invoice History"
                extra={
                  <Button
                    type="primary"
                    icon={<MailOutlined />}
                    onClick={() => setInvoiceModalOpen(true)}
                    style={{
                      background: "#5240d6",
                      borderColor: "#5240d6",
                      borderRadius: 8,
                    }}
                  >
                    Send Invoice
                  </Button>
                }
              >
                {invoices.length === 0 ? (
                  <Empty
                    description="No invoices sent yet"
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                  >
                    <Button
                      type="primary"
                      icon={<MailOutlined />}
                      onClick={() => setInvoiceModalOpen(true)}
                      style={{ background: "#5240d6" }}
                    >
                      Send First Invoice
                    </Button>
                  </Empty>
                ) : (
                  <Table
                    columns={invoiceColumns}
                    dataSource={[...invoices].reverse()}
                    rowKey={(_, i) => String(i)}
                    size="small"
                    pagination={{ pageSize: 10 }}
                  />
                )}
              </Card>
            ),
          },
          {
            key: "settings",
            label: "Settings",
            children: <OrgSettingsTab org={org} onRefresh={fetchDetail} />,
          },
        ]}
      />

      {/* Send Invoice Modal */}
      <Modal
        title={
          <Space>
            <MailOutlined style={{ color: "#5240d6" }} />
            <span>Send Invoice to {org.name}</span>
          </Space>
        }
        open={invoiceModalOpen}
        onCancel={() => {
          setInvoiceModalOpen(false);
          form.resetFields();
        }}
        footer={null}
        width={480}
      >
        <Alert
          message={`Invoice will be sent to: ${org.contactEmail || org.ownedBy?.email || "No email on record"}`}
          type="info"
          showIcon
          style={{ marginBottom: 16 }}
        />
        <Form form={form} layout="vertical" onFinish={handleSendInvoice}>
          <Form.Item label="Invoice Amount (₹)" name="amount">
            <InputNumber
              min={0}
              style={{ width: "100%" }}
              formatter={(v) => `₹ ${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
              placeholder="e.g. 9999"
            />
          </Form.Item>
          <Form.Item label="Due Date" name="dueDate">
            <DatePicker
              style={{ width: "100%" }}
              disabledDate={(d) => d && d.isBefore(dayjs())}
            />
          </Form.Item>
          <Form.Item label="Notes" name="notes">
            <Input.TextArea
              rows={3}
              placeholder="Add any notes for this invoice…"
            />
          </Form.Item>
          <Form.Item style={{ marginBottom: 0 }}>
            <Space style={{ width: "100%", justifyContent: "flex-end" }}>
              <Button
                onClick={() => {
                  setInvoiceModalOpen(false);
                  form.resetFields();
                }}
              >
                Cancel
              </Button>
              <Button
                type="primary"
                htmlType="submit"
                loading={sendingInvoice}
                icon={<MailOutlined />}
                style={{ background: "#5240d6", borderColor: "#5240d6" }}
              >
                Send Invoice
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}

// ── Org Settings Tab ────────────────────────────────────────────────────────────

function OrgSettingsTab({
  org,
  onRefresh,
}: {
  org: any;
  onRefresh: () => void;
}) {
  const { message } = App.useApp();
  const [form] = Form.useForm();
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    form.setFieldsValue({
      name: org.name,
      type: org.type,
      contactEmail: org.contactEmail,
      contactPhone: org.contactPhone,
      address: org.address,
      isActive: org.isActive,
    });
  }, [org, form]);

  const handleSave = async (values: any) => {
    setSaving(true);
    try {
      await updateOrganization(org._id, values);
      message.success("Organization updated");
      onRefresh();
    } catch {
      message.error("Failed to update organization");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card style={{ borderRadius: 12 }} bodyStyle={{ padding: "20px 24px" }}>
      <Title level={5} style={{ marginBottom: 16 }}>
        Edit Organization Settings
      </Title>
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSave}
        style={{ maxWidth: 560 }}
      >
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item label="Name" name="name" rules={[{ required: true }]}>
              <Input />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="Type" name="type">
              <Input placeholder="restaurant / retail / hospital…" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="Contact Email" name="contactEmail">
              <Input type="email" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="Contact Phone" name="contactPhone">
              <Input />
            </Form.Item>
          </Col>
          <Col span={24}>
            <Form.Item label="Address" name="address">
              <Input.TextArea rows={2} />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="Status" name="isActive" valuePropName="checked">
              <Switch checkedChildren="Active" unCheckedChildren="Inactive" />
            </Form.Item>
          </Col>
        </Row>
        <Form.Item>
          <Button
            type="primary"
            htmlType="submit"
            loading={saving}
            style={{ background: "#5240d6", borderColor: "#5240d6" }}
          >
            Save Changes
          </Button>
        </Form.Item>
      </Form>
    </Card>
  );
}
