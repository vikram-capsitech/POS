import { Link } from "react-router-dom";
// @antd
import { Typography } from "antd";
import RegisterForm from "../../Sections/Auth/RegisterForm";
import { ScraawlLogoIcon } from "../../Assets/CustomAntIcons";
import AuthSocial from "../../Sections/Auth/AuthSocial";

// ----------------------------------------------------------------------

export default function Register() {
  const { Text } = Typography;
  return (
    <>
      <div
        style={{
          width: "100%",
          // maxWidth: "500px",
          padding: "10px",
          borderRadius: "8px",
          // boxShadow: "0 4px 10px rgba(0, 0, 0, 0.1)",
          backgroundColor: "#fff",
          textAlign: "center",
          border: "1px solidrgba(51, 51, 51, 0.2)",
        }}
      >
        <div
          style={{
            margin: "4px 0px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "#F2F9FF",
            padding: "16px",
            borderRadius: "8px",
            position: "relative",
            zIndex: 10,
          }}
        >
          <Text
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              cursor: "pointer",
              color: "#0078EF",
              fontWeight: 700,
              fontSize: "26px",
            }}
          >
            <ScraawlLogoIcon />
            SCRAAWL
          </Text>
        </div>
        {/* Form */}
        <div style={{ padding: "10px 30px" }}>
          {/* Login Title */}
          <Typography.Title
            level={4}
            style={{
              fontWeight: 400,
              marginBottom: 4,
              textAlign: "start",
              fontSize: "28px",
              color: "#333333",
            }}
          >
            Sign Up
          </Typography.Title>
          <Typography.Text type="secondary">
            Sign in to engage in secure, efficient communication.
          </Typography.Text>

          {/* Form Fields */}
          <div style={{ textAlign: "left", marginTop: "20px" }}>
            <RegisterForm />
          </div>
          <div style={{ textAlign: "left", marginTop: "20px" }}>
            <AuthSocial />
          </div>
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            gap: "6px",
            margin: "16px",
          }}
        >
          <Typography.Text
            style={{
              fontWeight: 400,
              fontSize: "15px",
              color: "#33333366",
            }}
          >
            Already have account
          </Typography.Text>
          <Link
            to="/auth/login"
            style={{
              fontWeight: 400,
              textDecoration: "underline",
              color: "#0078EF",
            }}
          >
            Login
          </Link>
        </div>
      </div>
    </>
  );
}
