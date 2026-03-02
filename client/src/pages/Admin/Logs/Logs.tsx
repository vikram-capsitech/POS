import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Badge,
  Button,
  Card,
  Col,
  DatePicker,
  Divider,
  Empty,
  Flex,
  Input,
  Pagination,
  Row,
  Select,
  Skeleton,
  Space,
  Statistic,
  Table,
  Tag,
  Tooltip,
  Typography,
  message,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import {
  DownloadOutlined,
  FilterOutlined,
  ReloadOutlined,
  SearchOutlined,
  AuditOutlined,
  ClockCircleFilled,
  FireFilled,
  TeamOutlined,
} from "@ant-design/icons";
import { fetchUserLogs, fetchUserLogsStats } from "../../../Api/index";
import { requestHandler } from "../../../Utils/index";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTime);

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;
const { Option } = Select;

// ── Types ────────────────────────────────────────────────────────────────────

type LogEntry = {
  _id: string;
  userID?: {
    _id?: string;
    userName?: string;
    displayName?: string;
    profilePhoto?: string;
  };
  action: string;
  module?: string;
  resourceID?: string;
  details?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  createdAt: string;
};

type Stats = {
  total: number;
  todayCount: number;
  activeUsersToday: number;
  moduleCounts: { _id: string; count: number }[];
};

// ── Constants ────────────────────────────────────────────────────────────────

const MODULE_OPTIONS = [
  "TASK",
  "EMPLOYEE",
  "HRM",
  "ATTENDANCE",
  "AUTH",
  "SOP",
  "REQUEST",
];

const ACTION_LABELS: Record<string, string> = {
  TASK_CREATED: "Task Created",
  TASK_UPDATED: "Task Updated",
  TASK_DELETED: "Task Deleted",
  EMPLOYEE_ADDED: "Employee Added",
  EMPLOYEE_UPDATED: "Employee Updated",
  EMPLOYEE_DELETED: "Employee Deleted",
  LEAVE_REQUESTED: "Leave Applied",
  LEAVE_STATUS_CHANGED: "Leave Status Changed",
  ATTENDANCE_CHECK_IN: "Checked In",
  ATTENDANCE_CHECK_OUT: "Checked Out",
  SOP_CREATED: "SOP Created",
  SOP_UPDATED: "SOP Updated",
  SOP_DELETED: "SOP Deleted",
  REQUEST_CREATED: "Request Created",
  REQUEST_STATUS_UPDATED: "Request Status Updated",
  LOGIN: "Login",
  LOGOUT: "Logout",
};

const MODULE_COLORS: Record<string, string> = {
  TASK: "blue",
  EMPLOYEE: "green",
  HRM: "purple",
  ATTENDANCE: "cyan",
  AUTH: "orange",
  SOP: "volcano",
  REQUEST: "geekblue",
};

// ── Helpers ───────────────────────────────────────────────────────────────────

const actionLabel = (a: string) => ACTION_LABELS[a] ?? a.replace(/_/g, " ");

const moduleTag = (m?: string) => (
  <Tag
    color={MODULE_COLORS[m ?? ""] ?? "default"}
    style={{ fontWeight: 600, fontSize: 11 }}
  >
    {m ?? "—"}
  </Tag>
);

const actionTag = (a: string) => {
  const label = actionLabel(a);
  const isDelete = a.includes("DELETE") || a.includes("DELETED");
  const isCreate =
    a.includes("CREATE") ||
    a.includes("CREATED") ||
    a.includes("ADDED") ||
    a.includes("CHECK_IN") ||
    a.includes("REQUESTED");
  const isUpdate =
    a.includes("UPDATE") || a.includes("CHANGED") || a.includes("CHECK_OUT");
  const color = isDelete
    ? "red"
    : isCreate
      ? "green"
      : isUpdate
        ? "gold"
        : "default";
  return <Tag color={color}>{label}</Tag>;
};

// Renders field-level change diffs from details.changes
const ChangeDiff: React.FC<{
  changes: Record<string, { from: any; to: any }>;
}> = ({ changes }) => (
  <div style={{ marginTop: 6 }}>
    {Object.entries(changes).map(([field, { from, to }]) => (
      <div key={field} style={{ marginBottom: 4, fontSize: 12 }}>
        <Text
          type="secondary"
          style={{ textTransform: "capitalize", marginRight: 4 }}
        >
          {field}:
        </Text>
        <Tag color="default" style={{ marginRight: 2 }}>
          {String(from ?? "—")}
        </Tag>
        <Text type="secondary">→</Text>
        <Tag color="blue" style={{ marginLeft: 2 }}>
          {String(to ?? "—")}
        </Tag>
      </div>
    ))}
  </div>
);

