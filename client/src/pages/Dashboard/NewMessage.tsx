import React from "react";
import { Image, Typography } from "antd";
import WIP from "../../Assets/Images/WIP.png";

const NewMessage = () => {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        width: "100%",
        backgroundColor: "#fff", 
      }}
    >
      <div style={{ textAlign: "center", paddingTop: 200 }}>
        <Image src={WIP} preview={false} height={400} />
        <Typography.Title level={1}>Work In Progress</Typography.Title>
      </div>
    </div>
  );
};

export default NewMessage;
