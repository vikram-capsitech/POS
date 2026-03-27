"use client";

import React, { useState, useRef } from "react";
import {
  Layout,
  Typography,
  Row,
  Col,
  Card,
  Tag,
  Collapse,
  Segmented,
  Grid,
} from "antd";
import {
  ShopOutlined,
  BarChartOutlined,
  ThunderboltOutlined,
  LoginOutlined,
  CheckCircleFilled,
  UsergroupAddOutlined,
  BlockOutlined,
  SafetyCertificateOutlined,
  ClockCircleOutlined,
  CreditCardOutlined,
  RiseOutlined,
  RestOutlined,
  TeamOutlined,
  CalendarOutlined,
  FileTextOutlined,
  DollarOutlined,
  DeploymentUnitOutlined,
  AppstoreOutlined,
  StarFilled,
  ArrowRightOutlined,
} from "@ant-design/icons";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRouter } from "next/navigation";

import {
  FadeInSection,
  MagneticButton,
  ScreenshotCard,
} from "./ui/Animations";
import { ModuleBlock, StatCard } from "./ui/Cards";
import Image from "next/image";
import { modules, faqItems, plans, testimonials } from "../data";

const { Title, Paragraph, Text } = Typography;
const { Header, Content, Footer } = Layout;
const { useBreakpoint } = Grid;

