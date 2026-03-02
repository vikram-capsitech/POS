import { Space, Divider } from "antd";
import { Nav_Buttons } from "../../Data";
import { useDispatch, useSelector } from "react-redux";
import { SideBarType, ToggleSidebar, UpdateTab } from "../../redux/slices/app";
import { LogoIcon } from "../../Assets/CustomAntIcons";
import { useNavigate } from "react-router-dom";
import { AuthInitialState } from "../../redux/slices/auth";
import { useTheme } from "../../Contexts/ThemeContext";
import { Moon, Settings, Sun } from "lucide-react";

const SideBar = () => {
  const { theme, themeType, setThemeType } = useTheme();
  const dispatch = useDispatch();
  const { tab } = useSelector((state: any) => state.app);
  const selectedTab = tab.tab;
  const handleChangeTab = (index: any) => {
    navigate(`/client/${currentOrganization.id}`);
    dispatch(UpdateTab({ tab: index } as any) as any);
    dispatch(ToggleSidebar(SideBarType.GROUP, false) as any);
    dispatch(ToggleSidebar(SideBarType.PROFILE, false) as any);
    dispatch(ToggleSidebar(SideBarType.BUG, false) as any);
  };
  const { currentOrganization } = useSelector(
    (state: any) => state.auth as AuthInitialState
  );
  const navigate = useNavigate();

  return (
    <div
      style={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "8px 0",
      }}
    >
      {/* Top Section */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          marginTop: "5px",
        }}
      >
        <div>
          <LogoIcon
            style={{
              fontSize: 35,
              color: "blue",
              backgroundColor:
                themeType === "light"
                  ? theme.light.primaryBackground
                  : theme.dark.primaryBackground,
              stroke:
                themeType === "light"
                  ? theme.light.primaryBackground
                  : theme.dark.primaryBackground,
              padding: "8px",
              borderRadius: "8px",
            }}
          />
          <Divider
            className="custom-dividersidenave"
            style={{
              borderColor:
                themeType === "light" ? theme.light.border : theme.dark.border,
              width: "10px",
            }}
          />
        </div>

        <Space
          direction="vertical"
          size={8}
          style={{
            alignItems: "center",
          }}
        >
          {Nav_Buttons.map((el) => (
            <div
              key={el.index}
              style={{
                textAlign: "center",
                cursor: "pointer",
                color:
                  themeType === "light" ? theme.light.text : theme.dark.text,
                backgroundColor:
                  el.index === selectedTab
                    ? themeType === "light"
                      ? theme.light.selected
                      : theme.dark.selected
                    : themeType === "light"
                    ? theme.light.primaryBackground
                    : theme.dark.primaryBackground,
                borderRadius: "4px",
                width: "62px",
                padding: "1px 0px",
              }}
              onClick={() => handleChangeTab(el.index)}
            >
              <div
                style={{
                  borderRadius: "8px",
                  padding: "6px 6px 0px 6px",
                  display: "inline-block",
                }}
              >
                {el.index === selectedTab ? el.activeIcon : el.icon}
              </div>
              <p
                style={{
                  fontSize: "11px",
                  fontWeight: 400,
                  lineHeight: "10.86px",
                  textAlign: "center",
                  textUnderlinePosition: "from-font",
                  textDecorationSkipInk: "none",
                  marginTop: 5,
                }}
              >
                {el.text}
              </p>
            </div>
          ))}
        </Space>
      </div>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "20px",
          padding: "20px",
        }}
      >
        <div>
          {themeType === "light" ? (
            <Sun
              strokeWidth={1.5}
              size={20}
              onClick={() => setThemeType("dark")}
              style={{ color: theme.light.text, cursor: "pointer" }}
            />
          ) : (
            <Moon
              strokeWidth={1.5}
              size={20}
              onClick={() => setThemeType("light")}
              style={{ color: theme.dark.text, cursor: "pointer" }}
            />
          )}
        </div>
        <div>
          <Settings
            strokeWidth={1.5}
            size={20}
            style={{
              color: themeType === "light" ? theme.light.text : theme.dark.text,
              cursor: "pointer",
            }}
            onClick={() => {
              if (currentOrganization?.id) {
                navigate(`/client/${currentOrganization.id}/settings`);
              }
              dispatch(ToggleSidebar(SideBarType.PROFILE, false) as any);
              dispatch(ToggleSidebar(SideBarType.GROUP, false) as any);
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default SideBar;
