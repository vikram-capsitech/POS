import { useState } from "react";
import * as Yup from "yup";
// form
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
// @antd
import { Button, Alert, Space, Row, Typography } from "antd";
import { EyeOutlined, EyeInvisibleOutlined } from "@ant-design/icons";
// components
import { LoginUser } from "../../redux/slices/auth";
import { useDispatch } from "react-redux";
import { Link } from "react-router-dom";
import FormProvider from "../../Components/Hook-Form/FormProvider";
import RHFTextField from "../../Components/Hook-Form/RHFTextField";

// ----------------------------------------------------------------------

export default function AuthLoginForm() {
  const dispatch = useDispatch();
  const [showPassword, setShowPassword] = useState(false);
  const LoginSchema = Yup.object().shape({
    email: Yup.string()
      .required("Email is required")
      .email("Email must be a valid email address"),
    password: Yup.string().required("Password is required"),
  });

  const methods = useForm({
    resolver: yupResolver(LoginSchema),
  });

  const {
    reset,
    setError,
    handleSubmit,
    formState: { errors },
  }: any = methods;

  const onSubmit = async (data: any) => {
    try {
      // submit data to backend
      dispatch(LoginUser(data) as any);
    } catch (error: any) {
      console.error(error);
      reset();
      setError("afterSubmit", {
        ...error,
        message: error.message,
      });
    }
  };

  return (
    <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
      <Space
        direction="vertical"
        // size="large"
        style={{ width: "100%", marginBottom: "20px" }}
      >
        {!!errors.afterSubmit && (
          <Alert message={errors.afterSubmit.message} type="error" />
        )}

        {/* Username */}
        <Typography.Text style={{ fontWeight: 400, color: "#333333" }}>
          Username
        </Typography.Text>
        <RHFTextField
          style={{
            padding: "10px 15px",
            borderRadius: "8px",
            border: "1px solid #d9d9d9",
          }}
          name="email"
          placeholder="Enter username"
        />

        {/* Password */}
        <Typography.Text style={{ fontWeight: 400, color: "#333333" }}>Password</Typography.Text>
        <RHFTextField
          style={{
            padding: "10px 15px",
            borderRadius: "8px",
            border: "1px solid #d9d9d9",
          }}
          name="password"
          placeholder="Enter password"
          type={showPassword ? "text" : "password"}
          suffix={
            <span
              onClick={() => setShowPassword(!showPassword)}
              style={{ cursor: "pointer" }}
            >
              {showPassword ? <EyeOutlined /> : <EyeInvisibleOutlined />}
            </span>
          }
        />

        {/* Forgot Password - Right Aligned */}
        <Row justify="end">
          <Link
            to="/forgot-password"
            style={{
              fontSize: "14px",
              color: "#0078EF",
              textDecoration: "underline",
            }}
          >
            Forgot Password
          </Link>
        </Row>
      </Space>

      <Button
        block
        size="large"
        htmlType="submit"
        loading={false}
        style={{
          backgroundColor: "#0078EF",
          color: "#fff",
          borderRadius: "6px",
          border: "none",
        }}
      >
        Login
      </Button>
      {/* <Row justify="center" style={{ marginBottom: "30px" }}>
        <Col span={24}>
          <Space>
          
            <Link
              to={"/auth/register"}
              style={{
                textDecoration: "underline",
                fontWeight: 600,
                fontSize: "14px",
              }}
            >
              Forget Password
            </Link>
          </Space>
        </Col>
      </Row> */}
    </FormProvider>
  );
}
