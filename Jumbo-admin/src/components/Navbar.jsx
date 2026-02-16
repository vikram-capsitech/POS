import { useState, useRef, useEffect } from "react";
import { useLocation} from "react-router-dom";
import { Search, User } from "lucide-react";
import { getProfile } from "../services/api";
import LogoutIcon from "../assets/homeScreen/LogoutIcon.svg";

import { useSearchStore } from "../store/searchStore";

const getUserRole = () => {
  const role = localStorage.getItem("role");
  const position = localStorage.getItem("position");
  if (role === "employee" || position === "manager") {
    return "manager";
  }
  return role || "admin";
};

// Reusable Profile Menu
function ProfileMenu({ userName, onLogout, photo }) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const onDocClick = (e) => {
      if (!menuRef.current) return;
      if (!menuRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("click", onDocClick);
    return () => document.removeEventListener("click", onDocClick);
  }, []);

  const handleLogoutClick = () => {
    localStorage.removeItem("name");
    localStorage.removeItem("profilePhoto");
    // localStorage.removeItem("userId");
    onLogout();
  };

  const role = getUserRole();

  return (
    <div className="profile" ref={menuRef}>
      <div>
        <div style={{ fontWeight: 500, fontSize: 18 }}>
          {userName || "User"}
        </div>
        <div style={{ color: "#3D3D3D", fontSize: 15, fontWeight: 500 }}>
          {role.charAt(0).toUpperCase() + role.slice(1)}
        </div>
      </div>

      <div
        className="profile-pic"
        onClick={() => setOpen((v) => !v)}
        style={{
          display: "flex",
          alignItems: "center",
          gap: "16px",
          cursor: "pointer",
        }}
      >
        {photo ? (
          <img
            src={photo}
            alt="profile"
            style={{
              width: "40px",
              height: "40px",
              borderRadius: "50%",
              objectFit: "cover",
            }}
          />
        ) : (
          <User size={40} color="#555" />
        )}
      </div>

      {open && (
        <div className="profile-menu">
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "16px",
              borderBottom: "1px solid #ccc",
              paddingTop: "10px",
              paddingLeft: "10px",
              paddingBottom: "10px",
            }}
          >
            {photo ? (
              <img
                src={photo}
                alt="profile"
                style={{
                  width: "40px",
                  height: "40px",
                  borderRadius: "50%",
                  objectFit: "cover",
                  objectPosition: "center",
                  display: "block",
                  //  display: "block",
                }}
              />
            ) : (
              <div>
                <User size={40} color="#555" />
              </div>
            )}

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
              }}
            >
              <span
                style={{
                  fontWeight: 500,
                  fontSize: "18px",
                  lineHeight: "20px",
                  whiteSpace: "nowrap",
                }}
              >
                {userName || "User"}
              </span>
              <span
                style={{ fontWeight: 500, fontSize: "14px", color: "#666" }}
              >
                {getUserRole().charAt(0).toUpperCase() + getUserRole().slice(1)}
              </span>
            </div>
          </div>

          <button
            type="button"
            className="menu-item"
            onClick={handleLogoutClick}
            style={{ display: "flex", alignItems: "center", gap: "10px" }}
          >
            <img src={LogoutIcon} alt="LogoutIcon" width={20} height={20} />
            Log out
          </button>
        </div>
      )}
    </div>
  );
}

