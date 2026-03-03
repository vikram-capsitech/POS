// src/pages/Auth/LoginAntd.tsx
import React, { useMemo, useState } from "react";
import {
  Row,
  Col,
  Card,
  Typography,
  Form,
  Input,
  Button,
  Alert,
  Divider,
  Space,
  Grid,
  theme,
  App,
  Flex,
} from "antd";
import {
  EyeInvisibleOutlined,
  EyeTwoTone,
  LockOutlined,
  MailOutlined,
  SafetyCertificateOutlined,
  IdcardOutlined,
  PartitionOutlined,
  CarryOutOutlined,
  FireOutlined,
  UsergroupAddOutlined,
  RocketOutlined,
  TeamOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";

import { loginUser, hrmManagerCheckIn } from "../../Api";
import { useAuthStore } from "../../Store/store";
import { useAppStore } from "../../Store/app.store";

const { Title, Text } = Typography;
const { useBreakpoint } = Grid;

type Props = {
  onLogin: (role?: string, access?: any) => void;
};

export default function LoginAntd({ onLogin }: Props) {
  const navigate = useNavigate();
  const screens = useBreakpoint();
  const { token } = theme.useToken();
  const { showSnackbar } = useAppStore();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const [form] = Form.useForm();

  const isMobile = !screens.lg;

  // ✅ Use same palette as AuthLayout (light gradient + background image)
  const pageStyle = useMemo<React.CSSProperties>(
    () => ({
      width: "100%",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      padding: isMobile ? 16 : 24,
    }),
    [isMobile],
  );

  const shellStyle = useMemo<React.CSSProperties>(
    () => ({
      width: "min(1040px, 100%)",
      borderRadius: 18,
      overflow: "hidden",
      boxShadow: "0 30px 100px rgba(2, 6, 23, 0.18)",
      border: "1px solid rgba(2, 6, 23, 0.06)",
      background: "rgba(255,255,255,0.78)",
      backdropFilter: "blur(12px)",
    }),
    [],
  );

  const leftStyle = useMemo<React.CSSProperties>(
    () => ({
      position: "relative",
      padding: isMobile ? 24 : 44,
      color: "#0F172A",
      background:
        "radial-gradient(900px 520px at 10% 10%, rgba(82, 64, 214, 0.18), transparent 55%), radial-gradient(720px 520px at 90% 20%, rgba(37, 99, 235, 0.12), transparent 55%), #FFFFFF",
      minHeight: isMobile ? 220 : 560,
      display: "flex",
      flexDirection: "column",
      justifyContent: "space-between",
      borderRight: isMobile ? "none" : "1px solid rgba(2, 6, 23, 0.06)",
    }),
    [isMobile],
  );

  const rightStyle = useMemo<React.CSSProperties>(
    () => ({
      padding: isMobile ? 22 : 44,
      background: "rgba(255,255,255,0.9)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      minHeight: isMobile ? "auto" : 560,
    }),
    [isMobile],
  );

  const cardStyle = useMemo<React.CSSProperties>(
    () => ({
      width: "min(420px, 100%)",
      borderRadius: 16,
      border: "1px solid rgba(2,6,23,0.06)",
      boxShadow: "0 18px 60px rgba(2,6,23,0.10)",
      background: "#FFFFFF",
    }),
    [],
  );

  const brandMarkStyle: React.CSSProperties = {
    width: 40,
    height: 40,
    borderRadius: 12,
    display: "grid",
    placeItems: "center",
    fontWeight: 900,
    letterSpacing: ".5px",
    background: "linear-gradient(135deg, #5240d6, #2563EB)",
    color: "#fff",
    boxShadow: "0 10px 25px rgba(82,64,214,.25)",
  };

  const chipStyle: React.CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    padding: "10px 12px",
    borderRadius: 999,
    background: "rgba(82, 64, 214, 0.08)",
    border: "1px solid rgba(82, 64, 214, 0.14)",
    fontSize: 12,
    color: "#0F172A",
  };

  const setSessionFromLogin = useAuthStore.getState().setSessionFromLogin as (
    payload: any,
  ) => void;
  const updateSession = (useAuthStore.getState() as any).updateSession as
    | ((patch: any) => void)
    | undefined;

  const performLogin = async (loginEmail: string, loginPassword: string) => {
    setLoading(true);
    setError("");

    try {
      // axios response
      const res: any = await loginUser({ loginEmail, loginPassword });
      // backend format:
      // res.data = { statusCode, data: { user, accessToken }, message, success }
      const payload = res?.data?.data;
      const user = payload?.user;
      const accessToken = payload?.accessToken;

      if (!accessToken || !user?._id) {
        throw new Error("Invalid login response");
      }

      // ✅ Store in Zustand (store expects accessToken + user)
      setSessionFromLogin(payload);
      // Optional: employee check-in based on systemRole
      const systemRole = user?.systemRole; // "admin" | "employee" | ...
      if (systemRole === "employee") {
        try {
          // Your API expects restaurantID; in your schema it's organizationID
          const restaurantID = user?.organizationID?._id;

          const attendanceIdRes: any = await hrmManagerCheckIn({
            employeeId: user._id,
            restaurantID,
          });

          const attendanceId =
            attendanceIdRes?.data?._id || attendanceIdRes?.data?.data?._id;
          if (attendanceId && typeof updateSession === "function") {
            updateSession({ attendanceId });
          }
        } catch (err) {
          console.error("Employee check-in error:", err);
        }
      }

      // callback (role + token)
      if (onLogin) onLogin(systemRole, accessToken);

      showSnackbar("success", "Login successful! Redirecting...");
      // redirect logic
      const org = user?.organizationID;
      const orgId = typeof org === "string" ? org : org?._id;
      const hasOrg = Boolean(orgId);

      // Determine redirect destination based on role
      if (systemRole === "superadmin") {
        navigate("/superadmin/dashboard");
      } else if (hasOrg) {
        // Check if this employee is a POS-only waiter (pages only contains "pos")
        const roleData = typeof user?.roleID === "object" ? user.roleID : null;
        const rolePages: string[] | null = Array.isArray(roleData?.pages)
          ? roleData.pages
          : null;
        const isPosOnly =
          rolePages !== null &&
          rolePages.length > 0 &&
          rolePages.every((p: string) => p === "pos");

        if (isPosOnly) {
          // Send pos-only directly to their specific views
          const roleName = (roleData?.name || "").toLowerCase();
          if (roleName === "waiter") {
            navigate(`/pos/${orgId}/waiter`);
          } else if (roleName === "kitchen") {
            navigate(`/pos/${orgId}/kitchen`);
          } else {
            navigate(`/pos/${orgId}/dashboard`);
          }
        } else {
          navigate(`/client/${orgId}`);
        }
      } else {
        navigate("/client/organization");
      }
    } catch (err: any) {
      console.error("Login error:", err);
      const status = err?.response?.status;

      if (status === 401) setError("Invalid email or password");
      else if (status === 500)
        setError("Server error. Please try again later.");
      else if (!err?.response)
        setError(
          "Unable to connect to server. Please check if backend is running.",
        );
      else
        setError(
          err?.response?.data?.message || "Login failed. Please try again.",
        );
    } finally {
      setLoading(false);
    }
  };

  const onFinish = async (values: { email: string; password: string }) => {
    await performLogin(values.email, values.password);
  };

  // ✅ Dev buttons should NOT show in production
  const showQuickLogin = import.meta.env.DEV === true;

  return (
    <div style={pageStyle}>
      <div style={shellStyle}>
        <Row gutter={0} wrap>
          {/* LEFT */}
          <Col xs={24} lg={13}>
            <div style={leftStyle}>
              <div>
                <Space align="start" size={12}>
                  <div style={brandMarkStyle}>J</div>
                  <div>
                    <Text
                      style={{
                        color: "#0F172A",
                        fontWeight: 900,
                        fontSize: 18,
                        display: "block",
                      }}
                    >
                      Jumbo Foods
                    </Text>
                    <Text style={{ color: "rgba(15,23,42,.70)", fontSize: 12 }}>
                      Restaurant SaaS Suite
                    </Text>
                  </div>
                </Space>

                <div style={{ marginTop: 16 }}>
                  <Title
                    level={2}
                    style={{
                      margin: 0,
                      fontWeight: 850,
                      letterSpacing: "-0.02em",
                      lineHeight: 1.12,
                      fontSize: isMobile ? 26 : 38,
                      maxWidth: 520,
                      color: "#0F172A",
                    }}
                  >
                    Welcome back to your operations hub.
                  </Title>

                  <Text
                    style={{
                      display: "block",
                      marginTop: 10,
                      color: "rgba(15,23,42,.75)",
                      fontSize: 14,
                      lineHeight: 1.65,
                      maxWidth: 560,
                    }}
                  >
                    Run orders, staff, inventory, and analytics from one secure
                    dashboard built for multi-branch teams.
                  </Text>

                  <div
                    style={{
                      marginTop: 18,
                      display: "grid",
                      gap: 10,
                      maxWidth: 560,
                    }}
                  >
                    {[
                      {
                        t: "Role-based access",
                        d: "Control modules & permissions per user and branch.",
                      },
                      {
                        t: "Faster daily workflows",
                        d: "Less clicks for billing, kitchen, and counter operations.",
                      },
                      {
                        t: "Real-time insights",
                        d: "Sales, wastage and staff performance on one screen.",
                      },
                    ].map((b) => (
                      <div
                        key={b.t}
                        style={{
                          display: "flex",
                          gap: 10,
                          padding: "12px 14px",
                          borderRadius: 14,
                          background: "rgba(2,6,23,.03)",
                          border: "1px solid rgba(2,6,23,.06)",
                        }}
                      >
                        <div
                          style={{
                            width: 10,
                            height: 10,
                            borderRadius: 999,
                            marginTop: 6,
                            background: "#5240d6",
                            boxShadow: "0 0 0 4px rgba(82,64,214,.12)",
                          }}
                        />
                        <div>
                          <Text
                            style={{
                              color: "#0F172A",
                              fontWeight: 750,
                              fontSize: 13,
                            }}
                          >
                            {b.t}
                          </Text>
                          <Text
                            style={{
                              display: "block",
                              color: "rgba(15,23,42,.70)",
                              fontSize: 12,
                              marginTop: 3,
                            }}
                          >
                            {b.d}
                          </Text>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  gap: 12,
                }}
              >
                <div style={chipStyle}>🔒 Secure login</div>
                <div style={{ ...chipStyle, opacity: 0.85 }}>v1.0</div>
              </div>
            </div>
          </Col>

          {/* RIGHT */}
          <Col xs={24} lg={11}>
            <div style={rightStyle}>
              <Card style={cardStyle} bodyStyle={{ padding: 22 }}>
                <Space direction="vertical" size={4} style={{ width: "100%" }}>
                  <Title
                    level={4}
                    style={{
                      margin: 0,
                      color: token.colorTextHeading,
                      fontWeight: 850,
                    }}
                  >
                    Sign in
                  </Title>
                  <Text type="secondary">
                    Enter your credentials to continue.
                  </Text>
                </Space>

                <div style={{ marginTop: 14 }}>
                  {error ? (
                    <Alert
                      type="error"
                      showIcon
                      message={error}
                      style={{ borderRadius: 12, marginBottom: 12 }}
                    />
                  ) : null}

                  <Form
                    form={form}
                    layout="vertical"
                    onFinish={onFinish}
                    requiredMark={false}
                    size="large"
                    style={{ marginTop: 8 }}
                  >
                    <Form.Item
                      label={<span style={{ fontWeight: 650 }}>Email</span>}
                      name="email"
                      rules={[
                        { required: true, message: "Email is required" },
                        { type: "email", message: "Enter a valid email" },
                      ]}
                    >
                      <Input
                        prefix={<MailOutlined />}
                        placeholder="admin@restaurant.com"
                        autoComplete="email"
                      />
                    </Form.Item>

                    <Form.Item
                      label={<span style={{ fontWeight: 650 }}>Password</span>}
                      name="password"
                      rules={[
                        { required: true, message: "Password is required" },
                      ]}
                    >
                      <Input.Password
                        prefix={<LockOutlined />}
                        placeholder="••••••••"
                        autoComplete="current-password"
                        iconRender={(visible) =>
                          visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />
                        }
                      />
                    </Form.Item>

                    <Button
                      type="primary"
                      htmlType="submit"
                      loading={loading}
                      block
                      style={{
                        height: 46,
                        borderRadius: 12,
                        fontWeight: 850,
                        background: "linear-gradient(135deg, #5240d6, #2563EB)",
                        border: "none",
                        boxShadow: "0 10px 30px rgba(82,64,214,.22)",
                      }}
                    >
                      Sign in
                    </Button>

                    {showQuickLogin ? (
                      <>
                        <Divider style={{ margin: "14px 0" }}>
                          <Text type="secondary" style={{ fontSize: 11, fontWeight: 700 }}>DEMO CREDENTIALS</Text>
                        </Divider>

                        <Row gutter={[8, 8]}>
                          {[
                            ["Superadmin", "superadmin@example.com", "SuperAdmin@1234", <SafetyCertificateOutlined key="sa" />],
                            ["Admin", "admin@example.com", "Admin@1234", <IdcardOutlined key="ad" />],
                            ["Manager", "manager@example.com", "Manager@1234", <PartitionOutlined key="mg" />],
                            ["Staff", "staff@example.com", "Staff@1234", <CarryOutOutlined key="sf" />],
                            ["Kitchen", "kitchen@example.com", "Kitchen@1234", <FireOutlined key="kt" />],
                            ["Waiter", "waiter@example.com", "Waiter@1234", <UsergroupAddOutlined key="wt" />],
                            ["Cleaner", "cleaner@example.com", "Cleaner@1234", <RocketOutlined key="cl" />],
                            ["Employee", "employee@example.com", "Employee@1234", <TeamOutlined key="em" />],
                          ].map(([label, email, pass, icon]) => (
                            <Col xs={24} sm={12} key={label as string}>
                              <Button
                                block
                                onClick={() => {
                                  form.setFieldsValue({ email, password: pass });
                                  performLogin(email as string, pass as string);
                                }}
                                style={{
                                  borderRadius: 10,
                                  height: "auto",
                                  padding: "10px 12px",
                                  textAlign: "left",
                                  background: "rgba(2,6,23,.02)",
                                  border: "1px solid rgba(2,6,23,.05)",
                                }}
                                className="dev-auth-btn"
                              >
                                <Flex align="start" gap={10}>
                                  <div style={{
                                    fontSize: 18,
                                    padding: 6,
                                    borderRadius: 8,
                                    background: "#fff",
                                    color: "#5240d6",
                                    boxShadow: "0 2px 6px rgba(0,0,0,0.05)"
                                  }}>
                                    {icon}
                                  </div>
                                  <div style={{ flex: 1 }}>
                                    <Text strong style={{ fontSize: 13, display: "block" }}>{label}</Text>
                                    <Text type="secondary" style={{ fontSize: 11, display: "block" }}>{email}</Text>
                                  </div>
                                </Flex>
                              </Button>
                            </Col>
                          ))}
                        </Row>
                      </>
                    ) : null}
                  </Form>

                  <Text
                    type="secondary"
                    style={{
                      display: "block",
                      marginTop: 12,
                      fontSize: 12,
                      textAlign: "center",
                    }}
                  >
                    By continuing, you agree to your organization’s access
                    policies.
                  </Text>
                </div>
              </Card>
            </div>
          </Col>
        </Row>
      </div>
    </div>
  );
}
