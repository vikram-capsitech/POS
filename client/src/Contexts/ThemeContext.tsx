import React, { createContext, useContext, useState, useEffect } from "react";
import {
  themes,
  ThemeType,
  AppTheme,
  FontFamily,
  defaultFont,
  SizeLevel,
  TextType,
  getFontSizesForLevel,
} from "../Utils/theme";
import { requestHandler } from "../Utils";
import { getAppSetting, saveAppSetting } from "../Api";
import { useAuthStore } from "../Store/store";

interface ThemeContextType {
  theme: AppTheme;
  themeName: ThemeType;
  themeType: "light" | "dark";
  isSystemDefault: boolean;
  fontFamily: FontFamily | string;
  sizeLevel: SizeLevel;
  fontSizes: Record<TextType, string>;
  setTheme: (themeName: ThemeType) => void;
  setThemeType: (themeType: "light" | "dark") => void;
  setFontFamily: (font: FontFamily | string) => void;
  setSizeLevel: (size: SizeLevel) => void;
  setSystemDefaultTheme: (val: boolean) => void;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: themes.default,
  themeName: "default",
  themeType: "light",
  fontFamily: defaultFont,
  sizeLevel: "m",
  isSystemDefault: false,
  fontSizes: getFontSizesForLevel("m"),
  setTheme: () => { },
  setThemeType: () => { },
  setFontFamily: () => { },
  setSizeLevel: () => { },
  setSystemDefaultTheme: () => { },
});

export const SaveData = async (
  themeName: ThemeType,
  themeType: "light" | "dark",
  font: FontFamily | string,
  size: SizeLevel,
  isSystemDefault: boolean
) => {
  await requestHandler(
    async () =>
      await saveAppSetting({
        themeName,
        themeType,
        fontFamily: font,
        sizeLevel: size,
        isSystemDefault,
      }) as any,
    null,
    (res) => {
      if (res.success) {
        console.info("Theme settings saved");
      }
    },
    (err) => console.error("Failed saving theme settings:", err)
  );
};

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const token = useAuthStore((s) => s.session.token);
  const [themeName, setThemeName] = useState<ThemeType>("default");
  const [themeTypeState, setThemeTypeState] = useState<"light" | "dark">(
    "light"
  );
  const [fontFamilyState, setFontFamilyState] = useState<FontFamily | string>(
    defaultFont
  );
  const [loading, setLoading] = useState(false); // 👈 Start with false to avoid initial blank screen
  const [sizeLevelState, setSizeLevelState] = useState<SizeLevel>("m");
  const isLoggedIn = !!token;
  const [isSystemDefault, setIsSystemDefault] = React.useState(false);

  const getSetting = async () => {
    await requestHandler(
      async () => await getAppSetting() as any,
      setLoading,
      (res) => {
        if (res.success) {
          const settings = res.data;
          setThemeName(settings.theme ?? "default");
          setFontFamilyState(settings.fontFamily ?? defaultFont);
          setSizeLevelState(settings.sizeLevel ?? "m");
          const systemPref = window.matchMedia(
            "(prefers-color-scheme: dark)"
          ).matches;
          const initialThemeType = settings.isSystemDefault
            ? systemPref
              ? "dark"
              : "light"
            : settings.themeType ?? "light";
          setThemeTypeState(initialThemeType);
          setIsSystemDefault(settings.isSystemDefault ?? false);
        }
      },
      (err) => console.error("Error fetching theme settings:", err)
    );
  };

  useEffect(() => {
    if (!isSystemDefault) return;

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

    const handleSystemThemeChange = (e: MediaQueryListEvent) => {
      const systemThemeType = e.matches ? "dark" : "light";
      setThemeTypeState(systemThemeType);
    };

    setThemeTypeState(mediaQuery.matches ? "dark" : "light");
    mediaQuery.addEventListener("change", handleSystemThemeChange);
    return () => {
      mediaQuery.removeEventListener("change", handleSystemThemeChange);
    };
  }, [isSystemDefault]);

  useEffect(() => {
    if (isLoggedIn) {
      getSetting();
    } else {
      setLoading(false); // 👈 Still render if not logged in
    }
  }, [isLoggedIn]);

  const setTheme = (name: ThemeType) => {
    setThemeName(name);
    SaveData(
      themeName,
      themeTypeState,
      fontFamilyState,
      sizeLevelState,
      isSystemDefault
    );
  };

  const setThemeType = (type: "light" | "dark") => {
    setThemeTypeState(type);
    SaveData(themeName, type, fontFamilyState, sizeLevelState, isSystemDefault);
  };

  const setFontFamily = (font: FontFamily | string) => {
    setFontFamilyState(font);
    SaveData(themeName, themeTypeState, font, sizeLevelState, isSystemDefault);
  };

  const setSizeLevel = (size: SizeLevel) => {
    setSizeLevelState(size);
    SaveData(themeName, themeTypeState, fontFamilyState, size, isSystemDefault);
  };

  const setSystemDefaultTheme = (val: boolean) => {
    setIsSystemDefault(val);
    const prefersDark = window.matchMedia(
      "(prefers-color-scheme: dark)"
    ).matches;
    const systemThemeType = prefersDark ? "dark" : "light";
    const finalThemeType = val ? systemThemeType : themeTypeState;
    if (val) setThemeTypeState(systemThemeType);
    SaveData(themeName, finalThemeType, fontFamilyState, sizeLevelState, val);
  };

  if (loading) return null;

  return (
    <ThemeContext.Provider
      value={{
        theme: themes[themeName],
        themeName,
        isSystemDefault,
        themeType: themeTypeState,
        fontFamily: fontFamilyState,
        sizeLevel: sizeLevelState,
        fontSizes: getFontSizesForLevel(sizeLevelState),
        setTheme,
        setThemeType,
        setFontFamily,
        setSizeLevel,
        setSystemDefaultTheme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
