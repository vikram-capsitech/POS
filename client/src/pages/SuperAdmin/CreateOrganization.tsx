import React, { useState } from "react";
import {
    Form,
    Input,
    Select,
    Button,
    Card,
    Switch,
    DatePicker,
    InputNumber,
    Divider,
    Tag,
    Typography,
    Row,
    Col,
    Alert,
    Progress,
    Result,
    Timeline,
    FormInstance,
    notification,
} from "antd";
import { useNavigate } from "react-router-dom";
import { createOrganization } from "../../Api";

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;
const { TextArea } = Input;

// ─── Types ────────────────────────────────────────────────────────────────────

type OrgType = "restaurant" | "retail" | "hospital" | "logistics" | "other";
type BillingCycle = "monthly" | "quarterly" | "annual";
type ModuleKey = "pos" | "hrm" | "inventory" | "payroll" | "ai";

interface OrgTypeOption {
    value: OrgType;
    label: string;
    color: string;
}

interface ModuleOption {
    key: ModuleKey;
    label: string;
    icon: string;
    desc: string;
    price: number;
    default?: boolean;
}

interface BillingCycleOption {
    value: BillingCycle;
    label: string;
    discount: number;
}

interface IndustryField {
    key: string;
    label: string;
    placeholder: string;
    type?: "number";
}

interface StepDef {
    title: string;
}

