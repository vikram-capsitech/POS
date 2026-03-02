import Router from "./Routes/Index";
import React from "react";
import "./App.css";
import { SocketProvider } from "./Contexts/SocketContext";
import "antd/dist/reset.css";
import { notification } from "antd";
import { ToastContainer } from "react-toastify";
import { ThemeProvider } from "./Contexts/ThemeContext";
import { useAppStore } from "./Store/app.store";

function App() {
  const { open, severity, message } = useAppStore((s) => s.snackbar);

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
          useAppStore.getState().closeSnackBar();
        },
      });
    }
  }, [open, message, severity]);

  return (
    <>
      <ThemeProvider>
        <SocketProvider>
          <div
            style={{
              overflow: "hidden",
              height: "100vh",
              width: "100vw",
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
