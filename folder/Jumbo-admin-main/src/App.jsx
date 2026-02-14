import { useState, useEffect } from "react";
import { Routes, Route, useNavigate } from "react-router-dom";
import { createAdminCheckOut, createManagerCheckOut } from "./services/api";
import Sidebar from "./components/Sidebar";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Task from "./pages/Task";
import Request from "./pages/Request";
import Attendance from "./pages/Attendance";
import SOP from "./pages/SOP";
import AIReview from "./pages/AIReview";
import SalaryManagement from "./pages/SalaryManagement";
import StaffProfile from "./pages/StaffProfile";
import StaffProfileDetails from "./pages/StaffProfileDetails";
import AddEmployee from "./pages/AddEmployee";
import AdminPortal from "./pages/AdminPortal";
import CreateTask from "./pages/CreateTask";
import TaskDetails from "./pages/TaskDetails";
import RaiseIssue from "./pages/RaiseIssue";
import RequestDetails from "./pages/RequestDetails";
import CreateSOP from "./pages/CreateSOP";
import SOPDetails from "./pages/SOPDetails";
import AdminProfile from "./pages/AdminProfile";
import Settings from "./pages/Settings";
import Login from "./pages/Login";
import AddRestaurant from "./pages/AddRestaurant";
import AddAdmin from "./pages/AddAdmin";
import { toast, Toaster } from "sonner";
import SopDraft from "./pages/SopDraft";
import AIReviewDetails from "./pages/AIReviewDetails";
import IssueRaise from "./pages/issue";
import IssueDetails from "./components/IssueDetails";
import ProtectedRoute from "./components/ProtectedRoute";
import Payments from "./pages/Payments";
import AdminCheckIns from "./pages/AdminCheckIns";
import { socket } from "./socket";
import VOUCHER from "./pages/Voucher";
import VoucherDetails from "./pages/VoucherDetails";
import CreateVOUCHER from "./pages/VoucherCreate";
import moment from "moment-timezone";

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [notifications, setNotifications] = useState({
    task: 0,
    request: 0,
    issue: 0,
  });

  const [userRole, setUserRole] = useState(null);
  const [userAccess, setUserAccess] = useState([]);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMenuVisible, setIsMenuVisible] = useState(true);
  const navigate = useNavigate();
  useEffect(() => {
    if (!isLoggedIn) return;

    const role = localStorage.getItem("role");
    const restaurantID = localStorage.getItem("restaurantID");

    if (role === "admin" && restaurantID) {
      if (!socket.connected) {
        socket.connect();
      }

      socket.on("connect", () => {
        console.log("✅ Socket connected:", socket.id);
        socket.emit("JOIN_ADMIN", { restaurantID });
      });

      //  CENTRALIZED HANDLER
      const handleNotification = (type, message, variant = "info") => {
        setNotifications((prev) => ({
          ...prev,
          [type]: prev[type] + 1,
        }));
        toast[variant](message, {
          icon: "🔔",
        });
      };

      socket.on("TASK_EVENT", () =>
        handleNotification("task", "Task completed", "success"),
      );
      socket.on("REQUEST_EVENT", () =>
        handleNotification("request", "New request received", "info"),
      );

      socket.on("ISSUE_EVENT", () =>
        handleNotification("issue", "New issue raised", "warning"),
      );
      socket.on("CHECKIN_EVENT", (data) => {
        const checkInTime = moment(data.checkInTime)
          .tz("Asia/Kolkata")
          .format("hh:mm:ss A");

        toast.info(`${data.employeeName} checked in at ${checkInTime}`, {
          icon: "🟢",
        });
      });

      socket.on("connect_error", (err) => {
        console.error("❌ Socket error:", err.message);
      });
    }

    return () => {
      socket.off("TASK_EVENT");
      socket.off("REQUEST_EVENT");
      socket.off("ISSUE_EVENT");
      socket.off("CHECKIN_EVENT");
    };
  }, [isLoggedIn]);

  const handleLogin = (role, access) => {
    setIsLoggedIn(true);
    setUserRole(role);
    setUserAccess(access);
  };
  const handleLogout = async () => {
    socket.disconnect();
    localStorage.getItem("token");
    localStorage.getItem("role");

    const Id = localStorage.getItem("attendanceId");

    if (userRole === "admin") {
      try {
        await createAdminCheckOut({
          attendanceId: Id,
        });
      } catch (err) {
        console.error("not check out", err);
      }
    }
       if (userRole === "employee") {
      try {
        await createManagerCheckOut({
          attendanceId: Id,
        });
      } catch (err) {
        console.error("not check out", err);
      }
    }
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("userId");
    localStorage.removeItem("access");
    localStorage.removeItem("restaurantID");
    setIsLoggedIn(false);
    setUserRole(null);
    setUserAccess([]);

    navigate("/");
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };
  const clearNotification = (type) => {
    setNotifications((prev) => ({
      ...prev,
      [type]: 0,
    }));
  };

  useEffect(() => {
    let lastScrollY = window.scrollY;

    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY > lastScrollY) {
        // Scrolling down
        setIsMenuVisible(false);
      } else {
        // Scrolling up
        setIsMenuVisible(true);
      }
      lastScrollY = currentScrollY;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  useEffect(() => {
    // Check if user is already logged in on app start
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");
    const access = JSON.parse(localStorage.getItem("access") || "[]");
    if (token && role) {
      setIsLoggedIn(true);
      setUserRole(role);
      setUserAccess(access);
    }
  }, []);

  if (!isLoggedIn) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div className="app-layout">
      <button
        className={`mobile-menu-toggle ${isMenuVisible ? "visible" : "hidden"}`}
        onClick={toggleMobileMenu}
      >
        ☰
      </button>
      <Sidebar
        isOpen={isMobileMenuOpen}
        onClose={closeMobileMenu}
        userRole={userRole}
        userAccess={userAccess}
        notifications={notifications}
        clearNotification={clearNotification}
      />
      <div className="main">
        <Navbar onLogout={handleLogout} />
        <div className="content">
          <Toaster position="top-right" />

          <Routes>
            <Route
              path="/"
              element={
                <ProtectedRoute
                  userRole={userRole}
                  // requiredRole="superadmin"
                  allowedRoles={["admin", "superadmin", "employee"]}
                  Component={Home}
                />
              }
            />

            <Route
              path="/task"
              element={
                <ProtectedRoute
                  userRole={userRole}
                  userAccess={userAccess}
                  allowedRoles={["admin", "employee"]}
                  requiredAccess="task"
                  // requiredRole="admin"
                  Component={Task}
                />
              }
            />

            <Route
              path="/task/new"
              element={
                <ProtectedRoute
                  userRole={userRole}
                  userAccess={userAccess}
                  requiredAccess="task"
                  allowedRoles={["admin", "employee"]}
                  Component={CreateTask}
                />
              }
            />

            <Route
              path="/task/:id"
              element={
                <ProtectedRoute
                  userRole={userRole}
                  userAccess={userAccess}
                  requiredAccess="task"
                  allowedRoles={["admin", "employee"]}
                  Component={TaskDetails}
                />
              }
            />

            <Route
              path="/task/edit/:id"
              element={
                <ProtectedRoute
                  userRole={userRole}
                  userAccess={userAccess}
                  requiredAccess="task"
                  allowedRoles={["admin", "employee"]}
                  Component={CreateTask}
                />
              }
            />

            {/* <Route path="/issue/" element={<IssueRaise />} /> */}
            <Route
              path="/issue/"
              element={
                <ProtectedRoute
                  userRole={userRole}
                  userAccess={userAccess}
                  requiredAccess="issueRaised"
                  allowedRoles={["admin", "employee"]}
                  Component={IssueRaise}
                />
              }
            />

            <Route
              path="/issue/:id"
              element={
                <ProtectedRoute
                  userRole={userRole}
                  userAccess={userAccess}
                  requiredAccess="issueRaised"
                  allowedRoles={["admin", "employee"]}
                  Component={IssueDetails}
                />
              }
            />
            <Route
              path="/issue/raise"
              element={
                <ProtectedRoute
                  userRole={userRole}
                  userAccess={userAccess}
                  requiredAccess="issueRaised"
                  allowedRoles={["admin", "employee"]}
                  Component={RaiseIssue}
                />
              }
            />
            <Route
              path="/issue/edit/:id"
              element={
                <ProtectedRoute
                  userRole={userRole}
                  userAccess={userAccess}
                  requiredAccess="issueRaised"
                  allowedRoles={["admin", "employee"]}
                  Component={RaiseIssue}
                />
              }
            />

            <Route
              path="/request"
              element={
                <ProtectedRoute
                  userRole={userRole}
                  userAccess={userAccess}
                  requiredAccess="request"
                  allowedRoles={["admin", "employee"]}
                  Component={Request}
                />
              }
            />
            <Route
              path="/request/:type/:id"
              element={
                <ProtectedRoute
                  userRole={userRole}
                  userAccess={userAccess}
                  requiredAccess="request"
                  allowedRoles={["admin", "employee"]}
                  Component={RequestDetails}
                />
              }
            />
            <Route
              path="/attendance"
              element={
                <ProtectedRoute
                  userRole={userRole}
                  userAccess={userAccess}
                  requiredAccess="attendance"
                  allowedRoles={["admin", "employee"]}
                  Component={Attendance}
                />
              }
            />
            <Route
              path="/sop"
              element={
                <ProtectedRoute
                  userRole={userRole}
                  userAccess={userAccess}
                  requiredAccess="sop"
                  allowedRoles={["admin", "employee"]}
                  Component={SOP}
                />
              }
            />
            <Route
              path="/sop/new"
              element={
                <ProtectedRoute
                  userRole={userRole}
                  userAccess={userAccess}
                  requiredAccess="sop"
                  allowedRoles={["admin", "employee"]}
                  Component={CreateSOP}
                />
              }
            />
            <Route
              path="/sop/new/:id"
              element={
                <ProtectedRoute
                  userRole={userRole}
                  userAccess={userAccess}
                  requiredAccess="sop"
                  allowedRoles={["admin", "employee"]}
                  Component={CreateSOP}
                />
              }
            />
            <Route
              path="/sop/draft"
              element={
                <ProtectedRoute
                  userRole={userRole}
                  userAccess={userAccess}
                  requiredAccess="sop"
                  allowedRoles={["admin", "employee"]}
                  Component={SopDraft}
                />
              }
            />
            <Route
              path="/sop/:id"
              element={
                <ProtectedRoute
                  userRole={userRole}
                  userAccess={userAccess}
                  requiredAccess="sop"
                  allowedRoles={["admin", "employee"]}
                  Component={SOPDetails}
                />
              }
            />
            <Route
              path="/voucher"
              element={
                <ProtectedRoute
                  userRole={userRole}
                  userAccess={userAccess}
                  requiredAccess="sop"
                  allowedRoles={["admin", "employee"]}
                  Component={VOUCHER}
                />
              }
            />
            <Route
              path="/voucher/:id"
              element={
                <ProtectedRoute
                  userRole={userRole}
                  userAccess={userAccess}
                  requiredAccess="sop"
                  allowedRoles={["admin", "employee"]}
                  Component={VoucherDetails}
                />
              }
            />
            <Route
              path="/voucher/new"
              element={
                <ProtectedRoute
                  userRole={userRole}
                  userAccess={userAccess}
                  requiredAccess="sop"
                  allowedRoles={["admin", "employee"]}
                  Component={CreateVOUCHER}
                />
              }
            />
            <Route
              path="/voucher/new/:id"
              element={
                <ProtectedRoute
                  userRole={userRole}
                  userAccess={userAccess}
                  requiredAccess="sop"
                  allowedRoles={["admin", "employee"]}
                  Component={CreateVOUCHER}
                />
              }
            />
            <Route
              path="/ai-review"
              element={
                <ProtectedRoute
                  userRole={userRole}
                  userAccess={userAccess}
                  requiredAccess="ai-Review"
                  allowedRoles={["admin", "employee"]}
                  Component={AIReview}
                />
              }
            />
            <Route
              path="/ai-review/:id"
              element={
                <ProtectedRoute
                  userRole={userRole}
                  userAccess={userAccess}
                  requiredAccess="ai-Review"
                  allowedRoles={["admin", "employee"]}
                  Component={AIReviewDetails}
                />
              }
            />
            <Route
              path="/salary-management"
              element={
                <ProtectedRoute
                  userRole={userRole}
                  userAccess={userAccess}
                  requiredAccess="salaryManagement"
                  // requiredRole="admin"
                  allowedRoles={["admin", "superadmin", "employee"]}
                  Component={SalaryManagement}
                />
              }
            />

            {/*****************For both     **************** */}
            <Route
              path="/payments"
              element={
                <ProtectedRoute
                  userRole={userRole}
                  allowedRoles={"superadmin"}
                  Component={Payments}
                />
              }
            />

            <Route
              path="/checkin"
              element={
                <ProtectedRoute
                  userRole={userRole}
                  allowedRoles={"superadmin"}
                  Component={AdminCheckIns}
                />
              }
            />
            <Route
              path="/user-profile"
              element={
                <ProtectedRoute
                  userRole={userRole}
                  userAccess={userAccess}
                  requiredAccess="userProfile"
                  // requiredRole="admin"
                  allowedRoles={["admin", "superadmin", "employee"]}
                  // Component={(StaffProfile roleCheck ={userRole})}
                  Component={() => <StaffProfile roleCheck={userRole} />}
                />
              }
            />

            {/* element={<StaffProfile roleCheck={userRole} />}
            /> */}

            <Route
              path="/user-profile/add"
              element={
                <ProtectedRoute
                  userRole={userRole}
                  userAccess={userAccess}
                  requiredAccess="userProfile"
                  requiredRole="admin"
                  Component={AddEmployee}
                />
              }
            />
            <Route
              path="/user-profile/add/:id"
              element={
                <ProtectedRoute
                  userRole={userRole}
                  userAccess={userAccess}
                  requiredAccess="userProfile"
                  requiredRole="admin"
                  Component={AddEmployee}
                />
              }
            />

            {/* <Route
              path="/user-profile/:role/:id"
              element={<StaffProfileDetails />}
            /> */}
            <Route
              path="/user-profile/:role/:id"
              element={
                <ProtectedRoute
                  userRole={userRole}
                  Component={() => <StaffProfileDetails />}
                  checkParam={({ userRole, params }) => {
                    const roleInUrl = params.role; // :role from the URL
                    if (userRole === "superadmin" && roleInUrl === "admins")
                      return true;
                    if (userRole === "admin" && roleInUrl !== "admins")
                      return true;
                    return false; // otherwise block
                  }}
                />
              }
            />

            <Route
              path="/admin-profile"
              element={
                <ProtectedRoute
                  userRole={userRole}
                  Component={() => <StaffProfileDetails />}
                  checkParam={({ userRole, params }) => {
                    const roleInUrl = params.role; // :role from the URL
                    if (userRole === "superadmin" && roleInUrl === "admins")
                      return true;
                    if (userRole === "admin" && roleInUrl !== "admins")
                      return true;
                    return false; // otherwise block
                  }}
                />
              }
            />
            <Route
              path="/settings"
              element={
                <ProtectedRoute
                  userRole={userRole}
                  requiredRole="superadmin"
                  Component={Settings}
                />
              }
            />
            {/* <Route path="/admin-portal" element={<AdminPortal />} /> */}

            <Route
              path="/user-profile/add/admin"
              element={
                <ProtectedRoute
                  userRole={userRole}
                  requiredRole="superadmin"
                  Component={AddAdmin}
                />
              }
            />
            <Route
              path="/user-profile/add/admin/:id"
              element={
                <ProtectedRoute
                  userRole={userRole}
                  requiredRole="superadmin"
                  Component={AddAdmin}
                />
              }
            />

            <Route
              path="/add-restaurant"
              element={
                <ProtectedRoute
                  userRole={userRole}
                  requiredRole="superadmin"
                  Component={AddRestaurant}
                />
              }
            />
            {/* <Route path="/add-admin" element={<AddAdmin />} /> */}
          </Routes>
        </div>
      </div>
    </div>
  );
}
