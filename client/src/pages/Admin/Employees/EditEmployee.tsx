import React, { useState } from "react";
import {
    ArrowLeftOutlined,
    IdcardOutlined,
    DollarOutlined,
    UserOutlined,
} from "@ant-design/icons";
import {
    Button,
    Card,
    Col,
    DatePicker,
    Divider,
    Form,
    Input,
    InputNumber,
    Row,
    Select,
    Space,
    Tabs,
    Typography,
    message,
} from "antd";
import dayjs from "dayjs";
import apiClient from "../../../Api";
import type { EmployeeRecord } from "./EmployeeList";

const { Title, Text } = Typography;

type Props = {
    employee: EmployeeRecord;
    onBack: () => void;
    onSuccess: () => void;
};

export default function EditEmployee({ employee, onBack, onSuccess }: Props) {
    const [userForm] = Form.useForm();
    const [profileForm] = Form.useForm();
    const [submitting, setSubmitting] = useState(false);
    const [activeTab, setActiveTab] = useState("personal");

    // Pre-fill forms with existing data
    // User model fields
    userForm.setFieldsValue({
        displayName: employee.displayName,
        email: employee.email,
        phoneNumber: employee.phoneNumber,
    });

    // EmployeeProfile fields
    profileForm.setFieldsValue({
        jobRole: employee.profile?.jobRole,
        position: employee.profile?.position,
        employeeStatus: employee.profile?.employeeStatus ?? "active",
        hireDate: employee.profile?.hireDate ? dayjs(employee.profile.hireDate) : null,
        salary: employee.profile?.salary ?? 0,
        coinsPerMonth: employee.profile?.coinsPerMonth ?? 0,
        totalLeave: employee.profile?.totalLeave ?? 4,
    });

    const handleSubmit = async () => {
        try {
            // Validate both forms
            const [userValues, profileValues] = await Promise.all([
                userForm.validateFields(),
                profileForm.validateFields(),
            ]);

            const payload = {
                // ── User model fields (PUT /api/employees/:id updates both User + EmployeeProfile)
                displayName: userValues.displayName,
                email: userValues.email,
                phoneNumber: userValues.phoneNumber,

                // ── EmployeeProfile fields
                jobRole: profileValues.jobRole,
                position: profileValues.position,
                employeeStatus: profileValues.employeeStatus,
                hireDate: profileValues.hireDate
                    ? profileValues.hireDate.toISOString()
                    : undefined,
                salary: profileValues.salary ?? 0,
                coinsPerMonth: profileValues.coinsPerMonth ?? 0,
                totalLeave: profileValues.totalLeave ?? 4,
            };

            setSubmitting(true);
            await apiClient.put(`/api/employees/${employee._id}`, payload);
            message.success("Employee updated successfully");
            onSuccess();
        } catch (err: any) {
            const msg = err?.response?.data?.message || err?.message;
            if (msg) message.error(msg);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div style={{ padding: 24, margin: "0 auto" }}>

            {/* Page header */}
            <Space style={{ marginBottom: 20 }}>
                <Button icon={<ArrowLeftOutlined />} onClick={onBack} style={{ borderRadius: 8 }}>
                    Back to List
                </Button>
            </Space>

            <div style={{ marginBottom: 24 }}>
                <Title level={4} style={{ margin: 0 }}>
                    Edit Employee
                </Title>
                <Text type="secondary">
                    Updating: <Text strong>{employee.displayName || employee.userName}</Text>
                </Text>
            </div>

            <Tabs
                activeKey={activeTab}
                onChange={setActiveTab}
                items={[

                    // ── Tab 1: Personal Info ─────────────────────────────────────────
                    {
                        key: "personal",
                        label: <Space><UserOutlined />Personal Info</Space>,
                        children: (
                            <Card style={{ borderRadius: 14 }}>
                                <Form form={userForm} layout="vertical" requiredMark="optional">
                                    <Row gutter={16}>
                                        <Col xs={24} sm={12}>
                                            <Form.Item
                                                name="displayName"
                                                label="Full Name"
                                                rules={[{ required: true, message: "Full name is required" }]}
                                            >
                                                <Input size="large" />
                                            </Form.Item>
                                        </Col>
                                        <Col xs={24} sm={12}>
                                            {/* email is editable but unique — server validates */}
                                            <Form.Item
                                                name="email"
                                                label="Email Address"
                                                rules={[
                                                    { required: true, message: "Email is required" },
                                                    { type: "email", message: "Enter a valid email" },
                                                ]}
                                            >
                                                <Input size="large" />
                                            </Form.Item>
                                        </Col>
                                    </Row>

                                    {/* phoneNumber — User model requires exactly 10 digits */}
                                    <Form.Item
                                        name="phoneNumber"
                                        label="Phone Number"
                                        rules={[
                                            { required: true, message: "Phone number is required" },
                                            {
                                                pattern: /^[0-9]{10}$/,
                                                message: "Must be exactly 10 digits",
                                            },
                                        ]}
                                    >
                                        <Input size="large" maxLength={10} style={{ maxWidth: 320 }} />
                                    </Form.Item>

                                    <Card
                                        size="small"
                                        style={{
                                            background: "#fffbe6",
                                            border: "1px solid #ffe58f",
                                            borderRadius: 10,
                                            marginTop: 8,
                                        }}
                                    >
                                        <Text style={{ fontSize: 12 }} type="secondary">
                                            ⚠️ <strong>Username</strong> cannot be changed after creation as it is
                                            used for login. To change it, please delete and re-create the employee.
                                        </Text>
                                    </Card>
                                </Form>
                            </Card>
                        ),
                    },

                    // ── Tab 2: Job Details ───────────────────────────────────────────
                    {
                        key: "job",
                        label: <Space><IdcardOutlined />Job Details</Space>,
                        children: (
                            <Card style={{ borderRadius: 14 }}>
                                <Form form={profileForm} layout="vertical" requiredMark="optional">
                                    <Row gutter={16}>
                                        <Col xs={24} sm={12}>
                                            {/* jobRole → EmployeeProfile.jobRole */}
                                            <Form.Item
                                                name="jobRole"
                                                label="Job Role"
                                                rules={[{ required: true, message: "Job role is required" }]}
                                            >
                                                <Input size="large" placeholder="e.g. Cashier, Kitchen Staff" />
                                            </Form.Item>
                                        </Col>
                                        <Col xs={24} sm={12}>
                                            {/* position → EmployeeProfile.position */}
                                            <Form.Item name="position" label="Position">
                                                <Select
                                                    size="large"
                                                    allowClear
                                                    options={[
                                                        { value: "employee", label: "Employee" },
                                                        { value: "manager", label: "Manager" },
                                                        { value: "supervisor", label: "Supervisor" },
                                                        { value: "intern", label: "Intern" },
                                                    ]}
                                                />
                                            </Form.Item>
                                        </Col>
                                    </Row>

                                    <Row gutter={16}>
                                        <Col xs={24} sm={12}>
                                            {/* hireDate → EmployeeProfile.hireDate */}
                                            <Form.Item name="hireDate" label="Hire / Join Date">
                                                <DatePicker
                                                    style={{ width: "100%" }}
                                                    size="large"
                                                    format="DD MMM YYYY"
                                                    disabledDate={(d) => d && d.isAfter(dayjs())}
                                                />
                                            </Form.Item>
                                        </Col>
                                        <Col xs={24} sm={12}>
                                            {/* employeeStatus → EmployeeProfile.employeeStatus enum: "active" | "inactive" */}
                                            <Form.Item name="employeeStatus" label="Employment Status">
                                                <Select
                                                    size="large"
                                                    options={[
                                                        { value: "active", label: "Active" },
                                                        { value: "inactive", label: "Inactive" },
                                                    ]}
                                                />
                                            </Form.Item>
                                        </Col>
                                    </Row>
                                </Form>
                            </Card>
                        ),
                    },

                    // ── Tab 3: Compensation ──────────────────────────────────────────
                    {
                        key: "compensation",
                        label: <Space><DollarOutlined />Compensation</Space>,
                        children: (
                            <Card style={{ borderRadius: 14 }}>
                                <Form form={profileForm} layout="vertical" requiredMark="optional">
                                    <Row gutter={16}>
                                        <Col xs={24} sm={12}>
                                            {/* salary → EmployeeProfile.salary (min: 0) */}
                                            <Form.Item name="salary" label="Monthly Salary (₹)">
                                                <InputNumber<number>
                                                    min={0}
                                                    style={{ width: "100%" }}
                                                    size="large"
                                                    formatter={(v) =>
                                                        `₹ ${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                                                    }
                                                    parser={(v) => Number(v?.replace(/₹\s?|(,*)/g, "") ?? 0)}
                                                />
                                            </Form.Item>
                                        </Col>
                                        <Col xs={24} sm={12}>
                                            {/* coinsPerMonth → EmployeeProfile.coinsPerMonth */}
                                            <Form.Item
                                                name="coinsPerMonth"
                                                label="Coins Per Month"
                                                extra="Credited every salary cycle"
                                            >
                                                <InputNumber min={0} style={{ width: "100%" }} size="large" />
                                            </Form.Item>
                                        </Col>
                                    </Row>

                                    {/* totalLeave → EmployeeProfile.totalLeave */}
                                    <Form.Item name="totalLeave" label="Total Leaves Per Month">
                                        <InputNumber min={0} max={31} style={{ width: "100%", maxWidth: 320 }} size="large" />
                                    </Form.Item>
                                </Form>
                            </Card>
                        ),
                    },
                ]}
            />

            <Divider style={{ margin: "24px 0 16px" }} />

            <div style={{ display: "flex", justifyContent: "space-between" }}>
                <Button size="large" onClick={onBack} style={{ borderRadius: 8 }}>
                    Cancel
                </Button>
                <Button
                    type="primary"
                    size="large"
                    loading={submitting}
                    onClick={handleSubmit}
                    style={{ borderRadius: 8, minWidth: 160 }}
                >
                    Save Changes
                </Button>
            </div>
        </div>
    );
}