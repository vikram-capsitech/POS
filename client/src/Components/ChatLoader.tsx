import React from "react";
import { Skeleton } from "antd";

const ChatLoadingScreen = () => {
  return (
    <div
      style={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
      }}
    >
      <div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            marginBottom: 20,
            borderBottom: `1px solid #0000000f`,
            padding: "13px 10px",
          }}
        >
          <Skeleton.Avatar active size="large" shape="circle" />
          <div style={{ marginLeft: 10 }}>
            <Skeleton.Input active size="small" style={{ width: 120 }} />
          </div>
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 15,
            padding: "20px",
          }}
        >
          {Array.from({ length: 4 }).map((_, idx) => (
            <div
              key={idx}
              style={{
                display: "flex",
                justifyContent: idx % 2 === 0 ? "flex-start" : "flex-end",
              }}
            >
              <Skeleton.Input
                active
                style={{
                  width: 150,
                  height: 40,
                  borderRadius: 12,
                }}
              />
            </div>
          ))}
        </div>
      </div>

      <div style={{ marginTop: 20, padding: "13px 10px" }}>
        <Skeleton.Input block active style={{ height: 120 }} />
      </div>
    </div>
  );
};

export default ChatLoadingScreen;
