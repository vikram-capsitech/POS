import Router from "./Routes/Index";
import React from "react";
import "./App.css";
import { SocketProvider } from "./Contexts/SocketContext";
import "antd/dist/reset.css";
import { notification, ConfigProvider, theme as antTheme } from "antd";
import { ToastContainer } from "react-toastify";
import { ThemeProvider, useTheme } from "./Contexts/ThemeContext";
import { useAppStore } from "./Store/app.store";
import { themes } from "./Utils/theme";

/**
 * Maps our custom ThemeContext → Ant Design ConfigProvider.
 *
 * - themeName controls colorPrimary (read from theme.light.primaryText — the brand accent)
 * - themeType controls the light/dark algorithm
 * - SuperAdmin pages are NOT wrapped here; they keep a plain Ant Design look
 */
const AntdThemeWrapper: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { themeName, themeType } = useTheme();

  // primaryText is the brand accent colour used on white backgrounds (e.g. sidebar link colour)
  const primaryColor = themes[themeName]?.light?.primaryText || "#793AC5";

  return (
    <ConfigProvider
      theme={{
        algorithm:
          themeType === "dark"
            ? antTheme.darkAlgorithm
            : antTheme.defaultAlgorithm,
        token: {
          colorPrimary: primaryColor,
          borderRadius: 8,
          fontFamily:
            "'Outfit', 'Segoe UI', Roboto, 'Helvetica Neue', sans-serif",
        },
      }}
    >
      {children}
    </ConfigProvider>
  );
};

function AppInner() {
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
    <AntdThemeWrapper>
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
    </AntdThemeWrapper>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AppInner />
    </ThemeProvider>
  );
}

export default App;
