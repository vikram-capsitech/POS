import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api, { loginUser, createAdminCheckIns, createManagerCheckIns } from "../services/api";
import { Eye, EyeOff } from "lucide-react";
import { GoogleLogin } from "@react-oauth/google";
import React from "react";

export default function Login({ onLogin }) {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const performLogin = async (loginEmail, loginPassword) => {
    setLoading(true);
    setError("");

    try {
      const response = await loginUser(loginEmail, loginPassword, "web");

      localStorage.setItem("token", response.token);
      localStorage.setItem("role", response.role);
      localStorage.setItem("userId", response._id);
      localStorage.setItem("restaurantID", response?.restaurantID);

      if (response.modules) {
        localStorage.setItem("restaurantModules", JSON.stringify(response.modules));
      } else {
        localStorage.removeItem("restaurantModules");
      }

      if (response.role === "admin") {
        try {
          const attendanceId = await createAdminCheckIns({ adminId: response._id });
          localStorage.setItem("attendanceId", attendanceId.data._id);
        } catch (err) {
          console.error("not check in ", err);
        }
      }

      if (response?.role === "employee") {
        try {
          const attendanceId = await createManagerCheckIns({
            employeeId: response._id,
            restaurantID: response.restaurantID,
          });
          localStorage.setItem("attendanceId", attendanceId.data._id);
        } catch (err) {
          console.error("not check in ", err);
        }
        localStorage.setItem("access", JSON.stringify(response?.access || []));
      }

      onLogin(response?.role, response?.access);
      navigate("/");
    } catch (err) {
      console.error("Login error:", err);
      if (err.response?.status === 401) setError("Invalid email or password");
      else if (err.response?.status === 500) setError("Server error. Please try again later.");
      else if (!err.response) setError("Unable to connect to server. Please check if backend is running.");
      else setError("Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await performLogin(email, password);
  };

  // ===== Single-file styles =====
  const S = {
    page: {
      minHeight: "100vh",
      display: "grid",
      placeItems: "center",
      padding: "24px",
      background:
        "radial-gradient(1200px 700px at 20% 10%, rgba(37, 99, 235, 0.18), transparent 45%), radial-gradient(900px 600px at 90% 40%, rgba(15, 23, 42, 0.25), transparent 50%), #0F172A",
      fontFamily:
        "Inter, system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif",
    },
    shell: {
      width: "min(1040px, 100%)",
      minHeight: "560px",
      display: "grid",
      gridTemplateColumns: "1.05fr .95fr",
      borderRadius: "18px",
      overflow: "hidden",
      boxShadow: "0 40px 120px rgba(0,0,0,.45)",
      background: "rgba(15, 23, 42, 0.75)",
      backdropFilter: "blur(16px)",
      border: "1px solid rgba(255,255,255,.08)",
    },
    left: {
      padding: "52px",
      color: "#fff",
      background:
        "linear-gradient(135deg, #1E293B 0%, #0F172A 60%, #020617 100%)",
      display: "flex",
      flexDirection: "column",
      justifyContent: "space-between",
      position: "relative",
      overflow: "hidden",
    },
    glow1: {
      position: "absolute",
      inset: "-120px auto auto -140px",
      width: "320px",
      height: "320px",
      borderRadius: "999px",
      background: "rgba(37, 99, 235, .25)",
      filter: "blur(0px)",
      transform: "rotate(10deg)",
      pointerEvents: "none",
    },
    glow2: {
      position: "absolute",
      inset: "auto -120px -160px auto",
      width: "380px",
      height: "380px",
      borderRadius: "999px",
      background: "rgba(255,255,255,.10)",
      filter: "blur(0px)",
      transform: "rotate(-10deg)",
      pointerEvents: "none",
    },
    brandRow: { display: "flex", alignItems: "center", gap: "10px" },
    mark: {
      width: "38px",
      height: "38px",
      borderRadius: "12px",
      background: "linear-gradient(135deg, #2563EB, #1D4ED8)",
      border: "1px solid rgba(255,255,255,.26)",
      display: "grid",
      placeItems: "center",
      fontWeight: 800,
      letterSpacing: ".5px",
    },
    brandText: { display: "flex", flexDirection: "column", lineHeight: 1.1 },
    brandTitle: { margin: 0, fontSize: "18px", fontWeight: 800 },
    brandSub: { margin: 0, fontSize: "12px", opacity: 0.85, marginTop: "4px" },

    hero: { marginTop: "10px" },
    heroH: {
      margin: 0,
      fontSize: "38px",
      lineHeight: 1.15,
      fontWeight: 750,
      letterSpacing: "-0.02em",
      maxWidth: "420px",
    },
    heroP: {
      margin: "14px 0 0",
      maxWidth: "420px",
      opacity: 0.86,
      fontSize: "15px",
      lineHeight: 1.6,
    },
    bullets: { marginTop: "26px", display: "grid", gap: "12px", maxWidth: "420px" },
    bullet: {
      display: "flex",
      alignItems: "flex-start",
      gap: "10px",
      padding: "12px 14px",
      borderRadius: "14px",
      background: "rgba(255,255,255,.04)",
      border: "1px solid rgba(255,255,255,.06)",
    },
    dot: {
      width: "10px",
      height: "10px",
      borderRadius: "999px",
      marginTop: "5px",
      background: "#3B82F6",
    },
    bulletT: { margin: 0, fontSize: "13px", opacity: 0.95, fontWeight: 650 },
    bulletD: { margin: "4px 0 0", fontSize: "12px", opacity: 0.80, lineHeight: 1.5 },

    foot: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      gap: "12px",
      paddingTop: "20px",
      opacity: 0.9,
    },
    footChip: {
      display: "inline-flex",
      alignItems: "center",
      gap: "8px",
      padding: "10px 12px",
      borderRadius: "999px",
      background: "rgba(255,255,255,.12)",
      border: "1px solid rgba(255,255,255,.18)",
      fontSize: "12px",
    },

    right: {
      padding: "52px",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: "rgba(248,250,252,.95)",
    },
    card: {
      width: "min(420px, 100%)",
      borderRadius: "18px",
      padding: "26px",
      // background: "#FFFFFF",
      // border: "1px solid rgba(15,23,42,.06)",
      // boxShadow: "0 20px 60px rgba(0,0,0,.08)",
    },
    cardTop: { display: "grid", gap: "6px", marginBottom: "18px" },
    title: { margin: 0, fontSize: "22px", fontWeight: 750, letterSpacing: "-0.01em", color: "#0F172A", },
    subtitle: { margin: 0, fontSize: "13px", color: "#64748B", lineHeight: 1.45 },

    form: { display: "grid", gap: "14px" },
    field: { display: "grid", gap: "6px", textAlign: "left" },
    label: { fontSize: "12px", color: "#475569", fontWeight: 650 },
    inputWrap: { position: "relative" },
    input: {
      height: "48px",
      width: "100%",
      borderRadius: "12px",
      border: "1px solid rgba(15,23,42,.10)",
      padding: "0 12px",
      fontSize: "14px",
      color: "#0F172A",
      outline: "none",
      background: "#fff",
      boxShadow: "0 1px 2px rgba(0,0,0,.04)",
      transition: "box-shadow .2s, border-color .2s",
    },
    inputFocus: {
      borderColor: "rgba(95,61,196,.55)",
      boxShadow: "0 0 0 4px rgba(95,61,196,.12)",
    },
    toggleBtn: {
      position: "absolute",
      right: "10px",
      top: "50%",
      transform: "translateY(-50%)",
      width: "36px",
      height: "36px",
      borderRadius: "10px",
      border: "1px solid rgba(15,23,42,.08)",
      background: "rgba(248,250,252,.9)",
      display: "grid",
      placeItems: "center",
      cursor: "pointer",
      color: "#475569",
    },

    error: { margin: 0, fontSize: "13px", color: "#EF4444", fontWeight: 600 },

    primary: {
      height: "48px",
      borderRadius: "12px",
      border: "none",
      cursor: "pointer",
      fontWeight: 750,
      fontSize: "14px",
      color: "#fff",
      background: "linear-gradient(135deg, #2563EB, #1D4ED8)",
      boxShadow: "0 10px 30px rgba(37,99,235,.35)",
      transition: "transform .06s ease, filter .2s ease",
    },
    primaryDisabled: { filter: "grayscale(.15) opacity(.75)", cursor: "not-allowed" },

    divider: {
      display: "grid",
      gridTemplateColumns: "1fr auto 1fr",
      gap: "12px",
      alignItems: "center",
      margin: "6px 0 2px",
      color: "#94A3B8",
      fontSize: "12px",
      fontWeight: 700,
    },
    line: { height: "1px", background: "rgba(15,23,42,.10)" },

    googleWrap: {
      display: "grid",
      gap: "10px",
      marginTop: "2px",
    },

    devBox: {
      marginTop: "10px",
      paddingTop: "14px",
      borderTop: "1px dashed rgba(15,23,42,.12)",
      display: "grid",
      gap: "10px",
    },
    devTitle: { margin: 0, fontSize: "12px", color: "#64748B", fontWeight: 700, textTransform: "uppercase", letterSpacing: ".08em" },
    devBtns: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" },
    ghostBtn: {
      height: "40px",
      borderRadius: "12px",
      border: "1px solid rgba(15,23,42,.10)",
      background: "rgba(248,250,252,.9)",
      cursor: "pointer",
      fontWeight: 700,
      fontSize: "12px",
      color: "#0F172A",
    },

    // Responsive
    mobileShell: {
      gridTemplateColumns: "1fr",
      minHeight: "auto",
    },
    mobileLeft: {
      padding: "34px",
      minHeight: "260px",
    },
    mobileRight: { padding: "24px" },
  };

  function useMediaQuery(query) {
    const getMatch = () =>
      typeof window !== "undefined" ? window.matchMedia(query).matches : false;

    const [matches, setMatches] = useState(getMatch);

    React.useEffect(() => {
      if (typeof window === "undefined") return;
      const mql = window.matchMedia(query);

      const onChange = () => setMatches(mql.matches);
      onChange();

      // Safari fallback
      if (mql.addEventListener) mql.addEventListener("change", onChange);
      else mql.addListener(onChange);

      return () => {
        if (mql.removeEventListener) mql.removeEventListener("change", onChange);
        else mql.removeListener(onChange);
      };
    }, [query]);

    return matches;
  }

  const isMobile = useMediaQuery("(max-width: 920px)");


  // small helper to add focus styles without extra css file
  const [focus, setFocus] = useState({ email: false, password: false });

  return (
    <div style={S.page}>
      <div style={{ ...S.shell, ...(isMobile ? S.mobileShell : null) }}>
        {/* LEFT */}
        <div style={{ ...S.left, ...(isMobile ? S.mobileLeft : null) }}>
          <div style={S.glow1} />
          <div style={S.glow2} />

          <div>
            <div style={S.brandRow}>
              <div style={S.mark}>J</div>
              <div style={S.brandText}>
                <h3 style={S.brandTitle}>Jumbo Foods</h3>
                <p style={S.brandSub}>Restaurant SaaS Suite</p>
              </div>
            </div>

            <div style={S.hero}>
              <h1 style={S.heroH}>Welcome back to your operations hub.</h1>
              <p style={S.heroP}>
                Run orders, staff, inventory, and analytics from one secure dashboard built for multi-branch teams.
              </p>

              <div style={S.bullets}>
                <div style={S.bullet}>
                  <div style={S.dot} />
                  <div>
                    <p style={S.bulletT}>Role-based access</p>
                    <p style={S.bulletD}>Control modules & permissions per user and branch.</p>
                  </div>
                </div>
                <div style={S.bullet}>
                  <div style={S.dot} />
                  <div>
                    <p style={S.bulletT}>Faster daily workflows</p>
                    <p style={S.bulletD}>Less clicks for billing, kitchen, and counter operations.</p>
                  </div>
                </div>
                <div style={S.bullet}>
                  <div style={S.dot} />
                  <div>
                    <p style={S.bulletT}>Real-time insights</p>
                    <p style={S.bulletD}>Sales, wastage and staff performance on one screen.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div style={S.foot}>
            <div style={S.footChip}>🔒 Secure login</div>
            <div style={{ ...S.footChip, opacity: 0.85 }}>v1.0</div>
          </div>
        </div>

        {/* RIGHT */}
        <div style={{ ...S.right, ...(isMobile ? S.mobileRight : null) }}>
          <div style={S.card}>
            <div style={S.cardTop}>
              <h2 style={S.title}>Sign in</h2>
              <p style={S.subtitle}>Enter your credentials to continue.</p>
            </div>

            <form onSubmit={handleSubmit} style={S.form}>
              <div style={S.field}>
                <label style={S.label}>Email</label>
                <div style={S.inputWrap}>
                  <input
                    style={{
                      ...S.input,
                      ...(focus.email ? S.inputFocus : null),
                    }}
                    type="email"
                    value={email}
                    onFocus={() => setFocus((p) => ({ ...p, email: true }))}
                    onBlur={() => setFocus((p) => ({ ...p, email: false }))}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@restaurant.com"
                    required
                    autoComplete="email"
                  />
                </div>
              </div>

              <div style={S.field}>
                <label style={S.label}>Password</label>
                <div style={S.inputWrap}>
                  <input
                    style={{
                      ...S.input,
                      paddingRight: "54px",
                      ...(focus.password ? S.inputFocus : null),
                    }}
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onFocus={() => setFocus((p) => ({ ...p, password: true }))}
                    onBlur={() => setFocus((p) => ({ ...p, password: false }))}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    onClick={() => setShowPassword((v) => !v)}
                    style={S.toggleBtn}
                  >
                    {showPassword ? <Eye size={18} /> : <EyeOff size={18} />}
                  </button>
                </div>
              </div>

              {error ? <p style={S.error}>{error}</p> : null}

              <button
                type="submit"
                disabled={loading}
                style={{
                  ...S.primary,
                  ...(loading ? S.primaryDisabled : null),
                }}
                onMouseDown={(e) => e.currentTarget.style.transform = "translateY(1px)"}
                onMouseUp={(e) => e.currentTarget.style.transform = "translateY(0px)"}
                onClick={handleSubmit}
              >
                {loading ? "Signing in..." : "Sign in"}
              </button>

              <div style={S.divider}>
                <div style={S.line} />
                <span>OR</span>
                <div style={S.line} />
              </div>

              <div style={S.googleWrap}>
                <GoogleLogin
                  onSuccess={async (credentialResponse) => {
                    try {
                      const res = await api.post(`/auth/google-login`, {
                        credential: credentialResponse.credential,
                      });
                      localStorage.setItem("token", res?.data?.token);
                      localStorage.setItem("role", res?.data?.role);
                      onLogin(res?.data?.role);
                      navigate("/");
                    } catch (err) {
                      console.error("Google Login Failed:", err);
                      setError("Google login failed. Try again.");
                    }
                  }}
                  onError={() => setError("Google login failed. Try again.")}
                  theme="outline"
                  size="large"
                  width="100%"
                />
              </div>

              {/* Dev quick login - keep or remove */}
              <div style={S.devBox}>
                <p style={S.devTitle}>Quick login (dev)</p>
                <div style={S.devBtns}>
                  <button
                    type="button"
                    style={S.ghostBtn}
                    onClick={() => performLogin("superadmin@example.com", "SuperAdmin@123")}
                  >
                    Super Admin
                  </button>
                  <button
                    type="button"
                    style={S.ghostBtn}
                    onClick={() => performLogin("admin@example.com", "Admin@123")}
                  >
                    Restaurant Admin
                  </button>
                  <button
                    type="button"
                    style={S.ghostBtn}
                    onClick={() => performLogin("kitchen@example.com", "Employee@123")}
                  >
                    Kitchen Staff
                  </button>
                  <button
                    type="button"
                    style={S.ghostBtn}
                    onClick={() => performLogin("counter@example.com", "Employee@123")}
                  >
                    Counter Staff
                  </button>
                </div>
              </div>
            </form>

            <div style={{ marginTop: "14px", fontSize: "12px", color: "#94A3B8", textAlign: "center" }}>
              By continuing, you agree to your organization’s access policies.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
