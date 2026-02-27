// Sidebar.jsx / Sidebar.tsx
import { NavLink, useLocation } from "react-router-dom";
import { Home, Hand } from "lucide-react";
import { useEffect, useState } from "react";
import { getProfile } from "../services/api";

import TaskIcon from "../assets/TaskIcon.svg?react";
import TaskIconOn from "../assets/TaskIconOn.svg?react";
import RequestIcon from "../assets/RequestIcon.svg?react";
import RequestIconOn from "../assets/RequestIconOn.svg?react";
import SalaryIcon from "../assets/SalaryIcon.svg?react";
import SalaryIconOnIcon from "../assets/SalaryIconOnIcon.svg?react";
import IssueIconOn from "../assets/IssueIconOn.svg?react";
import IssueIcon from "../assets/IssueIcon.svg?react";
import PortalIcon from "../assets/PortalIcon.svg?react";
import UserProfileIcon from "../assets/UserProfileIcon.svg?react";
import UserProfileIconOn from "../assets/UserProfileIconOn.svg?react";
import AiReviewIcon from "../assets/AiReviewIcon.svg?react";
import AiReviewIconOn from "../assets/AiReviewIconOn.svg?react";
import SopIconOn from "../assets/SopIconOn.svg?react";
import SopIcon from "../assets/SopIcon.svg?react";
import VoucherOn from "../assets/VoucherOn.svg?react";
import VoucherOff from "../assets/VoucherOff.svg?react";
import AttendenceOn1 from "../assets/AttendenceOn1.svg?react";
import AttendenceOff from "../assets/AttendenceOff.svg?react";