export default function Navbar({ onLogout }) {
  const location = useLocation();
  const [data, setData] = useState("");

  const [userName, setUserName] = useState(localStorage.getItem("name") || "");
  const [photo, setPhoto] = useState(
    localStorage.getItem("profilePhoto") || "",
  );
  const searchQuery = useSearchStore((state) => state.searchQuery);
  const setSearchQuery = useSearchStore((state) => state.setSearchQuery);

  useEffect(() => {
    let mounted = true;
    const loadName = async () => {
      try {
        if (!userName && localStorage.getItem("token")) {
          const data = await getProfile();
          if (!mounted) return;
          if (data?.name) {
            setUserName(data.name);
            localStorage.setItem("name", data.name);
          }
          if (data?.profilePhoto) {
            setPhoto(data?.profilePhoto);
            localStorage.setItem("profilePhoto", data.profilePhoto);
          }
          setData(data);
        }
      } catch (err) {
        console.debug(
          "Navbar: failed to fetch profile name",
          err?.message || err,
        );
      }
    };
    loadName();
    return () => {
      mounted = false;
    };
  }, []);
  useEffect(() => {
    getProfile();
  }, []);

  const handleSearch = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    window.dispatchEvent(
      new CustomEvent("navbar-search", {
        detail: { query, page: location.pathname },
      }),
    );
  };

  const handleSearchSubmit = (e) => {
    if (e.key === "Enter") {
      window.dispatchEvent(
        new CustomEvent("navbar-search-submit", {
          detail: { query: searchQuery, page: location.pathname },
        }),
      );
    }
  };

  // Route configuration
  const routeConfig = [
    {
      path: "/",
      title: `Hello, ${userName || "User"}`,
      subtitle: "Welcome back! Here's what's happening today",
    },
    { path: "/task", title: null, subtitle: null, search: true },
    {
      pathPrefix: "/task/edit/",
      title: "Edit Task",
      subtitle: "Assign a task to your team members",
    },
    {
      pathPrefix: "/task/",
      title: "Task Overview",
      subtitle: "Manage and track all assigned tasks",
    },
    {
      path: "/task/new",
      title: "Create New Task",
      subtitle: "Assign a task to your team members",
    },

    { path: "/issue", title: null, subtitle: null, search: true },
    {
      pathPrefix: "/issue/",
      title: "Issue Overview",
      subtitle: "Track and manage all the request! Issue raised",
    },
    {
      pathPrefix: "/request",
      title: "Request Overview",
      subtitle: "Track and manage all the request!  Advance, Leave",
    },
    {
      path: "/attendance",
      title: "Attendance Log",
      subtitle: "Track and manage employee attendance",
    },
    {
      path: "/sop",
      title: "Standard Operating Procedures",
      subtitle: "Manage and organize your company SOP",
    },
    {
      pathPrefix: "/sop/new/",
      title: "Edit SOP",
      subtitle: "Create step-by-step procedures for your team",
    },
    {
      pathPrefix: "/sop/",
      title: "Standard Operating Procedures",
      subtitle: "Manage and organize your company SOP",
    },
    {
      path: "/sop/new",
      title: "Create new SOP",
      subtitle: "Create step-by-step procedures for your team",
    },
    {
      path: "/sop/draft",
      title: "Standard Operating Procedures",
      subtitle: "Manage and organize your company SOP",
    },
    {
      path: "/ai-review",
      title: "AI Task Review",
      subtitle: "Review AI validation results for submitted tasks",
    },
    {
      pathPrefix: "/ai-review/",
      title: "AI Task Review",
      subtitle: "Review AI validation results for submitted tasks",
    },

    {
      path: "/salary-management",
      title: "Salary Management",
      subtitle: "Manage employee salaries and advance payments",
    },
    {
      path: "/checkin",
      title: "Check-in",
      subtitle: "Track and manage admins check-ins",
    },
    {
      path: "/payments",
      title: "Payment managements",
      subtitle: "Manage admin payments",
    },
    {
      path: "/admin-portal",
      title: "Admin Portal",
      subtitle: "System administration and settings",
    },
  ];

  // Find matching route
  const matchedRoute = routeConfig.find((r) => r.path === location.pathname) ||
    routeConfig.find(
      (r) => r.pathPrefix && location.pathname.startsWith(r.pathPrefix),
    ) ||
    (location.pathname.includes("/user-profile") && {
      title: "User profiles",
      subtitle: "Manage employee profiles, documents, and history",
    }) || { title: "Dashboard", subtitle: "Overview" };

  return (
    <header className={`navbar ${matchedRoute.search ? "navbar-task" : ""}`}>
      <div className={matchedRoute.search ? "navbar-search-wrapper" : ""}>
        {matchedRoute.title && (
          <div>
            <div className="navbar-heading">{matchedRoute.title}</div>
            <div className="navbar-sub">{matchedRoute.subtitle}</div>
          </div>
        )}
        {matchedRoute.search && (
          <div className="search">
            <Search className="search-icon" size={22} />
            <input
              type="text"
              className="search-input"
              placeholder="Search"
              value={searchQuery}
              onChange={handleSearch}
              onKeyPress={handleSearchSubmit}
            />
          </div>
        )}
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
        {data?.restaurant?.logo && (
          <img
            src={data.restaurant.logo}
            alt="Restaurant Logo"
            style={{
              height: "40px",
              maxWidth: "120px",
              objectFit: "contain",
            }}
          />
        )}
        <ProfileMenu
          userName={userName}
          onLogout={onLogout}
          data={data}
          photo={photo}
        />
      </div>
    </header>
  );
}
