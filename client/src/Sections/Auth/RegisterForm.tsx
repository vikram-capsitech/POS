import { useState } from "react";
import * as Yup from "yup";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { Space, Alert, Button, Typography } from "antd";
import { EyeOutlined, EyeInvisibleOutlined } from "@ant-design/icons";
import { RegisterUser } from "../../redux/slices/auth";
import { useDispatch } from "react-redux";
import FormProvider from "../../Components/Hook-Form/FormProvider";
import RHFTextField from "../../Components/Hook-Form/RHFTextField";

export default function AuthRegisterForm() {
  const dispatch = useDispatch();
  const [showPassword, setShowPassword] = useState(false);
  const LoginSchema = Yup.object().shape({
    displayName: Yup.string().required("Name required"),
    email: Yup.string()
      .required("Email is required")
      .email("Email must be a valid email address"),
    password: Yup.string().required("Password is required"),
  });

  const defaultValues = {
    displayName: "",
    email: "demo@Scraawl.com",
    password: "Welcome",
  };

  const methods = useForm({
    resolver: yupResolver(LoginSchema),
    defaultValues,
  });

  const {
    reset,
    setError,
    handleSubmit,
    formState: { errors },
  } = methods;

  const onSubmit = async (data: any) => {
    try {
      // submit data to backend
      dispatch(RegisterUser(data) as any);
    } catch (error: any) {
      console.error(error);
      reset();
      setError("afterSubmit" as any, {
        ...error,
        message: error.message,
      });
    }
  };

  return (
    <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
      <Space
        direction="vertical"
        style={{
          width: "100%",
          borderRadius: "8px",
          backgroundColor: "#fff",
          textAlign: "left",
        }}
      >
        {!!(errors as any).afterSubmit && (
          <Alert message={(errors as any).afterSubmit.message} type="error" />
        )}
        <Typography.Text style={{ fontWeight: 400, color: "#333333" }}>
          Display Name
        </Typography.Text>
        <RHFTextField
          name="displayName"
          placeholder="Display Name"
          style={{
            padding: "10px 15px",
            borderRadius: "8px",
            border: "1px solid #d9d9d9",
          }}
        />
        {/* Full Name */}
        <Typography.Text style={{ fontWeight: 400, color: "#333333" }}>
          Full Name
        </Typography.Text>
        <RHFTextField
          name="userName"
          placeholder="Enter Username"
          style={{
            padding: "10px 15px",
            borderRadius: "8px",
            border: "1px solid #d9d9d9",
          }}
        />

        {/* Email */}
        <Typography.Text style={{ fontWeight: 400, color: "#333333" }}>
          Email
        </Typography.Text>
        <RHFTextField
          name="email"
          placeholder="Enter email"
          style={{
            padding: "10px 15px",
            borderRadius: "8px",
            border: "1px solid #d9d9d9",
          }}
        />

        {/* Password */}
        <Typography.Text style={{ fontWeight: 400, color: "#333333" }}>
          Password
        </Typography.Text>
        <RHFTextField
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
          style={{
            padding: "10px 15px",
            borderRadius: "8px",
            border: "1px solid #d9d9d9",
          }}
        />

        {/* Sign Up Button */}
        <Button
          block
          style={{
            backgroundColor: "#0078EF",
            color: "#fff",
            borderRadius: "8px",
            border: "none",
            fontWeight: 400,
            marginTop: "10px",
          }}
          size="large"
          htmlType="submit"
          loading={false}
        >
          Sign up
        </Button>
      </Space>
    </FormProvider>
  );
}
