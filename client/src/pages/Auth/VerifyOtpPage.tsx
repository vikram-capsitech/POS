import { Button, Image, Input, Typography } from "antd";
import Otp from "../../Assets/Images/Otp.png";
import React, { useRef, useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { SendOtpToMail, VerifyEmail } from "../../redux/slices/auth";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as Yup from "yup";

export default function OtpVerification({ email }: { email: string }) {
  const otpImage = Otp;
  const [otp, setOtp] = useState<string[]>(["", "", "", "", "", ""]);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const [errorMessage, setErrorMessage] = useState("");
  const dispatch = useDispatch();
  const [timer, setTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);

  const EmailSchema = Yup.object().shape({
    email: Yup.string()
      .required("Email is required")
      .email("Email must be a valid email address"),
  });

  const methods = useForm({
    resolver: yupResolver(EmailSchema),
  });

  const { reset, setError } = methods;

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    index: number
  ) => {
    const value = e.target.value.replace(/\D/g, "");
    if (value.length <= 1) {
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);
      setErrorMessage("");
      if (value && index < 5) {
        inputRefs.current[index + 1]?.focus();
      }
    }
  };

  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    index: number
  ) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === "Enter") {
      onSubmit();
    }
  };

  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  useEffect(() => {
    if (!canResend && timer > 0) {
      const countdown = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(countdown);
    } else if (timer === 0) {
      setCanResend(true);
    }
  }, [timer, canResend]);

  const handleResend = async (data: any) => {
    try {
      await dispatch(SendOtpToMail(data) as any);
    } catch (error: any) {
      console.error("Failed to send OTP:", error);
      reset();
      setError("afterSubmit", {
        ...error,
        message: error.message,
      });
    }
  };

  const onSubmit = async () => {
    const otpValue = otp.join("");
    if (otpValue.length !== 6) {
      setErrorMessage("Please enter a valid 6-digit OTP");
      return;
    }
    try {
      await dispatch(VerifyEmail({ email, otp: otpValue }) as any);
    } catch (error: any) {
      console.error("Failed to verify OTP:", error);
      const message =
        error?.response?.data?.message ||
        "OTP verification failed. Please try again.";
      setErrorMessage(message);
      setOtp(["", "", "", "", "", ""]);
      inputRefs.current[0]?.focus();
    }
  };

  return (
    <div
      style={{
        background: "#fff",
        padding: 32,
        borderRadius: 12,
        maxWidth: 600,
        margin: "auto",
        textAlign: "center",
      }}
    >
      <Image
        src={otpImage}
        alt="OTP Verification"
        style={{ marginBottom: 16 }}
        preview={false}
      />
      <Typography.Title level={4} style={{ marginBottom: 8 }}>
        Enter verification code
      </Typography.Title>

      <Typography.Text type="secondary">
        Enter the 6-digit code sent to your email: <b>{email}</b>
      </Typography.Text>

      <div
        style={{
          display: "flex",
          gap: 12,
          justifyContent: "center",
          margin: "24px 0",
        }}
        onPaste={(e) => {
          e.preventDefault();
          const pastedData = e.clipboardData.getData("Text").trim();
          if (!/^\d{6}$/.test(pastedData)) return;
          const otpChars = pastedData.split("").slice(0, 6);
          const newOtp = [...otp];
          otpChars.forEach((char, idx) => {
            newOtp[idx] = char;
            if (inputRefs.current[idx]) {
              inputRefs.current[idx].value = char;
            }
          });
          setOtp(newOtp);

          const nextIndex = otpChars.length < 6 ? otpChars.length : 5;
          inputRefs.current[nextIndex]?.focus();
        }}
      >
        {[0, 1, 2, 3, 4, 5].map((index) => (
          <Input
            key={index}
            maxLength={1}
            value={otp[index]}
            onChange={(e) => handleChange(e, index)}
            onKeyDown={(e) => handleKeyDown(e, index)}
            ref={(input) => {
              const internalInput = input?.input;
              inputRefs.current[index] = internalInput ?? null;
            }}
            style={{
              width: 60,
              height: 60,
              textAlign: "center",
              fontSize: 24,
              borderRadius: 8,
            }}
          />
        ))}
      </div>

      {errorMessage && (
        <Typography.Text
          type="danger"
          style={{ display: "block", marginBottom: 12 }}
        >
          {errorMessage}
        </Typography.Text>
      )}

      <Button
        type="primary"
        block
        size="large"
        style={{ borderRadius: 6 }}
        onClick={onSubmit}
      >
        Continue
      </Button>

      <Typography.Text style={{ marginTop: 16, display: "block" }}>
        Didn’t receive it?
        {canResend ? (
          <a onClick={() => handleResend({ email })}> Resend mail</a>
        ) : (
          <span style={{ color: "#999" }}> Resend mail in {timer}s...</span>
        )}
      </Typography.Text>
    </div>
  );
}
