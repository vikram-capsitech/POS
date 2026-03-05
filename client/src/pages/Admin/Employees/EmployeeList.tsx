import React, { useEffect, useState } from "react";
import {
  Avatar,
  Badge,
  Button,
  Card,
  Input,
  Popconfirm,
  Space,
  Table,
  Tag,
  Tooltip,
  Typography,
  message,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import {
  DeleteOutlined,
  EditOutlined,
  EyeOutlined,
  PlusOutlined,
  ReloadOutlined,
  SearchOutlined,
  UserOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import apiClient, { hrmListEmployees } from "../../../Api";
import AddEmployee from "./AddEmployee";
import EditEmployee from "./EditEmployee";
import EmployeeProfilePage from "./Employeeprofilepage";

const { Title, Text } = Typography;

export type EmployeeRecord = {
  _id: string;
  displayName?: string;
  userName: string;
  email: string;
  phoneNumber?: string;
  profilePhoto?: string | null;
  profile?: {
    _id?: string;
    jobRole?: string;
    position?: string;
    employeeStatus?: string;
    hireDate?: string;
    salary?: number;
    coinsPerMonth?: number;
    totalLeave?: number;
  };
};

type View =
  | { type: "list" }
  | { type: "add" }
  | { type: "edit"; employee: EmployeeRecord }
  | { type: "profile"; employeeId: string };

export default function EmployeeList() {
  const [view, setView] = useState<View>({ type: "list" });
  const [employees, setEmployees] = useState<EmployeeRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");

  const fetchEmployees = async () => {
    setLoading(true);
    try {
      const res: any = await hrmListEmployees();
      const payload = res?.data?.data?.data ?? res?.data?.data ?? [];
      setEmployees(Array.isArray(payload) ? payload : []);
    } catch (err: any) {
      message.error(err?.response?.data?.message || "Failed to load employees");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  const handleDelete = async (id: string) => {
    try {
      await apiClient.delete(`/api/employees/${id}`);
      message.success("Employee deleted");
      fetchEmployees();
    } catch (err: any) {
      message.error(err?.response?.data?.message || "Failed to delete");
    }
  };

  // ── Sub-page routing via view state ───────────────────────────────────────
  if (view.type === "add") {
    return (
      <AddEmployee
        onBack={() => setView({ type: "list" })}
        onSuccess={() => { setView({ type: "list" }); fetchEmployees(); }}
      />
    );
  }
  if (view.type === "edit") {
    return (
      <EditEmployee
        employee={view.employee}
        onBack={() => setView({ type: "list" })}
        onSuccess={() => { setView({ type: "list" }); fetchEmployees(); }}
      />
    );
  }
  if (view.type === "profile") {
    return (
      <EmployeeProfilePage
        employeeId={view.employeeId}
        onBack={() => setView({ type: "list" })}
        onEdit={(emp) => setView({ type: "edit", employee: emp })}
      />
    );
  }

  // ── Filter ────────────────────────────────────────────────────────────────
  const visible = employees.filter((e) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      e.displayName?.toLowerCase().includes(q) ||
      e.userName?.toLowerCase().includes(q) ||
      e.email?.toLowerCase().includes(q) ||
      e.profile?.jobRole?.toLowerCase().includes(q)
    );
  });

  const columns: ColumnsType<EmployeeRecord> = [
    {
      title: "Employee",
      key: "name",
      render: (_, r) => (
        <Space>
          <Avatar
            src={r.profilePhoto}
            icon={!r.profilePhoto && <UserOutlined />}
            style={{ background: "#e8f4ff", color: "#1677ff", flexShrink: 0 }}
          />
          <Space direction="vertical" size={0}>
            <Text strong>{r.displayName || r.userName}</Text>
            <Text type="secondary" style={{ fontSize: 12 }}>{r.email}</Text>
          </Space>
        </Space>
      ),
    },
    {
      title: "Phone",
      dataIndex: "phoneNumber",
      key: "phoneNumber",
      render: (v) => v || "—",
    },
    {
      title: "Job Role",
      key: "jobRole",
      render: (_, r) =>
        r.profile?.jobRole ? (
          <Tag color="blue" style={{ borderRadius: 20 }}>{r.profile.jobRole}</Tag>
        ) : "—",
    },
    {
      title: "Position",
      key: "position",
      render: (_, r) => r.profile?.position || "—",
    },
    {
      title: "Salary",
      key: "salary",
      render: (_, r) =>
        r.profile?.salary ? `₹${r.profile.salary.toLocaleString("en-IN")}` : "—",
    },
    {
      title: "Status",
      key: "status",
      render: (_, r) => {
        const s = r.profile?.employeeStatus ?? "active";
        return (
          <Badge
            status={s === "active" ? "success" : "default"}
            text={s === "active" ? "Active" : "Inactive"}
          />
        );
      },
    },
    {
      title: "Joined",
      key: "hireDate",
      render: (_, r) =>
        r.profile?.hireDate ? dayjs(r.profile.hireDate).format("DD MMM YYYY") : "—",
    },
    {
      title: "Actions",
      key: "actions",
      fixed: "right",
      width: 130,
      render: (_, r) => (
        <Space>
          <Tooltip title="View Profile">
            <Button
              size="small"
              icon={<EyeOutlined />}
              onClick={() => setView({ type: "profile", employeeId: r._id })}
              style={{ borderRadius: 8 }}
            />
          </Tooltip>
          <Tooltip title="Edit">
            <Button
              size="small"
              icon={<EditOutlined />}
              onClick={() => setView({ type: "edit", employee: r })}
              style={{ borderRadius: 8 }}
            />
          </Tooltip>
          <Popconfirm
            title="Delete this employee?"
            description="This cannot be undone."
            onConfirm={() => handleDelete(r._id)}
            okText="Delete"
            okButtonProps={{ danger: true }}
          >
            <Tooltip title="Delete">
              <Button size="small" danger icon={<DeleteOutlined />} style={{ borderRadius: 8 }} />
            </Tooltip>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: 20,
          flexWrap: "wrap",
          gap: 12,
        }}
      >
        <div>
          <Title level={4} style={{ margin: 0 }}>Employees</Title>
          <Text type="secondary">Manage all staff members in your organisation</Text>
        </div>
        <Space wrap>
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            allowClear
            prefix={<SearchOutlined />}
            placeholder="Search by name, email, role..."
            style={{ width: 260 }}
          />
          <Button icon={<ReloadOutlined />} onClick={fetchEmployees} loading={loading} style={{ borderRadius: 8 }}>
            Refresh
          </Button>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setView({ type: "add" })}
            style={{ borderRadius: 8 }}
          >
            Add Employee
          </Button>
        </Space>
      </div>

      <Card style={{ borderRadius: 12 }} bodyStyle={{ padding: 0 }}>
        <Table
          dataSource={visible}
          columns={columns}
          rowKey="_id"
          loading={loading}
          scroll={{ x: 1000 }}
          pagination={{ pageSize: 15, showTotal: (t) => `${t} employees` }}
        />
      </Card>
    </div>
  );
}