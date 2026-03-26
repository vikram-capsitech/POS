import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Layout,
  Typography,
  Button,
  Space,
  Image,
  Row,
  Col,
  Card,
  Divider,
  Tag,
  Tooltip,
  Input,
  Spin,
  Collapse,
  Segmented,
  Badge,
  Grid,
} from "antd";
import {
  ShopOutlined,
  BarChartOutlined,
  SyncOutlined,
  ThunderboltOutlined,
  LoginOutlined,
  MessageOutlined,
  SendOutlined,
  CloseOutlined,
  CheckCircleFilled,
  UsergroupAddOutlined,
  BlockOutlined,
  SafetyCertificateOutlined,
  ClockCircleOutlined,
  CustomerServiceOutlined,
  CreditCardOutlined,
  RiseOutlined,
  ApiOutlined,
} from "@ant-design/icons";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
// Mockup image — replace with the real screenshot asset at src/Assets/Images/OutletOpsMockup.png
const OutletOpsMockup = "https://placehold.co/1200x720/0f172a/1677ff?text=OutletOps+Dashboard";
import apiClient from "../Api";
import { BotMessage } from "../Components/BotMessage";

const { Title, Paragraph, Text } = Typography;
const { Header, Content, Footer } = Layout;
const { useBreakpoint } = Grid;

const INR = (amount: number) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(amount);

type BillingMode = "Monthly" | "Yearly";
type ChatMsg = { sender: "bot" | "user"; text: string };

const coreFeatures = [
  {
    icon: <ShopOutlined style={{ fontSize: 34, color: "#1677ff" }} />,
    title: "Multi-Outlet Management",
    description:
      "Manage inventory, sales, and operations across all branches from a single dashboard. Branch-level settings and role-based access.",
  },
  {
    icon: <ThunderboltOutlined style={{ fontSize: 34, color: "#eb2f96" }} />,
    title: "Lightning Fast POS",
    description:
      "Fast billing, split checks, discounts, receipt printing, and peak-hour reliability. Designed for restaurants and retail.",
  },
  {
    icon: <BlockOutlined style={{ fontSize: 34, color: "#52c41a" }} />,
    title: "Inventory & Stock",
    description:
      "Real-time stock tracking, low-stock alerts, purchase requests, supplier workflows, and waste reduction insights.",
  },
  {
    icon: <UsergroupAddOutlined style={{ fontSize: 34, color: "#fa8c16" }} />,
    title: "Workforce & HR",
    description:
      "Attendance with selfie check-in, breaks, working hours, leave approvals, salary management, and staff performance visibility.",
  },
  {
    icon: <BarChartOutlined style={{ fontSize: 34, color: "#722ed1" }} />,
    title: "Analytics & Finance",
    description:
      "Daily/weekly/monthly sales trends, expense tracking, profit signals, outlet comparisons, and export-ready reports.",
  },
  {
    icon: <SyncOutlined style={{ fontSize: 34, color: "#13c2c2" }} />,
    title: "Cloud Sync",
    description:
      "Live data sync across devices for owners/managers. Secure access and fast operations even with multiple outlets.",
  },
];

const suiteHighlights = [
  { icon: <ApiOutlined />, title: "Roles & Access", desc: "Admin/Superadmin roles, permissions per module." },
  { icon: <ClockCircleOutlined />, title: "Tasks / SOP", desc: "Daily checklists with completion tracking." },
  { icon: <CustomerServiceOutlined />, title: "Kitchen + Waiter", desc: "Table & orders + kitchen display flows." },
  { icon: <CreditCardOutlined />, title: "Payments", desc: "Subscription billing + invoices (plan-based)." },
  { icon: <RiseOutlined />, title: "Audit & Logs", desc: "Activity logs and key actions visibility." },
  { icon: <SafetyCertificateOutlined />, title: "Security", desc: "Secure access patterns and operational controls." },
];

