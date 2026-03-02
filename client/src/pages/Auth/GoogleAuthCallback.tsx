import { useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { LoadingOutlined } from "@ant-design/icons";
import { Result, Spin } from "antd";
import { showSnackbar } from "../../redux/slices/app";
import { useDispatch } from "react-redux";
import { fetchUserByTemporaryToken } from "../../Api";
import { requestHandler } from "../../Utils";
import { verifyUser } from "../../redux/slices/auth";

const GoogleAuthCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [status, setStatus] = useState(false);
  const hasRun = useRef(false);

  useEffect(() => {
    if (hasRun.current) return;
    hasRun.current = true;
    const handleGoogleAuth = async () => {
      const temporaryToken = searchParams.get("temp");
      const newUser = searchParams.get("userAuth");
      if (newUser === 'false') {
        dispatch(
          showSnackbar({ severity: "error", message: "User already registered" }) as any
        );
        return navigate("/auth/login");
      }
      if (!temporaryToken) {
        dispatch(
          showSnackbar({ severity: "error", message: "Missing token" }) as any
        );
        return navigate("/auth/login");
      }
      await requestHandler(
        async () => await fetchUserByTemporaryToken(temporaryToken!),
        () => setStatus(true),
        (res) => {
          if (res?.success) {
            setStatus(false);
            dispatch(verifyUser(res) as any);
          }
        },
        (err: string) => {
          console.error("Google auth failed:", err);
          dispatch(
            showSnackbar({
              severity: "error",
              message: "Login failed",
            }) as any
          );
        }
      );
    };

    handleGoogleAuth();
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white text-center p-4">
      {status ? (
        <>
          <Spin indicator={<LoadingOutlined style={{ fontSize: 48 }} spin />} />
          <p className="mt-4 text-lg font-medium text-gray-600">
            Verifying your Google account...
          </p>
        </>
      ) : (
        <>
          <Result
            status="success"
            title="Successfully Authenticated!"
            subTitle="Redirecting to your dashboard..."
          />
        </>
      )}
    </div>
  );
};

export default GoogleAuthCallback;
