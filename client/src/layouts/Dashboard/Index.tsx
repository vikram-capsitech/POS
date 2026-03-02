import { dispatch, useSelector } from "../../redux/store";
import { Navigate, Outlet } from "react-router-dom";
import { TabType, ToggleSidebar, SideBarType } from "../../redux/slices/app";
import Chats from "../../pages/Dashboard/Chats";
import AllChats from "../../pages/Dashboard/AllChats";
import SideNav from "./SideNav";
import Channels from "../../pages/Dashboard/Channels";
import UserProfileCard from "../../pages/Dashboard/UserProfileCard";
import { useTheme } from "../../Contexts/ThemeContext";
import {
  GroupDetailModel,
  PinDetails,
  ProfileDetails,
} from "../../Components/Chat/Header";
import React from "react";
import DeveloperPannel from "../../Components/DeveloperPanel";

const DashboardLayout = () => {
  const { tab, sideBar } = useSelector((state: any) => state.app);
  const { user, isLoggedIn, currentOrganization } = useSelector(
    (state: any) => state.auth
  );
  const { theme, themeType } = useTheme();
  const { currentChat } = useSelector((state: any) => state.chat);
  const [receiver, setReceiver] = React.useState<{
    id: any;
    name: string;
    email: string;
    pic: any;
    designation: string;
    about: string;
    phone: number;
    social: string;
  }>({
    id: "",
    email: "",
    name: "",
    pic: "",
    designation: "",
    about: "",
    phone: +91,
    social: "",
  });

  React.useEffect(() => {
    const getUserDetail = () => {
      if (currentChat) {
        const rece = currentChat?.participants?.filter((u: any) => {
          if (u._id !== user?._id) return u;
        });
        if (rece?.length > 0) {
          setReceiver(() => ({
            email: rece[0].email,
            id: rece[0]._id,
            name: rece[0].userName,
            pic: rece[0].pic,
            designation: rece[0].designation,
            about: rece[0].about,
            phone: rece[0].phone,
            social: rece[0].social,
          }));
        }
      }
    };
    getUserDetail();
  }, [currentChat, user?._id]);

  const getChatSection = ({ tab }: any) => {
    if (tab === TabType.DM) {
      return <Chats />;
    } else if (tab === TabType.CHANNELS) {
      return <Channels />;
    } 
    else if (tab === TabType.BUG) {
      return <DeveloperPannel />;
    } 
    else {
      return <AllChats />;
    }
  };

  if (!isLoggedIn) {
    return <Navigate to={"/auth/login"} />;
  }

  if (currentOrganization?.id === undefined) {
    return <Navigate to={"/client/organization"} />;
  }

  return (
    <div
      style={{
        height: "100%",
        width: "100%",
        display: "flex",
        overflow: "hidden",
        background:
          themeType === "light"
            ? theme.light.neutralbackground
            : theme.dark.neutralbackground,
      }}
    >
      {/* Sidebar Navigation */}
      <div
        style={{
          background:
            themeType === "light"
              ? theme.light.primaryBackground
              : theme.dark.primaryBackground,
          width: "75px",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          borderTopRightRadius: 10,
          borderBottomRightRadius: 10,
        }}
      >
        <SideNav />
      </div>

      {/* Main Content Wrapper */}
      <div
        style={{
          display: "flex",
          flexGrow: 1,
          width: "100%",
          height: "100%",
          padding: "9px 0px",
        }}
      >
        {/* Left Section (Chats) */}
        <div
          style={{
            width: "20%",
            flexShrink: 0,
            background:
              themeType === "light"
                ? theme.light.secondaryBackground
                : theme.dark.secondaryBackground,
            borderRadius: 10,
            borderTopLeftRadius: 0,
            borderBottomLeftRadius: 0,
            display: "flex",
            flexDirection: "column",
            height: "100%",
            justifyContent: "space-between",
          }}
        >
          <div style={{ flexGrow: 1, height: "70%" }}>
            {getChatSection(tab)}
          </div>

          {/* UserProfileCard stays at the bottom */}
          <div style={{ flexShrink: 0 }}>
            <UserProfileCard />
          </div>
        </div>

        {/* Main Chat Content - Occupies Remaining Space */}
        <div
          style={{
            flexGrow: 1,
            minWidth: 0,
            borderRadius: 10,
            marginLeft: "5px",
            marginRight: "5px",
            padding: "2px 0px",
          }}
        >
          <Outlet />
        </div>

        {sideBar.open && sideBar.type === SideBarType.PROFILE && (
          <div
            style={{
              width: "22%",
              marginRight: "5px",
              flexShrink: 0,
              background:
                themeType === "light"
                  ? theme.light.secondaryBackground
                  : theme.dark.secondaryBackground,

              borderRadius: 10,
              display: "flex",
              flexDirection: "column",
              height: "100%",
              justifyContent: "space-between",
              padding: "2px 0px",
            }}
          >
            <ProfileDetails />
          </div>
        )}

        {sideBar.open && sideBar.type === SideBarType.GROUP && (
          <div
            style={{
              width: "22%",
              marginRight: "5px",
              flexShrink: 0,
              background:
                themeType === "light"
                  ? theme.light.secondaryBackground
                  : theme.dark.secondaryBackground,
              borderRadius: 10,
              display: "flex",
              flexDirection: "column",
              height: "100%",
              justifyContent: "space-between",
              padding: "2px 0px",
            }}
          >
            <GroupDetailModel
              currentChat={currentChat}
              receiver={receiver}
              isOpen={sideBar.open}
              onClose={() => {
                dispatch(ToggleSidebar(SideBarType.GROUP, false) as any);
              }}
            />
          </div>
        )}

        {sideBar.open && sideBar.type === SideBarType.PIN && (
          <div
            style={{
              width: "22%",
              marginRight: "5px",
              flexShrink: 0,
              background:
                themeType === "light"
                  ? theme.light.secondaryBackground
                  : theme.dark.secondaryBackground,
              borderRadius: 10,
              display: "flex",
              flexDirection: "column",
              height: "100%",
              justifyContent: "space-between",
              padding: "2px 0px",
            }}
          >
            <PinDetails />
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardLayout;
