import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Avatar,
  Badge,
  Button,
  Card,
  Col,
  Divider,
  Empty,
  Flex,
  Row,
  Select,
  Skeleton,
  Space,
  Statistic,
  Tag,
  Timeline,
  Tooltip,
  Typography,
  message,
  theme,
} from "antd";
import {
  AuditOutlined,
  CalendarOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  FileTextOutlined,
  PlusOutlined,
  ReloadOutlined,
  RocketOutlined,
  TeamOutlined,
  ThunderboltOutlined,
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
  Tooltip as RTooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { fetchAdminDashboard, hrmCreateRequest } from "../../Api/index";
import { requestHandler } from "../../Utils/index";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { useAuthStore } from "../../Store/store";

dayjs.extend(relativeTime);

const { Title, Text } = Typography;
const { Option } = Select;
const { useToken } = theme;

// ── Types ────────────────────────────────────────────────────────────────────

type OrgStat = {
  org: {
    _id: string;
    name: string;
    type?: string;
    logo?: string;
    slug?: string;
    modules?: Record<string, boolean>;
    isActive?: boolean;
    ownedBy?: { displayName?: string; email?: string };
    contactEmail?: string;
    contactPhone?: string;
  };
  tasks: {
    total: number;
    byStatus: Record<string, number>;
    byPriority: Record<string, number>;
  };
  employees: number;
  todayAttendance: number;
  pendingLeaves: number;
  pos: {
    totalOrders: number;
    totalRevenue: number;
    completedOrders: number;
  };
  recentActivity: Array<{
    _id: string;
    action: string;
    module?: string;
    userID?: { displayName?: string; userName?: string };
    createdAt: string;
  }>;
};

type DashboardData = {
  orgs: OrgStat[];
  totals: {
    totalEmployees: number;
    totalTasks: number;
    totalPendingLeaves: number;
    totalTodayAttendance: number;
    totalRevenue: number;
    totalOrders: number;
  };
  orgCount: number;
};

// ── Semantic chart colours (kept — these are meaningful indicators) ───────────

const STATUS_COLORS: Record<string, string> = {
  Pending:     "#faad14",
  "In Progress": "#1677ff",
  Completed:   "#52c41a",
  Rejected:    "#ff4d4f",
};

const PRIORITY_COLORS: Record<string, string> = {
  Low:      "#95de64",
  Medium:   "#ffd666",
  High:     "#ff7a45",
  Critical: "#f5222d",
};

// ── Helpers ──────────────────────────────────────────────────────────────────

const fmtCurrency = (n: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 0,
  }).format(n);

const orgInitials = (name: string) =>
  name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join("");

const actionLabel = (a: string) =>
  a.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

// ── Stat Card (theme-synced) ──────────────────────────────────────────────────

const StatCard: React.FC<{
  title: string;
  value: number | string;
  icon: React.ReactNode;
  accentColor: string;
  suffix?: string;
}> = ({ title, value, icon, accentColor, suffix }) => {
  const { token } = useToken();
  return (
    <Card
      style={{
        borderRadius: 14,
        border: `1.5px solid ${token.colorBorderSecondary}`,
        background: token.colorBgContainer,
        overflow: "hidden",
        position: "relative",
      }}
      styles={{ body: { padding: "18px 22px" } }}
    >
      {/* left accent bar */}
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          bottom: 0,
          width: 4,
          background: accentColor,
          borderRadius: "14px 0 0 14px",
        }}
      />
      <div style={{ marginLeft: 8 }}>
        <Flex justify="space-between" align="flex-start">
          <Statistic
            title={
              <Text type="secondary" style={{ fontSize: 12, fontWeight: 600 }}>
                {title}
              </Text>
            }
            value={value}
            suffix={suffix}
            valueStyle={{ color: token.colorText, fontSize: 26, fontWeight: 800 }}
          />
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: 10,
              background: `${accentColor}18`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 18,
              color: accentColor,
              flexShrink: 0,
            }}
          >
            {icon}
          </div>
        </Flex>
      </div>
    </Card>
  );
};

