import {
  FacebookIcon,
  InstagramIcon,
  LinkedInIcon,
  TwitterIcon,
} from "../Assets/CustomAntIcons";
import { useTheme } from "../Contexts/ThemeContext";

export const detectSocialPlatform = (url: string): string | null => {
  if (!url) return null;

  const socialPatterns: { [key: string]: RegExp } = {
    linkedin: /linkedin\.com/i,
    facebook: /facebook\.com/i,
    instagram: /instagram\.com/i,
    twitter: /(?:x\.com|twitter\.com)/i,
    github: /github\.com/i,
  };

  for (const platform in socialPatterns) {
    if (socialPatterns[platform].test(url)) {
      return platform;
    }
  }

  return null;
};

export const GetSocialMediaIcon = (platform: string): JSX.Element | null => {
  const { theme, themeType } = useTheme();
  const icons: { [key: string]: JSX.Element } = {
    linkedin: (
      <LinkedInIcon
        fill={
          themeType === "light"
            ? theme.light.textHilight
            : theme.dark.textHilight
        }
      />
    ),
    facebook: (
      <FacebookIcon
        fill={
          themeType === "light"
            ? theme.light.textHilight
            : theme.dark.textHilight
        }
      />
    ),
    instagram: (
      <InstagramIcon
        fill={
          themeType === "light"
            ? theme.light.textHilight
            : theme.dark.textHilight
        }
      />
    ),
    twitter: (
      <TwitterIcon
        fill={
          themeType === "light"
            ? theme.light.textHilight
            : theme.dark.textHilight
        }
      />
    ),
  };

  return icons[platform] || null;
};
