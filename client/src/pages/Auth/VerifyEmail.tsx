import { Button, Typography } from "antd";
import { ScraawlLogoIcon } from "../../Assets/CustomAntIcons";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as Yup from "yup";
import FormProvider from "../../Components/Hook-Form/FormProvider";
import RHFTextField from "../../Components/Hook-Form/RHFTextField";
import React from "react";
import OtpVerification from "./VerifyOtpPage";
import { dispatch } from "../../redux/store";
import { SendOtpToMail } from "../../redux/slices/auth";

export default function VerifyEmailPage() {
  const { Text } = Typography;

  const EmailSchema = Yup.object().shape({
    email: Yup.string()
      .required("Email is required")
      .email("Email must be a valid email address"),
  });

  const methods = useForm({
    resolver: yupResolver(EmailSchema),
  });

  const { reset, setError, handleSubmit } = methods;

  const [isOtpSent, setIsOtpSent] = React.useState<boolean>(false);
  const [emailValue, setEmailValue] = React.useState("");

  const onSubmit = async (data: any) => {
    try {
      await dispatch(SendOtpToMail(data) as any);
      setIsOtpSent(true);
      setEmailValue(data.email);
    } catch (error: any) {
      console.error("Failed to send OTP:", error);
      reset();
      setError("afterSubmit", {
        ...error,
        message: error.message,
      });
    }
  };

  return isOtpSent ? (
    <OtpVerification email={emailValue} />
  ) : (
    <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
      <div
        style={{
          width: "100%",
          padding: "10px",
          borderRadius: "8px",
          backgroundColor: "#fff",
          textAlign: "center",
        }}
      >
        {/* Logo Section */}
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

        <div style={{ padding: "10px 30px" }}>
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
            Verify Email
          </Typography.Title>
          <Typography.Text type="secondary">
            Enter your email to receive an OTP for verification.
          </Typography.Text>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "16px",
              marginTop: "16px",
            }}
          >
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "8px",
                alignItems: "flex-start",
              }}
            >
              <Typography.Text style={{ fontWeight: 400, color: "#333333" }}>
                Email
              </Typography.Text>
              <RHFTextField
                style={{
                  padding: "10px 15px",
                  borderRadius: "8px",
                  border: "1px solid #d9d9d9",
                }}
                name="email"
                placeholder="Enter email"
              />
            </div>
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
              Send OTP
            </Button>
          </div>
        </div>
      </div>
    </FormProvider>
  );
}
