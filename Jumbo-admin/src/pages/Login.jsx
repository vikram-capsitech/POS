import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api, {
  loginUser,
  createAdminCheckIns,
  createManagerCheckIns,
} from "../services/api";
import GoogleLogo from "../assets/Googlelogo.svg";
import { Eye, EyeOff } from "lucide-react";
import { GoogleLogin } from "@react-oauth/google";

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

      // Store token and role
      localStorage.setItem("token", response.token);
      localStorage.setItem("role", response.role);
      localStorage.setItem("userId", response._id);
      localStorage.setItem("restaurantID", response?.restaurantID);
      if (response.role === "admin") {
        try {
          const attendanceId = await createAdminCheckIns({
            adminId: response._id,
          });
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
      if (err.response?.status === 401) {
        setError("Invalid email or password");
      } else if (err.response?.status === 500) {
        setError("Server error. Please try again later.");
      } else if (!err.response) {
        setError(
          "Unable to connect to server. Please check if backend is running.",
        );
      } else {
        setError("Login failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await performLogin(email, password);
  };

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        height: "100vh",
        backgroundColor: "#FFFFFF",
      }}
    >
      <div
        style={{
          display: "flex",
          width: "940px",
          height: "524px",
          borderRadius: "10px",
          overflow: "hidden",
          backgroundColor: "#F6F8FA",
        }}
      >
        {/* Left Section */}
        <div
          style={{
            width: "470px",
            height: "524px",
            background: "linear-gradient(141.18deg, #5240D6 0%, #2B2170 100%)",
            color: "#fff",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            opacity: 1,
          }}
        >
          <div>
            <div
              style={{
                width: "148px",
                height: "44px",
                top: "10px",
                left: "10px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "10px",
                padding: "10px",
                opacity: 1,
                position: "relative",
              }}
            >
              {" "}
              <h3
                style={{
                  fontFamily: "Inter, sans-serif",
                  fontWeight: 700,
                  fontStyle: "normal",
                  fontSize: "20px",
                  lineHeight: "120%",
                  letterSpacing: "0%",
                  textAlign: "center",
                  width: "128px",
                  height: "24px",
                  // background: "#FFFFFF",
                  color: "#FFFFFF", // keeps it visible on dark background
                  opacity: 1,
                  margin: 0,
                }}
              >
                Jumbo foods
              </h3>
            </div>
            <div
              style={{
                width: "357px",
                height: "68px",
                position: "relative",
                top: "101px",
                left: "20px",
                display: "flex",
                flexDirection: "column",
                gap: "8px",
                opacity: 1,
              }}
            >
              <h1
                style={{
                  width: "266px",
                  height: "36px",
                  fontWeight: 600, // Semi Bold
                  fontStyle: "normal",
                  fontSize: "34px",
                  lineHeight: "100%",
                  letterSpacing: "0%",
                  color: "#FFFFFF",
                  background: "#FFFFFF00", // transparent to avoid blocking background
                  opacity: 1,
                  margin: 0,
                }}
              >
                Welcome back!
              </h1>
              <p
                style={{
                  width: "192px",
                  height: "24px",
                  fontFamily: "Inter, sans-serif",
                  fontWeight: 400,
                  fontStyle: "normal",
                  fontSize: "23px",
                  lineHeight: "100%",
                  letterSpacing: "0%",
                  color: "#D1CFFF",
                  opacity: 1,
                  gap: "10px",
                  margin: 0,
                }}
              >
                Let’s get started.
              </p>
            </div>
          </div>
          <div
            style={{
              width: "176px",
              height: "42px",
              top: "458px",
              left: "10px",
              gap: "10px",
              padding: "10px",
              opacity: 1,
              marginBottom: "20px",
              marginLeft: "10px",
            }}
          >
            <p
              style={{
                width: "156px",
                height: "22px",
                fontFamily: "Inter, sans-serif",
                fontWeight: 700, // Bold
                fontStyle: "normal",
                fontSize: "18px",
                lineHeight: "120%",
                letterSpacing: "0%",
                textAlign: "center",
                color: "#FFFFFF",
                background: "#FFFFFF00", // transparent background for display
                opacity: 1,
                margin: 0,
              }}
            >
              Admin dashboard
            </p>
          </div>
        </div>

        {/* Right Section */}
        <div
          className="login-container"
          style={{
            display: "flex",
            flex: 1,
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            height: "524px",
            padding: "25px 20px",
            boxSizing: "border-box",
            textAlign: "center",
          }}
        >
          <form
            onSubmit={handleSubmit}
            style={{
              top: "74px",
              left: "518px",
              display: "flex",
              flexDirection: "column",
              gap: "20px", // Reduced gap to fit buttons
              width: "358px",
              // height: "376px", // Removed fixed height
              opacity: 1,
            }}
          >
            <div style={{ textAlign: "left" }}>
              <label
                style={{
                  display: "block",
                  fontWeight: "400",
                  fontSize: "8px",
                  color: "#7B7B7B",
                  fontStyle: "normal",
                  marginBottom: "6px",
                  width: "94px",
                  height: "14px",
                  lineHeight: "100%",
                  letterSpacing: "0em",
                  verticalAlign: "middle",
                  whiteSpace: "nowrap",
                }}
              >
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email Address"
                style={{
                  height: "53px",
                  width: "358px",
                  padding: "10px",
                  border: "1px solid var(--border)",
                  borderRadius: "var(--radius-sm)",
                  fontSize: "14px",
                  boxSizing: "border-box",
                  gap: "20px",
                  boxShadow: "0px 1px 2px 0px #0000001A",
                }}
                required
              />
            </div>
            <div style={{ textAlign: "left", position: "relative" }}>
              <label
                style={{
                  display: "block",
                  fontWeight: "400",
                  width: "65px",
                  height: "14px",
                  fontSize: "14px",
                  color: "#7B7B7B",

                  marginBottom: "6px",
                  lineHeight: "100%",
                  letterSpacing: "0em",
                }}
              >
                Password
              </label>
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                style={{
                  height: "53px",
                  width: "358px",
                  padding: "10px",
                  border: "1px solid var(--border)",
                  borderRadius: "var(--radius-sm)",
                  fontSize: "14px",
                  boxShadow: "0px 1px 2px 0px #0000001A",
                  boxSizing: "border-box",
                }}
                required
              />
              {/* Eye button */}
              <span
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: "absolute",
                  right: "10px",
                  top: "50%",
                  marginTop: "11px",
                  transform: "translateY(-50%)",
                  width: "16px",
                  height: "11.875px",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  opacity: 1,
                  color: "#5C5C5C",
                }}
              >
                {showPassword ? <Eye /> : <EyeOff />}
              </span>
            </div>
            {error && (
              <p
                style={{
                  color: "var(--error)",
                  fontWeight: "500",
                  fontSize: "14px",
                  margin: "0",
                }}
              >
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="custom-login-btn"
            >
              {loading ? "Logging in..." : "Login"}
            </button>

            {/* Quick Login Buttons (Dev Only) */}
            <div
              style={{ display: "flex", flexDirection: "column", gap: "10px" }}
            >
              <p
                style={{ fontSize: "12px", color: "#888", marginBottom: "5px" }}
              >
                Quick Login (Dev Only):
              </p>
              <div
                style={{
                  display: "flex",
                  gap: "10px",
                  flexWrap: "wrap",
                  justifyContent: "space-between",
                }}
              >
                <button
                  type="button"
                  onClick={() =>
                    performLogin("superadmin@example.com", "SuperAdmin@123")
                  }
                  style={{
                    flex: "1 0 45%",
                    padding: "8px",
                    fontSize: "11px",
                    cursor: "pointer",
                    backgroundColor: "#e0e0e0",
                    border: "none",
                    borderRadius: "5px",
                  }}
                >
                  Super Admin
                </button>
                <button
                  type="button"
                  onClick={() => performLogin("admin@example.com", "Admin@123")}
                  style={{
                    flex: "1 0 45%",
                    padding: "8px",
                    fontSize: "11px",
                    cursor: "pointer",
                    backgroundColor: "#e0e0e0",
                    border: "none",
                    borderRadius: "5px",
                  }}
                >
                  Restaurant Admin
                </button>
                <button
                  type="button"
                  onClick={() =>
                    performLogin("kitchen@example.com", "Employee@123")
                  }
                  style={{
                    flex: "1 0 45%",
                    padding: "8px",
                    fontSize: "11px",
                    cursor: "pointer",
                    backgroundColor: "#e0e0e0",
                    border: "none",
                    borderRadius: "5px",
                  }}
                >
                  Kitchen Staff
                </button>
                <button
                  type="button"
                  onClick={() =>
                    performLogin("counter@example.com", "Employee@123")
                  }
                  style={{
                    flex: "1 0 45%",
                    padding: "8px",
                    fontSize: "11px",
                    cursor: "pointer",
                    backgroundColor: "#e0e0e0",
                    border: "none",
                    borderRadius: "5px",
                  }}
                >
                  Counter Staff
                </button>
              </div>
            </div>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "9px",
                width: "358px",
                height: "17px",
              }}
            >
              <div
                style={{
                  width: "160px",
                  height: "0px",
                  borderTop: "1px solid #808080",
                  opacity: 1,
                }}
              ></div>
              <span
                style={{
                  fontFamily: "Inter, sans-serif",
                  fontWeight: 400,
                  width: "16px",
                  height: "17px",
                  fontSize: "14px",
                  color: "#808080",

                  lineHeight: "120%",
                }}
              >
                or
              </span>
              <div
                style={{
                  width: "160px",
                  height: "0px",
                  borderTop: "1px solid #808080",
                  opacity: 1,
                }}
              ></div>
            </div>
            {/* Google Login Button */}
            <div>
              <GoogleLogin
                onSuccess={async (credentialResponse) => {
                  try {
                    const res = await api.post(`/auth/google-login`, {
                      credential: credentialResponse.credential,
                    });

                    // Save token + role
                    localStorage.setItem("token", res?.data?.token);
                    localStorage.setItem("role", res?.data?.role);

                    onLogin(res?.data?.role);
                    navigate("/");
                  } catch (err) {
                    console.error("Google Login Failed:", err);
                    setError("Google login failed. Try again.");
                  }
                }}
                onError={() => {
                  setError("Google login failed. Try again.");
                }}
                theme="outline"
                size="large"
                width="358px"
              />
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