export default function LandingPage() {
  const router = useRouter();
  const screens = useBreakpoint();
  const [billingPeriod, setBillingPeriod] = useState<"Monthly" | "Yearly">("Monthly");
  
  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: heroRef });
  const heroY = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const heroScale = useTransform(scrollYProgress, [0, 0.5], [1, 0.95]);

  return (
    <Layout style={{ minHeight: "100vh", background: "#fff", overflowX: "hidden" }}>
      {/* ── NAVBAR with scroll blur effect ────────────────────────────────── */}
      <motion.div
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      >
        <Header
          style={{
            position: "fixed",
            top: 0,
            width: "100%",
            zIndex: 1000,
            background: "rgba(255,255,255,0.85)",
            backdropFilter: "blur(20px) saturate(180%)",
            borderBottom: "1px solid rgba(0,0,0,0.06)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "0 40px",
            height: 72,
          }}
        >
          <motion.div
            style={{ display: "flex", alignItems: "center", gap: 12, cursor: "pointer" }}
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.2 }}
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          >
            <div
              style={{
                width: 42,
                height: 42,
                borderRadius: 12,
                background: "linear-gradient(135deg,#5838ff,#a855f7)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#fff",
                fontWeight: 900,
                fontSize: 18,
                boxShadow: "0 4px 20px rgba(88,56,255,0.3)",
              }}
            >
              O
            </div>
            <div>
              <div style={{ fontWeight: 900, fontSize: 17, lineHeight: 1, color: "#1a1a2e" }}>
                OutletOps
              </div>
              <div style={{ fontSize: 11, color: "#888", lineHeight: 1.2 }}>Retail + Restaurant Ops</div>
            </div>
          </motion.div>

          <div style={{ display: "flex", alignItems: "center", gap: 40 }}>
            {!screens.xs && (
              <>
                <motion.a
                  href="#features"
                  style={{ color: "#444", fontWeight: 600, fontSize: 15 }}
                  whileHover={{ color: "#5838ff" }}
                >
                  Features
                </motion.a>
                <motion.a
                  href="#team"
                  style={{ color: "#444", fontWeight: 600, fontSize: 15 }}
                  whileHover={{ color: "#5838ff" }}
                >
                  Team
                </motion.a>
                <motion.a
                  href="#pricing"
                  style={{ color: "#444", fontWeight: 600, fontSize: 15 }}
                  whileHover={{ color: "#5838ff" }}
                >
                  Pricing
                </motion.a>
                <motion.a
                  href="#faq"
                  style={{ color: "#444", fontWeight: 600, fontSize: 15 }}
                  whileHover={{ color: "#5838ff" }}
                >
                  FAQ
                </motion.a>
              </>
            )}
            <MagneticButton
              type="primary"
              icon={<LoginOutlined />}
              onClick={() => window.location.href = "http://localhost:3000/auth/login"}
              style={{
                background: "linear-gradient(135deg,#5838ff,#a855f7)",
                border: "none",
                borderRadius: 100,
                fontWeight: 700,
                height: 42,
                paddingInline: 24,
                boxShadow: "0 4px 20px rgba(88,56,255,0.25)",
              }}
            >
              Sign In
            </MagneticButton>
          </div>
        </Header>
      </motion.div>

      <Content style={{ paddingTop: 72 }}>
        {/* ── HERO with enhanced animations ─────────────────────────────────── */}
        <div
          ref={heroRef}
          style={{
            minHeight: "95vh",
            background: "radial-gradient(ellipse 90% 70% at 50% -10%, #f0ecff 0%, #fff 70%)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "100px 24px 60px",
            textAlign: "center",
            position: "relative",
            overflow: "hidden",
          }}
        >
          {/* Animated gradient orbs */}
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.5, 0.3],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            style={{
              position: "absolute",
              top: 80,
              left: "5%",
              width: 400,
              height: 400,
              borderRadius: "50%",
              background: "radial-gradient(circle, rgba(88,56,255,0.15) 0%, transparent 70%)",
              pointerEvents: "none",
              filter: "blur(60px)",
            }}
          />
          <motion.div
            animate={{
              scale: [1, 1.3, 1],
              opacity: [0.2, 0.4, 0.2],
            }}
            transition={{
              duration: 10,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 1,
            }}
            style={{
              position: "absolute",
              bottom: 120,
              right: "5%",
              width: 350,
              height: 350,
              borderRadius: "50%",
              background: "radial-gradient(circle, rgba(168,85,247,0.15) 0%, transparent 70%)",
              pointerEvents: "none",
              filter: "blur(60px)",
            }}
          />

          {/* Floating particles */}
          {Array.from({ length: 20 }).map((_, i) => (
            <motion.div
              key={i}
              animate={{
                y: [0, -30, 0],
                x: [0, Math.random() * 20 - 10, 0],
                opacity: [0, 1, 0],
              }}
              transition={{
                duration: 3 + Math.random() * 2,
                repeat: Infinity,
                delay: Math.random() * 5,
              }}
              style={{
                position: "absolute",
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                width: 4,
                height: 4,
                borderRadius: "50%",
                background: `rgba(88, 56, 255, ${0.3 + Math.random() * 0.4})`,
                pointerEvents: "none",
              }}
            />
          ))}

          <motion.div style={{ y: heroY, opacity: heroOpacity, scale: heroScale }}>
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              style={{ display: "flex", justifyContent: "center", gap: 12, marginBottom: 32, flexWrap: "wrap" }}
            >
              <motion.div whileHover={{ scale: 1.05, y: -2 }}>
                <Tag
                  style={{
                    borderRadius: 100,
                    padding: "6px 18px",
                    fontSize: 13,
                    fontWeight: 700,
                    border: "1px solid #5838ff50",
                    color: "#5838ff",
                    background: "#5838ff15",
                    boxShadow: "0 2px 12px rgba(88,56,255,0.15)",
                  }}
                >
                  POS • Inventory • HR • Analytics
                </Tag>
              </motion.div>
              <motion.div whileHover={{ scale: 1.05, y: -2 }}>
                <Tag
                  style={{
                    borderRadius: 100,
                    padding: "6px 18px",
                    fontSize: 13,
                    fontWeight: 700,
                    border: "1px solid #a855f750",
                    color: "#a855f7",
                    background: "#a855f715",
                    boxShadow: "0 2px 12px rgba(168,85,247,0.15)",
                  }}
                >
                  Multi-Outlet + Role Access
                </Tag>
              </motion.div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, delay: 0.3 }}
            >
              <Title
                level={1}
                style={{
                  fontSize: screens.xs ? 40 : screens.md ? 60 : 72,
                  fontWeight: 900,
                  lineHeight: 1.1,
                  color: "#1a1a2e",
                  marginBottom: 24,
                  letterSpacing: "-0.02em",
                }}
              >
                Run your outlets with{" "}
                <motion.span
                  animate={{
                    backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
                  }}
                  transition={{
                    duration: 5,
                    repeat: Infinity,
                    ease: "linear",
                  }}
                  style={{
                    background: "linear-gradient(90deg,#5838ff,#a855f7,#5838ff)",
                    backgroundSize: "200% 100%",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                  }}
                >
                  one system
                </motion.span>
              </Title>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              <Paragraph
                style={{
                  fontSize: 19,
                  color: "#666",
                  maxWidth: 620,
                  margin: "0 auto 40px",
                  lineHeight: 1.75,
                }}
              >
                OutletOps unifies POS billing, inventory, staff attendance, tasks/SOP, and
                analytics — built for restaurants and retail with multi-outlet control.
              </Paragraph>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.5 }}
              style={{ display: "flex", justifyContent: "center", gap: 20, flexWrap: "wrap" }}
            >
              <MagneticButton
                type="primary"
                size="large"
                icon={<LoginOutlined />}
                onClick={() => window.location.href = "http://localhost:3000/auth/login"}
                style={{
                  height: 56,
                  paddingInline: 36,
                  borderRadius: 100,
                  fontSize: 17,
                  fontWeight: 800,
                  background: "linear-gradient(135deg,#5838ff,#a855f7)",
                  border: "none",
                  boxShadow: "0 12px 40px rgba(88,56,255,0.4)",
                }}
              >
                Sign In to Dashboard
              </MagneticButton>
              <MagneticButton
                size="large"
                href="#pricing"
                style={{
                  height: 56,
                  paddingInline: 36,
                  borderRadius: 100,
                  fontSize: 17,
                  fontWeight: 800,
                  border: "2px solid #e0e0e0",
                  color: "#333",
                  background: "#fff",
                }}
              >
                View Pricing
              </MagneticButton>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
              style={{
                display: "flex",
                justifyContent: "center",
                gap: 32,
                marginTop: 32,
                flexWrap: "wrap",
              }}
            >
              {["No hidden fees", "Yearly savings available", "Secure cloud sync"].map((t, i) => (
                <motion.div
                  key={t}
                  style={{ display: "flex", alignItems: "center", gap: 8 }}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.8 + i * 0.1 }}
                >
                  <CheckCircleFilled style={{ color: "#52c41a", fontSize: 16 }} />
                  <Text style={{ fontSize: 14, color: "#666", fontWeight: 500 }}>{t}</Text>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>

          {/* Hero dashboard screenshot with enhanced effects */}
          <motion.div
            initial={{ opacity: 0, y: 100, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 1, delay: 0.6, ease: [0.16, 1, 0.3, 1] }}
            style={{ width: "100%", maxWidth: 1200, marginTop: 80, position: "relative" }}
          >
            <motion.div
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.4 }}
              style={{
                borderRadius: 24,
                overflow: "hidden",
                boxShadow:
                  "0 6px 0 #5838ff40, 0 50px 140px rgba(88,56,255,0.25), 0 12px 50px rgba(0,0,0,0.15)",
                border: "2px solid rgba(88,56,255,0.15)",
                position: "relative",
              }}
            >
              {/* Shimmer effect */}
              <motion.div
                animate={{
                  x: ["-100%", "100%"],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "linear",
                  repeatDelay: 2,
                }}
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "100%",
                  height: "100%",
                  background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)",
                  pointerEvents: "none",
                  zIndex: 1,
                }}
              />
              <Image
                src="/screenshots/ss_dashboard.png"
                alt="OutletOps Admin Dashboard"
                width={1400}
                height={900}
                style={{ width: "100%", height: "auto", display: "block" }}
                priority
              />
            </motion.div>

            {/* Floating metric badges with enhanced animations */}
            <motion.div
              animate={{
                y: [0, -12, 0],
                rotate: [0, 2, 0],
              }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              style={{
                position: "absolute",
                top: 32,
                right: -32,
                background: "#fff",
                borderRadius: 18,
                padding: "14px 24px",
                boxShadow: "0 12px 40px rgba(0,0,0,0.15), 0 0 0 1px rgba(0,0,0,0.05)",
                display: "flex",
                alignItems: "center",
                gap: 14,
                minWidth: 200,
              }}
            >
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 12,
                  background: "linear-gradient(135deg, #52c41a15, #52c41a25)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 20,
                }}
              >
                📊
              </div>
              <div>
                <div style={{ fontSize: 12, color: "#888", fontWeight: 600 }}>POS Revenue</div>
                <div style={{ fontSize: 18, fontWeight: 900, color: "#52c41a" }}>₹2,392</div>
              </div>
            </motion.div>

            <motion.div
              animate={{
                y: [0, 12, 0],
                rotate: [0, -2, 0],
              }}
              transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut", delay: 1.5 }}
              style={{
                position: "absolute",
                bottom: 50,
                left: -36,
                background: "#fff",
                borderRadius: 18,
                padding: "14px 24px",
                boxShadow: "0 12px 40px rgba(0,0,0,0.15), 0 0 0 1px rgba(0,0,0,0.05)",
                display: "flex",
                alignItems: "center",
                gap: 14,
              }}
            >
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 12,
                  background: "linear-gradient(135deg, #5838ff15, #5838ff25)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 20,
                }}
              >
                👥
              </div>
              <div>
                <div style={{ fontSize: 12, color: "#888", fontWeight: 600 }}>Total Employees</div>
                <div style={{ fontSize: 18, fontWeight: 900, color: "#5838ff" }}>10 Staff</div>
              </div>
            </motion.div>
          </motion.div>
        </div>

        {/* ── STATS STRIP with enhanced counters ───────────────────────────── */}
        <div style={{ background: "#fafafa", padding: "80px 40px", borderTop: "1px solid #f0f0f0" }}>
          <div style={{ maxWidth: 1200, margin: "0 auto" }}>
            <FadeInSection>
              <Row gutter={[32, 32]}>
                {[
                  { value: "10+", label: "Modules in One App", color: "#5838ff" },
                  { value: "∞", label: "Outlets Supported", color: "#a855f7" },
                  { value: "8", label: "User Roles", color: "#f7931a" },
                  { value: "99.9%", label: "Uptime SLA", color: "#52c41a" },
                ].map((s, i) => (
                  <Col key={s.label} xs={12} md={6}>
                    <StatCard {...s} delay={i * 0.1} />
                  </Col>
                ))}
              </Row>
            </FadeInSection>
          </div>
        </div>

        {/* ── MODULE SHOWCASE with enhanced blocks ─────────────────────────── */}
        <section id="features" style={{ maxWidth: 1200, margin: "0 auto", padding: "80px 24px" }}>
          <FadeInSection>
            <div style={{ textAlign: "center", marginBottom: 24 }}>
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                whileInView={{ scale: 1, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
              >
                <Tag
                  style={{
                    borderRadius: 100,
                    padding: "6px 20px",
                    fontSize: 13,
                    fontWeight: 700,
                    color: "#5838ff",
                    border: "1px solid #5838ff40",
                    background: "#5838ff10",
                    marginBottom: 24,
                  }}
                >
                  COMPLETE PLATFORM
                </Tag>
              </motion.div>
              <Title level={2} style={{ fontSize: 44, fontWeight: 900, marginBottom: 16, letterSpacing: "-0.01em" }}>
                Everything you need to operate and scale
              </Title>
              <Paragraph style={{ fontSize: 18, color: "#666", maxWidth: 600, margin: "0 auto" }}>
                POS, inventory, staff, tasks/SOP, finance, and multi-outlet control — built to
                reduce chaos and increase visibility.
              </Paragraph>
            </div>
          </FadeInSection>

          {modules.map((mod, i) => (
            <ModuleBlock key={mod.title} {...mod} index={i} reverse={mod.reverse} />
          ))}
        </section>

        {/* ── QUICK FEATURE GRID with stagger animation ────────────────────── */}
        <div style={{ background: "#fafafa", padding: "100px 40px", borderTop: "1px solid #f0f0f0" }}>
          <div style={{ maxWidth: 1200, margin: "0 auto" }}>
            <FadeInSection>
              <div style={{ textAlign: "center", marginBottom: 64 }}>
                <Title level={2} style={{ fontWeight: 900, fontSize: 40, marginBottom: 12 }}>
                  Every role. Every workflow.
                </Title>
                <Paragraph style={{ color: "#666", fontSize: 17 }}>
                  Designed for owners, managers, cashiers, kitchen staff, waiters, and cleaners.
                </Paragraph>
              </div>
            </FadeInSection>
            <Row gutter={[28, 28]}>
              {[
                {
                  icon: <ShopOutlined />,
                  color: "#5838ff",
                  title: "Point of Sale",
                  desc: "Fast billing with table mapping, split bills, discounts, and printer integration.",
                },
                {
                  icon: <RestOutlined />,
                  color: "#f7931a",
                  title: "Kitchen Display",
                  desc: "Live KOT tickets update instantly as orders are placed by waiters.",
                },
                {
                  icon: <DeploymentUnitOutlined />,
                  color: "#13c2c2",
                  title: "Floor Map",
                  desc: "Real-time table status — Available, Occupied, Reserved, or Billing.",
                },
                {
                  icon: <TeamOutlined />,
                  color: "#eb2f96",
                  title: "Role-based Access",
                  desc: "8 built-in roles with granular module-level permissions per outlet.",
                },
                {
                  icon: <CalendarOutlined />,
                  color: "#52c41a",
                  title: "Leave & Attendance",
                  desc: "Track daily presence with monthly views, break tracking, and export.",
                },
                {
                  icon: <FileTextOutlined />,
                  color: "#a855f7",
                  title: "SOP Library",
                  desc: "Document operational procedures with difficulty, steps, and category.",
                },
                {
                  icon: <RiseOutlined />,
                  color: "#fa541c",
                  title: "Expense Tracker",
                  desc: "Log and categorize operational expenses with date filters and charts.",
                },
                {
                  icon: <SafetyCertificateOutlined />,
                  color: "#1677ff",
                  title: "Activity Logs",
                  desc: "Full audit trail of all user actions across the organization.",
                },
                {
                  icon: <CreditCardOutlined />,
                  color: "#fa8c16",
                  title: "Payroll Processing",
                  desc: "Process monthly salaries, track advance payments, and view payslips.",
                },
                {
                  icon: <BarChartOutlined />,
                  color: "#722ed1",
                  title: "Analytics Dashboard",
                  desc: "POS revenue, task status, employee overview — all in one dashboard.",
                },
                {
                  icon: <ClockCircleOutlined />,
                  color: "#13c2c2",
                  title: "Task Management",
                  desc: "Assign tasks with priority, deadline, and track from pending to done.",
                },
                {
                  icon: <AppstoreOutlined />,
                  color: "#52c41a",
                  title: "Multi-Outlet Control",
                  desc: "Manage all your outlets from a single admin dashboard with org switching.",
                },
              ].map((f, i) => (
                <Col key={f.title} xs={12} sm={8} md={6}>
                  <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: i * 0.05 }}
                    whileHover={{ y: -8 }}
                  >
                    <Card
                      styles={{ body: { padding: 24 } }}
                      style={{
                        borderRadius: 20,
                        border: "1px solid #f0f0f0",
                        boxShadow: "0 2px 16px rgba(0,0,0,0.06)",
                        height: "100%",
                        transition: "all 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
                        cursor: "default",
                        background: "#fff",
                      }}
                      onMouseEnter={(e) => {
                        (e.currentTarget as HTMLElement).style.boxShadow = `0 12px 40px ${f.color}30`;
                        (e.currentTarget as HTMLElement).style.borderColor = `${f.color}40`;
                      }}
                      onMouseLeave={(e) => {
                        (e.currentTarget as HTMLElement).style.boxShadow = "0 2px 16px rgba(0,0,0,0.06)";
                        (e.currentTarget as HTMLElement).style.borderColor = "#f0f0f0";
                      }}
                    >
                      <motion.div
                        whileHover={{ rotate: [0, -10, 10, 0], scale: 1.1 }}
                        transition={{ duration: 0.5 }}
                        style={{
                          width: 52,
                          height: 52,
                          borderRadius: 14,
                          background: `linear-gradient(135deg, ${f.color}15, ${f.color}25)`,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: 22,
                          color: f.color,
                          marginBottom: 18,
                        }}
                      >
                        {f.icon}
                      </motion.div>
                      <div style={{ fontWeight: 800, fontSize: 15, marginBottom: 8, color: "#1a1a2e" }}>
                        {f.title}
                      </div>
                      <div style={{ fontSize: 13, color: "#888", lineHeight: 1.7 }}>{f.desc}</div>
                    </Card>
                  </motion.div>
                </Col>
              ))}
            </Row>
          </div>
        </div>

        {/* ── ADDITIONAL SCREENSHOTS ROW ──────────────────── */}
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "100px 24px" }}>
          <FadeInSection>
            <div style={{ textAlign: "center", marginBottom: 64 }}>
              <Title level={2} style={{ fontWeight: 900, fontSize: 40, marginBottom: 12 }}>
                See it in action
              </Title>
              <Paragraph style={{ color: "#666", fontSize: 17 }}>
                Real screenshots from the live app.
              </Paragraph>
            </div>
          </FadeInSection>
          <Row gutter={[40, 80]}>
            {[
              { src: "/screenshots/ss_pos_dashboard.png", label: "POS Dashboard" },
              { src: "/screenshots/ss_tables.png", label: "Table Manager" },
              { src: "/screenshots/ss_sop.png", label: "SOP Management" },
              { src: "/screenshots/ss_expenses.png", label: "Expense Tracker" },
            ].map((s, i) => (
              <Col key={s.label} xs={24} sm={12}>
                <ScreenshotCard src={s.src} label={s.label} delay={i * 0.15} direction={i % 2 === 0 ? "left" : "right"} />
              </Col>
            ))}
          </Row>
        </div>

        {/* ── TESTIMONIALS ─────────────────────────────── */}
        <div style={{ background: "linear-gradient(135deg, #1a1a2e 0%, #2d1f7a 100%)", padding: "100px 40px", position: "relative", overflow: "hidden" }}>
          {/* Animated background pattern */}
          <motion.div
            animate={{
              backgroundPosition: ["0% 0%", "100% 100%"],
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              repeatType: "reverse",
            }}
            style={{
              position: "absolute",
              inset: 0,
              backgroundImage: "radial-gradient(circle at 20% 50%, rgba(88,56,255,0.1) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(168,85,247,0.1) 0%, transparent 50%)",
              backgroundSize: "100% 100%",
            }}
          />

          <div style={{ maxWidth: 1200, margin: "0 auto", position: "relative" }}>
            <FadeInSection>
              <div style={{ textAlign: "center", marginBottom: 64 }}>
                <Title level={2} style={{ color: "#fff", fontWeight: 900, fontSize: 40, marginBottom: 12 }}>
                  Loved by operators across India
                </Title>
                <Paragraph style={{ color: "rgba(255,255,255,0.65)", fontSize: 17 }}>
                  From single cafés to multi-outlet chains.
                </Paragraph>
              </div>
            </FadeInSection>
            <Row gutter={[32, 32]}>
              {testimonials.map((t, i) => (
                <Col key={t.name} xs={24} md={8}>
                  <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: i * 0.15 }}
                    whileHover={{ y: -12, transition: { duration: 0.3 } }}
                  >
                    <div
                      style={{
                        background: "rgba(255,255,255,0.08)",
                        backdropFilter: "blur(20px)",
                        border: "1px solid rgba(255,255,255,0.15)",
                        borderRadius: 24,
                        padding: 32,
                        height: "100%",
                        transition: "all 0.4s",
                      }}
                      onMouseEnter={(e) => {
                        (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.12)";
                        (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.25)";
                      }}
                      onMouseLeave={(e) => {
                        (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.08)";
                        (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.15)";
                      }}
                    >
                      <div style={{ marginBottom: 18 }}>
                        {Array.from({ length: t.stars }).map((_, j) => (
                          <motion.span
                            key={j}
                            initial={{ opacity: 0, scale: 0 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.15 + j * 0.1 }}
                          >
                            <StarFilled style={{ color: "#fbbf24", fontSize: 16, marginRight: 4 }} />
                          </motion.span>
                        ))}
                      </div>
                      <Paragraph
                        style={{ color: "rgba(255,255,255,0.9)", fontSize: 16, lineHeight: 1.8, marginBottom: 24, fontStyle: "italic" }}
                      >
                        "{t.text}"
                      </Paragraph>
                      <div>
                        <div style={{ color: "#fff", fontWeight: 800, fontSize: 15 }}>{t.name}</div>
                        <div style={{ color: "rgba(255,255,255,0.5)", fontSize: 13, marginTop: 2 }}>{t.role}</div>
                      </div>
                    </div>
                  </motion.div>
                </Col>
              ))}
            </Row>
          </div>
        </div>

        {/* ── TEAM SECTION ──────────────────────────────────────────────────── */}
        <section id="team" style={{ maxWidth: 1200, margin: "0 auto", padding: "100px 24px" }}>
          <FadeInSection>
            <div style={{ textAlign: "center", marginBottom: 64 }}>
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                whileInView={{ scale: 1, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
              >
                <Tag
                  style={{
                    borderRadius: 100,
                    padding: "6px 20px",
                    fontSize: 13,
                    fontWeight: 700,
                    color: "#5838ff",
                    border: "1px solid #5838ff40",
                    background: "#5838ff10",
                    marginBottom: 24,
                  }}
                >
                  MEET THE TEAM
                </Tag>
              </motion.div>
              <Title level={2} style={{ fontSize: 44, fontWeight: 900, marginBottom: 16, letterSpacing: "-0.01em" }}>
                Built by operators, for operators
              </Title>
              <Paragraph style={{ fontSize: 18, color: "#666", maxWidth: 600, margin: "0 auto" }}>
                We understand your challenges because we've been there. Our team combines deep industry experience with technical excellence.
              </Paragraph>
            </div>
          </FadeInSection>

          <Row gutter={[48, 48]} justify="center">
            {[
              {
                name: "Vikram Patel",
                role: "Founder & CEO",
                bio: "Former restaurant chain operator with 10+ years of experience. Built OutletOps after struggling with fragmented systems across 5 outlets.",
                image: "👨‍💼",
                color: "#5838ff",
                linkedin: "#",
                twitter: "#",
              },
              {
                name: "Priya Singh",
                role: "Co-Founder & CTO",
                bio: "Tech lead with expertise in POS systems and real-time architecture. Previously led engineering at a major F&B tech company.",
                image: "👩‍💻",
                color: "#a855f7",
                linkedin: "#",
                twitter: "#",
              },
              {
                name: "Arjun Mehta",
                role: "Head of Product",
                bio: "Product designer who spent years in retail operations. Obsessed with creating intuitive workflows that actually work on the ground.",
                image: "🎨",
                color: "#f7931a",
                linkedin: "#",
                twitter: "#",
              },
            ].map((member, i) => (
              <Col key={member.name} xs={24} sm={12} md={8}>
                <motion.div
                  initial={{ opacity: 0, y: 60 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.7, delay: i * 0.2 }}
                  whileHover={{ y: -16 }}
                  style={{ height: "100%" }}
                >
                  <Card
                    styles={{ body: { padding: 0 } }}
                    style={{
                      borderRadius: 24,
                      overflow: "hidden",
                      border: `2px solid ${member.color}20`,
                      boxShadow: "0 4px 24px rgba(0,0,0,0.08)",
                      height: "100%",
                      transition: "all 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
                    }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLElement).style.boxShadow = `0 20px 60px ${member.color}30`;
                      (e.currentTarget as HTMLElement).style.borderColor = `${member.color}60`;
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLElement).style.boxShadow = "0 4px 24px rgba(0,0,0,0.08)";
                      (e.currentTarget as HTMLElement).style.borderColor = `${member.color}20`;
                    }}
                  >
                    {/* Avatar Section */}
                    <div
                      style={{
                        background: `linear-gradient(135deg, ${member.color}15, ${member.color}25)`,
                        padding: "48px 32px 32px",
                        textAlign: "center",
                        position: "relative",
                        overflow: "hidden",
                      }}
                    >
                      {/* Decorative circles */}
                      <div
                        style={{
                          position: "absolute",
                          top: -40,
                          right: -40,
                          width: 120,
                          height: 120,
                          borderRadius: "50%",
                          background: `${member.color}15`,
                          filter: "blur(40px)",
                        }}
                      />
                      <motion.div
                        whileHover={{ scale: 1.1, rotate: 5 }}
                        transition={{ duration: 0.3 }}
                        style={{
                          width: 120,
                          height: 120,
                          margin: "0 auto 20px",
                          borderRadius: "50%",
                          background: `linear-gradient(135deg, ${member.color}, ${member.color}dd)`,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: 56,
                          boxShadow: `0 12px 40px ${member.color}40`,
                          border: "4px solid #fff",
                        }}
                      >
                        {member.image}
                      </motion.div>
                      <div style={{ fontWeight: 900, fontSize: 20, color: "#1a1a2e", marginBottom: 6 }}>
                        {member.name}
                      </div>
                      <div
                        style={{
                          fontSize: 14,
                          color: member.color,
                          fontWeight: 700,
                          marginBottom: 4,
                        }}
                      >
                        {member.role}
                      </div>
                    </div>

                    {/* Bio Section */}
                    <div style={{ padding: "24px 28px 28px" }}>
                      <Paragraph
                        style={{
                          fontSize: 14,
                          color: "#666",
                          lineHeight: 1.7,
                          marginBottom: 24,
                          minHeight: 84,
                        }}
                      >
                        {member.bio}
                      </Paragraph>

                      {/* Social Links */}
                      <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
                        <motion.a
                          href={member.linkedin}
                          whileHover={{ scale: 1.15, y: -2 }}
                          whileTap={{ scale: 0.95 }}
                          style={{
                            width: 40,
                            height: 40,
                            borderRadius: 12,
                            background: `${member.color}15`,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: member.color,
                            fontSize: 18,
                            transition: "all 0.3s",
                            border: `1px solid ${member.color}30`,
                          }}
                          onMouseEnter={(e) => {
                            (e.currentTarget as HTMLElement).style.background = member.color;
                            (e.currentTarget as HTMLElement).style.color = "#fff";
                          }}
                          onMouseLeave={(e) => {
                            (e.currentTarget as HTMLElement).style.background = `${member.color}15`;
                            (e.currentTarget as HTMLElement).style.color = member.color;
                          }}
                        >
                          in
                        </motion.a>
                        <motion.a
                          href={member.twitter}
                          whileHover={{ scale: 1.15, y: -2 }}
                          whileTap={{ scale: 0.95 }}
                          style={{
                            width: 40,
                            height: 40,
                            borderRadius: 12,
                            background: `${member.color}15`,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: member.color,
                            fontSize: 18,
                            transition: "all 0.3s",
                            border: `1px solid ${member.color}30`,
                          }}
                          onMouseEnter={(e) => {
                            (e.currentTarget as HTMLElement).style.background = member.color;
                            (e.currentTarget as HTMLElement).style.color = "#fff";
                          }}
                          onMouseLeave={(e) => {
                            (e.currentTarget as HTMLElement).style.background = `${member.color}15`;
                            (e.currentTarget as HTMLElement).style.color = member.color;
                          }}
                        >
                          𝕏
                        </motion.a>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              </Col>
            ))}
          </Row>

          {/* Join Team CTA */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.6 }}
            style={{
              marginTop: 80,
              textAlign: "center",
              padding: "48px 40px",
              borderRadius: 24,
              background: "linear-gradient(135deg, #f8f9fa, #fff)",
              border: "2px solid #f0f0f0",
            }}
          >
            <Title level={3} style={{ fontSize: 28, fontWeight: 900, marginBottom: 12 }}>
              Want to join us?
            </Title>
            <Paragraph style={{ fontSize: 16, color: "#666", marginBottom: 28, maxWidth: 500, margin: "0 auto 28px" }}>
              We're always looking for talented people who are passionate about making outlet operations better.
            </Paragraph>
            <MagneticButton
              size="large"
              style={{
                height: 52,
                paddingInline: 36,
                borderRadius: 100,
                fontSize: 16,
                fontWeight: 700,
                border: "2px solid #5838ff50",
                color: "#5838ff",
                background: "#fff",
              }}
              onClick={() => window.location.href = "mailto:careers@outletops.com"}
            >
              View Open Positions →
            </MagneticButton>
          </motion.div>
        </section>

        {/* ── PRICING with enhanced cards ──────────────────────────────────── */}
        <section id="pricing" style={{ maxWidth: 1200, margin: "0 auto", padding: "100px 24px" }}>
          <FadeInSection>
            <div style={{ textAlign: "center", marginBottom: 48 }}>
              <Title level={2} style={{ fontWeight: 900, fontSize: 44, marginBottom: 16 }}>
                Simple pricing in INR
              </Title>
              <Paragraph style={{ color: "#666", fontSize: 17, marginBottom: 32 }}>
                Choose Monthly or Yearly plans.
              </Paragraph>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Segmented<"Monthly" | "Yearly">
                  options={["Monthly", "Yearly"]}
                  value={billingPeriod}
                  onChange={(v) => setBillingPeriod(v)}
                  style={{ padding: 6, borderRadius: 100, fontSize: 15, fontWeight: 700 }}
                />
              </motion.div>
              {billingPeriod === "Yearly" && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  style={{ marginTop: 16 }}
                >
                  <Tag color="green" style={{ borderRadius: 100, fontWeight: 700, padding: "4px 16px", fontSize: 13 }}>
                    Save ~17% with yearly billing
                  </Tag>
                </motion.div>
              )}
            </div>
          </FadeInSection>

          <Row gutter={[32, 32]} style={{ alignItems: "stretch" }}>
            {plans.map((plan, i) => (
              <Col key={plan.name} xs={24} md={8}>
                <motion.div
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: i * 0.15 }}
                  whileHover={{ y: -12, scale: 1.02 }}
                  style={{
                    border: plan.popular ? `2px solid ${plan.color}` : "2px solid #e8e8e8",
                    borderRadius: 24,
                    padding: "40px 32px",
                    height: "100%",
                    position: "relative",
                    background: plan.popular ? `linear-gradient(135deg, ${plan.color}08, ${plan.color}12)` : "#fff",
                    boxShadow: plan.popular ? `0 20px 60px ${plan.color}25` : "0 4px 20px rgba(0,0,0,0.06)",
                    transition: "all 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
                  }}
                >
                  {plan.popular && (
                    <motion.div
                      initial={{ scale: 0 }}
                      whileInView={{ scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.3 + i * 0.15, type: "spring", stiffness: 200 }}
                      style={{
                        position: "absolute",
                        top: -16,
                        left: "50%",
                        transform: "translateX(-50%)",
                        background: `linear-gradient(135deg, ${plan.color}, ${plan.color}dd)`,
                        color: "#fff",
                        borderRadius: 100,
                        padding: "6px 20px",
                        fontSize: 13,
                        fontWeight: 800,
                        whiteSpace: "nowrap",
                        boxShadow: `0 8px 24px ${plan.color}50`,
                      }}
                    >
                      Most Popular
                    </motion.div>
                  )}
                  <div style={{ fontWeight: 900, fontSize: 24, color: "#1a1a2e", marginBottom: 8 }}>
                    {plan.name}
                  </div>
                  <div style={{ fontSize: 14, color: "#888", marginBottom: 28 }}>{plan.desc}</div>
                  <div style={{ marginBottom: 32 }}>
                    <motion.span
                      key={billingPeriod}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      style={{ fontSize: 40, fontWeight: 900, color: plan.color }}
                    >
                      {billingPeriod === "Monthly" ? plan.monthlyPrice : plan.yearlyPrice}
                    </motion.span>
                    <span style={{ fontSize: 15, color: "#888" }}>
                      {" "}/ {billingPeriod === "Monthly" ? "month" : "year"}
                    </span>
                    <div style={{ fontSize: 13, color: "#aaa", marginTop: 6 }}>
                      Billed {billingPeriod.toLowerCase()}
                    </div>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 14, marginBottom: 32 }}>
                    {plan.features.map((f, fi) => (
                      <motion.div
                        key={f}
                        style={{ display: "flex", gap: 10, alignItems: "flex-start" }}
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.4 + i * 0.15 + fi * 0.05 }}
                      >
                        <CheckCircleFilled style={{ color: plan.color, fontSize: 16, marginTop: 2 }} />
                        <Text style={{ fontSize: 15, color: "#444" }}>{f}</Text>
                      </motion.div>
                    ))}
                  </div>
                  <MagneticButton
                    type={plan.popular ? "primary" : "default"}
                    size="large"
                    onClick={() => window.location.href = "http://localhost:3000/auth/login"}
                    style={{
                      width: "100%",
                      borderRadius: 100,
                      fontWeight: 800,
                      height: 52,
                      fontSize: 16,
                      ...(plan.popular
                        ? {
                          background: `linear-gradient(135deg, ${plan.color}, ${plan.color}dd)`,
                          border: "none",
                          boxShadow: `0 12px 32px ${plan.color}50`,
                        }
                        : { border: `2px solid ${plan.color}50`, color: plan.color, background: "#fff" }),
                    }}
                  >
                    {plan.cta} <ArrowRightOutlined />
                  </MagneticButton>
                  <div style={{ fontSize: 12, color: "#bbb", textAlign: "center", marginTop: 12 }}>
                    Taxes extra if applicable.
                  </div>
                </motion.div>
              </Col>
            ))}
          </Row>
        </section>

        {/* ── FAQ with enhanced collapse ───────────────────────────────────── */}
        <section
          id="faq"
          style={{ background: "#fafafa", padding: "100px 40px", borderTop: "1px solid #f0f0f0" }}
        >
          <div style={{ maxWidth: 800, margin: "0 auto" }}>
            <FadeInSection>
              <div style={{ textAlign: "center", marginBottom: 56 }}>
                <Title level={2} style={{ fontWeight: 900, fontSize: 44, marginBottom: 12 }}>
                  FAQ
                </Title>
                <Paragraph style={{ color: "#666", fontSize: 17 }}>
                  Quick answers about OutletOps modules, restaurant flows, roles/permissions, and
                  billing.
                </Paragraph>
              </div>
            </FadeInSection>
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <Collapse
                items={faqItems}
                style={{
                  borderRadius: 20,
                  overflow: "hidden",
                  border: "2px solid #e8e8e8",
                  background: "#fff",
                }}
                expandIconPosition="end"
              />
            </motion.div>
          </div>
        </section>

        {/* ── CTA BANNER with enhanced gradient ────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <div
            style={{
              background: "linear-gradient(135deg,#5838ff 0%,#a855f7 100%)",
              padding: "100px 40px",
              textAlign: "center",
              position: "relative",
              overflow: "hidden",
            }}
          >
            {/* Animated background pattern */}
            <motion.div
              animate={{
                scale: [1, 1.2, 1],
                rotate: [0, 90, 180],
              }}
              transition={{
                duration: 20,
                repeat: Infinity,
                ease: "linear",
              }}
              style={{
                position: "absolute",
                top: "50%",
                left: "50%",
                width: 800,
                height: 800,
                background: "radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)",
                transform: "translate(-50%, -50%)",
                pointerEvents: "none",
              }}
            />

            <motion.div
              initial={{ y: 30, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
              style={{ position: "relative" }}
            >
              <Title level={2} style={{ color: "#fff", fontWeight: 900, fontSize: 44, marginBottom: 16, letterSpacing: "-0.01em" }}>
                Ready to streamline your outlet?
              </Title>
              <Paragraph style={{ color: "rgba(255,255,255,0.85)", fontSize: 18, marginBottom: 40, maxWidth: 600, margin: "0 auto 40px" }}>
                Sign in and set up your organization in minutes. No installation required.
              </Paragraph>
              <MagneticButton
                type="primary"
                size="large"
                icon={<LoginOutlined />}
                onClick={() => window.location.href = "http://localhost:3000/auth/login"}
                style={{
                  height: 60,
                  paddingInline: 52,
                  borderRadius: 100,
                  fontSize: 18,
                  fontWeight: 800,
                  background: "#fff",
                  color: "#5838ff",
                  border: "none",
                  boxShadow: "0 12px 48px rgba(0,0,0,0.25)",
                }}
              >
                Get Started Now
              </MagneticButton>
            </motion.div>
          </div>
        </motion.div>
      </Content>

      {/* ── FOOTER ───────────────────────────────────────────────────────────── */}
      <Footer
        style={{
          background: "#1a1a2e",
          padding: "48px 60px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 20,
        }}
      >
        <div>
          <div style={{ color: "#fff", fontWeight: 900, fontSize: 18 }}>OutletOps</div>
          <div style={{ color: "rgba(255,255,255,0.4)", fontSize: 13, marginTop: 6 }}>
            Retail + Restaurant Ops Platform
          </div>
        </div>
        <div style={{ color: "rgba(255,255,255,0.35)", fontSize: 14 }}>
          © {new Date().getFullYear()} OutletOps. All rights reserved.
        </div>
      </Footer>
    </Layout>
  );
}