// Renders full expandable log details
const LogDetails: React.FC<{ log: LogEntry }> = ({ log }) => {
  const { details } = log;
  if (!details)
    return (
      <Text type="secondary" style={{ fontSize: 12 }}>
        No additional details.
      </Text>
    );

  const changes = details?.changes;
  const hasChanges = changes && Object.keys(changes).length > 0;

  return (
    <Space
      direction="vertical"
      size={4}
      style={{ width: "100%", fontSize: 12 }}
    >
      {details?.title && (
        <div>
          <Text type="secondary">Resource: </Text>
          <Text strong>{details.title}</Text>
        </div>
      )}
      {details?.name && (
        <div>
          <Text type="secondary">Name: </Text>
          <Text strong>{details.name}</Text>
        </div>
      )}
      {details?.jobRole && (
        <div>
          <Text type="secondary">Job Role: </Text>
          <Text>{details.jobRole}</Text>
        </div>
      )}
      {details?.reason && (
        <div>
          <Text type="secondary">Reason: </Text>
          <Text>{details.reason}</Text>
        </div>
      )}
      {log.resourceID && (
        <div>
          <Text type="secondary">Resource ID: </Text>
          <Text code style={{ fontSize: 11 }}>
            {String(log.resourceID)}
          </Text>
        </div>
      )}
      {log.ipAddress && (
        <div>
          <Text type="secondary">IP Address: </Text>
          <Text code style={{ fontSize: 11 }}>
            {log.ipAddress}
          </Text>
        </div>
      )}
      {hasChanges && (
        <>
          <Text type="secondary" strong>
            Fields Changed:
          </Text>
          <ChangeDiff changes={changes} />
        </>
      )}
    </Space>
  );
};

// ── Main Component ────────────────────────────────────────────────────────────