type Plan = {
  id: "starter" | "growth" | "pro" | "payg";
  name: string;
  subtitle: string;
  badge?: string;
  monthly?: number; // INR
  yearly?: number; // INR (total per year)
  payg?: { base: number; perOutlet: number; perPosDevice: number }; // INR
  included: string[];
  cta: string;
};

const plans: Plan[] = [
  {
    id: "starter",
    name: "Starter",
    subtitle: "For single outlet getting started",
    monthly: 1999,
    yearly: 1999 * 12 * 0.83, // ~17% off example
    included: [
      "1 Outlet",
      "POS billing + receipts",
      "Inventory basics + low stock alerts",
      "Attendance + leave",
      "Basic analytics",
      "Email support",
    ],
    cta: "Start Starter",
  },
  {
    id: "growth",
    name: "Growth",
    subtitle: "For growing teams and multiple modules",
    badge: "Most Popular",
    monthly: 3999,
    yearly: 3999 * 12 * 0.8, // ~20% off example
    included: [
      "Up to 3 Outlets",
      "POS + discounts + split bills",
      "Inventory + purchase requests",
      "Tasks/SOP + completion tracking",
      "Expenses + reports",
      "Priority support",
    ],
    cta: "Choose Growth",
  },
  {
    id: "pro",
    name: "Pro",
    subtitle: "For multi-outlet operations and deeper control",
    monthly: 6999,
    yearly: 6999 * 12 * 0.78, // ~22% off example
    included: [
      "Up to 10 Outlets",
      "Kitchen display + waiter flows",
      "Advanced analytics + outlet comparison",
      "Salary management",
      "Activity logs",
      "Dedicated onboarding",
    ],
    cta: "Go Pro",
  },
  {
    id: "payg",
    name: "Pay as you go",
    subtitle: "Flexible pricing for seasonal usage",
    payg: { base: 999, perOutlet: 499, perPosDevice: 299 },
    included: [
      "Base platform access",
      "Add outlets when needed",
      "Add POS devices when needed",
      "Core modules available",
      "Email support",
    ],
    cta: "Use PayG",
  },
];

const faqs = [
  {
    key: "1",
    label: "Is OutletOps subscription-based?",
    children: (
      <div style={{ color: "#64748b", lineHeight: 1.7 }}>
        Yes. You can choose monthly or yearly plans. Yearly plans are discounted. You can also choose Pay-as-you-go for
        flexible usage.
      </div>
    ),
  },
  {
    key: "2",
    label: "Does it support restaurants (waiter + kitchen)?",
    children: (
      <div style={{ color: "#64748b", lineHeight: 1.7 }}>
        Yes. OutletOps supports Table & Orders (waiter flow) and Kitchen Display, plus POS billing and inventory.
      </div>
    ),
  },
  {
    key: "3",
    label: "Can I control staff access by role?",
    children: (
      <div style={{ color: "#64748b", lineHeight: 1.7 }}>
        Yes. Admin/Superadmin and module-level permissions can be configured to control what each user can view or manage.
      </div>
    ),
  },
  {
    key: "4",
    label: "Can I switch plans later?",
    children: (
      <div style={{ color: "#64748b", lineHeight: 1.7 }}>
        Yes. You can upgrade/downgrade based on your outlet count and required modules.
      </div>
    ),
  },
];

const SectionHeader = ({ title, subtitle }: { title: string; subtitle: string }) => (
  <div style={{ textAlign: "center", marginBottom: 64 }}>
    <Title level={2} style={{ fontSize: "2.6rem", fontWeight: 900, color: "#0f172a", marginBottom: 10 }}>
      {title}
    </Title>
    <Paragraph style={{ fontSize: "1.1rem", color: "#64748b", maxWidth: 720, margin: "0 auto" }}>
      {subtitle}
    </Paragraph>
  </div>
);