export default function Sidebar({
  isOpen,
  onClose,
  userRole,
  userAccess,
  notifications,
  clearNotification,
}) {
  const linkClass = ({ isActive }) => `nav-link${isActive ? " active" : ""}`;
  const loaction = useLocation();

  const handleLinkClick = () => {
    if (onClose) onClose();
  };

  const hasAccess = (accessKey) => {
    if (userRole !== "employee") return true;
    return userAccess?.includes(accessKey);
  };

  const storedModules = JSON.parse(
    localStorage.getItem("restaurantModules") || "{}",
  );
  const isPosVisible = storedModules?.pos !== false;

  // ✅ restaurant logo state (no navbar needed)
  const [restaurantLogo, setRestaurantLogo] = useState(
    localStorage.getItem("restaurantLogo") || "",
  );

  useEffect(() => {
    let mounted = true;

    const loadLogo = async () => {
      try {
        // if already cached, skip call
        if (restaurantLogo) return;

        const data = await getProfile(); // should return { restaurant: { logo } }
        if (!mounted) return;

        const logo = data?.restaurant?.logo || "";
        if (logo) {
          setRestaurantLogo(logo);
          localStorage.setItem("restaurantLogo", logo);
        }
      } catch (e) {
        // keep silent
      }
    };

    if (localStorage.getItem("token")) loadLogo();
    return () => {
      mounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      {isOpen && <div className="sidebar-overlay" onClick={onClose} />}
      <aside className={`sidebar ${isOpen ? "open" : ""}`}>
        {/* ✅ Brand area: logo if present else fallback text */}
        <div className="brand" >
          {restaurantLogo ? (
            <img
              src={restaurantLogo}
              alt="Restaurant Logo"
              style={{
                height: 42,
                maxWidth: "100%",
                objectFit: "contain",
                display: "block",
              }}
            />
          ) : (
            "Management App"
          )}
        </div>

        <ul className="nav-list">
          <li>
            <NavLink to="/" className={linkClass} onClick={handleLinkClick}>
              <Home className="w-5 h-5" />
              Home
            </NavLink>
          </li>

          {userRole !== "superadmin" && isPosVisible && (
            <li>
              <NavLink to="/pos" className={linkClass} onClick={handleLinkClick}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: "20px",
                  }}
                >
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
                    <line x1="8" y1="21" x2="16" y2="21" />
                    <line x1="12" y1="17" x2="12" y2="21" />
                  </svg>
                </div>
                POS
              </NavLink>
            </li>
          )}

          {userRole !== "superadmin" && (
            <>
              {hasAccess("task") && (
                <li>
                  <NavLink
                    to="/task"
                    className={linkClass}
                    onClick={() => {
                      clearNotification("task");
                      handleLinkClick();
                    }}
                  >
                    {loaction.pathname.includes("/task") ? (
                      <TaskIconOn />
                    ) : (
                      <TaskIcon />
                    )}
                    Task
                    {notifications.task > 0 && (
                      <span className="red-dot">{notifications.task}</span>
                    )}
                  </NavLink>
                </li>
              )}

              {hasAccess("issueRaised") && (
                <li>
                  <NavLink
                    to="/issue"
                    className={linkClass}
                    onClick={() => {
                      clearNotification("issue");
                      handleLinkClick();
                    }}
                  >
                    {loaction.pathname.includes("/issue") ? (
                      <IssueIconOn />
                    ) : (
                      <IssueIcon />
                    )}
                    Issue raised
                    {notifications.issue > 0 && (
                      <span className="red-dot">{notifications.issue}</span>
                    )}
                  </NavLink>
                </li>
              )}

              {hasAccess("request") && (
                <li>
                  <NavLink
                    to="/request"
                    className={linkClass}
                    onClick={() => {
                      clearNotification("request");
                      handleLinkClick();
                    }}
                  >
                    {loaction.pathname.includes("/request") ? (
                      <RequestIconOn />
                    ) : (
                      <RequestIcon />
                    )}
                    Request
                    {notifications.request > 0 && (
                      <span className="red-dot">{notifications.request}</span>
                    )}
                  </NavLink>
                </li>
              )}

              {hasAccess("attendance") && (
                <li>
                  <NavLink
                    to="/attendance"
                    className={linkClass}
                    onClick={handleLinkClick}
                  >
                    {loaction.pathname.includes("/attendance") ? (
                      <AttendenceOn1 />
                    ) : (
                      <AttendenceOff />
                    )}
                    Attendance
                  </NavLink>
                </li>
              )}

              {hasAccess("voucher") && (
                <li>
                  <NavLink
                    to="/voucher"
                    className={linkClass}
                    onClick={handleLinkClick}
                  >
                    {loaction.pathname.includes("/voucher") ? (
                      <VoucherOn />
                    ) : (
                      <VoucherOff />
                    )}
                    Vouchers
                  </NavLink>
                </li>
              )}

              {hasAccess("sop") && (
                <li>
                  <NavLink to="/sop" className={linkClass} onClick={handleLinkClick}>
                    {loaction.pathname.includes("/sop") ? <SopIconOn /> : <SopIcon />}
                    SOP
                  </NavLink>
                </li>
              )}

              {hasAccess("ai-Review") && (
                <li>
                  <NavLink
                    to="/ai-review"
                    className={linkClass}
                    onClick={handleLinkClick}
                  >
                    {loaction.pathname.includes("/ai-review") ? (
                      <AiReviewIconOn />
                    ) : (
                      <AiReviewIcon />
                    )}
                    AI Review
                  </NavLink>
                </li>
              )}

              {hasAccess("salaryManagement") && (
                <li>
                  <NavLink
                    to="/salary-management"
                    className={linkClass}
                    onClick={handleLinkClick}
                  >
                    {loaction.pathname.includes("/salary-management") ? (
                      <SalaryIconOnIcon />
                    ) : (
                      <SalaryIcon />
                    )}
                    Salary Management
                  </NavLink>
                </li>
              )}
            </>
          )}

          {userRole === "superadmin" && (
            <>
              <li>
                <NavLink
                  to="/checkin"
                  className={linkClass}
                  onClick={handleLinkClick}
                >
                  <Hand style={{ marginLeft: 0 }} />
                  Check-ins
                </NavLink>
              </li>

              <li>
                <NavLink
                  to="/payments"
                  className={linkClass}
                  onClick={handleLinkClick}
                >
                  {loaction.pathname.includes("/payments") ? (
                    <SalaryIconOnIcon />
                  ) : (
                    <SalaryIcon />
                  )}
                  Payments
                </NavLink>
              </li>
            </>
          )}

          {hasAccess("userProfile") && (
            <li>
              <NavLink
                to="/user-profile"
                className={linkClass}
                onClick={handleLinkClick}
              >
                {loaction.pathname.includes("/user-profile") ? (
                  <UserProfileIconOn />
                ) : (
                  <UserProfileIcon />
                )}
                {userRole === "superadmin" ? "Admin" : "User"} profile
              </NavLink>
              <div style={{ borderBottom: "1px solid #ccc", marginTop: "15px" }} />
            </li>
          )}

          {userRole === "admin" && (
            <li>
              <NavLink
                to="/settings"
                className={linkClass}
                onClick={handleLinkClick}
              >
                <UserProfileIconOn />
                Settings
              </NavLink>
            </li>
          )}
        </ul>

        {userRole === "superadmin" && (
          <div className="bottom-section" style={{ marginTop: "auto" }}>
            <div className="nav-text-item">
              <PortalIcon />
              Super Admin Portal
            </div>
          </div>
        )}

        {userRole === "admin" && (
          <div className="bottom-section" style={{ marginTop: "auto" }}>
            <div className="nav-text-item">
              <PortalIcon />
              Admin Portal
            </div>
          </div>
        )}

        {userRole === "employee" && (
          <div className="bottom-section" style={{ marginTop: "auto" }}>
            <div className="nav-text-item">
              <PortalIcon />
              Manager Portal
            </div>
          </div>
        )}
      </aside>
    </>
  );
}
