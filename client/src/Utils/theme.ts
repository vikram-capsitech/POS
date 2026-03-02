// src/themes/index.ts

export enum ThemeEnum {
  Default = "default",
  AquaSunset = "aquaSunset",
  BlushBloom = "blushBloom",
  EarthMoss = "earthMoss",
  CrimsonSand = "crimsonSand",
  VioletDream = "violetDream",
}

export type ThemeType = "default" 
| "aquaSunset"
| "blushBloom"
| "earthMoss"
| "crimsonSand"
| "violetDream";

export type FontFamily =
  | "Outfit"
  | "Segoe UI"
  | "Roboto"
  | "Helvetica Neue"
  | "Arial"
  | "Noto Sans"
  | "sans-serif"
  | "Apple Color Emoji"
  | "Segoe UI Emoji"
  | "Segoe UI Symbol"
  | "Noto Color Emoji";

export type SizeLevel = "xs" | "s" | "m" | "l" | "xl";
export type TextType =
  | "title"
  | "heading"
  | "subheading"
  | "label"
  | "body"
  | "header"
  | "paragraph"
  | "emoji";

export const fontSizes: Record<TextType, Record<SizeLevel, string>> = {
  title: { xs: "24px", s: "28px", m: "32px", l: "36px", xl: "40px" },
  heading: { xs: "18px", s: "20px", m: "24px", l: "28px", xl: "32px" },
  subheading: { xs: "10px", s: "11px", m: "12px", l: "13px", xl: "14px" },
  label: { xs: "12px", s: "14px", m: "16px", l: "18px", xl: "20px" },
  body: { xs: "10px", s: "12px", m: "14px", l: "16px", xl: "18px" },
  header: { xs: "16px", s: "18px", m: "20px", l: "22px", xl: "24px" },
  paragraph: { xs: "8px", s: "9px", m: "10px", l: "11px", xl: "12px" },
  emoji: { xs: "16px", s: "17px", m: "18px", l: "19px", xl: "20px" },
};

export const getFontSizesForLevel = (
  level: SizeLevel
): Record<TextType, string> => {
  return {
    title: fontSizes.title[level],
    heading: fontSizes.heading[level],
    subheading: fontSizes.subheading[level],
    label: fontSizes.label[level],
    body: fontSizes.body[level],
    header: fontSizes.header[level],
    paragraph: fontSizes.paragraph[level],
    emoji: fontSizes.emoji[level],
  };
};

export interface ThemeColors {
  primaryBackground: string;
  secondaryBackground: string;
  neutralbackground: string;
  selected: string;
  hover: string;
  primaryLight: string;
  text: string;
  primaryText: string;
  textHilight: string;
  textLight: string;
  border: string;
}

export interface AppTheme {
  type: ThemeEnum;
  name: string;
  light: ThemeColors;
  dark: ThemeColors;
}

// Separate font family values (for dropdowns, etc.)
export const fontFamilies: FontFamily[] = [
  "Outfit",
  "Segoe UI",
  "Roboto",
  "Arial",
  "Noto Sans",
  "sans-serif",
  "Apple Color Emoji",
  "Segoe UI Emoji",
  "Segoe UI Symbol",
  "Noto Color Emoji",
];

export const defaultFont: FontFamily = "Outfit";