const WelcomePage = () => {
  const navigate = useNavigate();
  const screens = useBreakpoint();

  const [billingMode, setBillingMode] = useState<BillingMode>("Monthly");
  const [chatOpen, setChatOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [chatHistory, setChatHistory] = useState<ChatMsg[]>([
    {
      sender: "bot",
      text:
        "Welcome to OutletOps. Ask me about POS, inventory, attendance, tasks/SOP, analytics, pricing, or roles/permissions.",
    },
  ]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const isMobile = !screens.md;

  const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });

  useEffect(() => {
    if (chatOpen) scrollToBottom();
  }, [chatHistory, chatOpen]);

  const priceLabel = useMemo(() => {
    if (billingMode === "Monthly") return "per month";
    return "per year";
  }, [billingMode]);

  const handleSendMessage = async () => {
    if (!message.trim() || loading) return;

    const currentMessage = message.trim();
    const newHistory: any = [...chatHistory, { sender: "user", text: currentMessage }];
    setChatHistory(newHistory);
    setMessage("");
    setLoading(true);

    try {
      const response = await apiClient.post("/api/chat", {
        message: currentMessage,
        history: chatHistory,
      });

      const reply = response.data?.data?.text || "Sorry, I couldn't process your request. Please try again.";
      setChatHistory([...newHistory, { sender: "bot", text: reply }]);
    } catch (error) {
      console.error(error);
      setChatHistory([
        ...newHistory,
        { sender: "bot", text: "Sorry, I couldn't process your request. Please try again." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const goToSection = (id: string) => {
    const el = document.getElementById(id);
    if (!el) return;
    el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <Layout style={{ minHeight: "100vh", background: "#f8fafc", overflowX: "hidden" }}>
      {/* Navbar */}
      <Header
        style={{
          position: "fixed",
          zIndex: 100,
          width: "100%",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          background: "rgba(255, 255, 255, 0.78)",
          backdropFilter: "blur(14px)",
          borderBottom: "1px solid #e2e8f0",
          padding: isMobile ? "0 16px" : "0 48px",
        }}
      >
        <div
          style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }}
          onClick={() => goToSection("top")}
        >
          <div
            style={{
              width: 36,
              height: 36,
              background: "linear-gradient(135deg, #1677ff, #722ed1)",
              borderRadius: 10,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#fff",
              fontWeight: 900,
              fontSize: 18,
              boxShadow: "0 10px 20px rgba(114, 46, 209, 0.18)",
            }}
          >
            O
          </div>
          <div style={{ lineHeight: 1 }}>
            <Title level={4} style={{ margin: 0, fontWeight: 900, color: "#0f172a" }}>
              OutletOps
            </Title>
            <Text style={{ color: "#64748b", fontSize: 12, fontWeight: 600 }}>Retail + Restaurant Ops</Text>
          </div>
        </div>

        <Space size="middle" style={{ display: isMobile ? "none" : "flex" }}>
          <Text style={{ cursor: "pointer", color: "#0f172a", fontWeight: 600 }} onClick={() => goToSection("features")}>
            Features
          </Text>
          <Text style={{ cursor: "pointer", color: "#0f172a", fontWeight: 600 }} onClick={() => goToSection("pricing")}>
            Pricing
          </Text>
          <Text style={{ cursor: "pointer", color: "#0f172a", fontWeight: 600 }} onClick={() => goToSection("faq")}>
            FAQ
          </Text>
        </Space>

        <Space>
          <Button
            type="primary"
            icon={<LoginOutlined />}
            size="large"
            style={{
              background: "#0f172a",
              borderColor: "#0f172a",
              borderRadius: 26,
              fontWeight: 700,
              padding: isMobile ? "0 14px" : "0 24px",
            }}
            onClick={() => navigate("/auth/login")}
          >
            Sign In
          </Button>
        </Space>
      </Header>

      <Content id="top" style={{ paddingTop: 64 }}>
        {/* Hero */}
        <section
          style={{
            position: "relative",
            padding: isMobile ? "92px 16px 56px" : "120px 24px 76px",
            background: "linear-gradient(180deg, #f8fafc 0%, #e2e8f0 100%)",
            textAlign: "center",
          }}
        >
          {/* blurred blobs */}
          <div
            style={{
              position: "absolute",
              top: "12%",
              left: "12%",
              width: 420,
              height: 420,
              background: "#1677ff",
              opacity: 0.1,
              filter: "blur(110px)",
              borderRadius: "50%",
              pointerEvents: "none",
            }}
          />
          <div
            style={{
              position: "absolute",
              top: "18%",
              right: "12%",
              width: 320,
              height: 320,
              background: "#722ed1",
              opacity: 0.1,
              filter: "blur(90px)",
              borderRadius: "50%",
              pointerEvents: "none",
            }}
          />

          <motion.div
            initial={{ opacity: 0, y: 26 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            style={{ maxWidth: 980, margin: "0 auto", position: "relative", zIndex: 10 }}
          >
            <Space style={{ marginBottom: 14 }} wrap>
              <Tag
                color="geekblue"
                style={{ borderRadius: 999, padding: "4px 12px", fontWeight: 700 }}
              >
                POS • Inventory • HR • Analytics
              </Tag>
              <Tag
                color="purple"
                style={{ borderRadius: 999, padding: "4px 12px", fontWeight: 700 }}
              >
                Multi-Outlet + Role Access
              </Tag>
            </Space>

            <Title
              style={{
                fontSize: isMobile ? "2.8rem" : "4.6rem",
                fontWeight: 950,
                lineHeight: 1.08,
                color: "#0f172a",
                marginBottom: 18,
                letterSpacing: "-0.03em",
              }}
            >
              Run your outlets with{" "}
              <span
                style={{
                  color: "transparent",
                  WebkitTextFillColor: "transparent",
                  backgroundImage: "linear-gradient(90deg, #1677ff, #722ed1)",
                  WebkitBackgroundClip: "text",
                  backgroundClip: "text",
                }}
              >
                one system
              </span>
            </Title>

            <Paragraph
              style={{
                fontSize: isMobile ? "1.02rem" : "1.25rem",
                color: "#64748b",
                maxWidth: 760,
                margin: "0 auto 28px",
                lineHeight: 1.7,
              }}
            >
              OutletOps unifies POS billing, inventory, staff attendance, tasks/SOP, and analytics—built for restaurants
              and retail with multi-outlet control.
            </Paragraph>

            <Space size="middle" wrap style={{ justifyContent: "center" }}>
              <Button
                type="primary"
                size="large"
                icon={<LoginOutlined />}
                style={{
                  height: 54,
                  padding: "0 34px",
                  fontSize: 16,
                  fontWeight: 800,
                  borderRadius: 28,
                  background: "linear-gradient(135deg, #1677ff, #0958d9)",
                  border: "none",
                  boxShadow: "0 14px 28px -10px rgba(22, 119, 255, 0.55)",
                }}
                onClick={() => navigate("/auth/login")}
              >
                Sign In to Dashboard
              </Button>

              <Button
                size="large"
                style={{
                  height: 54,
                  padding: "0 28px",
                  fontSize: 16,
                  fontWeight: 800,
                  borderRadius: 28,
                  borderColor: "#cbd5e1",
                  color: "#0f172a",
                  background: "rgba(255,255,255,0.75)",
                }}
                onClick={() => goToSection("pricing")}
              >
                View Pricing
              </Button>
            </Space>

            <div
              style={{
                marginTop: 22,
                display: "flex",
                justifyContent: "center",
                gap: 18,
                color: "#64748b",
                fontSize: 13,
                flexWrap: "wrap",
              }}
            >
              <span>
                <CheckCircleFilled style={{ color: "#10b981", marginRight: 6 }} /> No hidden fees
              </span>
              <span>
                <CheckCircleFilled style={{ color: "#10b981", marginRight: 6 }} /> Yearly savings available
              </span>
              <span>
                <CheckCircleFilled style={{ color: "#10b981", marginRight: 6 }} /> Secure cloud sync
              </span>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.97, y: 28 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.12 }}
            style={{
              marginTop: isMobile ? 36 : 70,
              position: "relative",
              maxWidth: 1120,
              marginInline: "auto",
              zIndex: 10,
              perspective: 1000,
              padding: isMobile ? "0 6px" : "0 0",
            }}
          >
            <div
              style={{
                background: "#ffffff",
                padding: 12,
                borderRadius: 24,
                boxShadow: "0 28px 60px -18px rgba(2, 6, 23, 0.28)",
                border: "1px solid #e2e8f0",
                transform: "rotateX(1.5deg)",
              }}
            >
              <Image
                src={OutletOpsMockup}
                alt="OutletOps Dashboard"
                preview={false}
                style={{ width: "100%", height: "auto", borderRadius: 14, display: "block" }}
                fallback="https://via.placeholder.com/1200x800.png?text=OutletOps+Dashboard"
              />
            </div>
          </motion.div>
        </section>

        {/* Features */}
        <section id="features" style={{ padding: isMobile ? "70px 16px" : "100px 48px", background: "#ffffff" }}>
          <SectionHeader
            title="Everything you need to operate and scale"
            subtitle="POS, inventory, staff, tasks/SOP, finance, and multi-outlet control—built to reduce chaos and increase visibility."
          />

          <Row gutter={[24, 24]} justify="center" style={{ maxWidth: 1200, margin: "0 auto" }}>
            {coreFeatures.map((f, idx) => (
              <Col xs={24} sm={12} md={8} key={idx}>
                <motion.div
                  initial={{ opacity: 0, y: 18 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.06, duration: 0.45 }}
                  style={{ height: "100%" }}
                >
                  <Card
                    hoverable
                    bordered={false}
                    style={{
                      height: "100%",
                      borderRadius: 18,
                      background: "linear-gradient(180deg, #f8fafc 0%, #ffffff 100%)",
                      border: "1px solid #e2e8f0",
                    }}
                    bodyStyle={{
                      padding: "28px 22px",
                      display: "flex",
                      flexDirection: "column",
                      height: "100%",
                      gap: 10,
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <div>{f.icon}</div>
                      <Tag style={{ borderRadius: 999, fontWeight: 700, color: "#0f172a" }}>Core</Tag>
                    </div>
                    <Title level={4} style={{ fontWeight: 900, color: "#0f172a", margin: 0 }}>
                      {f.title}
                    </Title>
                    <Paragraph style={{ color: "#64748b", margin: 0, lineHeight: 1.7 }}>
                      {f.description}
                    </Paragraph>
                  </Card>
                </motion.div>
              </Col>
            ))}
          </Row>

          <Divider style={{ margin: "56px auto 30px", maxWidth: 1100, borderColor: "#e2e8f0" }} />

          <Row gutter={[16, 16]} justify="center" style={{ maxWidth: 1100, margin: "0 auto" }}>
            {suiteHighlights.map((h, i) => (
              <Col xs={24} sm={12} md={8} key={i}>
                <Card
                  bordered={false}
                  style={{
                    borderRadius: 16,
                    border: "1px solid #e2e8f0",
                    background: "#ffffff",
                  }}
                  bodyStyle={{ padding: 18 }}
                >
                  <Space align="start" size={12}>
                    <div
                      style={{
                        width: 40,
                        height: 40,
                        borderRadius: 12,
                        background: "#f1f5f9",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "#0f172a",
                        flex: "0 0 auto",
                      }}
                    >
                      {h.icon}
                    </div>
                    <div>
                      <Text style={{ fontWeight: 900, color: "#0f172a" }}>{h.title}</Text>
                      <div style={{ color: "#64748b", marginTop: 4, lineHeight: 1.6 }}>{h.desc}</div>
                    </div>
                  </Space>
                </Card>
              </Col>
            ))}
          </Row>
        </section>

        {/* Pricing */}
        <section id="pricing" style={{ padding: isMobile ? "70px 16px" : "100px 48px", background: "#f8fafc" }}>
          <SectionHeader
            title="Simple pricing in INR"
            subtitle="Choose Monthly or Yearly plans, or go flexible with Pay-as-you-go. (You can change these numbers anytime.)"
          />

          <div style={{ display: "flex", justifyContent: "center", marginBottom: 22 }}>
            <Segmented
              value={billingMode}
              onChange={(v) => setBillingMode(v as BillingMode)}
              options={[
                { label: "Monthly", value: "Monthly" },
                { label: "Yearly (save)", value: "Yearly" },
              ]}
            />
          </div>

          <Row gutter={[20, 20]} justify="center" style={{ maxWidth: 1200, margin: "0 auto" }}>
            {plans.map((p) => {
              const isPayg = p.id === "payg";
              const isPopular = p.badge === "Most Popular";
              const price: any =
                isPayg
                  ? null
                  : billingMode === "Monthly"
                    ? p.monthly ?? 0
                    : p.yearly ?? 0;

              const perMonthEffective =
                !isPayg && billingMode === "Yearly" && p.yearly
                  ? Math.round(p.yearly / 12)
                  : null;

              return (
                <Col xs={24} sm={12} md={6} key={p.id}>
                  <Badge.Ribbon
                    text={p.badge}
                    color={isPopular ? "purple" : "blue"}
                    style={{ display: p.badge ? "block" : "none" }}
                  >
                    <Card
                      bordered={false}
                      style={{
                        height: "100%",
                        borderRadius: 18,
                        border: isPopular ? "2px solid #722ed1" : "1px solid #e2e8f0",
                        boxShadow: isPopular ? "0 22px 55px -25px rgba(114,46,209,0.5)" : "none",
                        background: "#ffffff",
                      }}
                      bodyStyle={{ padding: 20, display: "flex", flexDirection: "column", height: "100%" }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                        <div>
                          <Title level={4} style={{ margin: 0, fontWeight: 950, color: "#0f172a" }}>
                            {p.name}
                          </Title>
                          <Text style={{ color: "#64748b" }}>{p.subtitle}</Text>
                        </div>
                        <Tooltip title="Secure subscription billing">
                          <SafetyCertificateOutlined style={{ color: "#94a3b8" }} />
                        </Tooltip>
                      </div>

                      <Divider style={{ margin: "14px 0", borderColor: "#eef2f7" }} />

                      {!isPayg ? (
                        <>
                          <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
                            <div style={{ fontSize: 30, fontWeight: 950, color: "#0f172a" }}>
                              {INR(price)}
                            </div>
                            <Text style={{ color: "#64748b", fontWeight: 600 }}>{priceLabel}</Text>
                          </div>
                          {perMonthEffective ? (
                            <Text style={{ color: "#64748b" }}>
                              Effective ~{INR(perMonthEffective)}/month (yearly)
                            </Text>
                          ) : (
                            <Text style={{ color: "#64748b" }}>Billed {billingMode.toLowerCase()}</Text>
                          )}
                        </>
                      ) : (
                        <>
                          <div style={{ fontSize: 16, fontWeight: 900, color: "#0f172a" }}>
                            {INR(p.payg!.base)} / month base
                          </div>
                          <Text style={{ color: "#64748b" }}>
                            + {INR(p.payg!.perOutlet)} per outlet • + {INR(p.payg!.perPosDevice)} per POS device
                          </Text>
                        </>
                      )}

                      <Divider style={{ margin: "14px 0", borderColor: "#eef2f7" }} />

                      <div style={{ display: "flex", flexDirection: "column", gap: 10, flex: 1 }}>
                        {p.included.map((x, i) => (
                          <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                            <CheckCircleFilled style={{ color: "#10b981", marginTop: 3 }} />
                            <Text style={{ color: "#334155" }}>{x}</Text>
                          </div>
                        ))}
                      </div>

                      <Button
                        type={isPopular ? "primary" : "default"}
                        size="large"
                        style={{
                          marginTop: 18,
                          borderRadius: 14,
                          fontWeight: 900,
                          height: 46,
                          background: isPopular ? "linear-gradient(135deg, #722ed1, #1677ff)" : undefined,
                          border: isPopular ? "none" : "1px solid #e2e8f0",
                        }}
                        onClick={() => navigate("/auth/login")}
                      >
                        {p.cta}
                      </Button>

                      <Text style={{ color: "#94a3b8", fontSize: 12, marginTop: 10 }}>
                        Taxes extra if applicable.
                      </Text>
                    </Card>
                  </Badge.Ribbon>
                </Col>
              );
            })}
          </Row>
        </section>

        {/* FAQ */}
        <section id="faq" style={{ padding: isMobile ? "70px 16px" : "100px 48px", background: "#ffffff" }}>
          <SectionHeader
            title="FAQ"
            subtitle="Quick answers about OutletOps modules, restaurant flows, roles/permissions, and billing."
          />

          <div style={{ maxWidth: 920, margin: "0 auto" }}>
            <Collapse items={faqs} defaultActiveKey={["1"]} />
          </div>
        </section>

        {/* CTA */}
        <section style={{ padding: isMobile ? "70px 16px" : "100px 24px", background: "#0f172a", textAlign: "center" }}>
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <Title style={{ color: "#ffffff", fontSize: isMobile ? "2.1rem" : "3rem", fontWeight: 950, marginBottom: 14 }}>
              Ready to streamline your operations?
            </Title>
            <Paragraph style={{ color: "#94a3b8", fontSize: "1.1rem", maxWidth: 720, margin: "0 auto 26px" }}>
              Start with POS, add inventory and HR, then scale to multi-outlet controls, tasks/SOP, and analytics.
            </Paragraph>
            <Space size="middle" wrap style={{ justifyContent: "center" }}>
              <Button
                type="primary"
                size="large"
                icon={<LoginOutlined />}
                onClick={() => navigate("/auth/login")}
                style={{
                  height: 54,
                  padding: "0 44px",
                  fontSize: 16,
                  fontWeight: 900,
                  borderRadius: 28,
                  background: "#ffffff",
                  color: "#0f172a",
                  border: "none",
                }}
              >
                Sign In Now
              </Button>
              <Button
                size="large"
                style={{
                  height: 54,
                  padding: "0 36px",
                  fontSize: 16,
                  fontWeight: 900,
                  borderRadius: 28,
                  borderColor: "rgba(148,163,184,0.35)",
                  color: "#ffffff",
                  background: "transparent",
                }}
                onClick={() => setChatOpen(true)}
              >
                Ask AI about features
              </Button>
            </Space>
          </motion.div>
        </section>
      </Content>

      <Footer style={{ textAlign: "center", background: "#f8fafc", padding: "34px 16px", color: "#64748b" }}>
        <div style={{ display: "flex", justifyContent: "center", gap: 28, marginBottom: 18, fontWeight: 700, flexWrap: "wrap" }}>
          <span style={{ cursor: "pointer" }} onClick={() => goToSection("features")}>
            Features
          </span>
          <span style={{ cursor: "pointer" }} onClick={() => goToSection("pricing")}>
            Pricing
          </span>
          <span style={{ cursor: "pointer" }} onClick={() => goToSection("faq")}>
            FAQ
          </span>
          <span style={{ cursor: "pointer" }} onClick={() => navigate("/auth/login")}>
            Sign In
          </span>
        </div>
        <Divider style={{ margin: "0 auto 18px", maxWidth: 900, borderColor: "#e2e8f0" }} />
        <Text style={{ color: "#94a3b8" }}>© {new Date().getFullYear()} OutletOps. All rights reserved.</Text>
      </Footer>

      {/* Floating Chatbot */}
      <div style={{ position: "fixed", bottom: 26, right: 26, zIndex: 1000 }}>
        <AnimatePresence>
          {chatOpen && (
            <motion.div
              initial={{ opacity: 0, y: 16, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 16, scale: 0.96 }}
              transition={{ duration: 0.18 }}
              style={{
                position: "absolute",
                bottom: 78,
                right: 0,
                width: isMobile ? 320 : 360,
                background: "#ffffff",
                borderRadius: 18,
                boxShadow: "0 26px 60px -20px rgba(2,6,23,0.45)",
                border: "1px solid #e2e8f0",
                display: "flex",
                flexDirection: "column",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  background: "linear-gradient(135deg, #1677ff, #722ed1)",
                  padding: "14px 16px",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  color: "#fff",
                }}
              >
                <div>
                  <div style={{ fontWeight: 900, fontSize: 15 }}>OutletOps AI</div>
                  <div style={{ fontSize: 12, opacity: 0.9 }}>Ask about POS, pricing, roles, modules</div>
                </div>
                <Button type="text" icon={<CloseOutlined />} style={{ color: "#fff" }} onClick={() => setChatOpen(false)} />
              </div>

              <div
                style={{
                  padding: 14,
                  height: 310,
                  overflowY: "auto",
                  background: "#f8fafc",
                  display: "flex",
                  flexDirection: "column",
                  gap: 10,
                }}
              >
                {chatHistory.map((msg, i) => (
                  <div
                    key={i}
                    style={{
                      alignSelf: msg.sender === "bot" ? "flex-start" : "flex-end",
                      background: msg.sender === "bot" ? "#ffffff" : "#1677ff",
                      color: msg.sender === "bot" ? "#0f172a" : "#ffffff",
                      padding: "10px 12px",
                      borderRadius: 16,
                      borderBottomLeftRadius: msg.sender === "bot" ? 6 : 16,
                      borderBottomRightRadius: msg.sender === "user" ? 6 : 16,
                      maxWidth: "88%",
                      boxShadow: "0 2px 6px rgba(2,6,23,0.06)",
                      fontSize: 13.5,
                      lineHeight: 1.55,
                      border: msg.sender === "bot" ? "1px solid #e2e8f0" : "none",
                      whiteSpace: "pre-wrap",
                    }}
                  >
                    {msg.sender === "bot" ? <BotMessage text={msg.text} /> : msg.text}
                  </div>
                ))}

                {loading && (
                  <div style={{ alignSelf: "flex-start", paddingLeft: 4 }}>
                    <Spin size="small" />
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              <div style={{ padding: 12, background: "#ffffff", borderTop: "1px solid #e2e8f0" }}>
                <Input
                  placeholder="Type your question..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onPressEnter={handleSendMessage}
                  suffix={
                    <Button
                      type="primary"
                      shape="circle"
                      icon={<SendOutlined />}
                      size="small"
                      onClick={handleSendMessage}
                      disabled={loading}
                      style={{ background: "#722ed1", border: "none" }}
                    />
                  }
                  style={{ borderRadius: 999, padding: "8px 14px" }}
                />
                <div style={{ marginTop: 8, display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {["Pricing", "POS features", "Attendance", "Inventory", "Roles & access"].map((q) => (
                    <Button
                      key={q}
                      size="small"
                      style={{ borderRadius: 999, fontWeight: 700 }}
                      onClick={() => setMessage(q)}
                    >
                      {q}
                    </Button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.96 }}>
          <Button
            type="primary"
            shape="circle"
            icon={chatOpen ? <CloseOutlined /> : <MessageOutlined />}
            size="large"
            onClick={() => setChatOpen((s) => !s)}
            style={{
              width: 62,
              height: 62,
              fontSize: 26,
              background: "linear-gradient(135deg, #1677ff, #722ed1)",
              border: "none",
              boxShadow: "0 16px 34px rgba(22, 119, 255, 0.35)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          />
        </motion.div>
      </div>
    </Layout>
  );
};

export default WelcomePage;