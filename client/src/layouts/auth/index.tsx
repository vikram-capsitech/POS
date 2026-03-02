import React from "react";
import { useSelector } from "react-redux";
import { Navigate, Outlet } from "react-router-dom";
import { Layout, Space } from "antd";
import Background from "../../Assets/Images/Background.png";
const { Content } = Layout;

const AuthLayout = () => {
  const { isLoggedIn, currentOrganization } = useSelector(
    (state: any) => state.auth
  );

  // Redirect logic
  if (isLoggedIn && currentOrganization?.id === undefined) {
    return <Navigate to={"/client/organization"} />;
  }

  if (isLoggedIn && currentOrganization?.id !== undefined) {
    return <Navigate to={"/"} />;
  }

  // Styles for the layout

  const layoutStyle: React.CSSProperties = {
    minHeight: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor:
      "linear-gradient(180deg, #F4F9FF 0%, #FBFBFB 47.23%, #F4F9FF 101.21%)",
    paddingTop: "100px",
    backgroundImage: `url(${Background})`,
    backgroundSize: "cover",
    backgroundPosition: "center",
    backgroundRepeat: "no-repeat",
  };

  const contentStyle: React.CSSProperties = {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
    height: "100%",
  };

  const spaceStyle: React.CSSProperties = {
    width: "100%",
    textAlign: "center",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    minHeight: "100vh",
  };

  return (
    <Layout style={layoutStyle}>
      <Content style={contentStyle}>
        <Space direction="vertical" style={spaceStyle}>
          <Outlet />
        </Space>
      </Content>
    </Layout>
  );
};

export default AuthLayout;
