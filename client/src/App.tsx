import Router from "./Routes/Index";
import { useDispatch, useSelector } from "react-redux";
import React from "react";
import { closeSnackBar } from "./redux/slices/app";
import "./App.css";
import { SocketProvider } from "./Contexts/SocketContext";
import "antd/dist/reset.css";
import { notification } from "antd";
import { ToastContainer } from "react-toastify";
import { ThemeProvider } from "./Contexts/ThemeContext";

function App() {
  const dispatch = useDispatch();

  const { severity, message, open } = useSelector(
    (state: any) => state.app.snackbar
  );

  React.useEffect(() => {
    if (open && message) {
      notification.open({
        message:
          severity === "success"
            ? "Success"
            : severity === "error"
            ? "Error"
            : "Info",
        description: message,
        placement: "bottom",
        duration: 4,
        onClose: () => {
          dispatch(closeSnackBar() as any);
        },
      });
    }
  }, [open, message, severity, dispatch]);

  return (
    <>
      <ThemeProvider>
        <SocketProvider>
          <div
            style={{
              overflow: "hidden",
              maxHeight: "100%",
              minHeight: "100%",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <Router />
            <ToastContainer />
          </div>
        </SocketProvider>
      </ThemeProvider>
    </>
  );
}

export default App;