interface AllData {
    orgType?: OrgType;
    organizationName?: string;
    slug?: string;
    contactEmail?: string;
    contactPhone?: string;
    address?: string;
    gstIn?: string;
    panNumber?: string;
    displayName?: string;
    userName?: string;
    email?: string;
    phoneNumber?: string;
    password?: string;
    gender?: string;
    meta?: Record<string, unknown>;
    subscriptionStartDate?: unknown;
    invoiceDueDays?: number;
    paymentMethod?: string;
    autoReminderDays?: number;
    subscriptionNotes?: string;
    sendWelcomeEmail?: boolean;
    sendFirstInvoice?: boolean;
    selectedModules?: ModuleKey[];
    billingCycle?: BillingCycle;
    monthlyAmount?: number;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const ORG_TYPES: OrgTypeOption[] = [
    { value: "restaurant", label: "🍽️ Restaurant / F&B", color: "#f97316" },
    { value: "retail", label: "🛍️ Retail / E-commerce", color: "#8b5cf6" },
    { value: "hospital", label: "🏥 Healthcare / Hospital", color: "#10b981" },
    { value: "logistics", label: "🚚 Logistics / Transport", color: "#3b82f6" },
    { value: "other", label: "🏢 Other Business", color: "#6b7280" },
];

const MODULES: ModuleOption[] = [
    { key: "pos", label: "Point of Sale", icon: "💳", desc: "Orders, billing, tables", price: 999 },
    { key: "hrm", label: "HR Management", icon: "👥", desc: "Employees, attendance, leaves", price: 799, default: true },
    { key: "inventory", label: "Inventory", icon: "📦", desc: "Stock, suppliers, warehouses", price: 699 },
    { key: "payroll", label: "Payroll", icon: "💰", desc: "Salary, deductions, payslips", price: 599 },
    { key: "ai", label: "AI Assistant", icon: "🤖", desc: "Insights, automation, reports", price: 1499 },
];

const BILLING_CYCLES: BillingCycleOption[] = [
    { value: "monthly", label: "Monthly", discount: 0 },
    { value: "quarterly", label: "Quarterly", discount: 10 },
    { value: "annual", label: "Annual", discount: 20 },
];

const INDUSTRY_EXTRA_FIELDS: Record<OrgType, IndustryField[]> = {
    restaurant: [
        { key: "fssaiLicense", label: "FSSAI License No.", placeholder: "10-digit FSSAI number" },
        { key: "numberOfTables", label: "Number of Tables", placeholder: "e.g. 20", type: "number" },
        { key: "cuisineType", label: "Cuisine Type", placeholder: "e.g. North Indian, Chinese" },
        { key: "operatingHours", label: "Operating Hours", placeholder: "e.g. 10:00 AM – 11:00 PM" },
    ],
    retail: [
        { key: "registrationNo", label: "Business Registration No.", placeholder: "MCA / ROC number" },
        { key: "numberOfOutlets", label: "Number of Outlets", placeholder: "e.g. 3", type: "number" },
        { key: "productCategories", label: "Product Categories", placeholder: "e.g. Electronics, Apparel" },
    ],
    hospital: [
        { key: "registrationNo", label: "Hospital Registration No.", placeholder: "Health dept. reg. no." },
        { key: "numberOfBeds", label: "Number of Beds", placeholder: "e.g. 50", type: "number" },
        { key: "specializations", label: "Specializations", placeholder: "e.g. Cardiology, Ortho" },
        { key: "emergencyContact", label: "Emergency Contact", placeholder: "24/7 helpline number" },
    ],
    logistics: [
        { key: "registrationNo", label: "Transport License No.", placeholder: "Permit/Registration" },
        { key: "fleetSize", label: "Fleet Size", placeholder: "e.g. 15 vehicles", type: "number" },
        { key: "operatingZones", label: "Operating Zones", placeholder: "e.g. Mumbai, Pune, Nashik" },
    ],
    other: [
        { key: "registrationNo", label: "Business Registration No.", placeholder: "Any govt. reg. number" },
        { key: "industry", label: "Industry Vertical", placeholder: "e.g. Education, Technology" },
    ],
};

const BASE_PLATFORM_PRICE = 499;

// ─── StepIndicator ────────────────────────────────────────────────────────────

interface StepIndicatorProps {
    current: number;
    steps: StepDef[];
}

const StepIndicator: React.FC<StepIndicatorProps> = ({ current, steps }) => (
    <div style={{
        background: "linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)",
        padding: "32px 40px",
        borderRadius: "16px 16px 0 0",
        position: "relative",
        overflow: "hidden",
    }}>
        <div style={{
            position: "absolute", top: 0, right: 0, width: 300, height: 300,
            background: "radial-gradient(circle, rgba(99,102,241,0.15) 0%, transparent 70%)",
            borderRadius: "50%", transform: "translate(50px, -100px)",
        }} />
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", position: "relative", zIndex: 1 }}>
            {steps.map((step, idx) => (
                <div key={idx} style={{ display: "flex", alignItems: "center", flex: idx < steps.length - 1 ? 1 : "none" }}>
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", minWidth: 80 }}>
                        <div style={{
                            width: 40, height: 40, borderRadius: "50%",
                            background: idx < current ? "#6366f1" : idx === current ? "linear-gradient(135deg, #6366f1, #8b5cf6)" : "rgba(255,255,255,0.1)",
                            border: idx === current ? "3px solid #a5b4fc" : "2px solid transparent",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            fontSize: idx < current ? 16 : 14,
                            color: idx <= current ? "#fff" : "rgba(255,255,255,0.4)",
                            fontWeight: 700,
                            boxShadow: idx === current ? "0 0 20px rgba(99,102,241,0.5)" : "none",
                            transition: "all 0.3s",
                        }}>
                            {idx < current ? "✓" : idx + 1}
                        </div>
                        <div style={{
                            marginTop: 8, fontSize: 11,
                            fontWeight: idx === current ? 600 : 400,
                            color: idx === current ? "#a5b4fc" : idx < current ? "#6366f1" : "rgba(255,255,255,0.3)",
                            textAlign: "center", whiteSpace: "nowrap",
                        }}>
                            {step.title}
                        </div>
                    </div>
                    {idx < steps.length - 1 && (
                        <div style={{
                            flex: 1, height: 2, margin: "0 8px", marginBottom: 18,
                            background: idx < current ? "#6366f1" : "rgba(255,255,255,0.1)",
                            transition: "all 0.3s",
                        }} />
                    )}
                </div>
            ))}
        </div>
    </div>
);

// ─── Step 1: Org Basics ───────────────────────────────────────────────────────

interface Step1Props {
    form: FormInstance;
    onOrgTypeChange: (type: OrgType) => void;
    savedOrgType: OrgType | null;
}

const Step1OrgBasics: React.FC<Step1Props> = ({ form, onOrgTypeChange, savedOrgType }) => {
    const [selectedType, setSelectedType] = useState<OrgType | null>(savedOrgType);

    return (
        <div>
            <div style={{ marginBottom: 32 }}>
                <Title level={4} style={{ margin: 0, color: "#1e1b4b" }}>Organization Basics</Title>
                <Text type="secondary">Tell us about your business to get started</Text>
            </div>

            <Form.Item name="orgType" label="Business Type" rules={[{ required: true, message: "Please select a business type" }]}>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
                    {ORG_TYPES.map((t) => (
                        <div
                            key={t.value}
                            onClick={() => {
                                setSelectedType(t.value);
                                form.setFieldValue("orgType", t.value);
                                onOrgTypeChange(t.value);
                            }}
                            style={{
                                padding: "14px 16px", borderRadius: 10, cursor: "pointer",
                                border: `2px solid ${selectedType === t.value ? t.color : "#e5e7eb"}`,
                                background: selectedType === t.value ? `${t.color}10` : "#fff",
                                transition: "all 0.2s", display: "flex", alignItems: "center", gap: 8,
                            }}
                        >
                            <span style={{ fontSize: 20 }}>{t.label.split(" ")[0]}</span>
                            <span style={{
                                fontSize: 13,
                                fontWeight: selectedType === t.value ? 600 : 400,
                                color: selectedType === t.value ? t.color : "#374151",
                            }}>
                                {t.label.split(" ").slice(1).join(" ")}
                            </span>
                        </div>
                    ))}
                </div>
            </Form.Item>

            <Row gutter={16}>
                <Col span={12}>
                    <Form.Item name="organizationName" label="Organization Name" rules={[{ required: true, message: "Organization name is required" }]}>
                        <Input size="large" placeholder="e.g. Burger House Pvt. Ltd." />
                    </Form.Item>
                </Col>
                <Col span={12}>
                    <Form.Item name="slug" label="URL Slug" rules={[
                        { required: true, message: "Slug is required" },
                        { pattern: /^[a-z0-9-]+$/, message: "Only lowercase, numbers, hyphens" },
                    ]}>
                        <Input size="large" placeholder="burger-house-delhi" addonBefore="app.yourplatform.com/" />
                    </Form.Item>
                </Col>
            </Row>

            <Row gutter={16}>
                <Col span={12}>
                    <Form.Item name="contactEmail" label="Contact Email" rules={[{ required: true, type: "email", message: "Valid email required" }]}>
                        <Input size="large" placeholder="owner@company.com" />
                    </Form.Item>
                </Col>
                <Col span={12}>
                    <Form.Item name="contactPhone" label="Contact Phone" rules={[
                        { required: true, message: "Phone is required" },
                        { pattern: /^[0-9]{10}$/, message: "10-digit number required" },
                    ]}>
                        <Input size="large" placeholder="9876543210" addonBefore="+91" />
                    </Form.Item>
                </Col>
            </Row>

            <Form.Item name="address" label="Business Address">
                <TextArea rows={2} placeholder="Full business address..." />
            </Form.Item>

            <Row gutter={16}>
                <Col span={12}>
                    <Form.Item name="gstIn" label={<span>GST Number <Text type="secondary" style={{ fontSize: 12 }}>(Optional)</Text></span>}>
                        <Input size="large" placeholder="22AAAAA0000A1Z5" style={{ textTransform: "uppercase" }} />
                    </Form.Item>
                </Col>
                <Col span={12}>
                    <Form.Item name="panNumber" label={<span>PAN Number <Text type="secondary" style={{ fontSize: 12 }}>(Optional)</Text></span>}>
                        <Input size="large" placeholder="AAAAA9999A" style={{ textTransform: "uppercase" }} />
                    </Form.Item>
                </Col>
            </Row>
        </div>
    );
};

// ─── Step 2: Industry Details + Admin Account ─────────────────────────────────

interface Step2Props {
    form: FormInstance;
    orgType: OrgType;
}

const Step2IndustryDetails: React.FC<Step2Props> = ({ form: _form, orgType }) => {
    const fields = INDUSTRY_EXTRA_FIELDS[orgType] ?? INDUSTRY_EXTRA_FIELDS.other;
    const typeInfo = ORG_TYPES.find((t) => t.value === orgType);

    return (
        <div>
            <div style={{ marginBottom: 32 }}>
                <Title level={4} style={{ margin: 0, color: "#1e1b4b" }}>{typeInfo?.label} Details</Title>
                <Text type="secondary">Industry-specific information helps us tailor your experience</Text>
            </div>

            <div style={{
                background: `linear-gradient(135deg, ${typeInfo?.color}15, ${typeInfo?.color}05)`,
                border: `1px solid ${typeInfo?.color}30`,
                borderRadius: 12, padding: "16px 20px", marginBottom: 24,
            }}>
                <Text style={{ color: typeInfo?.color, fontWeight: 600 }}>{typeInfo?.label} Module</Text>
                <br />
                <Text type="secondary" style={{ fontSize: 13 }}>
                    These fields will be stored and used when we add more {typeInfo?.value}-specific features.
                </Text>
            </div>

            <Row gutter={16}>
                {fields.map((field) => (
                    <Col span={12} key={field.key}>
                        <Form.Item name={["meta", field.key]} label={field.label}>
                            {field.type === "number" ? (
                                <InputNumber size="large" placeholder={field.placeholder} style={{ width: "100%" }} />
                            ) : (
                                <Input size="large" placeholder={field.placeholder} />
                            )}
                        </Form.Item>
                    </Col>
                ))}
            </Row>

            <Divider />

            <Title level={5} style={{ color: "#1e1b4b", marginBottom: 16 }}>Admin Account</Title>

            <Row gutter={16}>
                <Col span={12}>
                    <Form.Item name="displayName" label="Admin Full Name" rules={[{ required: true, message: "Name is required" }]}>
                        <Input size="large" placeholder="John Doe" />
                    </Form.Item>
                </Col>
                <Col span={12}>
                    <Form.Item name="userName" label="Username" rules={[
                        { required: true, message: "Username is required" },
                        { pattern: /^[a-z0-9_]+$/, message: "Lowercase, numbers, underscore only" },
                    ]}>
                        <Input size="large" placeholder="johndoe" />
                    </Form.Item>
                </Col>
            </Row>

            <Row gutter={16}>
                <Col span={12}>
                    <Form.Item name="email" label="Admin Email" rules={[{ required: true, type: "email", message: "Valid email required" }]}>
                        <Input size="large" placeholder="admin@company.com" />
                    </Form.Item>
                </Col>
                <Col span={12}>
                    <Form.Item name="phoneNumber" label="Admin Phone" rules={[
                        { required: true, message: "Phone is required" },
                        { pattern: /^[0-9]{10}$/, message: "10-digit number" },
                    ]}>
                        <Input size="large" placeholder="9876543210" addonBefore="+91" />
                    </Form.Item>
                </Col>
            </Row>

            <Row gutter={16}>
                <Col span={12}>
                    <Form.Item name="password" label="Initial Password" rules={[
                        { required: true, message: "Password is required" },
                        { min: 8, message: "Minimum 8 characters" },
                    ]}>
                        <Input.Password size="large" placeholder="Min 8 characters" />
                    </Form.Item>
                </Col>
                <Col span={12}>
                    <Form.Item name="gender" label="Gender">
                        <Select size="large" placeholder="Select gender">
                            <Option value="male">Male</Option>
                            <Option value="female">Female</Option>
                            <Option value="other">Other</Option>
                        </Select>
                    </Form.Item>
                </Col>
            </Row>
        </div>
    );
};

// ─── Step 3: Modules & Pricing ────────────────────────────────────────────────

interface Step3Props {
    selectedModules: ModuleKey[];
    setSelectedModules: React.Dispatch<React.SetStateAction<ModuleKey[]>>;
    billingCycle: BillingCycle;
    setBillingCycle: React.Dispatch<React.SetStateAction<BillingCycle>>;
}

const Step3Modules: React.FC<Step3Props> = ({ selectedModules, setSelectedModules, billingCycle, setBillingCycle }) => {
    const toggleModule = (key: ModuleKey) => {
        if (key === "hrm") return;
        setSelectedModules((prev) => prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]);
    };