// ── Task Donut Chart ─────────────────────────────────────────────────────────

const TaskDonut: React.FC<{ byStatus: Record<string, number> }> = ({ byStatus }) => {
  const data = Object.entries(byStatus)
    .filter(([, v]) => v > 0)
    .map(([k, v]) => ({ name: k, value: v }));

  if (!data.length)
    return (
      <Flex align="center" justify="center" style={{ height: 180 }}>
        <Text type="secondary" style={{ fontSize: 12 }}>No tasks yet</Text>
      </Flex>
    );

  return (
    <ResponsiveContainer width="100%" height={180}>
      <PieChart>
        <Pie data={data} cx="50%" cy="50%" innerRadius={50} outerRadius={75} paddingAngle={3} dataKey="value">
          {data.map((entry) => (
            <Cell key={entry.name} fill={STATUS_COLORS[entry.name] ?? "#ccc"} />
          ))}
        </Pie>
        <RTooltip />
        <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11 }} />
      </PieChart>
    </ResponsiveContainer>
  );
};

// ── Task Priority Bar ─────────────────────────────────────────────────────────

const PriorityBar: React.FC<{ byPriority: Record<string, number> }> = ({ byPriority }) => {
  const data = ["Low", "Medium", "High", "Critical"].map((p) => ({
    name: p,
    count: byPriority[p] ?? 0,
  }));

  return (
    <ResponsiveContainer width="100%" height={160}>
      <BarChart data={data} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" />
        <XAxis dataKey="name" tick={{ fontSize: 11 }} />
        <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
        <RTooltip />
        <Bar dataKey="count" radius={[4, 4, 0, 0]}>
          {data.map((entry) => (
            <Cell key={entry.name} fill={PRIORITY_COLORS[entry.name] ?? "#ccc"} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
};

// ── Quick Actions ─────────────────────────────────────────────────────────────

const QuickActions: React.FC<{ orgId: string }> = ({ orgId }) => {
  const navigate = useNavigate();
  const { token } = useToken();

  const actions = [
    { label: "Create Task",    icon: <PlusOutlined />,        onClick: () => navigate(`/client/${orgId}/task/new`) },
    { label: "View Tasks",     icon: <RocketOutlined />,      onClick: () => navigate(`/client/${orgId}/task`) },
    { label: "SOP",            icon: <FileTextOutlined />,    onClick: () => navigate(`/client/${orgId}/sop`) },
    { label: "Activity Logs",  icon: <AuditOutlined />,       onClick: () => navigate(`/client/${orgId}/logs`) },
    { label: "Attendance",     icon: <CalendarOutlined />,    onClick: () => navigate(`/client/${orgId}/attendance`) },
    { label: "Requests",       icon: <ThunderboltOutlined />, onClick: () => navigate(`/client/${orgId}/request`) },
    { label: "Vouchers",       icon: <TeamOutlined />,        onClick: () => navigate(`/client/${orgId}/voucher`) },
  ];

  return (
    <Flex gap={8} wrap="wrap">
      {actions.map((a) => (
        <Tooltip key={a.label} title={a.label}>
          <Button
            onClick={a.onClick}
            style={{
              borderRadius: 10,
              borderColor: token.colorPrimary,
              color: token.colorPrimary,
              fontWeight: 600,
              fontSize: 12,
            }}
            icon={a.icon}
          >
            {a.label}
          </Button>
        </Tooltip>
      ))}
    </Flex>
  );
};

// ── Org Card ──────────────────────────────────────────────────────────────────

const OrgCard: React.FC<{ data: OrgStat }> = ({ data }) => {
  const { token } = useToken();
  const { org, tasks, employees, todayAttendance, pendingLeaves, pos, recentActivity } = data;
  const hasPOS = org.modules?.pos;

  // Single-colour banner derived from theme primary (not random multi-colour)
  const bannerBg = `linear-gradient(135deg, ${token.colorPrimaryActive} 0%, ${token.colorPrimary} 60%, ${token.colorPrimaryHover} 100%)`;

  return (
    <Card
      style={{ borderRadius: 16, marginBottom: 24, overflow: "hidden", border: `1px solid ${token.colorBorderSecondary}` }}
      styles={{ body: { padding: 0 } }}
    >
      {/* ── Org Header Banner ── */}
      <div style={{ background: bannerBg, padding: "20px 24px" }}>
        <Flex justify="space-between" align="flex-start" wrap="wrap" gap={12}>
          <Flex gap={14} align="center">
            {org.logo ? (
              <Avatar src={org.logo} size={52} style={{ border: "2px solid rgba(255,255,255,0.4)" }} />
            ) : (
              <Avatar
                style={{
                  background: "rgba(255,255,255,0.25)", color: "#fff", fontWeight: 700,
                  fontSize: 18, border: "2px solid rgba(255,255,255,0.4)", width: 52, height: 52, lineHeight: "52px",
                }}
              >
                {orgInitials(org.name)}
              </Avatar>
            )}
            <Space direction="vertical" size={2}>
              <Flex gap={8} align="center">
                <Title level={5} style={{ margin: 0, color: "#fff" }}>{org.name}</Title>
                {org.isActive === false ? (
                  <Tag color="default">Inactive</Tag>
                ) : (
                  <Tag color="success">Active</Tag>
                )}
              </Flex>
              <Text style={{ color: "rgba(255,255,255,0.8)", fontSize: 12 }}>
                {org.type?.toUpperCase()} {org.slug ? `• ${org.slug}` : ""}
              </Text>
              <Flex gap={4} wrap="wrap" style={{ marginTop: 4 }}>
                {Object.entries(org.modules ?? {})
                  .filter(([, v]) => v)
                  .map(([k]) => (
                    <Tag key={k} style={{ fontSize: 10, margin: 0, background: "rgba(255,255,255,0.2)", color: "#fff", border: "none" }}>
                      {k.toUpperCase()}
                    </Tag>
                  ))}
              </Flex>
            </Space>
          </Flex>

          {/* Stats chips on banner */}
          <Flex gap={16} wrap="wrap">
            {[
              { label: "Employees",      value: employees,      icon: <TeamOutlined /> },
              { label: "Checked In",     value: todayAttendance, icon: <CheckCircleOutlined /> },
              { label: "Pending Leaves", value: pendingLeaves,  icon: <ClockCircleOutlined /> },
            ].map((s) => (
              <Space
                key={s.label}
                direction="vertical"
                size={0}
                style={{
                  background: "rgba(255,255,255,0.18)", borderRadius: 10,
                  padding: "8px 14px", minWidth: 70, textAlign: "center",
                }}
              >
                <Text style={{ color: "rgba(255,255,255,0.8)", fontSize: 11 }}>{s.label}</Text>
                <Text style={{ color: "#fff", fontWeight: 700, fontSize: 20 }}>{s.value}</Text>
              </Space>
            ))}
          </Flex>
        </Flex>
      </div>

      {/* ── Body ── */}
      <div style={{ padding: "20px 24px", background: token.colorBgContainer }}>
        {/* Quick Actions */}
        <div style={{ marginBottom: 20 }}>
          <Text type="secondary" style={{ fontSize: 12, fontWeight: 600, display: "block", marginBottom: 10 }}>
            QUICK ACTIONS
          </Text>
          <QuickActions orgId={org._id} />
        </div>

        <Divider style={{ margin: "0 0 20px" }} />

        <Row gutter={[16, 16]}>
          {/* Task Status Donut */}
          <Col xs={24} md={8}>
            <Flex justify="space-between" align="center" style={{ marginBottom: 8 }}>
              <Text strong style={{ fontSize: 13 }}>Task Status</Text>
              <Badge count={tasks.total} showZero style={{ backgroundColor: token.colorPrimary }} />
            </Flex>
            <TaskDonut byStatus={tasks.byStatus} />
            <Flex gap={6} wrap="wrap" justify="center" style={{ marginTop: 6 }}>
              {Object.entries(tasks.byStatus).map(([k, v]) => (
                <Space key={k} size={3}>
                  <div style={{ width: 8, height: 8, borderRadius: "50%", background: STATUS_COLORS[k] }} />
                  <Text style={{ fontSize: 11 }}>{k}: <strong>{v}</strong></Text>
                </Space>
              ))}
            </Flex>
          </Col>

          {/* Task Priority Bar */}
          <Col xs={24} md={8}>
            <Text strong style={{ fontSize: 13, display: "block", marginBottom: 8 }}>Task Priority</Text>
            <PriorityBar byPriority={tasks.byPriority} />
          </Col>

          {/* POS + Recent Activity */}
          <Col xs={24} md={8}>
            {hasPOS ? (
              <>
                <Text strong style={{ fontSize: 13, display: "block", marginBottom: 8 }}>POS (Last 30 Days)</Text>
                <Space direction="vertical" size={10} style={{ width: "100%" }}>
                  <Flex gap={8}>
                    {/* Revenue card */}
                    <Card
                      size="small"
                      style={{ flex: 1, borderRadius: 10, background: token.colorPrimaryBg, border: `1.5px solid ${token.colorPrimaryBorder}` }}
                      styles={{ body: { padding: "12px 14px" } }}
                    >
                      <Text style={{ color: token.colorPrimaryText, fontSize: 11, fontWeight: 600 }}>Revenue</Text>
                      <Title level={5} style={{ color: token.colorPrimary, margin: 0 }}>
                        {fmtCurrency(pos.totalRevenue)}
                      </Title>
                    </Card>
                    {/* Orders card */}
                    <Card
                      size="small"
                      style={{ flex: 1, borderRadius: 10, background: token.colorSuccessBg, border: `1.5px solid ${token.colorSuccessBorder}` }}
                      styles={{ body: { padding: "12px 14px" } }}
                    >
                      <Text style={{ color: token.colorSuccessText, fontSize: 11, fontWeight: 600 }}>Orders</Text>
                      <Title level={5} style={{ color: token.colorSuccess, margin: 0 }}>{pos.totalOrders}</Title>
                    </Card>
                  </Flex>
                  <div
                    style={{
                      padding: "8px 12px",
                      background: token.colorFillQuaternary,
                      borderRadius: 10, fontSize: 12, textAlign: "center",
                    }}
                  >
                    <Text type="secondary">Completed orders: </Text>
                    <Text strong>{pos.completedOrders}</Text>
                    {pos.totalOrders > 0 && (
                      <Text type="secondary"> ({Math.round((pos.completedOrders / pos.totalOrders) * 100)}%)</Text>
                    )}
                  </div>
                </Space>
              </>
            ) : (
              <div style={{ padding: "12px 0" }}>
                <Text type="secondary" style={{ fontSize: 12 }}>POS module not enabled</Text>
              </div>
            )}

            {/* Recent Activity */}
            <div style={{ marginTop: 16 }}>
              <Text strong style={{ fontSize: 13, display: "block", marginBottom: 10 }}>Recent Activity</Text>
              {recentActivity.length === 0 ? (
                <Text type="secondary" style={{ fontSize: 12 }}>No recent activity</Text>
              ) : (
                <Timeline
                  style={{ fontSize: 12 }}
                  items={recentActivity.map((log) => ({
                    dot: <ClockCircleOutlined style={{ fontSize: 10 }} />,
                    children: (
                      <div>
                        <Text style={{ fontSize: 12 }}>{actionLabel(log.action)}</Text>
                        <Text type="secondary" style={{ fontSize: 11, display: "block" }}>
                          {log.userID?.displayName ?? log.userID?.userName ?? "System"} · {dayjs(log.createdAt).fromNow()}
                        </Text>
                      </div>
                    ),
                  }))}
                />
              )}
            </div>
          </Col>
        </Row>
      </div>
    </Card>
  );
};

// tiny helper to avoid JSX-in-expression issues for currency
const fmtCurrencyText: React.FC<{ value: number }> = ({ value }) => <>{fmtCurrency(value)}</>;

// ── Main Dashboard ────────────────────────────────────────────────────────────

export default function OrganizationDashboard() {
  const { token } = useToken();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(false);
  const [requestLoading, setRequestLoading] = useState(false);
  const [selectedOrgId, setSelectedOrgId] = useState<string | undefined>();

  const navigate = useNavigate();
  const session = useAuthStore((s) => s.session);
  const isEmployee = session.role !== "superadmin" && session.role !== "admin";
  const hasPos = session.modules?.includes("POS") || session.modules?.includes("pos");
  const orgId = session.restaurantId;

  // Redirect employees with POS access to the right POS page
  useEffect(() => {
    if (isEmployee && hasPos && orgId) {
      const roleName = session.orgAccess?.[orgId]?.roleName?.toLowerCase() || "";
      if (roleName === "waiter")       navigate(`/pos/${orgId}/waiter`,    { replace: true });
      else if (roleName === "kitchen") navigate(`/pos/${orgId}/kitchen`,   { replace: true });
      else                            navigate(`/pos/${orgId}/dashboard`,  { replace: true });
    }
  }, [isEmployee, hasPos, orgId, navigate, session.orgAccess]);

  const loadDashboard = useCallback((id?: string) => {
    if (isEmployee) return;
    requestHandler(
      () => fetchAdminDashboard(id ? { orgId: id } : undefined) as any,
      setLoading,
      (res: any) => setData(res?.data ?? res),
      (err: any) => message.error(err || "Failed to load dashboard"),
    );
  }, [isEmployee]);

  useEffect(() => { if (!isEmployee) loadDashboard(); }, [loadDashboard, isEmployee]);

  const handleOrgFilter = (val: string | undefined) => { setSelectedOrgId(val); loadDashboard(val); };

  const handleRequestAccess = async (moduleName: string) => {
    try {
      setRequestLoading(true);
      await hrmCreateRequest({
        title: `Access Request: ${moduleName}`,
        description: `User requested access to the ${moduleName} module.`,
        requestType: "Support",
        raisedBy: "user",
        priority: "Low",
      });
      message.success(`Request for ${moduleName} access sent to admins!`);
    } catch (err: any) {
      message.error(err?.response?.data?.message || "Failed to send request");
    } finally {
      setRequestLoading(false);
    }
  };

  // ── Employee Fallback View ────────────────────────────────────────────────
  if (isEmployee && !hasPos) {
    const modules = session.organization?.modules || {};
    const availableModules = Object.entries(modules).filter(([, enabled]) => enabled).map(([key]) => key);

    return (
      <div style={{ padding: "20px 24px", minHeight: "100vh", background: token.colorBgLayout }}>
        <Flex justify="space-between" align="center" wrap="wrap" gap={12} style={{ marginBottom: 20 }}>
          <Space direction="vertical" size={2}>
            <Title level={4} style={{ margin: 0 }}>Good to see you 👋</Title>
            <Text type="secondary">Your account has limited access. Request access to modules below.</Text>
          </Space>
        </Flex>
        <Row gutter={[16, 16]}>
          {availableModules.length === 0 ? (
            <Col xs={24}><Empty description="No modules enabled for this organization" /></Col>
          ) : (
            availableModules.map((mod) => (
              <Col xs={24} sm={12} md={8} lg={6} key={mod}>
                <Card hoverable style={{ borderRadius: 12 }}
                  actions={[
                    <Button type="primary" loading={requestLoading} onClick={() => handleRequestAccess(mod)}
                      style={{ borderRadius: 6, fontWeight: 600 }}>
                      Request Access
                    </Button>,
                  ]}
                >
                  <Card.Meta
                    avatar={<Avatar style={{ background: token.colorPrimary }}>{mod.substring(0, 2).toUpperCase()}</Avatar>}
                    title={<span style={{ textTransform: "capitalize" }}>{mod} Module</span>}
                    description={`Click below to request access to ${mod}.`}
                  />
                </Card>
              </Col>
            ))
          )}
        </Row>
      </div>
    );
  }

  const displayedOrgs = useMemo(() => data?.orgs ?? [], [data]);
  const totals = data?.totals;
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  // Semantic accent colours for the 6 stat cards (tied to meaning, not decoration)
  const statAccents = {
    employees:   token.colorPrimary,
    tasks:       token.colorInfo,
    attendance:  token.colorSuccess,
    leaves:      token.colorWarning,
    posOrders:   token.colorError,
    posRevenue:  token.colorPrimary,
  };

  return (
    <div style={{ padding: "20px 24px", minHeight: "100vh", background: token.colorBgLayout }}>
      {/* ── Header ── */}
      <Flex justify="space-between" align="center" wrap="wrap" gap={12} style={{ marginBottom: 20 }}>
        <Space direction="vertical" size={2}>
          <Title level={4} style={{ margin: 0 }}>{greeting}👋</Title>
          <Text type="secondary">
            Organization Dashboard · {data?.orgCount ?? 0} organization{data?.orgCount === 1 ? "" : "s"}
          </Text>
        </Space>
        <Flex gap={10} wrap="wrap" align="center">
          <Select
            placeholder="All Organizations"
            value={selectedOrgId}
            onChange={handleOrgFilter}
            allowClear
            style={{ width: 220, borderRadius: 8 }}
            loading={loading}
          >
            {displayedOrgs.map((d) => (
              <Option key={d.org._id} value={d.org._id}>
                <Flex gap={8} align="center">
                  {d.org.logo ? (
                    <Avatar src={d.org.logo} size={18} />
                  ) : (
                    <Avatar size={18} style={{ fontSize: 9, background: token.colorPrimary }}>
                      {orgInitials(d.org.name)}
                    </Avatar>
                  )}
                  <Text style={{ fontSize: 13 }}>{d.org.name}</Text>
                </Flex>
              </Option>
            ))}
          </Select>
          <Button icon={<ReloadOutlined />} onClick={() => loadDashboard(selectedOrgId)} loading={loading} style={{ borderRadius: 8 }}>
            Refresh
          </Button>
        </Flex>
      </Flex>

      {/* ── Global KPI Row ── */}
      {loading && !data ? (
        <Row gutter={[16, 16]} style={{ marginBottom: 20 }}>
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Col key={i} xs={24} sm={12} lg={4}>
              <Card style={{ borderRadius: 14 }}><Skeleton active paragraph={false} /></Card>
            </Col>
          ))}
        </Row>
      ) : totals ? (
        <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
          <Col xs={24} sm={12} lg={4}>
            <StatCard title="Total Employees"  value={totals.totalEmployees}      icon={<TeamOutlined />}         accentColor={statAccents.employees} />
          </Col>
          <Col xs={24} sm={12} lg={4}>
            <StatCard title="Total Tasks"       value={totals.totalTasks}           icon={<RocketOutlined />}       accentColor={statAccents.tasks} />
          </Col>
          <Col xs={24} sm={12} lg={4}>
            <StatCard title="Checked In Today"  value={totals.totalTodayAttendance} icon={<CheckCircleOutlined />}  accentColor={statAccents.attendance} />
          </Col>
          <Col xs={24} sm={12} lg={4}>
            <StatCard title="Pending Leaves"    value={totals.totalPendingLeaves}   icon={<ClockCircleOutlined />}  accentColor={statAccents.leaves} />
          </Col>
          <Col xs={24} sm={12} lg={4}>
            <StatCard title="POS Orders (30d)"  value={totals.totalOrders}          icon={<ThunderboltOutlined />}  accentColor={statAccents.posOrders} />
          </Col>
          <Col xs={24} sm={12} lg={4}>
            <StatCard title="POS Revenue (30d)" value={fmtCurrency(totals.totalRevenue)} icon={<AuditOutlined />} accentColor={statAccents.posRevenue} />
          </Col>
        </Row>
      ) : null}

      {/* ── Per-Org Cards ── */}
      {loading && displayedOrgs.length === 0 ? (
        <Card style={{ borderRadius: 16 }}><Skeleton active paragraph={{ rows: 6 }} /></Card>
      ) : displayedOrgs.length === 0 ? (
        <Empty description="No organizations found" style={{ padding: 48 }} />
      ) : (
        displayedOrgs.map((d) => (
          <OrgCard key={d.org._id} data={d} />
        ))
      )}
    </div>
  );
}
