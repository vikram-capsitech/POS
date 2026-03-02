import {
  LogoutOutlined,
  SettingOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { Bug, Hash, House, MessageCircleMore } from "lucide-react";
const Profile_Menu = [
  {
    title: "Profile",
    icon: <UserOutlined />,
  },
  // {
  //   title: "Preferences",
  //   icon: <Gear />,
  // },
  {
    title: "Sign Out",
    icon: <LogoutOutlined />,
  },
];

const Message_options = [
  {
    title: "Reply",
  },
  {
    title: "React to message",
  },
  {
    title: "Forward message",
  },
  {
    title: "Star message",
  },
  {
    title: "Report",
  },
  {
    title: "Delete Message",
  },
];

const Nav_Buttons = [
  {
    index: 0,
    icon: <House strokeWidth={1.5} size={20} style={{ stroke: "#A3A3A3" }} />,
    activeIcon: (
      <House strokeWidth={1.5} size={20} style={{ stroke: "#FFFFFF" }} />
    ),
    text: "Home",
  },
  {
    index: 1,
    icon: (
      <MessageCircleMore
        strokeWidth={1.5}
        size={20}
        style={{ stroke: "#A3A3A3" }}
      />
    ),
    activeIcon: (
      <MessageCircleMore
        strokeWidth={1.5}
        size={20}
        style={{ stroke: "#FFFFFF" }}
      />
    ),
    text: "DMs",
  },
  {
    index: 2,
    icon: <Hash size={20} strokeWidth={1.5} style={{ stroke: "#A3A3A3" }} />,
    activeIcon: (
      <Hash size={20} strokeWidth={1.5} style={{ stroke: "#FFFFFF" }} />
    ),
    text: "Channels",
  },
  {
    index: 3,
    icon: <Bug size={20} strokeWidth={1.5} style={{ stroke: "#FFFFFF" }} />,
    activeIcon: (
      <Bug size={20} strokeWidth={1.5} style={{ stroke: "#FFFFFF" }} />
    ),
    text: "Tickets",
  },
  // {
  //   index: 3,
  //   icon: <Users />,
  //   text:"Users"
  // },
  // {
  //   index: 4,
  //   icon: <Phone />,
  //   text:"Call"
  // },
];

const Nav_Setting = [
  {
    index: 3,
    icon: <SettingOutlined />,
  },
];

export { Profile_Menu, Nav_Setting, Nav_Buttons, Message_options };
