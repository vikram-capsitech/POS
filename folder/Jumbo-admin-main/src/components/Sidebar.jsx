import { NavLink, useLocation } from "react-router-dom";
import { Home, Hand } from "lucide-react";
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
    if (onClose) {
      onClose();
    }
  };

  const hasAccess = (accessKey) => {
    if (userRole !== "employee") return true; // admin,  superadmin
    return userAccess?.includes(accessKey);
  };

  return (
    <>
      {isOpen && <div className="sidebar-overlay" onClick={onClose} />}
      <aside className={`sidebar ${isOpen ? "open" : ""}`}>
        <div className="brand">Management App</div>
        <ul className="nav-list">
          <li>
            <NavLink to="/" className={linkClass} onClick={handleLinkClick}>
              <Home className="w-5 h-5" />
              Home
            </NavLink>
          </li>
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
                    {notifications.task>0 && <span className="red-dot">{notifications.task}</span>}
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
                    {notifications.issue>0 && <span className="red-dot">{notifications.issue}</span>}
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
                    {notifications.request>0 && <span className="red-dot">{notifications.request}</span>}
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
                  <NavLink
                    to="/sop"
                    className={linkClass}
                    onClick={handleLinkClick}
                  >
                    {loaction.pathname.includes("/sop") ? (
                      <SopIconOn />
                    ) : (
                      <SopIcon />
                    )}
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
              {/* </>
          )} */}
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
              <div
                style={{ borderBottom: "1px solid #ccc", marginTop: "15px" }}
              ></div>
            </li>
          )}
        </ul>
        {userRole === "superadmin" && (
          <div className="bottom-section" style={{ marginTop: "auto" }}>
            <div className="nav-text-item">
              {/* <Shield className="w-5 h-5" /> */}
              <PortalIcon />
              Super Admin Portal
            </div>
          </div>
        )}
        {userRole === "admin" && (
          <div className="bottom-section" style={{ marginTop: "auto" }}>
            <div className="nav-text-item">
              {/* <Shield className="w-5 h-5" /> */}
              <PortalIcon />
              Admin Portal
            </div>
          </div>
        )}
        {userRole === "employee" && (
          <div className="bottom-section" style={{ marginTop: "auto" }}>
            <div className="nav-text-item">
              {/* <Shield className="w-5 h-5" /> */}
              <PortalIcon />
              Manager Portal
            </div>
          </div>
        )}
      </aside>
    </>
  );
}
