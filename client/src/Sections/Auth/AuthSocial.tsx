import { Button, Divider, Space } from "antd";
import { GithubLogin, GoogleLogin } from "../../Api";
import { requestHandler } from "../../Utils";
import { dispatch } from "../../redux/store";
import { showSnackbar } from "../../redux/slices/app";
import { GithubIcon, GoogleIcon } from "../../Assets/CustomAntIcons";

export default function AuthSocial() {
  const handleGoogleLogin = async () => {
    await requestHandler(
      async () => await GoogleLogin(),
      () => {},
      (res) => {
        if (res?.data?.url) {
          window.open(res?.data?.url, "_self");
        }
      },
      (err: string) => {
        console.error("Google redirection failed:", err);
        dispatch(
          showSnackbar({
            severity: "error",
            message: "Redirection failed",
          }) as any
        );
      }
    );
  };

  const handleGithubLogin = async () => {
    await requestHandler(
      async () => await GithubLogin(),
      () => {},
      (res) => {
        if (res?.data) {
          window.location.href = res?.data?.url;
          //localStorage.setItem("latestCSRFToken", res?.data?.state);
        }
      },
      (err: string) => {
        console.error("Github redirection failed:", err);
        dispatch(
          showSnackbar({
            severity: "error",
            message: "Redirection failed",
          }) as any
        );
      }
    );
  };

  // const handleTwitterLogin = async () => {
  //   // Twitter login logic
  // };

  return (
    <div>
      <Divider
        orientation="center"
        style={{
          margin: "15px 0px",
          color: "rgba(0, 0, 0, 0.45)",
          borderTopStyle: "dashed",
          fontSize: 14,
          paddingTop: 10,
        }}
      >
        OR
      </Divider>

      <Space size="middle" style={{ justifyContent: "center", width: "100%" }}>
        <Button
          icon={<GoogleIcon style={{ fontSize: 20 }} />}
          onClick={handleGoogleLogin}
          style={{
            border: "1px solid #d9d9d9",
            padding: "5px 40px",
            display: "flex",
            alignItems: "center",
          }}
        >
          Google
        </Button>

        <Button
          icon={<GithubIcon style={{ fontSize: 20 }} />}
          onClick={handleGithubLogin}
          style={{
            border: "1px solid #d9d9d9",
            padding: "5px 40px",
            display: "flex",
            alignItems: "center",
          }}
        >
          GitHub
        </Button>

        {/* <Button
    icon={<TwitterOutlined style={{ color: "#1C9CEA", fontSize: 20 }} />}
    onClick={handleTwitterLogin}
    style={{
      border: "1px solid #d9d9d9",
      padding: "0 16px",
      display: "flex",
      alignItems: "center",
    }}
  >
    Twitter
  </Button> */}
      </Space>
    </div>
  );
}
