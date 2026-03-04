import React, { useEffect, useState } from "react";
import {
  Card,
  Table,
  Button,
  Space,
  Modal,
  Form,
  Input,
  Typography,
  Badge,
} from "antd";
import { PlusOutlined, EditOutlined } from "@ant-design/icons";
import apiClient, { hrmListEmployees } from "../../../Api";
import { useAppStore } from "../../../Store/app.store";
import dayjs from "dayjs";

const { Title, Text } = Typography;

export default function EmployeeList() {
  const { showSnackbar } = useAppStore();
  const [employees, setEmployees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [addModalOpen, setAddModalOpen] = useState(false);
  const [addingUser, setAddingUser] = useState(false);
  const [form] = Form.useForm();

  const fetchEmployees = async () => {
    setLoading(true);
    try {
      const res: any = await hrmListEmployees();
      const payload = res?.data?.data?.data || res?.data?.data || [];
      setEmployees(Array.isArray(payload) ? payload : []);
    } catch (err: any) {
      showSnackbar(
        "error",
        err?.response?.data?.message || "Failed to load employees",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleAddSubmit = async (values: any) => {
    setAddingUser(true);
    try {
      await apiClient.post("/api/employees", values);
      showSnackbar("success", "Employee added successfully");
      setAddModalOpen(false);
      form.resetFields();
      fetchEmployees();
    } catch (err: any) {
      showSnackbar(
        "error",
        err?.response?.data?.message || "Failed to add employee",
      );
    } finally {
      setAddingUser(false);
    }
  };

  const columns = [
    {
      title: "Name",
      dataIndex: "displayName",
      key: "displayName",
      render: (text: string, record: any) => (
        <Space direction="vertical" size={0}>
          <Text strong>{text || record.userName}</Text>
          <Text type="secondary" style={{ fontSize: 12 }}>
            {record.email}
          </Text>
        </Space>
      ),
    },
    {
      title: "Phone",
      dataIndex: "phoneNumber",
      key: "phoneNumber",
    },
    {
      title: "Job Role",
      key: "jobRole",
      render: (_: any, record: any) => record.profile?.jobRole || "—",
    },
    {
      title: "Status",
      key: "employeeStatus",
      render: (_: any, record: any) => {
        const status = record.profile?.employeeStatus || "Active";
        return (
          <Badge
            status={status === "Active" ? "success" : "default"}
            text={status}
          />
        );
      },
    },
    {
      title: "Joined",
      key: "hireDate",
      render: (_: any, record: any) =>
        record.profile?.hireDate
          ? dayjs(record.profile.hireDate).format("DD MMM YYYY")
          : "—",
    },
    {
      title: "Actions",
      key: "actions",
      render: () => (
        <Space>
          <Button type="text" icon={<EditOutlined />} />
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: 24, maxWidth: 1200, margin: "0 auto" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: 24,
        }}
      >
        <div>
          <Title level={4} style={{ margin: 0 }}>
            Employees
          </Title>
          <Text type="secondary">
            Manage all staff members in your organization
          </Text>
        </div>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => setAddModalOpen(true)}
          style={{ background: "#5240d6", borderColor: "#5240d6" }}
        >
          Add Employee
        </Button>
      </div>

      <Card style={{ borderRadius: 12 }} bodyStyle={{ padding: 0 }}>
        <Table
          dataSource={employees}
          columns={columns}
          rowKey="_id"
          loading={loading}
          pagination={{ pageSize: 15 }}
        />
      </Card>

      <Modal
        title="Add New Employee"
        open={addModalOpen}
        onCancel={() => {
          setAddModalOpen(false);
          form.resetFields();
        }}
        footer={null}
      >
        <Form form={form} layout="vertical" onFinish={handleAddSubmit}>
          <Form.Item
            name="displayName"
            label="Full Name"
            rules={[{ required: true, message: "Required" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="email"
            label="Email"
            rules={[
              {
                required: true,
                type: "email",
                message: "Valid email required",
              },
            ]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="phoneNumber"
            label="Phone Number"
            rules={[{ required: true, message: "Required" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item name="jobRole" label="Job Role">
            <Input placeholder="e.g. Cashier, Kitchen Staff" />
          </Form.Item>
          <Form.Item
            name="password"
            label="Initial Password"
            extra="Leave blank to use Employee@123"
          >
            <Input.Password />
          </Form.Item>
          <Form.Item style={{ marginBottom: 0, textAlign: "right" }}>
            <Space>
              <Button onClick={() => setAddModalOpen(false)}>Cancel</Button>
              <Button
                type="primary"
                htmlType="submit"
                loading={addingUser}
                style={{ background: "#5240d6", borderColor: "#5240d6" }}
              >
                Add Employee
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