    const moduleTotal = MODULES.filter((m) => selectedModules.includes(m.key)).reduce((sum, m) => sum + m.price, 0);
    const cycleInfo = BILLING_CYCLES.find((b) => b.value === billingCycle);
    const discount = cycleInfo?.discount ?? 0;
    const total = BASE_PLATFORM_PRICE + moduleTotal;
    const discountedTotal = total * (1 - discount / 100);
    const cycleMultiplier = billingCycle === "monthly" ? 1 : billingCycle === "quarterly" ? 3 : 12;

    return (
        <div>
            <div style={{ marginBottom: 32 }}>
                <Title level={4} style={{ margin: 0, color: "#1e1b4b" }}>Modules & Pricing</Title>
                <Text type="secondary">Select the modules this organization needs</Text>
            </div>

            <Row gutter={24}>
                <Col span={15}>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 24 }}>
                        {MODULES.map((m) => {
                            const isSelected = selectedModules.includes(m.key);
                            const isLocked = m.key === "hrm";
                            return (
                                <div
                                    key={m.key}
                                    onClick={() => !isLocked && toggleModule(m.key)}
                                    style={{
                                        padding: 16, borderRadius: 12,
                                        cursor: isLocked ? "default" : "pointer",
                                        border: `2px solid ${isSelected ? "#6366f1" : "#e5e7eb"}`,
                                        background: isSelected ? "#6366f110" : "#fff",
                                        transition: "all 0.2s", position: "relative",
                                    }}
                                >
                                    {isLocked && (
                                        <div style={{ position: "absolute", top: 8, right: 8 }}>
                                            <Tag color="blue" style={{ fontSize: 10 }}>Default</Tag>
                                        </div>
                                    )}
                                    {isSelected && !isLocked && (
                                        <div style={{
                                            position: "absolute", top: 8, right: 8,
                                            width: 20, height: 20, background: "#6366f1",
                                            borderRadius: "50%", display: "flex",
                                            alignItems: "center", justifyContent: "center",
                                            color: "#fff", fontSize: 12,
                                        }}>✓</div>
                                    )}
                                    <div style={{ fontSize: 24, marginBottom: 4 }}>{m.icon}</div>
                                    <div style={{ fontWeight: 600, fontSize: 14, color: "#1e1b4b" }}>{m.label}</div>
                                    <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 8 }}>{m.desc}</div>
                                    <div style={{ fontWeight: 700, color: isSelected ? "#6366f1" : "#374151" }}>
                                        ₹{m.price.toLocaleString()}<span style={{ fontWeight: 400, fontSize: 11 }}>/mo</span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    <Divider>Billing Cycle</Divider>
                    <div style={{ display: "flex", gap: 12 }}>
                        {BILLING_CYCLES.map((cycle) => (
                            <div
                                key={cycle.value}
                                onClick={() => setBillingCycle(cycle.value)}
                                style={{
                                    flex: 1, padding: "12px 16px", borderRadius: 10, cursor: "pointer",
                                    border: `2px solid ${billingCycle === cycle.value ? "#6366f1" : "#e5e7eb"}`,
                                    background: billingCycle === cycle.value ? "#6366f110" : "#fff",
                                    textAlign: "center", transition: "all 0.2s",
                                }}
                            >
                                <div style={{ fontWeight: 600, color: billingCycle === cycle.value ? "#6366f1" : "#374151" }}>
                                    {cycle.label}
                                </div>
                                {cycle.discount > 0 && (
                                    <Tag color="green" style={{ marginTop: 4, fontSize: 10 }}>Save {cycle.discount}%</Tag>
                                )}
                            </div>
                        ))}
                    </div>
                </Col>

                <Col span={9}>
                    <div style={{
                        background: "linear-gradient(135deg, #0f172a, #1e1b4b)",
                        borderRadius: 16, padding: 24, color: "#fff", position: "sticky", top: 0,
                    }}>
                        <Text style={{ color: "#a5b4fc", fontWeight: 600, fontSize: 12, letterSpacing: 1 }}>PRICING SUMMARY</Text>
                        <Divider style={{ borderColor: "rgba(255,255,255,0.1)", margin: "12px 0" }} />

                        <div style={{ marginBottom: 8 }}>
                            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                                <Text style={{ color: "rgba(255,255,255,0.6)", fontSize: 13 }}>Platform Base</Text>
                                <Text style={{ color: "#fff", fontSize: 13 }}>₹{BASE_PLATFORM_PRICE}/mo</Text>
                            </div>
                            {MODULES.filter((m) => selectedModules.includes(m.key)).map((m) => (
                                <div key={m.key} style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                                    <Text style={{ color: "rgba(255,255,255,0.6)", fontSize: 13 }}>{m.icon} {m.label}</Text>
                                    <Text style={{ color: "#fff", fontSize: 13 }}>₹{m.price}/mo</Text>
                                </div>
                            ))}
                        </div>

                        <Divider style={{ borderColor: "rgba(255,255,255,0.1)", margin: "12px 0" }} />

                        {discount > 0 && (
                            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                                <Text style={{ color: "#86efac", fontSize: 13 }}>Discount ({discount}%)</Text>
                                <Text style={{ color: "#86efac", fontSize: 13 }}>-₹{(total * discount / 100).toFixed(0)}/mo</Text>
                            </div>
                        )}

                        <div style={{ background: "rgba(255,255,255,0.05)", borderRadius: 10, padding: "12px 14px", marginBottom: 12 }}>
                            <Text style={{ color: "#a5b4fc", fontSize: 12 }}>Monthly charge</Text>
                            <div style={{ fontSize: 28, fontWeight: 800, color: "#fff", lineHeight: 1.2 }}>
                                ₹{discountedTotal.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                            </div>
                            <Text style={{ color: "rgba(255,255,255,0.4)", fontSize: 11 }}>
                                Billed {billingCycle === "monthly" ? "monthly" : `₹${(discountedTotal * cycleMultiplier).toFixed(0)} every ${billingCycle === "quarterly" ? "3 months" : "year"}`}
                            </Text>
                        </div>

                        {billingCycle !== "monthly" && (
                            <div style={{
                                background: "rgba(134,239,172,0.1)", border: "1px solid rgba(134,239,172,0.3)",
                                borderRadius: 8, padding: "8px 12px",
                            }}>
                                <Text style={{ color: "#86efac", fontSize: 12 }}>
                                    🎉 You save ₹{((total * discount / 100) * cycleMultiplier).toFixed(0)} over {billingCycle === "quarterly" ? "a quarter" : "a year"}!
                                </Text>
                            </div>
                        )}
                    </div>
                </Col>
            </Row>
        </div>
    );
};

// ─── Step 4: Subscription & Payment Setup ────────────────────────────────────

interface Step4Props {
    orgName?: string;
    billingCycle: BillingCycle;
    selectedModules: ModuleKey[];
    monthlyAmount: number;
}

const Step4Subscription: React.FC<Step4Props> = ({ orgName, billingCycle, selectedModules, monthlyAmount }) => {
    const cycleInfo = BILLING_CYCLES.find((b) => b.value === billingCycle);
    const discount = cycleInfo?.discount ?? 0;
    const discountedAmount = monthlyAmount * (1 - discount / 100);
    const cycleMultiplier = billingCycle === "monthly" ? 1 : billingCycle === "quarterly" ? 3 : 12;
    const invoiceAmount = discountedAmount * cycleMultiplier;

    return (
        <div>
            <div style={{ marginBottom: 32 }}>
                <Title level={4} style={{ margin: 0, color: "#1e1b4b" }}>Subscription & Payment Setup</Title>
                <Text type="secondary">Configure billing and payment tracking for this organization</Text>
            </div>

            <div style={{
                background: "linear-gradient(135deg, #f0fdf4, #dcfce7)",
                border: "1px solid #86efac", borderRadius: 12, padding: "16px 20px", marginBottom: 24,
            }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                        <Text style={{ fontWeight: 600, color: "#166534" }}>Subscription Summary</Text>
                        <br />
                        <Text style={{ color: "#15803d", fontSize: 13 }}>
                            {orgName ?? "This organization"} · {billingCycle} billing · {selectedModules.length} modules
                        </Text>
                    </div>
                    <div style={{ textAlign: "right" }}>
                        <div style={{ fontSize: 24, fontWeight: 800, color: "#166534" }}>
                            ₹{invoiceAmount.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                        </div>
                        <Text style={{ color: "#15803d", fontSize: 12 }}>
                            per {billingCycle === "monthly" ? "month" : billingCycle === "quarterly" ? "quarter" : "year"}
                        </Text>
                    </div>
                </div>
            </div>

            <Row gutter={16}>
                <Col span={12}>
                    <Form.Item name="subscriptionStartDate" label="Subscription Start Date" rules={[{ required: true, message: "Start date is required" }]}>
                        <DatePicker size="large" style={{ width: "100%" }} placeholder="Select start date" />
                    </Form.Item>
                </Col>
                <Col span={12}>
                    <Form.Item name="invoiceDueDays" label="Invoice Due Days" initialValue={7}>
                        <InputNumber size="large" style={{ width: "100%" }} min={1} max={90} addonAfter="days after issue" />
                    </Form.Item>
                </Col>
            </Row>

            <Row gutter={16}>
                <Col span={12}>
                    <Form.Item name="paymentMethod" label="Preferred Payment Method">
                        <Select size="large" placeholder="Select method">
                            <Option value="upi">UPI / NEFT</Option>
                            <Option value="bank_transfer">Bank Transfer</Option>
                            <Option value="card">Credit / Debit Card</Option>
                            <Option value="cheque">Cheque</Option>
                            <Option value="cash">Cash</Option>
                        </Select>
                    </Form.Item>
                </Col>
                <Col span={12}>
                    <Form.Item name="autoReminderDays" label="Send Reminder Before Due" initialValue={3}>
                        <InputNumber size="large" style={{ width: "100%" }} min={1} max={30} addonAfter="days before" />
                    </Form.Item>
                </Col>
            </Row>

            <Divider>Notes & Terms</Divider>

            <Form.Item name="subscriptionNotes" label="Internal Notes">
                <TextArea rows={3} placeholder="Any special terms, discounts, or notes for this client..." />
            </Form.Item>

            <Form.Item name="sendWelcomeEmail" valuePropName="checked" initialValue={true}>
                <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 16px", background: "#f8fafc", borderRadius: 8, border: "1px solid #e5e7eb" }}>
                    <Switch defaultChecked />
                    <div>
                        <Text style={{ fontWeight: 600 }}>Send Welcome Email to Admin</Text>
                        <br />
                        <Text type="secondary" style={{ fontSize: 12 }}>Include login credentials and getting started guide</Text>
                    </div>
                </div>
            </Form.Item>

            <Form.Item name="sendFirstInvoice" valuePropName="checked" initialValue={true}>
                <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 16px", background: "#f8fafc", borderRadius: 8, border: "1px solid #e5e7eb" }}>
                    <Switch defaultChecked />
                    <div>
                        <Text style={{ fontWeight: 600 }}>Send First Invoice Email</Text>
                        <br />
                        <Text type="secondary" style={{ fontSize: 12 }}>Automatically email the first invoice upon onboarding</Text>
                    </div>
                </div>
            </Form.Item>
        </div>
    );
};

// ─── Step 5: Review ───────────────────────────────────────────────────────────

interface Step5Props {
    allData: AllData;
}

const Step5Review: React.FC<Step5Props> = ({ allData }) => {
    const typeInfo = ORG_TYPES.find((t) => t.value === allData.orgType);
    const selectedModuleData = MODULES.filter((m) => (allData.selectedModules ?? []).includes(m.key));
    const cycleInfo = BILLING_CYCLES.find((b) => b.value === allData.billingCycle);
    const discount = cycleInfo?.discount ?? 0;
    const discountedMonthly = (allData.monthlyAmount ?? 0) * (1 - discount / 100);
    const cycleMultiplier = allData.billingCycle === "monthly" ? 1 : allData.billingCycle === "quarterly" ? 3 : 12;

    return (
        <div>
            <div style={{ marginBottom: 32 }}>
                <Title level={4} style={{ margin: 0, color: "#1e1b4b" }}>Review & Confirm</Title>
                <Text type="secondary">Please review all details before completing the onboarding</Text>
            </div>

            <Row gutter={16}>
                <Col span={12}>
                    <Card size="small" title={<span>🏢 Organization</span>} style={{ marginBottom: 16, borderRadius: 12 }}>
                        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                            <div><Text type="secondary">Name: </Text><Text strong>{allData.organizationName}</Text></div>
                            <div><Text type="secondary">Type: </Text><Tag color={typeInfo?.color}>{typeInfo?.label}</Tag></div>
                            <div><Text type="secondary">Email: </Text><Text>{allData.contactEmail}</Text></div>
                            <div><Text type="secondary">Phone: </Text><Text>+91 {allData.contactPhone}</Text></div>
                            {allData.gstIn && <div><Text type="secondary">GST: </Text><Text code>{allData.gstIn}</Text></div>}
                            <div><Text type="secondary">Slug: </Text><Text code>{allData.slug}</Text></div>
                        </div>
                    </Card>
                </Col>
                <Col span={12}>
                    <Card size="small" title={<span>👤 Admin Account</span>} style={{ marginBottom: 16, borderRadius: 12 }}>
                        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                            <div><Text type="secondary">Name: </Text><Text strong>{allData.displayName}</Text></div>
                            <div><Text type="secondary">Username: </Text><Text code>@{allData.userName}</Text></div>
                            <div><Text type="secondary">Email: </Text><Text>{allData.email}</Text></div>
                            <div><Text type="secondary">Phone: </Text><Text>+91 {allData.phoneNumber}</Text></div>
                        </div>
                    </Card>
                </Col>
            </Row>

            <Card size="small" title={<span>💳 Modules & Billing</span>} style={{ marginBottom: 16, borderRadius: 12 }}>
                <Row gutter={16}>
                    <Col span={14}>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 8 }}>
                            {selectedModuleData.map((m) => (
                                <Tag key={m.key} color="purple" style={{ padding: "4px 10px", fontSize: 13 }}>
                                    {m.icon} {m.label}
                                </Tag>
                            ))}
                        </div>
                    </Col>
                    <Col span={10} style={{ textAlign: "right" }}>
                        <div style={{ fontSize: 22, fontWeight: 800, color: "#6366f1" }}>
                            ₹{(discountedMonthly * cycleMultiplier).toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                        </div>
                        <Text type="secondary" style={{ fontSize: 12 }}>
                            per {allData.billingCycle === "monthly" ? "month" : allData.billingCycle === "quarterly" ? "quarter" : "year"}
                            {discount > 0 ? ` (${discount}% discount applied)` : ""}
                        </Text>
                    </Col>
                </Row>
            </Card>

            <Alert
                message="Ready to onboard!"
                description="Clicking 'Complete Onboarding' will create the organization, admin account, and configure all selected modules. Invoice will be sent to the contact email."
                type="success"
                showIcon
                style={{ borderRadius: 12 }}
            />
        </div>
    );
};

// ─── Main Component ───────────────────────────────────────────────────────────

interface OrgOnboardingProps {
    onSuccess?: (data: AllData) => void;
    onCancel?: () => void;
}

const STEPS: StepDef[] = [
    { title: "Basics" },
    { title: "Details" },
    { title: "Modules" },
    { title: "Billing" },
    { title: "Review" },
];

const OrgOnboarding: React.FC<OrgOnboardingProps> = ({ onSuccess, onCancel }) => {
    const [form] = Form.useForm();
    const [current, setCurrent] = useState<number>(0);
    const [orgType, setOrgType] = useState<OrgType>("other");
    const [selectedModules, setSelectedModules] = useState<ModuleKey[]>(["hrm"]);
    const [billingCycle, setBillingCycle] = useState<BillingCycle>("monthly");
    const [allData, setAllData] = useState<AllData>({});
    const [loading, setLoading] = useState<boolean>(false);
    const [done, setDone] = useState<boolean>(false);
    const navigate = useNavigate();

    const moduleTotal = MODULES.filter((m) => selectedModules.includes(m.key)).reduce((sum, m) => sum + m.price, 0);
    const monthlyAmount = BASE_PLATFORM_PRICE + moduleTotal;

    // ── Persist current step values → advance ────────────────────────────────
    const handleNext = async () => {
        try {
            await form.validateFields();
            const currentValues = form.getFieldsValue() as AllData;

            // Accumulate all values across steps into allData
            const merged: AllData = {
                ...allData,
                ...currentValues,
                selectedModules,
                billingCycle,
                monthlyAmount,
                orgType,
            };
            setAllData(merged);

            // Re-hydrate the form with accumulated values so going back
            // and forward never loses data that antd unmounted
            form.setFieldsValue(merged);

            setCurrent((c) => c + 1);
        } catch {
            // Inline validation errors shown by antd — no action needed
        }
    };

    // ── Save current step values → go back ───────────────────────────────────
    const handleBack = () => {
        const currentValues = form.getFieldsValue() as AllData;
        const merged: AllData = { ...allData, ...currentValues };
        setAllData(merged);
        form.setFieldsValue(merged);
        setCurrent((c) => c - 1);
    };

    // ── Final submit ──────────────────────────────────────────────────────────
    const handleSubmit = async () => {
        setLoading(true);
        try {
            // Merge final step's live values with everything accumulated so far
            const currentValues = form.getFieldsValue() as AllData;
            const merged: AllData = {
                ...allData,
                ...currentValues,
                selectedModules,
                billingCycle,
                monthlyAmount,
                orgType,
            };

            const formData = new FormData();

            // ── Admin fields ──────────────────────────────────────────────
            formData.append("email", merged.email ?? "");
            formData.append("userName", merged.userName ?? "");
            formData.append("phoneNumber", merged.phoneNumber ?? "");
            formData.append("displayName", merged.displayName ?? "");
            formData.append("password", merged.password ?? "");
            formData.append("gender", merged.gender ?? "");

            // ── Org fields ────────────────────────────────────────────────
            formData.append("organizationName", merged.organizationName ?? "");
            formData.append("orgType", merged.orgType ?? orgType);
            formData.append("slug", merged.slug ?? "");
            formData.append("contactPhone", merged.contactPhone ?? "");
            formData.append("organizationAddress", merged.address ?? "");

            // ── Modules → JSON string (multer can't handle nested objects) 
            formData.append(
                "modules",
                JSON.stringify(
                    Object.fromEntries(
                        (["pos", "hrm", "inventory", "payroll", "ai"] as ModuleKey[]).map(
                            (key) => [key, selectedModules.includes(key)]
                        )
                    )
                )
            );

            // ── Meta → JSON string ────────────────────────────────────────
            formData.append(
                "meta",
                JSON.stringify({
                    ...(merged.meta ?? {}),
                    gstIn: merged.gstIn,
                    panNumber: merged.panNumber,
                    billingCycle,
                    monthlyAmount,
                    paymentMethod: merged.paymentMethod,
                    invoiceDueDays: merged.invoiceDueDays,
                    autoReminderDays: merged.autoReminderDays,
                    subscriptionNotes: merged.subscriptionNotes,
                    subscriptionStartDate: merged.subscriptionStartDate,
                    sendWelcomeEmail: merged.sendWelcomeEmail ?? true,
                    sendFirstInvoice: merged.sendFirstInvoice ?? true,
                })
            );

            const { data } = await createOrganization(formData);

            setAllData(merged);
            setDone(true);
            onSuccess?.(data);
        } catch (err: any) {
            const message = err?.response?.data?.message ?? err?.message ?? "Something went wrong";
            notification.error({ message: "Onboarding Failed", description: message, placement: "topRight" });
        } finally {
            setLoading(false);
        }
    };

    // ── Success screen ────────────────────────────────────────────────────────
    if (done) {
        return (
            <div style={{
                minHeight: "100vh",
                background: "linear-gradient(135deg, #f8faff 0%, #f0f4ff 100%)",
                display: "flex", alignItems: "center", justifyContent: "center", padding: 40,
            }}>
                <Result
                    status="success"
                    icon={
                        <div style={{
                            width: 80, height: 80, borderRadius: "50%",
                            background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            fontSize: 36, margin: "0 auto",
                        }}>🎉</div>
                    }
                    title={<Title level={3} style={{ color: "#1e1b4b" }}>Onboarding Complete!</Title>}
                    subTitle={
                        <div style={{ maxWidth: 400 }}>
                            <Paragraph style={{ color: "#6b7280" }}>
                                <strong>{allData.organizationName}</strong> has been successfully onboarded.
                                Admin credentials have been sent to <strong>{allData.email}</strong>.
                            </Paragraph>
                            <Timeline
                                style={{ marginTop: 24, textAlign: "left" }}
                                items={[
                                    { color: "green", children: `Organization created with ${selectedModules.length} modules` },
                                    { color: "green", children: `Admin account created for ${allData.displayName}` },
                                    { color: "green", children: `Billing configured · ${billingCycle} · ₹${monthlyAmount.toLocaleString()}/mo` },
                                    { color: "blue", children: "Welcome email queued" },
                                    { color: "blue", children: "First invoice scheduled" },
                                ]}
                            />
                        </div>
                    }
                    extra={[
                        <Button
                            key="view" type="primary" size="large"
                            style={{ background: "#6366f1", borderColor: "#6366f1" }}
                            onClick={() => navigate("/superadmin/organizations")}
                        >
                            Done
                        </Button>,
                        <Button
                            key="new" size="large"
                            onClick={() => { setDone(false); setCurrent(0); setAllData({}); form.resetFields(); }}
                        >
                            Onboard Another
                        </Button>,
                    ]}
                />
            </div>
        );
    }

    // ── Wizard ────────────────────────────────────────────────────────────────
    return (
        <div style={{
            minHeight: "100vh",
            background: "linear-gradient(135deg, #f8faff 0%, #f0f4ff 100%)",
            padding: "32px 24px",
            fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
        }}>
            <div style={{ margin: "0 auto" }}>

                {/* Header */}
                <div style={{ marginBottom: 24, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
                            <div style={{
                                width: 32, height: 32, borderRadius: 8,
                                background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                                display: "flex", alignItems: "center", justifyContent: "center",
                                color: "#fff", fontSize: 16, fontWeight: 700,
                            }}>S</div>
                            <Text style={{ fontWeight: 700, fontSize: 16, color: "#1e1b4b" }}>SaaSPlatform</Text>
                        </div>
                        <Title level={3} style={{ margin: 0, color: "#1e1b4b" }}>Onboard New Organization</Title>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <Text type="secondary" style={{ fontSize: 13 }}>Step {current + 1} of {STEPS.length}</Text>
                        <Progress
                            type="circle"
                            percent={Math.round(((current + 1) / STEPS.length) * 100)}
                            size={44}
                            strokeColor="#6366f1"
                            format={(p) => <span style={{ fontSize: 11, fontWeight: 700 }}>{p}%</span>}
                        />
                    </div>
                </div>

                {/* Card */}
                <div style={{
                    background: "#fff", borderRadius: 20,
                    boxShadow: "0 20px 60px rgba(99,102,241,0.12), 0 4px 16px rgba(0,0,0,0.06)",
                    overflow: "hidden",
                }}>
                    <StepIndicator current={current} steps={STEPS} />

                    <div style={{ padding: "36px 40px" }}>
                        <Form form={form} layout="vertical" requiredMark={false}>
                            {current === 0 && (
                                <Step1OrgBasics
                                    form={form}
                                    onOrgTypeChange={setOrgType}
                                    savedOrgType={allData.orgType ?? null}
                                />
                            )}
                            {current === 1 && <Step2IndustryDetails form={form} orgType={orgType} />}
                            {current === 2 && (
                                <Step3Modules
                                    selectedModules={selectedModules}
                                    setSelectedModules={setSelectedModules}
                                    billingCycle={billingCycle}
                                    setBillingCycle={setBillingCycle}
                                />
                            )}
                            {current === 3 && (
                                <Step4Subscription
                                    orgName={allData.organizationName}
                                    billingCycle={billingCycle}
                                    selectedModules={selectedModules}
                                    monthlyAmount={monthlyAmount}
                                />
                            )}
                            {current === 4 && (
                                <Step5Review allData={{ ...allData, selectedModules, billingCycle, monthlyAmount }} />
                            )}
                        </Form>

                        {/* Navigation */}
                        <div style={{
                            display: "flex", justifyContent: "space-between", alignItems: "center",
                            marginTop: 32, paddingTop: 24, borderTop: "1px solid #f1f5f9",
                        }}>
                            <Button
                                size="large"
                                onClick={current === 0 ? onCancel : handleBack}
                                style={{ borderRadius: 10, minWidth: 120 }}
                            >
                                {current === 0 ? "Cancel" : "← Back"}
                            </Button>

                            <div style={{ display: "flex", gap: 8 }}>
                                {STEPS.map((_, idx) => (
                                    <div key={idx} style={{
                                        width: idx === current ? 24 : 8, height: 8, borderRadius: 4,
                                        background: idx === current ? "#6366f1" : idx < current ? "#a5b4fc" : "#e5e7eb",
                                        transition: "all 0.3s",
                                    }} />
                                ))}
                            </div>

                            {current < STEPS.length - 1 ? (
                                <Button
                                    type="primary" size="large" onClick={handleNext}
                                    style={{
                                        background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                                        borderColor: "transparent", borderRadius: 10, minWidth: 140,
                                        boxShadow: "0 4px 14px rgba(99,102,241,0.35)",
                                    }}
                                >
                                    Continue →
                                </Button>
                            ) : (
                                <Button
                                    type="primary" size="large" loading={loading} onClick={handleSubmit}
                                    style={{
                                        background: "linear-gradient(135deg, #059669, #10b981)",
                                        borderColor: "transparent", borderRadius: 10, minWidth: 180,
                                        boxShadow: "0 4px 14px rgba(16,185,129,0.35)",
                                    }}
                                >
                                    ✓ Complete Onboarding
                                </Button>
                            )}
                        </div>
                    </div>
                </div>

                <Text type="secondary" style={{ display: "block", textAlign: "center", marginTop: 16, fontSize: 12 }}>
                    All data is encrypted · Compliant with IT Act, 2000 · GDPR Ready
                </Text>
            </div>
        </div>
    );
};

export default OrgOnboarding;