export default function Logs() {
  // Table state
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);

  // Stats
  const [stats, setStats] = useState<Stats | null>(null);
  const [statsLoading, setStatsLoading] = useState(false);

  // Filters
  const [filterModule, setFilterModule] = useState<string | undefined>();
  const [filterAction, setFilterAction] = useState<string | undefined>();
  const [filterUser, setFilterUser] = useState<string>("");
  const [filterDates, setFilterDates] = useState<
    [dayjs.Dayjs | null, dayjs.Dayjs | null] | null
  >(null);
  const [searchText, setSearchText] = useState("");

  const PAGE_SIZE = 20;

  // ── Data Loading ─────────────────────────────────────────────────────────

  const loadStats = useCallback(() => {
    requestHandler(
      () => fetchUserLogsStats() as any,
      setStatsLoading,
      (data: any) => setStats(data?.data ?? data),
      () => {},
    );
  }, []);

  const loadLogs = useCallback(
    (pageNum = 1) => {
      const params: Record<string, any> = { page: pageNum, limit: PAGE_SIZE };
      if (filterModule) params.module = filterModule;
      if (filterAction) params.action = filterAction;
      if (filterUser.trim()) params.userID = filterUser.trim();
      if (filterDates?.[0]) params.startDate = filterDates[0].toISOString();
      if (filterDates?.[1]) params.endDate = filterDates[1].toISOString();
      if (searchText.trim()) params.search = searchText.trim();

      requestHandler(
        () => fetchUserLogs(params) as any,
        setLoading,
        (data: any) => {
          const d = data?.data ?? data;
          setLogs(d?.logs ?? []);
          setTotal(d?.total ?? 0);
          setPage(pageNum);
        },
        (err: any) => message.error(err || "Failed to load logs"),
      );
    },
    [filterModule, filterAction, filterUser, filterDates, searchText],
  );

  useEffect(() => {
    loadStats();
    loadLogs(1);
  }, []); // eslint-disable-line

  const handleApplyFilters = () => {
    loadLogs(1);
    loadStats();
  };

  const handleClearFilters = () => {
    setFilterModule(undefined);
    setFilterAction(undefined);
    setFilterUser("");
    setFilterDates(null);
    setSearchText("");
    // reload without filters
    setTimeout(() => loadLogs(1), 0);
  };

  const hasFilters = !!(
    filterModule ||
    filterAction ||
    filterUser ||
    filterDates ||
    searchText.trim()
  );

  // ── CSV Export ───────────────────────────────────────────────────────────

  const exportCSV = () => {
    const headers = ["Timestamp", "User", "Module", "Action", "Details", "IP"];
    const rows = logs.map((l) => [
      dayjs(l.createdAt).format("YYYY-MM-DD HH:mm:ss"),
      l.userID?.displayName || l.userID?.userName || "System",
      l.module ?? "",
      actionLabel(l.action),
      l.details?.title || l.details?.name || JSON.stringify(l.details ?? ""),
      l.ipAddress ?? "",
    ]);
    const csv = [headers, ...rows]
      .map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(","))
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `activity-logs-${dayjs().format("YYYY-MM-DD")}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    message.success("CSV exported");
  };

  // ── Stats Cards ──────────────────────────────────────────────────────────

  const topModule = useMemo(
    () => stats?.moduleCounts?.[0]?._id ?? "—",
    [stats],
  );

  // ── Columns ──────────────────────────────────────────────────────────────

  const columns: ColumnsType<LogEntry> = [
    {
      title: "Timestamp",
      dataIndex: "createdAt",
      key: "createdAt",
      width: 175,
      sorter: (a, b) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
      render: (v) => (
        <Space direction="vertical" size={0}>
          <Text style={{ fontSize: 13 }}>{dayjs(v).format("DD MMM YYYY")}</Text>
          <Text type="secondary" style={{ fontSize: 11 }}>
            {dayjs(v).format("HH:mm:ss")} · {dayjs(v).fromNow()}
          </Text>
        </Space>
      ),
    },
    {
      title: "User",
      key: "user",
      width: 180,
      render: (_, r) => (
        <Space>
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: "50%",
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: 700,
              color: "#fff",
              fontSize: 13,
              flexShrink: 0,
            }}
          >
            {(r.userID?.displayName ??
              r.userID?.userName ??
              "?")[0]?.toUpperCase()}
          </div>
          <Space direction="vertical" size={0}>
            <Text strong style={{ fontSize: 13, lineHeight: 1.2 }}>
              {r.userID?.displayName || "Unknown"}
            </Text>
            <Text type="secondary" style={{ fontSize: 11 }}>
              @{r.userID?.userName ?? "—"}
            </Text>
          </Space>
        </Space>
      ),
    },
    {
      title: "Module",
      dataIndex: "module",
      key: "module",
      width: 120,
      render: (v) => moduleTag(v),
    },
    {
      title: "Action",
      dataIndex: "action",
      key: "action",
      width: 200,
      render: (v) => actionTag(v),
    },
    {
      title: "Details",
      key: "details",
      render: (_, r) => {
        const { details } = r;
        const changes = details?.changes;
        const hasChanges = changes && Object.keys(changes).length > 0;
        const label =
          details?.title ||
          details?.name ||
          (r.action === "ATTENDANCE_CHECK_IN"
            ? "Employee checked in"
            : r.action === "ATTENDANCE_CHECK_OUT"
              ? "Employee checked out"
              : "—");

        return (
          <Space direction="vertical" size={2}>
            <Text style={{ fontSize: 13 }}>{label}</Text>
            {hasChanges && (
              <Flex gap={4} wrap="wrap">
                {Object.entries(changes)
                  .slice(0, 2)
                  .map(([field, val]: any) => (
                    <Text key={field} type="secondary" style={{ fontSize: 11 }}>
                      <Text code style={{ fontSize: 10 }}>
                        {field}
                      </Text>
                      : {String(val?.from ?? "—")} → {String(val?.to ?? "—")}
                      {Object.keys(changes).length > 2 ? "" : ""}
                    </Text>
                  ))}
                {Object.keys(changes).length > 2 && (
                  <Text type="secondary" style={{ fontSize: 11 }}>
                    +{Object.keys(changes).length - 2} more
                  </Text>
                )}
              </Flex>
            )}
          </Space>
        );
      },
    },
    {
      title: "IP",
      dataIndex: "ipAddress",
      key: "ipAddress",
      width: 130,
      render: (v) =>
        v ? (
          <Tooltip title={v}>
            <Text type="secondary" code style={{ fontSize: 11 }}>
              {String(v).slice(0, 15)}
              {String(v).length > 15 ? "…" : ""}
            </Text>
          </Tooltip>
        ) : (
          <Text type="secondary">—</Text>
        ),
    },
  ];

  // ── Render ───────────────────────────────────────────────────────────────

  return (
    <div
      style={{ padding: 20, minHeight: "100vh", backgroundColor: "#f5f7fa" }}
    >
      {/* ── Page Header ── */}
      <Flex
        justify="space-between"
        align="center"
        wrap="wrap"
        gap={12}
        style={{ marginBottom: 20 }}
      >
        <Space direction="vertical" size={2}>
          <Title level={4} style={{ margin: 0 }}>
            Activity Logs
          </Title>
          <Text type="secondary">
            Complete audit trail of user actions across all modules
          </Text>
        </Space>
        <Space>
          <Button
            icon={<ReloadOutlined />}
            onClick={() => {
              loadLogs(page);
              loadStats();
            }}
            loading={loading}
            style={{ borderRadius: 8 }}
          >
            Refresh
          </Button>
          <Button
            icon={<DownloadOutlined />}
            onClick={exportCSV}
            disabled={logs.length === 0}
            style={{ borderRadius: 8 }}
          >
            Export CSV
          </Button>
        </Space>
      </Flex>

      {/* ── Stats Row ── */}
      <Row gutter={[16, 16]} style={{ marginBottom: 20 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card
            style={{
              borderRadius: 14,
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              border: "none",
            }}
            styles={{ body: { padding: "20px 24px" } }}
          >
            {statsLoading ? (
              <Skeleton active paragraph={false} />
            ) : (
              <Statistic
                title={
                  <Text
                    style={{ color: "rgba(255,255,255,0.8)", fontSize: 13 }}
                  >
                    Total Logs
                  </Text>
                }
                value={stats?.total ?? 0}
                valueStyle={{ color: "#fff", fontSize: 30, fontWeight: 700 }}
                prefix={
                  <AuditOutlined
                    style={{ color: "rgba(255,255,255,0.8)", marginRight: 6 }}
                  />
                }
              />
            )}
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card
            style={{
              borderRadius: 14,
              background: "linear-gradient(135deg, #11998e 0%, #38ef7d 100%)",
              border: "none",
            }}
            styles={{ body: { padding: "20px 24px" } }}
          >
            {statsLoading ? (
              <Skeleton active paragraph={false} />
            ) : (
              <Statistic
                title={
                  <Text
                    style={{ color: "rgba(255,255,255,0.8)", fontSize: 13 }}
                  >
                    Today's Actions
                  </Text>
                }
                value={stats?.todayCount ?? 0}
                valueStyle={{ color: "#fff", fontSize: 30, fontWeight: 700 }}
                prefix={
                  <ClockCircleFilled
                    style={{ color: "rgba(255,255,255,0.8)", marginRight: 6 }}
                  />
                }
              />
            )}
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card
            style={{
              borderRadius: 14,
              background: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
              border: "none",
            }}
            styles={{ body: { padding: "20px 24px" } }}
          >
            {statsLoading ? (
              <Skeleton active paragraph={false} />
            ) : (
              <Statistic
                title={
                  <Text
                    style={{ color: "rgba(255,255,255,0.8)", fontSize: 13 }}
                  >
                    Top Module
                  </Text>
                }
                value={topModule}
                valueStyle={{ color: "#fff", fontSize: 24, fontWeight: 700 }}
                prefix={
                  <FireFilled
                    style={{ color: "rgba(255,255,255,0.8)", marginRight: 6 }}
                  />
                }
              />
            )}
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card
            style={{
              borderRadius: 14,
              background: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
              border: "none",
            }}
            styles={{ body: { padding: "20px 24px" } }}
          >
            {statsLoading ? (
              <Skeleton active paragraph={false} />
            ) : (
              <Statistic
                title={
                  <Text
                    style={{ color: "rgba(255,255,255,0.8)", fontSize: 13 }}
                  >
                    Active Users Today
                  </Text>
                }
                value={stats?.activeUsersToday ?? 0}
                valueStyle={{ color: "#fff", fontSize: 30, fontWeight: 700 }}
                prefix={
                  <TeamOutlined
                    style={{ color: "rgba(255,255,255,0.8)", marginRight: 6 }}
                  />
                }
              />
            )}
          </Card>
        </Col>
      </Row>

      {/* ── Filters ── */}
      <Card
        style={{ borderRadius: 14, marginBottom: 16 }}
        styles={{ body: { padding: "16px 20px" } }}
      >
        <Flex wrap="wrap" gap={10} align="center">
          <Input
            placeholder="Search action..."
            prefix={<SearchOutlined />}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            onPressEnter={handleApplyFilters}
            allowClear
            style={{ width: 200, borderRadius: 8 }}
          />
          <Select
            placeholder="Module"
            value={filterModule}
            onChange={setFilterModule}
            allowClear
            style={{ width: 140, borderRadius: 8 }}
          >
            {MODULE_OPTIONS.map((m) => (
              <Option key={m} value={m}>
                <Tag
                  color={MODULE_COLORS[m] ?? "default"}
                  style={{ margin: 0, fontSize: 11 }}
                >
                  {m}
                </Tag>
              </Option>
            ))}
          </Select>
          <Select
            placeholder="Action"
            value={filterAction}
            onChange={setFilterAction}
            allowClear
            showSearch
            style={{ width: 200, borderRadius: 8 }}
          >
            {Object.entries(ACTION_LABELS).map(([key, label]) => (
              <Option key={key} value={key}>
                {label}
              </Option>
            ))}
          </Select>
          <RangePicker
            value={filterDates as any}
            onChange={(vals) => setFilterDates(vals as any)}
            style={{ borderRadius: 8 }}
            format="DD MMM YYYY"
          />
          <Button
            type="primary"
            icon={<FilterOutlined />}
            onClick={handleApplyFilters}
            style={{ borderRadius: 8 }}
          >
            Apply
          </Button>
          {hasFilters && (
            <Button
              danger
              onClick={handleClearFilters}
              style={{ borderRadius: 8 }}
            >
              Clear
            </Button>
          )}
          <Text type="secondary" style={{ marginLeft: "auto", fontSize: 12 }}>
            {total.toLocaleString()} {total === 1 ? "entry" : "entries"} found
          </Text>
        </Flex>

        {/* Module breakdown chips */}
        {stats?.moduleCounts && stats.moduleCounts.length > 0 && (
          <>
            <Divider style={{ margin: "12px 0" }} />
            <Flex gap={8} wrap="wrap" align="center">
              <Text type="secondary" style={{ fontSize: 12 }}>
                Breakdown:{" "}
              </Text>
              {stats.moduleCounts.map((m) => (
                <Tag
                  key={m._id}
                  color={MODULE_COLORS[m._id] ?? "default"}
                  style={{ cursor: "pointer", userSelect: "none" }}
                  onClick={() => {
                    setFilterModule(m._id);
                    setTimeout(() => loadLogs(1), 0);
                  }}
                >
                  {m._id}{" "}
                  <Badge
                    count={m.count}
                    color="rgba(0,0,0,0.3)"
                    style={{ fontSize: 10, boxShadow: "none" }}
                  />
                </Tag>
              ))}
            </Flex>
          </>
        )}
      </Card>

      {/* ── Table ── */}
      <Card style={{ borderRadius: 14 }} styles={{ body: { padding: 0 } }}>
        {loading ? (
          <div style={{ padding: 24 }}>
            <Skeleton active paragraph={{ rows: 6 }} />
          </div>
        ) : logs.length === 0 ? (
          <Empty
            description="No activity logs found"
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            style={{ padding: 48 }}
          />
        ) : (
          <Table<LogEntry>
            rowKey="_id"
            columns={columns}
            dataSource={logs}
            pagination={false}
            scroll={{ x: 900 }}
            expandable={{
              expandedRowRender: (record) => (
                <div
                  style={{
                    margin: 0,
                    padding: "12px 20px",
                    background: "rgba(102,126,234,0.04)",
                    borderRadius: 8,
                  }}
                >
                  <Text
                    strong
                    style={{
                      fontSize: 12,
                      color: "#667eea",
                      display: "block",
                      marginBottom: 8,
                    }}
                  >
                    Full Log Details
                  </Text>
                  <LogDetails log={record} />
                  {record.userAgent && (
                    <div style={{ marginTop: 8 }}>
                      <Text type="secondary" style={{ fontSize: 11 }}>
                        <strong>User Agent:</strong> {record.userAgent}
                      </Text>
                    </div>
                  )}
                </div>
              ),
              rowExpandable: (r) =>
                !!(r.details || r.resourceID || r.ipAddress || r.userAgent),
            }}
            onRow={() => ({
              style: { cursor: "default" },
            })}
            style={{ borderRadius: 14, overflow: "hidden" }}
          />
        )}

        {/* Pagination */}
        {logs.length > 0 && (
          <div
            style={{
              padding: "16px 20px",
              borderTop: "1px solid rgba(0,0,0,0.06)",
            }}
          >
            <Flex justify="space-between" align="center" wrap="wrap" gap={8}>
              <Text type="secondary" style={{ fontSize: 12 }}>
                Showing {(page - 1) * PAGE_SIZE + 1}–
                {Math.min(page * PAGE_SIZE, total)} of {total.toLocaleString()}{" "}
                logs
              </Text>
              <Pagination
                current={page}
                total={total}
                pageSize={PAGE_SIZE}
                onChange={(p) => loadLogs(p)}
                showSizeChanger={false}
                showQuickJumper
              />
            </Flex>
          </div>
        )}
      </Card>
    </div>
  );
}
