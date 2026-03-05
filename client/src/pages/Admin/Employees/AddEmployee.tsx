import React, { useState } from "react";
import {
    ArrowLeftOutlined,
    CheckCircleOutlined,
    DollarOutlined,
    IdcardOutlined,
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
    Steps,
    Typography,
    message,
} from "antd";
import dayjs from "dayjs";
import apiClient from "../../../Api";

const { Title, Text } = Typography;

type Props = {
    onBack: () => void;
    onSuccess: () => void;
};

const STEPS = [
    {
        title: "Basic Info",
        description: "Name, email & contact",
        icon: <UserOutlined />,
    },
    {
        title: "Job Details",
        description: "Role, position & hire date",
        icon: <IdcardOutlined />,
    },
    {
        title: "Compensation",
        description: "Salary, leaves & coins",
        icon: <DollarOutlined />,
    },
];

// Fields to validate before allowing Next on each step
const STEP_FIELDS = [
    ["displayName", "userName", "email", "phoneNumber"],
    ["jobRole"],
    [],
];

export default function AddEmployee({ onBack, onSuccess }: Props) {
    const [form] = Form.useForm();
    const [currentStep, setCurrentStep] = useState(0);
    const [submitting, setSubmitting] = useState(false);

    const handleNext = async () => {
        try {
            await form.validateFields(STEP_FIELDS[currentStep]);
            setCurrentStep((s) => s + 1);
        } catch {
            // antd shows inline field errors
        }
    };

    const handleBack = () => {
        if (currentStep === 0) onBack();
        else setCurrentStep((s) => s - 1);
    };

    const handleSubmit = async () => {
        try {
            await form.validateFields();
            const v = form.getFieldsValue(true);

            const payload = {
                // ── User model fields ──────────────────────────────────────────────
                displayName: v.displayName,
                userName: v.userName,              // required + unique on User
                email: v.email,
                phoneNumber: v.phoneNumber,           // must be exactly 10 digits
                password: v.password || undefined, // defaults to Employee@123

                // ── EmployeeProfile fields ─────────────────────────────────────────
                jobRole: v.jobRole,
                position: v.position || undefined,
                hireDate: v.hireDate ? v.hireDate.toISOString() : undefined,

                // ── Compensation / EmployeeProfile fields ──────────────────────────
                salary: v.salary ?? 0,
                totalLeave: v.totalLeave ?? 4,
                coinsPerMonth: v.coinsPerMonth ?? 0,
            };

            setSubmitting(true);
            await apiClient.post("/api/employees", payload);
            message.success("Employee added successfully");
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
            <Space style={{ marginBottom: 24 }}>
                <Button icon={<ArrowLeftOutlined />} onClick={handleBack} style={{ borderRadius: 8 }}>
                    {currentStep === 0 ? "Back to List" : "Back"}
                </Button>
            </Space>

            <div style={{ marginBottom: 28 }}>
                <Title level={4} style={{ margin: 0 }}>Add New Employee</Title>
                <Text type="secondary">Fill in the details below to onboard a new staff member.</Text>
            </div>

            {/* Steps indicator */}
            <Steps
                current={currentStep}
                items={STEPS}
                style={{ marginBottom: 32 }}
            />

            <Card style={{ borderRadius: 14 }}>
                <Form form={form} layout="vertical" requiredMark="optional">

                    {/* ── Step 0 : Basic Info ─────────────────────────────────────── */}
                    {currentStep === 0 && (
                        <>
                            <Row gutter={16}>
                                <Col xs={24} sm={12}>
                                    <Form.Item
                                        name="displayName"
                                        label="Full Name"
                                        rules={[{ required: true, message: "Full name is required" }]}
                                    >
                                        <Input placeholder="e.g. Rahul Sharma" size="large" />
                                    </Form.Item>
                                </Col>
                                <Col xs={24} sm={12}>
                                    {/* userName is required + unique on User model, stored lowercase */}
                                    <Form.Item
                                        name="userName"
                                        label="Username"
                                        rules={[
                                            { required: true, message: "Username is required" },
                                            {
                                                pattern: /^[a-z0-9_]+$/,
                                                message: "Lowercase letters, numbers and underscores only",
                                            },
                                        ]}
                                    >
                                        <Input placeholder="e.g. rahul_sharma" size="large" />
                                    </Form.Item>
                                </Col>
                            </Row>

                            <Form.Item
                                name="email"
                                label="Email Address"
                                rules={[
                                    { required: true, message: "Email is required" },
                                    { type: "email", message: "Enter a valid email" },
                                ]}
                            >
                                <Input placeholder="rahul@company.com" size="large" />
                            </Form.Item>

                            <Row gutter={16}>
                                <Col xs={24} sm={12}>
                                    {/* phoneNumber validator on User model: exactly 10 digits */}
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
                                        <Input placeholder="9876543210" maxLength={10} size="large" />
                                    </Form.Item>
                                </Col>
                                <Col xs={24} sm={12}>
                                    <Form.Item
                                        name="password"
                                        label="Initial Password"
                                        extra="Leave blank to use the default: Employee@123"
                                    >
                                        <Input.Password placeholder="Employee@123" size="large" />
                                    </Form.Item>
                                </Col>
                            </Row>
                        </>
                    )}

                    {/* ── Step 1 : Job Details ────────────────────────────────────── */}
                    {currentStep === 1 && (
                        <>
                            <Row gutter={16}>
                                <Col xs={24} sm={12}>
                                    {/* jobRole → EmployeeProfile.jobRole (open string, no enum) */}
                                    <Form.Item
                                        name="jobRole"
                                        label="Job Role"
                                        rules={[{ required: true, message: "Job role is required" }]}
                                        extra="e.g. Cashier, Kitchen Staff, Nurse, Driver"
                                    >
                                        <Input placeholder="e.g. Cashier" size="large" />
                                    </Form.Item>
                                </Col>
                                <Col xs={24} sm={12}>
                                    {/* position → EmployeeProfile.position */}
                                    <Form.Item name="position" label="Position">
                                        <Select
                                            placeholder="Select a position"
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

                            {/* hireDate → EmployeeProfile.hireDate */}
                            <Form.Item name="hireDate" label="Hire / Join Date">
                                <DatePicker
                                    style={{ width: "100%" }}
                                    size="large"
                                    format="DD MMM YYYY"
                                    placeholder="Select hire date"
                                    disabledDate={(d) => d && d.isAfter(dayjs())}
                                />
                            </Form.Item>

                            <Card
                                size="small"
                                style={{
                                    background: "#f0f7ff",
                                    border: "1px solid #bae0ff",
                                    borderRadius: 10,
                                    marginTop: 8,
                                }}
                            >
                                <Text style={{ fontSize: 12 }} type="secondary">
                                    📎 <strong>Documents</strong> (ID proof, contracts) and{" "}
                                    <strong>Allocated Items</strong> (uniform, equipment) can be
                                    added from the employee's profile page after creation.
                                </Text>
                            </Card>
                        </>
                    )}

                    {/* ── Step 2 : Compensation ───────────────────────────────────── */}
                    {currentStep === 2 && (
                        <>
                            <Row gutter={16}>
                                <Col xs={24} sm={12}>
                                    {/* salary → EmployeeProfile.salary (min: 0) */}
                                    <Form.Item name="salary" label="Monthly Salary (₹)" initialValue={0}>
                                        <InputNumber<number>
                                            min={0}
                                            style={{ width: "100%" }}
                                            size="large"
                                            formatter={(v) =>
                                                `₹ ${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                                            }
                                            parser={(v) => Number(v?.replace(/₹\s?|(,*)/g, "") ?? 0)}
                                            placeholder="e.g. 25000"
                                        />
                                    </Form.Item>
                                </Col>
                                <Col xs={24} sm={12}>
                                    {/* coinsPerMonth → EmployeeProfile.coinsPerMonth */}
                                    <Form.Item
                                        name="coinsPerMonth"
                                        label="Coins Per Month"
                                        initialValue={0}
                                        extra="Credited to employee wallet every salary cycle"
                                    >
                                        <InputNumber min={0} style={{ width: "100%" }} size="large" placeholder="e.g. 100" />
                                    </Form.Item>
                                </Col>
                            </Row>

                            {/* totalLeave → EmployeeProfile.totalLeave (default: 4) */}
                            <Form.Item
                                name="totalLeave"
                                label="Total Leaves Per Month"
                                initialValue={4}
                            >
                                <InputNumber min={0} max={31} style={{ width: "100%" }} size="large" />
                            </Form.Item>

                            <Card
                                size="small"
                                style={{
                                    background: "#f6ffed",
                                    border: "1px solid #b7eb8f",
                                    borderRadius: 10,
                                    marginTop: 8,
                                }}
                            >
                                <Space>
                                    <CheckCircleOutlined style={{ color: "#52c41a" }} />
                                    <Text style={{ fontSize: 12 }}>
                                        A coin wallet will be automatically created for this employee.
                                    </Text>
                                </Space>
                            </Card>
                        </>
                    )}
                </Form>

                <Divider style={{ margin: "24px 0 16px" }} />

                {/* Footer navigation */}
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <Button size="large" onClick={handleBack} style={{ borderRadius: 8 }}>
                        {currentStep === 0 ? "Cancel" : "← Back"}
                    </Button>

                    {currentStep < STEPS.length - 1 ? (
                        <Button
                            type="primary"
                            size="large"
                            onClick={handleNext}
                            style={{ borderRadius: 8, minWidth: 120 }}
                        >
                            Next →
                        </Button>
                    ) : (
                        <Button
                            type="primary"
                            size="large"
                            loading={submitting}
                            onClick={handleSubmit}
                            style={{ borderRadius: 8, minWidth: 160 }}
                        >
                            Add Employee
                        </Button>
                    )}
                </div>
            </Card>
        </div>
    );
}