export const themes: Record<ThemeType, AppTheme> = {
  default: {
    type: ThemeEnum.Default,
    name: "Default",
    light: {
      primaryBackground: "#25064A",
      secondaryBackground: "#FFFF",
      neutralbackground: "#F6F6F6",
      selected: "#FFFFFF1A",
      hover: "#002E6908",
      primaryLight: "#793AC50F",
      text: "#FFFFFF",
      primaryText: "#793AC5",
      textHilight: "#333333",
      textLight: "#333333B2",
      border: "#3333331A",
    },
    dark: {
      primaryBackground: "#472373",
      secondaryBackground: "#282B2E",
      neutralbackground: "#1E2022",
      primaryText: "#A45BFB",
      selected: "#FFFFFF1A",
      hover: "#DDE3EB0F",
      primaryLight: "#A45BFB1A",
      text: "#FFFFFF",
      textHilight: "#F9F9F9",
      textLight: "#F9F9F966",
      border: "#FFFFFF1A",
    },
  },
  aquaSunset: {
    type: ThemeEnum.AquaSunset,
    name: "Aqua Sunset",
    light: {
      primaryBackground: "#129990", // strong brand color
      secondaryBackground: "#FFFFFF", // clean background
      neutralbackground: "#FFFBD6", // soft neutral cream
      selected: "#1299901A", // 10% opacity teal
      hover: "#12999008", // 3% opacity teal
      primaryLight: "#90D1CA0F", // 6% light aqua
      text: "#FFFFFF", // white text on teal bg
      primaryText: "#129990", // brand teal
      textHilight: "#333333", // standard dark
      textLight: "#333333B2", // lightened gray
      border: "#3333331A", // standard border
    },
    dark: {
      primaryBackground: "#096B68", // deeper brand shade
      secondaryBackground: "#282B2E", // same as default
      neutralbackground: "#1E2022", // same as default
      selected: "#FFFFFF1A", // same as default
      hover: "#90D1CA0F", // 6% light aqua
      primaryLight: "#90D1CA1A", // 10% light aqua
      text: "#FFFFFF", // standard
      primaryText: "#90D1CA", // brand accent
      textHilight: "#F9F9F9", // standard
      textLight: "#F9F9F966", // standard faded
      border: "#FFFFFF1A", // same as default
    },
  },
  blushBloom: {
    type: ThemeEnum.BlushBloom,
    name: "Blush Bloom",
    light: {
      primaryBackground: "#EC7FA9",              // vivid brand pink
      secondaryBackground: "#FFFFFF",            // white bg
      neutralbackground: "#FFEDFA",              // soft neutral pink
      selected: "#EC7FA91A",                     // 10% pink overlay
      hover: "#EC7FA908",                        // 3% pink overlay
      primaryLight: "#FFB8E00F",                 // 6% blush overlay
      text: "#FFFFFF",                           // white on pink bg
      primaryText: "#EC7FA9",                    // strong pink
      textHilight: "#333333",                    // standard black
      textLight: "#333333B2",                    // dimmed text
      border: "#3333331A",                       // light border
    },
    dark: {
      primaryBackground: "#BE5985",              // dark rose
      secondaryBackground: "#282B2E",            // standard dark bg
      neutralbackground: "#1E2022",              // standard neutral
      selected: "#FFFFFF1A",                     // same as default
      hover: "#FFB8E00F",                        // blush hover
      primaryLight: "#FFB8E01A",                 // blush lighter
      text: "#FFFFFF",                           // standard
      primaryText: "#FFB8E0",                    // blush for contrast
      textHilight: "#F9F9F9",                    // standard
      textLight: "#F9F9F966",                    // dimmed
      border: "#FFFFFF1A",                       // standard
    },
  },
  earthMoss: {
    type: ThemeEnum.EarthMoss,
    name: "Earth Moss",
    light: {
      primaryBackground: "#B9B28A",              // moss green
      secondaryBackground: "#FFFFFF",            // white
      neutralbackground: "#F8F3D9",              // soft cream
      selected: "#B9B28A1A",                     // 10% moss
      hover: "#B9B28A0D",                        // 5% moss
      primaryLight: "#EBE5C220",                 // 12% sand
      text: "#FFFFFF",                           // white on moss
      primaryText: "#504B38",                    // earthy brown
      textHilight: "#333333",                    // standard black
      textLight: "#333333B2",                    // dimmed
      border: "#3333331A",                       // subtle border
    },
    dark: {
      primaryBackground: "#504B38",              // earthy brown
      secondaryBackground: "#2A2A25",            // darker neutral
      neutralbackground: "#1E1E1B",              // dark neutral
      selected: "#FFFFFF1A",                     // white highlight
      hover: "#EBE5C220",                        // soft hover
      primaryLight: "#F8F3D91A",                 // cream accent
      text: "#FFFFFF",                           // white
      primaryText: "#EBE5C2",                    // light sand
      textHilight: "#F9F9F9",                    // bright white
      textLight: "#F9F9F966",                    // dimmed white
      border: "#FFFFFF1A",                       // subtle border
    },
  },
   crimsonSand: {
    type: ThemeEnum.CrimsonSand,
    name: "Crimson Sand",
    light: {
      primaryBackground: "#A31D1D",              // Crimson
      secondaryBackground: "#FFFFFF",            // White
      neutralbackground: "#FEF9E1",              // Ivory
      selected: "#A31D1D1A",                     // 10% Crimson
      hover: "#A31D1D0D",                        // 5% Crimson
      primaryLight: "#E5D0AC33",                 // 20% Sand
      text: "#FFFFFF",                           // White
      primaryText: "#6D2323",                    // Maroon
      textHilight: "#333333",                    // Standard
      textLight: "#333333B2",                    // Dimmed
      border: "#3333331A",                       // Subtle border
    },
    dark: {
      primaryBackground: "#6D2323",              // Deep Maroon
      secondaryBackground: "#2B1A1A",            // Dark background
      neutralbackground: "#1E1111",              // Dark neutral
      selected: "#FFFFFF1A",                     // Light overlay
      hover: "#A31D1D33",                        // Soft hover red
      primaryLight: "#FEF9E11A",                 // Ivory hint
      text: "#FFFFFF",                           // White
      primaryText: "#E5D0AC",                    // Sandy beige
      textHilight: "#F9F9F9",                    // Bright text
      textLight: "#F9F9F966",                    // Dimmed white
      border: "#FFFFFF1A",                       // Light border
    },
  },
  violetDream: {
    type: ThemeEnum.VioletDream,
    name: "Violet Dream",
    light: {
      primaryBackground: "#7E60BF",              // Violet Purple
      secondaryBackground: "#FFFFFF",            // White
      neutralbackground: "#FFE1FF",              // Pale Lilac
      selected: "#4338781A",                     // 10% Deep Indigo
      hover: "#4338780D",                        // 5% Deep Indigo
      primaryLight: "#E4B1F033",                 // 20% Lavender
      text: "#433878",                           // Deep Indigo
      primaryText: "#7E60BF",                    // Violet
      textHilight: "#333333",                    // Standard
      textLight: "#333333B2",                    // Dimmed
      border: "#3333331A",                       // Subtle border
    },
    dark: {
      primaryBackground: "#433878",              // Deep Indigo
      secondaryBackground: "#1E1A33",            // Deepened Violet-Black
      neutralbackground: "#141021",              // Dark Neutral
      selected: "#FFFFFF1A",                     // Light overlay
      hover: "#7E60BF33",                        // Violet Hover
      primaryLight: "#FFE1FF1A",                 // Lilac hint
      text: "#FFFFFF",                           // White
      primaryText: "#E4B1F0",                    // Lavender
      textHilight: "#F9F9F9",                    // Bright text
      textLight: "#F9F9F966",                    // Dimmed white
      border: "#FFFFFF1A",                       // Light border
    },
  },
};
