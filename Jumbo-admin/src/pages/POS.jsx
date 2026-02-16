import React, { Suspense } from "react";
import { Monitor } from "lucide-react";
import ErrorBoundary from "../components/ErrorBoundary"; // Assuming ErrorBoundary exists, if not I'll create one or implement inline

// Lazy load the remote component
// 'pos_app/App' corresponds to the remote name and exposed module
const RemotePOS = React.lazy(() => import("pos_app/App"));

export default function POS() {
  return (
    <div
      className="panel"
      style={{
        height: "calc(100vh - 140px)",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      <div style={{ flex: 1, padding: "2rem", overflow: "auto" }}>
        <ErrorBoundary
          fallback={
            <div style={{ padding: "2rem", color: "red" }}>
              Failed to load POS module. Please ensure the POS service is
              running on port 3001.
            </div>
          }
        >
          <Suspense
            fallback={
              <div style={{ padding: "2rem" }}>Loading POS Module...</div>
            }
          >
            <RemotePOS />
          </Suspense>
        </ErrorBoundary>
      </div>
    </div>
  );
}
