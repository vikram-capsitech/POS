// src/components/ThemeSwitcher.tsx
import React from "react";
import { themes, ThemeType, fontFamilies } from "../../../Utils/theme";
import { SaveData, useTheme } from "../../../Contexts/ThemeContext";
import { Typography, Select, Divider, Slider, Switch, Button } from "antd";
import { CheckOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";

const { Text } = Typography;
const { Option } = Select;

export const ThemeSwitcher: React.FC = () => {
  const {
    themeName,
    setTheme,
    theme,
    themeType,
    isSystemDefault,
    fontFamily,
    setFontFamily,
    sizeLevel,
    setSizeLevel,
    fontSizes,
    setThemeType,
    setSystemDefaultTheme,
  } = useTheme();
  const isLightMode = themeType === "light";
  const sizeLevels = ["xs", "s", "m", "l", "xl"];
  const currentLevelIndex = sizeLevels.indexOf(sizeLevel);
  const [tempTheme, setTempTheme] = React.useState(themeName);
  const [tempFontFamily, setTempFontFamily] = React.useState(fontFamily);
  const [tempSizeLevel, setTempSizeLevel] = React.useState(sizeLevel);
  const [tempThemeType, setTempThemeType] = React.useState(themeType);
  const navigate = useNavigate();

  React.useEffect(() => {
    setTempTheme(themeName);
    setTempFontFamily(fontFamily);
    setTempSizeLevel(sizeLevel);
    setTempThemeType(themeType);
  }, [themeName, fontFamily, sizeLevel, themeType]);

  return (
    <div
      style={{
        width: "100%",
        borderRadius: 10,
        overflow: "hidden",
        backgroundColor:
          themeType === "light"
            ? theme.light.secondaryBackground
            : theme.dark.secondaryBackground,
      }}
    >
      <div
        style={{
          padding: "12px 16px",
          borderBottom: `1px solid ${
            themeType === "light" ? theme.light.border : theme.dark.border
          }`,
          color:
            themeType === "light"
              ? theme.light.textHilight
              : theme.dark.textHilight,
          fontFamily: fontFamily,
          fontSize: fontSizes.header,
        }}
      >
        Appearance
      </div>
      <div style={{ padding: "10px 16px" }}>
        {/* Font Family Selector */}
        <div style={{ padding: "20px", fontFamily: "sans-serif" }}>
          <div
            style={{
              marginBottom: "6px",
              fontFamily: fontFamily,
              fontSize: fontSizes.header,
              color:
                themeType === "light"
                  ? theme.light.textHilight
                  : theme.dark.textHilight,
            }}
          >
            Color mode
          </div>
          <div
            style={{
              marginBottom: "16px",
              color:
                themeType === "light"
                  ? theme.light.textHilight
                  : theme.dark.textHilight,
              fontFamily: fontFamily,
              fontSize: fontSizes.body,
            }}
          >
            choose scraawl color mode
          </div>

          <div
            title={
              isSystemDefault
                ? "Turn off 'System Default' to manually choose light/dark mode"
                : ""
            }
            style={{
              padding: "6px",
              backgroundColor:
                themeType === "light" ? theme.light.hover : theme.dark.hover,
              width: 300,
              borderRadius: 12,
              display: "flex",
              justifyContent: "space-between",
              marginBottom: "20px",
            }}
          >
            <div
              onClick={() => {
                if (!isSystemDefault) {
                  setThemeType("light");
                }
              }}
              style={{
                flex: 1,
                border: "none",
                display: "flex",
                justifyContent: "center",
                cursor: isSystemDefault ? "not-allowed" : "pointer",
                borderRadius: 8,
                padding: "10px",
                backgroundColor: isLightMode
                  ? theme.light.primaryBackground
                  : "transparent",
                color:
                  themeType === "light"
                    ? theme.dark.textHilight
                    : theme.dark.textHilight,
                fontFamily: fontFamily,
                fontSize: fontSizes.label,
              }}
            >
              Light mode
            </div>
            <div
              onClick={() => {
                if (!isSystemDefault) {
                  setThemeType("dark");
                }
              }}
              style={{
                flex: 1,
                border: "none",
                display: "flex",
                justifyContent: "center",
                cursor: isSystemDefault ? "not-allowed" : "pointer",
                padding: "10px",
                borderRadius: 8,
                backgroundColor: !isLightMode
                  ? theme.light.primaryLight
                  : "transparent",
                color:
                  themeType === "light"
                    ? theme.light.textHilight
                    : theme.dark.textHilight,
                fontFamily: fontFamily,
                fontSize: fontSizes.label,
              }}
            >
              Dark mode
            </div>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              color:
                themeType === "light"
                  ? theme.light.textHilight
                  : theme.dark.textHilight,
              fontSize: fontSizes.body,
              fontFamily: fontFamily,
            }}
          >
            System default
            <Switch
              checked={isSystemDefault}
              onChange={(val) => setSystemDefaultTheme(val)}
              style={{
                backgroundColor:
                  themeType === "light"
                    ? theme.light.primaryBackground
                    : theme.dark.primaryBackground,
              }}
            />
          </div>
        </div>

        <Divider className="custom-divider" />

        {/* Theme Cards */}
        <div
          style={{
            display: "flex",
            gap: 24,
            flexWrap: "wrap",
            padding: 16,
            flexDirection: "column",
          }}
        >
          {/* Grouped Text Section */}
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div
              style={{
                marginBottom: 4,
                color:
                  themeType === "light"
                    ? theme.light.textHilight
                    : theme.dark.textHilight,
                fontFamily: fontFamily,
                fontSize: fontSizes.header,
              }}
            >
              App Color
            </div>
            <div
              style={{
                color:
                  themeType === "light"
                    ? theme.light.textHilight
                    : theme.dark.textHilight,
                fontSize: fontSizes.body,
                fontFamily: fontFamily,
              }}
            >
              choose your theme color
            </div>
          </div>

          {/* Theme Cards */}
          <div style={{ display: "flex", gap: 24, flexWrap: "wrap" }}>
            {Object.entries(themes).map(([key, val]) => {
              const isActive = themeName === key;
              return (
                <div
                  key={key}
                  onClick={() => setTheme(key as ThemeType)}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    cursor: "pointer",
                    position: "relative",
                  }}
                >
                  <div
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 8,
                      backgroundColor: val.light.primaryBackground,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      boxShadow: isActive ? `0 0 0 2px #3f3f3f` : "none",
                      position: "relative",
                    }}
                  >
                    {isActive && (
                      <CheckOutlined
                        style={{
                          color: "white",
                          fontSize: 18,
                        }}
                      />
                    )}
                  </div>
                  <div
                    style={{
                      marginTop: 8,
                      fontSize: fontSizes.label,
                      color:
                        themeType === "light"
                          ? theme.light.textHilight
                          : theme.dark.textHilight,
                      fontFamily: fontFamily,
                    }}
                  >
                    {val.name}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        <Divider className="custom-divider" />
        <div
          style={{
            marginBottom: 24,
            padding: "10px",
            display: "flex",
            flexDirection: "column",
            gap: 8,
          }}
        >
          <Text
            strong
            style={{
              fontSize: 16,
              color:
                themeType === "light"
                  ? theme.light.textHilight
                  : theme.dark.textHilight,
            }}
          >
            Font
          </Text>
          <Text
            style={{
              color:
                themeType === "light"
                  ? theme.light.textLight
                  : theme.dark.textLight,
              fontSize: fontSizes.body,
              fontFamily: fontFamily,
            }}
          >
            select the font size for scraawl chat
          </Text>

          <Select
            className={themeType === "light" ? "select-light" : "select-dark"}
            value={fontFamily}
            onChange={(val) => setFontFamily(val)}
            dropdownStyle={{
              color:
                themeType === "light"
                  ? theme.light.textLight
                  : theme.dark.textLight,
              backgroundColor:
                themeType === "light"
                  ? theme.light.secondaryBackground
                  : theme.dark.secondaryBackground,
            }}
            style={{
              width: 220,
              color:
                themeType === "light"
                  ? theme.light.textLight
                  : theme.dark.textLight,
              backgroundColor:
                themeType === "light"
                  ? theme.light.secondaryBackground
                  : theme.dark.secondaryBackground,
              fontFamily: fontFamily,
            }}
            showSearch
          >
            {fontFamilies.map((font: any) => (
              <Option
                key={font}
                value={font}
                style={{
                  backgroundColor:
                    themeType === "light"
                      ? theme.light.secondaryBackground
                      : theme.dark.secondaryBackground,
                  color:
                    themeType === "light"
                      ? theme.light.textLight
                      : theme.dark.textLight,
                }}
              >
                {font}
              </Option>
            ))}
          </Select>
        </div>

        <div style={{ marginBottom: 24, padding: "10px" }}>
          <Text
            strong
            style={{
              marginRight: 8,
              color:
                themeType === "light"
                  ? theme.light.textHilight
                  : theme.dark.textHilight,
              fontSize: fontSizes.body,
              fontFamily: fontFamily,
            }}
          >
            Font Size
          </Text>
          <div style={{ marginBottom: 24 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <Slider
                min={0}
                max={4}
                step={1}
                value={currentLevelIndex}
                onChange={(val) => setSizeLevel(sizeLevels[val] as any)}
                tooltip={{
                  formatter: (val: any) => sizeLevels[val].toUpperCase(),
                }}
                style={{
                  width: 220,
                }}
                trackStyle={{
                  backgroundColor: theme.light.primaryBackground,
                }}
              />
            </div>
          </div>
        </div>
      </div>
      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          gap: 12,
          padding: "16px",
          borderTop: `1px solid ${
            themeType === "light" ? theme.light.border : theme.dark.border
          }`,
        }}
      >
        <Button
          style={{
            padding: "8px 16px",
            borderRadius: 8,
            border: `1px solid ${
              themeType === "light" ? theme.light.border : theme.dark.border
            }`,
            backgroundColor: "transparent",
            color:
              themeType === "light"
                ? theme.light.textHilight
                : theme.dark.textHilight,
            cursor: "pointer",
            fontFamily,
          }}
          onClick={() => {
            navigate("/client");
          }}
        >
          Cancel
        </Button>
        <Button
          onClick={async () => {
            setTheme(tempTheme as ThemeType);
            setFontFamily(tempFontFamily);
            setSizeLevel(tempSizeLevel);
            setThemeType(tempThemeType);

            if (!isSystemDefault) {
              setThemeType(tempThemeType);
            } else {
              const prefersDark = window.matchMedia(
                "(prefers-color-scheme: dark)"
              ).matches;
              setThemeType(prefersDark ? "dark" : "light");
            }

            SaveData(
              tempTheme as ThemeType,
              tempThemeType,
              tempFontFamily,
              tempSizeLevel,
              isSystemDefault
            );
          }}
          style={{
            padding: "8px 16px",
            borderRadius: 8,
            border: "none",
            backgroundColor: theme.light.primaryBackground,
            color: themeType === "light" ? theme.light.text : theme.dark.text,
            cursor: "pointer",
            fontFamily,
          }}
        >
          Save
        </Button>
      </div>
    </div>
  );
};
