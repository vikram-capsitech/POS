import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import DialIcon from "../assets/userProfileDetails/DialIcon.svg?react";
import UserIcon from "../assets/sopDetails/UserIcon.svg?react";
import LeaveDateIcon from "../assets/requestDetails/LeaveDateIcon.svg?react";
import EmailIcon from "../assets/userProfileDetails/EmailIcon.svg?react";
import DropDown from "../assets/userProfileDetails/DropDown.svg?react";
import DropUp from "../assets/userProfileDetails/DropUp.svg?react";
import EditIcon from "../assets/userProfileDetails/EditIcon.svg?react";

import { ChevronDown, Download, User } from "lucide-react";
import { formatMDYString, formatToDMY, formatToYMD } from "./ui/DateFormatYMD";

import useStore from "../store/store";
import { calculateDuration } from "./ui/CalculateDuration";
import { getPaymentRecordByid, deleteAdminById, updateRestaurantTheme } from "../services/api";
import MonthYearDropdown from "./MonthYearDropDown";
import { toast } from "sonner";

export default function UserProfile({ role, id }) {
  const navigate = useNavigate();
  const location = useLocation();
  const previousTab =
    location.state?.topTab || (role === "admins" ? "Admins" : "Managers");

  const [slaaryDropdownOpen, setSalaryDropdownOpen] = useState(false);
  const [showDownloadModal, setShowDownloadModal] = useState(false);

  const [leaveDropdownOpen, setLeaveDropdownOpen] = useState(false);
  const [coinsDropdownOpen, setCoinsDropdownOpen] = useState(false);
  const [myDocumentsDropdownOpen, setMyDocumentsDropdownOpen] = useState(false);
  const [allotedItemDropdownOpen, setAllotedItemDropdownOpen] = useState(false);
  const [payment, setPayment] = useState();
  const { getAdminById, admin, employeeOverview, getEmployeeOverview } =
    useStore();

  const handleEditAdminProfile = () => {
    navigate(`/user-profile/add/admin/${admin?._id}`);
  };
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  const currentMonthIndex = now.getMonth();
  const [selectedMonth, setSelectedMonth] = useState(currentMonthIndex);
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [selectedLeaveMonth, setSelectedLeaveMonth] =
    useState(currentMonthIndex);
  const [selectedLeaveYear, setSelectedLeaveYear] = useState(currentYear);

  const [showLeaveDropdown, setShowLeaveDropdown] = useState(false);
  const [showSalaryDropdown, setShowSalaryDropdown] = useState(false);

  const leaveDropDownRef = useRef(null);
  const salaryDropDownRef = useRef(null);
  const [selectedCoinMonth, setSelectedCoinMonth] = useState(currentMonth);
  const [selectedCoinYear, setSelectedCoinYear] = useState(currentYear);

  useEffect(() => {
    if (role === "admins") {
      getAdminById(id);

      const month = selectedMonth;
      const year = selectedYear;

      getPaymentRecordByid(id, month, year)
        .then((res) => {
          setPayment(res.data || []);
        })
        .catch((err) => {
          console.error("Error fetching payments", err);
          setPayment([]);
        });
    } else {
      getEmployeeOverview(id);
    }
  }, [id, selectedMonth, selectedYear]);

  const staff = employeeOverview?.employee;
  const documents = employeeOverview?.documents;
  const allotedItems = employeeOverview?.allocatedItems;
  const coins = employeeOverview?.wallet;
  const leave = employeeOverview?.leaves;
  const history = employeeOverview?.transactions;

  const handleAdminDeleteProfile = async () => {
    await deleteAdminById(id);
    navigate("/user-profile");
  };

  const handleEditProfile = () => {
    navigate(`/user-profile/add/${staff?._id}`, {
      state: { topTab: previousTab }, // Pass the current tab
    });
  };
  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const monthlyAdvanceTaken = (() => {
    if (!history) return 0;

    const monthData = history.filter((item) => {
      const d = new Date(item.date);
      return d.getMonth() === selectedMonth && d.getFullYear() === selectedYear;
    });

    const advanceEntries = monthData.filter((item) => item.type === "advance");

    const totalAdvance = advanceEntries.reduce(
      (sum, item) => sum + Number(item.amount),
      0,
    );

    return totalAdvance;
  })();

  const monthlyLeaveTaken = (() => {
    if (!leave) return " ";

    const monthData = leave?.filter((item) => {
      const d = new Date(item?.startDate);
      return (
        d.getMonth() === selectedLeaveMonth &&
        d.getFullYear() === selectedLeaveYear
      );
    });

    const approvedLeaves = monthData.filter(
      (item) => item?.status === "Completed",
    );

    const totalLeaves = approvedLeaves.reduce(
      (sum, item) =>
        sum +
        Number(
          calculateDuration(item?.startDate, item?.endDate || item?.startDate),
        ),
      0,
    );

    return totalLeaves;
  })();

  const staffCreatedDate = new Date(staff?.createdAt);
  const selectedMonthEnd = new Date(selectedYear, selectedMonth + 1, 0);
  const selectedLeaveMonthEnd = new Date(
    selectedLeaveYear,
    selectedLeaveMonth + 1,
    0,
  );

  const monthlySalary =
    staffCreatedDate <= selectedMonthEnd ? staff?.salary : "";
  const monthlyLeave =
    staffCreatedDate <= selectedLeaveMonthEnd ? staff?.totalLeave : "";

  const handleDownload = async (url, docName, employeeName) => {
    try {
      const ext = url.split(".").pop().split("?")[0];
      if (["pdf", "doc", "docx"].includes(ext)) {
        setShowDownloadModal(true);
        return;
      }
      const filename =
        `${employeeName}_${docName}`.replace(/\s+/g, "_").toLowerCase() +
        "." +
        ext;

      const downloadUrl = url.replace("/upload/", "/upload/fl_attachment/");

      const response = await fetch(downloadUrl, { mode: "cors" });
      if (!response.ok) throw new Error("Network response was not ok");

      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Release memory
      window.URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error("Download failed:", error);
    }
  };
  if (!employeeOverview && role === "staff") {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <div className="sop-header-row">
        <div className="sop-breadcrumb">
          <Link
            to="/user-profile"
            state={{ topTab: previousTab }}
            className="crumb-dim"
            style={{
              textDecoration: "none",
            }}
          >
            User profiles
          </Link>
          <span
            className="crumb-sep"
            style={{ padding: "8px", display: "inline-flex" }}
          >
            ›
          </span>
          {role === "admins" ? (
            <span className="sop-breadcrumb__highlight">{admin?.name}</span>
          ) : (
            <span className="sop-breadcrumb__highlight">{staff?.name}</span>
          )}
        </div>
        {role === "admins" && (
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <button
              type="button"
              className="btn create"
              style={{ backgroundColor: "#EF4444" }}
              onClick={() => handleAdminDeleteProfile()}
            >
              Delete Profile
            </button>

            <button
              type="button"
              className="btn create"
              onClick={() => handleEditAdminProfile()}
            >
              <EditIcon />
              Edit
            </button>
          </div>
        )}
        {role === "staff" && (
          <button
            type="button"
            className="btn create"
            onClick={() => handleEditProfile()}
          >
            <EditIcon />
            Edit
          </button>
        )}
      </div>

      <div className="sop-layout">
        <div className="sop-card">
          {role === "staff" && (
            <div className="sop-title-row">
              <div className="sop-title-left">
                <div className="sop-title-icon-img">
                  {staff?.profilePhoto ? (
                    <img src={staff?.profilePhoto} className="user-img" />
                  ) : (
                    <div className="round-img">
                      <User size={48} color="#555" />
                    </div>
                  )}
                  {/* <img src={User} alt="User" className="round-img" /> */}
                </div>
                <div className="sop-title-text-wrapper">
                  <h1 className="sop-title-text">{staff?.name}</h1>

                  <div className="sop-tags-row">
                    <span className="sop-paragraph">{staff?.position}</span>
                  </div>
                </div>
              </div>
              <span
                className={`sop-tag sop-tag--${
                  staff?.status === "active" ? "Completed" : "Rejected"
                }`}
              >
                {staff?.status}
              </span>
            </div>
          )}
          {role === "admins" && (
            <>
              <div className="sop-title-row">
                <div className="sop-title-left">
                  <div className="sop-title-icon-img">
                    {admin?.profilePhoto ? (
                      <img src={admin?.profilePhoto} className="user-img" />
                    ) : (
                      <div className="round-img">
                        <User size={48} color="#555" />
                      </div>
                    )}
                    {/* <img src={User} alt="User" className="round-img" /> */}
                  </div>
                  <div className="sop-title-text-wrapper">
                    <h1 className="sop-title-text">{admin?.name}</h1>

                    <div className="sop-tags-row">
                      <span className="sop-paragraph">{admin?.role}</span>
                    </div>
                  </div>
                </div>
                <span
                  className={`sop-tag sop-tag--${
                    admin?.status === "active" ? "Completed" : "Rejected"
                  }`}
                >
                  {admin?.status}
                </span>
              </div>

              <div className="sop-steps-leaveBox">
                <div className="profile-title-row">
                  <h3
                    className="sop-section-title"
                    style={{ fontWeight: "600" }}
                  >
                    Monthly Subscription fee
                  </h3>
                  <div
                    className="profile-period"
                    ref={salaryDropDownRef}
                    style={{ position: "relative", cursor: "pointer" }}
                    onClick={() => setShowSalaryDropdown(!showSalaryDropdown)}
                  >
                    <span>
                      {selectedMonth === currentMonthIndex &&
                      selectedYear === currentYear
                        ? "This month"
                        : months[selectedMonth]}
                    </span>

                    <ChevronDown
                      size={18}
                      style={{
                        color: "var(--grey-120)",
                        transition: "transform 0.2s",
                        transform: showSalaryDropdown
                          ? "rotate(180deg)"
                          : "rotate(0deg)",
                      }}
                    />

                    {showSalaryDropdown && (
                      <div className="profile-period-dropdown">
                        {/* Year navigation row */}
                        <div
                          className="year-nav"
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            padding: "8px 12px",
                            borderBottom: "1px solid #eaefff",
                            fontWeight: 600,
                            fontSize: "14px",
                          }}
                        >
                          <span
                            style={{ cursor: "pointer", padding: "4px 8px" }}
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedYear((prev) => prev - 1);
                            }}
                          >
                            &lt;
                          </span>

                          <span>{selectedYear}</span>

                          <span
                            style={{ cursor: "pointer", padding: "4px 8px" }}
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedYear((prev) => prev + 1);
                            }}
                          >
                            &gt;
                          </span>
                        </div>

                        {/* Month list vertically */}
                        <div
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            gap: "4px",
                            padding: "8px 12px",
                          }}
                        >
                          {months.map((month, index) => {
                            const isCurrent =
                              index === currentMonthIndex &&
                              selectedYear === currentYear;
                            const isActive = index === selectedMonth;

                            return (
                              <div
                                key={month}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedMonth(index);
                                  setShowSalaryDropdown(false);
                                }}
                                className={`period-option ${
                                  isActive ? "active" : ""
                                }`}
                                style={{
                                  padding: "6px 10px",
                                  borderRadius: "4px",
                                  background: isActive
                                    ? "#eaefff"
                                    : "transparent",
                                  color: isActive ? "var(--purple)" : "#3d3d3d",
                                  fontWeight: isActive ? 600 : 500,
                                  cursor: "pointer",
                                }}
                              >
                                {isCurrent ? "This Month" : month}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                <div
                  className="sop-step-leave"
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    width: "100%",
                    marginTop: "18px",
                  }}
                >
                  <span className="leave">Monthly subscription</span>
                  <span className="leave">
                    {Number(admin?.monthlyfee).toFixed(2)}
                  </span>
                </div>

                <div
                  className="sop-step-leave"
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    width: "100%",
                    marginTop: "14px",
                  }}
                >
                  <span className="leave">Remaining this month</span>
                  {/* <span className="leave">{Number(monthlySalary * 0.6).toFixed(2)}</span> */}
                </div>

                <div
                  className={
                    slaaryDropdownOpen
                      ? "profile-steps-wrapper"
                      : "profile-steps-wrapper-d"
                  }
                  onClick={() => setSalaryDropdownOpen(!slaaryDropdownOpen)}
                >
                  <div className="profile-title-row">
                    <h3 className="sop-section-title">Recent Transactions</h3>
                    {slaaryDropdownOpen ? <DropUp /> : <DropDown />}
                  </div>

                  {slaaryDropdownOpen && (
                    <div className="req-steps-details">
                      {payment?.map((item) => {
                        return (
                          <div
                            key={item?._id}
                            className="previous-request-card"
                          >
                            <h4 className="request-title">
                              {/* {item?.type?.charAt(0).toUpperCase() +
                                item?.type?.slice(1)} */}
                              Monthly Payment
                            </h4>
                            <p className="request-date">
                              {formatMDYString(item?.date)}
                            </p>

                            <span
                              className={`status-badge ${
                                item?.type === "advance"
                                  ? "Rejected"
                                  : "Completed"
                              }`}
                            >
                              {item?.type === "advance" ? "-" : "+"}{" "}
                              {item?.admin?.monthlyfee}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
              <div className="sop-steps-leaveBox">
                <div className="profile-title-row">
                  <h3
                    className="sop-section-title"
                    style={{ fontWeight: "600" }}
                  >
                    Total number of employees
                  </h3>
                  <div
                    className="profile-period"
                    ref={leaveDropDownRef}
                    style={{ position: "relative", cursor: "pointer" }}
                    onClick={() => setShowLeaveDropdown(!showLeaveDropdown)}
                  >
                    <span>
                      {selectedLeaveMonth === currentMonthIndex &&
                      selectedLeaveYear === currentYear
                        ? "This month"
                        : months[selectedLeaveMonth]}
                    </span>

                    <ChevronDown
                      size={18}
                      style={{
                        color: "var(--grey-120)",
                        transition: "transform 0.2s",
                        transform: showLeaveDropdown
                          ? "rotate(180deg)"
                          : "rotate(0deg)",
                      }}
                    />

                    {showLeaveDropdown && (
                      <div className="profile-period-dropdown">
                        {/* Year navigation row */}
                        <div
                          className="year-nav"
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            padding: "8px 12px",
                            borderBottom: "1px solid #eaefff",
                            fontWeight: 600,
                            fontSize: "14px",
                          }}
                        >
                          <span
                            style={{ cursor: "pointer", padding: "4px 8px" }}
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedLeaveYear((prev) => prev - 1);
                            }}
                          >
                            &lt;
                          </span>

                          <span>{selectedLeaveYear}</span>

                          <span
                            style={{ cursor: "pointer", padding: "4px 8px" }}
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedLeaveYear((prev) => prev + 1);
                            }}
                          >
                            &gt;
                          </span>
                        </div>

                        {/* Month list vertically */}
                        <div
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            gap: "4px",
                            padding: "8px 12px",
                          }}
                        >
                          {months.map((month, index) => {
                            const isCurrent =
                              index === currentMonthIndex &&
                              selectedLeaveYear === currentYear;
                            const isActive = index === selectedLeaveMonth;

                            return (
                              <div
                                key={month}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedLeaveMonth(index);
                                  setShowLeaveDropdown(false);
                                }}
                                className={`period-option ${
                                  isActive ? "active" : ""
                                }`}
                                style={{
                                  padding: "6px 10px",
                                  borderRadius: "4px",
                                  background: isActive
                                    ? "#eaefff"
                                    : "transparent",
                                  color: isActive ? "var(--purple)" : "#3d3d3d",
                                  fontWeight: isActive ? 600 : 500,
                                  cursor: "pointer",
                                }}
                              >
                                {isCurrent ? "This Month" : month}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div
                  className="sop-step-leave"
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    width: "100%",
                    marginTop: "18px",
                  }}
                >
                  <span className="leave">Total available</span>
                  <span className="leave">{admin?.totalEmployee}</span>
                </div>

                <div
                  className="sop-step-leave"
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    width: "100%",
                    marginTop: "14px",
                  }}
                >
                  <span className="leave">Manager</span>
                  <span className="leave">{admin?.managerCount}</span>
                </div>

                <div
                  className="sop-step-leave"
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    width: "100%",
                    marginTop: "14px",
                  }}
                >
                  <span className="leave">staff</span>
                  <span className="leave">
                    {admin?.totalEmployee - admin?.managerCount}
                  </span>
                </div>
              </div>
            </>
          )}

          {role === 'admins' && (
             <>
                <div className="sop-steps-leaveBox" style={{ marginTop: '20px' }}>
                     <div className="profile-title-row">
                        <h3 className="sop-section-title" style={{ fontWeight: "600" }}>
                           Restaurant Theme
                        </h3>
                     </div>
                     <div style={{ padding: '10px 0' }}>
                        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                           {[
                              { value: '#5240d6', label: 'Default' },
                              { value: '#ec4899', label: 'Pink' },
                              { value: '#10b981', label: 'Emerald' },
                              { value: '#3b82f6', label: 'Blue' },
                              { value: '#f97316', label: 'Orange' },
                              { value: '#ef4444', label: 'Red' },
                           ].map((color) => (
                              <button
                                 key={color.value}
                                 onClick={async () => {
                                    const restaurantId = admin?.restaurant?._id || admin?.restaurantID?._id || admin?.restaurantID || admin?.restaurant;
                                    try {
                                       await updateRestaurantTheme(restaurantId, { primary: color.value });
                                       toast.success(`Theme updated to ${color.label}`);
                                       // Optionally refresh data if needed
                                    } catch (err) {
                                       toast.error("Failed to update theme");
                                       console.error(err);
                                    }
                                 }}
                                 style={{
                                    width: '30px',
                                    height: '30px',
                                    borderRadius: '50%',
                                    backgroundColor: color.value,
                                    border: '2px solid transparent',
                                    cursor: 'pointer',
                                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                                 }}
                                 title={color.label}
                              />
                           ))}
                           <div style={{ position: 'relative', width: '30px', height: '30px' }}>
                              <input 
                                 type="color" 
                                 onChange={async (e) => {
                                    const restaurantId = admin?.restaurant?._id || admin?.restaurantID?._id || admin?.restaurantID || admin?.restaurant;
                                    try {
                                       await updateRestaurantTheme(restaurantId, { primary: e.target.value });
                                       toast.success('Theme updated');
                                    } catch (err) {
                                       toast.error("Failed");
                                    }
                                 }}
                                 style={{ 
                                    width: '100%', 
                                    height: '100%', 
                                    opacity: 0, 
                                    cursor: 'pointer',
                                    position: 'absolute',
                                    top: 0,
                                    left: 0
                                 }} 
                              />
                              <div style={{
                                 width: '100%',
                                 height: '100%',
                                 borderRadius: '50%',
                                 background: 'conic-gradient(red, yellow, lime, aqua, blue, magenta, red)',
                                 pointerEvents: 'none',
                                 border: '1px solid #ddd'
                              }} />
                           </div>
                        </div>
                     </div>
                </div>

                {/* POS Module Toggle (Superadmin Only) */}
                <div className="sop-steps-leaveBox" style={{ marginTop: '20px' }}>
                     <div className="profile-title-row">
                        <h3 className="sop-section-title" style={{ fontWeight: "600" }}>
                           Restaurant Modules
                        </h3>
                     </div>
                     <div style={{ padding: '15px 0' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #f0f0f0' }}>
                           <div>
                              <div style={{ fontWeight: '500', color: '#1a1f36' }}>POS System</div>
                              <div style={{ fontSize: '12px', color: '#697386' }}>Enable/Disable Point of Sale access</div>
                           </div>
                           <label className="toggle-switch" style={{ position: 'relative', display: 'inline-block', width: '40px', height: '24px' }}>
                              <input 
                                 type="checkbox"
                                 checked={admin?.restaurant?.modules?.pos !== false}
                                 onChange={async (e) => {
                                    const restaurantId = admin?.restaurant?._id || admin?.restaurantID?._id || admin?.restaurantID || admin?.restaurant;
                                    const isEnabled = e.target.checked;
                                    try {
                                       await updateRestaurantTheme(restaurantId, { modules: { ...admin?.restaurant?.modules, pos: isEnabled } });
                                       await getAdminById(id); // Refresh data
                                       toast.success(`POS Module ${isEnabled ? 'Enabled' : 'Disabled'}`);
                                    } catch (err) {
                                       toast.error("Failed to update module settings");
                                       console.error(err);
                                    }
                                 }}
                                 style={{ opacity: 0, width: 0, height: 0 }}
                              />
                              <span style={{
                                 position: 'absolute', cursor: 'pointer', top: 0, left: 0, right: 0, bottom: 0,
                                 backgroundColor: admin?.restaurant?.modules?.pos !== false ? '#5240d6' : '#ccc',
                                 transition: '.4s', borderRadius: '34px'
                              }}>
                                 <span style={{
                                    position: 'absolute', content: '""', height: '16px', width: '16px',
                                    left: admin?.restaurant?.modules?.pos !== false ? '20px' : '4px',
                                    bottom: '4px', backgroundColor: 'white', transition: '.4s', borderRadius: '50%'
                                 }}/>
                              </span>
                           </label>
                        </div>
                     </div>
                </div>
              </>
            )}

          {role === "staff" && (
            <div>
              <div className="sop-steps-leaveBox">
                <div className="profile-title-row">
                  <h3
                    className="sop-section-title"
                    style={{ fontWeight: "600" }}
                  >
                    Salary
                  </h3>
                  <div
                    className="profile-period"
                    ref={salaryDropDownRef}
                    style={{ position: "relative", cursor: "pointer" }}
                    onClick={() => setShowSalaryDropdown(!showSalaryDropdown)}
                  >
                    <span>
                      {selectedMonth === currentMonthIndex &&
                      selectedYear === currentYear
                        ? "This month"
                        : months[selectedMonth]}
                    </span>

                    <ChevronDown
                      size={18}
                      style={{
                        color: "var(--grey-120)",
                        transition: "transform 0.2s",
                        transform: showSalaryDropdown
                          ? "rotate(180deg)"
                          : "rotate(0deg)",
                      }}
                    />

                    {showSalaryDropdown && (
                      <div className="profile-period-dropdown">
                        {/* Year navigation row */}
                        <div
                          className="year-nav"
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            padding: "8px 12px",
                            borderBottom: "1px solid #eaefff",
                            fontWeight: 600,
                            fontSize: "14px",
                          }}
                        >
                          <span
                            style={{ cursor: "pointer", padding: "4px 8px" }}
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedYear((prev) => prev - 1);
                            }}
                          >
                            &lt;
                          </span>

                          <span>{selectedYear}</span>

                          <span
                            style={{ cursor: "pointer", padding: "4px 8px" }}
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedYear((prev) => prev + 1);
                            }}
                          >
                            &gt;
                          </span>
                        </div>

                        {/* Month list vertically */}
                        <div
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            gap: "4px",
                            padding: "8px 12px",
                          }}
                        >
                          {months.map((month, index) => {
                            const isCurrent =
                              index === currentMonthIndex &&
                              selectedYear === currentYear;
                            const isActive = index === selectedMonth;

                            return (
                              <div
                                key={month}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedMonth(index);
                                  setShowSalaryDropdown(false);
                                }}
                                className={`period-option ${
                                  isActive ? "active" : ""
                                }`}
                                style={{
                                  padding: "6px 10px",
                                  borderRadius: "4px",
                                  background: isActive
                                    ? "#eaefff"
                                    : "transparent",
                                  color: isActive ? "var(--purple)" : "#3d3d3d",
                                  fontWeight: isActive ? 600 : 500,
                                  cursor: "pointer",
                                }}
                              >
                                {isCurrent ? "This Month" : month}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                <div
                  className="sop-step-leave"
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    width: "100%",
                    marginTop: "18px",
                  }}
                >
                  <span className="leave">Monthly salary</span>
                  <span className="leave">
                    {Number(monthlySalary).toFixed(2)}
                  </span>
                </div>

                <div
                  className="sop-step-leave"
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    width: "100%",
                    marginTop: "14px",
                  }}
                >
                  <span className="leave">Max advance balance</span>
                  <span className="leave">
                    {Number(monthlySalary * 0.6).toFixed(2)}
                  </span>
                </div>

                <div
                  className="sop-step-leave"
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    width: "100%",
                    marginTop: "14px",
                  }}
                >
                  <span className="leave">Used balance</span>
                  <span className="leave">
                    {monthlyAdvanceTaken === 0 ? " " : monthlyAdvanceTaken}
                  </span>
                </div>
                <div
                  className="sop-step-leave"
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    width: "100%",
                    marginTop: "14px",
                  }}
                >
                  <span className="leave">Remaining balance</span>
                  <span className="leave">
                    {Number(
                      monthlySalary === ""
                        ? ""
                        : monthlySalary * 0.6 - monthlyAdvanceTaken,
                    ).toFixed(2)}
                  </span>
                </div>
                <div
                  className={
                    slaaryDropdownOpen
                      ? "profile-steps-wrapper"
                      : "profile-steps-wrapper-d"
                  }
                  onClick={() => setSalaryDropdownOpen(!slaaryDropdownOpen)}
                >
                  <div className="profile-title-row">
                    <h3 className="sop-section-title">Recent Transactions</h3>
                    {slaaryDropdownOpen ? <DropUp /> : <DropDown />}
                  </div>

                  {slaaryDropdownOpen && (
                    <div className="req-steps-details">
                      {history?.map((item) => {
                        return (
                          <div
                            key={item?._id}
                            className="previous-request-card"
                          >
                            <h4 className="request-title">
                              {item?.type?.charAt(0).toUpperCase() +
                                item?.type?.slice(1)}
                            </h4>
                            <p className="request-date">
                              {formatMDYString(item?.date)}
                            </p>

                            <span
                              className={`status-badge ${
                                item?.type === "advance"
                                  ? "Rejected"
                                  : "Completed"
                              }`}
                            >
                              {item?.type === "advance" ? "-" : "+"}{" "}
                              {item?.amount}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>

              <div className="sop-steps-leaveBox">
                <div className="profile-title-row">
                  <h3
                    className="sop-section-title"
                    style={{ fontWeight: "600" }}
                  >
                    Leave balance
                  </h3>
                  <div
                    className="profile-period"
                    ref={leaveDropDownRef}
                    style={{ position: "relative", cursor: "pointer" }}
                    onClick={() => setShowLeaveDropdown(!showLeaveDropdown)}
                  >
                    <span>
                      {selectedLeaveMonth === currentMonthIndex &&
                      selectedLeaveYear === currentYear
                        ? "This month"
                        : months[selectedLeaveMonth]}
                    </span>

                    <ChevronDown
                      size={18}
                      style={{
                        color: "var(--grey-120)",
                        transition: "transform 0.2s",
                        transform: showLeaveDropdown
                          ? "rotate(180deg)"
                          : "rotate(0deg)",
                      }}
                    />

                    {showLeaveDropdown && (
                      <div className="profile-period-dropdown">
                        {/* Year navigation row */}
                        <div
                          className="year-nav"
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            padding: "8px 12px",
                            borderBottom: "1px solid #eaefff",
                            fontWeight: 600,
                            fontSize: "14px",
                          }}
                        >
                          <span
                            style={{ cursor: "pointer", padding: "4px 8px" }}
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedLeaveYear((prev) => prev - 1);
                            }}
                          >
                            &lt;
                          </span>

                          <span>{selectedLeaveYear}</span>

                          <span
                            style={{ cursor: "pointer", padding: "4px 8px" }}
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedLeaveYear((prev) => prev + 1);
                            }}
                          >
                            &gt;
                          </span>
                        </div>

                        {/* Month list vertically */}
                        <div
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            gap: "4px",
                            padding: "8px 12px",
                          }}
                        >
                          {months.map((month, index) => {
                            const isCurrent =
                              index === currentMonthIndex &&
                              selectedLeaveYear === currentYear;
                            const isActive = index === selectedLeaveMonth;

                            return (
                              <div
                                key={month}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedLeaveMonth(index);
                                  setShowLeaveDropdown(false);
                                }}
                                className={`period-option ${
                                  isActive ? "active" : ""
                                }`}
                                style={{
                                  padding: "6px 10px",
                                  borderRadius: "4px",
                                  background: isActive
                                    ? "#eaefff"
                                    : "transparent",
                                  color: isActive ? "var(--purple)" : "#3d3d3d",
                                  fontWeight: isActive ? 600 : 500,
                                  cursor: "pointer",
                                }}
                              >
                                {isCurrent ? "This Month" : month}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div
                  className="sop-step-leave"
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    width: "100%",
                    marginTop: "18px",
                  }}
                >
                  <span className="leave">Total available</span>
                  <span className="leave">{monthlyLeave}</span>
                </div>

                <div
                  className="sop-step-leave"
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    width: "100%",
                    marginTop: "14px",
                  }}
                >
                  <span className="leave">Used</span>
                  <span className="leave">
                    {monthlyLeaveTaken === 0 ? " " : monthlyLeaveTaken}
                  </span>
                </div>

                <div
                  className="sop-step-leave"
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    width: "100%",
                    marginTop: "14px",
                  }}
                >
                  <span className="leave">Remaining</span>
                  <span className="leave">
                    {monthlyLeave - monthlyLeaveTaken || " "}
                  </span>
                </div>

                <div
                  className={
                    leaveDropdownOpen
                      ? "profile-steps-wrapper"
                      : "profile-steps-wrapper-d"
                  }
                  onClick={() => setLeaveDropdownOpen(!leaveDropdownOpen)}
                >
                  <div className="profile-title-row">
                    <h3 className="sop-section-title">Previous request</h3>
                    {leaveDropdownOpen ? <DropUp /> : <DropDown />}
                  </div>

                  {leaveDropdownOpen && (
                    <div className="req-steps-details">
                      {leave?.map((l) => {
                        return (
                          <div key={l?._id} className="previous-request-card">
                            <h4 className="request-title">{l?.title}</h4>
                            <p className="request-date">
                              Date:{" "}
                              {l?.status === "Completed"
                                ? `${formatToYMD(l?.startDate)}${
                                    l?.endDate
                                      ? ` to ${formatToYMD(l?.endDate)}`
                                      : ""
                                  }`
                                : formatToYMD(l?.createdAt)}
                            </p>

                            <span className={`status-badge ${l?.status}`}>
                              {l?.status === "Completed"
                                ? "Approved"
                                : "Declined"}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
              <div className="sop-steps-leaveBox">
                <div className="profile-title-row">
                  <h3
                    className="sop-section-title"
                    style={{ fontWeight: "600" }}
                  >
                    Coins
                  </h3>
                  <MonthYearDropdown
                    selectedMonth={selectedCoinMonth}
                    selectedYear={selectedCoinYear}
                    onChange={(month, year) => {
                      setSelectedCoinMonth(month);
                      setSelectedCoinYear(year);

                      // getCoinsData(id, month, year);
                    }}
                  />
                </div>
                <div
                  className="sop-step-leave"
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    width: "100%",
                    marginTop: "18px",
                  }}
                >
                  <span className="leave">Coins available</span>
                  <span className="leave">
                    {coins?.totalEarned - coins?.totalSpent || "0"}
                  </span>
                </div>

                <div
                  className="sop-step-leave"
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    width: "100%",
                    marginTop: "14px",
                  }}
                >
                  <span className="leave">Total earned</span>
                  <span className="leave">{coins?.totalEarned}</span>
                </div>

                <div
                  className="sop-step-leave"
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    width: "100%",
                    marginTop: "14px",
                  }}
                >
                  <span className="leave">Total spent</span>
                  <span className="leave">{coins?.totalSpent}</span>
                </div>

                <div
                  className={
                    coinsDropdownOpen
                      ? "profile-steps-wrapper"
                      : "profile-steps-wrapper-d"
                  }
                  onClick={() => setCoinsDropdownOpen(!coinsDropdownOpen)}
                >
                  <div className="profile-title-row">
                    <h3 className="sop-section-title">Recent activity</h3>
                    {coinsDropdownOpen ? <DropUp /> : <DropDown />}
                  </div>

                  {coinsDropdownOpen && (
                    <div className="req-steps-details">
                      {coins?.coinsTransactions?.map((item) => {
                        return (
                          <div
                            key={item?._id}
                            className="previous-request-card"
                          >
                            <h4 className="request-title">
                              {item?.description}
                            </h4>
                            <p className="request-date">
                              {formatMDYString(item?.date)}
                            </p>

                            <span
                              className={`status-badge ${
                                item?.type === "debit"
                                  ? "Rejected"
                                  : "Completed"
                              }`}
                            >
                              {item?.type === "debit" ? "-" : "+"}{" "}
                              {item?.amount}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
              <div className="sop-steps-leaveBox">
                <h3 className="sop-section-title" style={{ fontWeight: "600" }}>
                  My documents
                </h3>
                <div
                  className="sop-step-leave"
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    width: "100%",
                    marginTop: "18px",
                  }}
                >
                  <span className="leave">Total documents</span>
                  <span className="leave">{documents?.length}</span>
                </div>

                <div
                  className="sop-step-leave"
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    width: "100%",
                    marginTop: "14px",
                  }}
                >
                  <span className="leave">Received</span>
                  <span className="leave">
                    {documents?.filter((d) => d.doc !== null).length}
                  </span>
                </div>

                <div
                  className="sop-step-leave"
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    width: "100%",
                    marginTop: "14px",
                  }}
                >
                  <span className="leave">Pending</span>
                  <span className="leave">
                    {documents?.filter((d) => d.doc === null).length}
                  </span>
                </div>

                <div
                  className={
                    myDocumentsDropdownOpen
                      ? "profile-steps-wrapper"
                      : "profile-steps-wrapper-d"
                  }
                  onClick={() =>
                    setMyDocumentsDropdownOpen(!myDocumentsDropdownOpen)
                  }
                >
                  <div className="profile-title-row">
                    <h3 className="sop-section-title">View documents</h3>
                    {myDocumentsDropdownOpen ? <DropUp /> : <DropDown />}
                  </div>

                  {myDocumentsDropdownOpen && (
                    <div className="req-steps-details">
                      {documents?.map((d) => {
                        return (
                          <div key={d?._id} className="previous-request-card">
                            <h4 className="request-title">{d?.docName}</h4>
                            <p className="request-date">
                              Issued On: {formatToYMD(d?.createdAt)}
                            </p>
                            <div
                              style={{
                                position: "absolute",
                                top: "1.6rem",
                                right: "1.6rem",
                                display: "flex",
                                alignItems: "center",
                                gap: "6px",
                              }}
                            >
                              <Download
                                size={16}
                                style={{ cursor: "pointer" }}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDownload(
                                    d?.doc,
                                    d?.docName,
                                    d?.EmployeeId?.name,
                                  );
                                }}
                              />{" "}
                              <span
                                className={`status-badge ${
                                  d?.status === "Received"
                                    ? "Completed"
                                    : "Rejected"
                                }`}
                                style={{ position: "static" }}
                              >
                                {d?.status === "Received"
                                  ? "Received"
                                  : "Pending"}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
              <div className="sop-steps-leaveBox">
                <h3 className="sop-section-title" style={{ fontWeight: "600" }}>
                  Allocated items
                </h3>
                <div
                  className="sop-step-leave"
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    width: "100%",
                    marginTop: "18px",
                  }}
                >
                  <span className="leave">Total items</span>
                  <span className="leave">{staff?.allotedItems?.length}</span>
                </div>

                <div
                  className="sop-step-leave"
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    width: "100%",
                    marginTop: "14px",
                  }}
                >
                  <span className="leave">Received</span>
                  <span className="leave">
                    {
                      staff?.allotedItems?.filter(
                        (a) => a?.isReceived === "Received",
                      )?.length
                    }
                  </span>
                </div>

                <div
                  className="sop-step-leave"
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    width: "100%",
                    marginTop: "14px",
                  }}
                >
                  <span className="leave">Pending</span>
                  <span className="leave">
                    {
                      staff?.allotedItems?.filter(
                        (a) => a?.isReceived === "Pending",
                      )?.length
                    }
                  </span>
                </div>

                <div
                  className={
                    allotedItemDropdownOpen
                      ? "profile-steps-wrapper"
                      : "profile-steps-wrapper-d"
                  }
                  onClick={() =>
                    setAllotedItemDropdownOpen(!allotedItemDropdownOpen)
                  }
                >
                  <div className="profile-title-row">
                    <h3 className="sop-section-title">View items</h3>
                    {allotedItemDropdownOpen ? <DropUp /> : <DropDown />}
                  </div>

                  {allotedItemDropdownOpen && (
                    <div className="req-steps-details">
                      {staff?.allotedItems?.map((a) => {
                        return (
                          <div key={a?._id} className="previous-request-card">
                            <h4 className="request-title">{a?.name}</h4>
                            {/* <p className="request-date">
                              Issued On: {formatToYMD(a?.issuedOn)}
                            </p> */}

                            <span
                              className={`status-badge ${
                                a?.isReceived === "Received"
                                  ? "Completed"
                                  : "Rejected"
                              }`}
                            >
                              {a?.isReceived === "Received"
                                ? "Received"
                                : "Pending"}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="sop-sidebar-stack">
          <div className="sop-card">
            <h3 className="sop-section-title">Joining date</h3>
            <div className="sop-profile-row">
              <div className="sop-avatar">
                <LeaveDateIcon />
              </div>
              <div>
                <p className="sop-profile-name">
                  {role === "admins"
                    ? formatToDMY(admin?.joinDate)
                    : formatToDMY(staff?.hireDate)}
                </p>
              </div>
            </div>
          </div>

          {staff?.position === "manager" && (
            <div className="sop-card">
              <h3 className="sop-section-title">Access alloted</h3>
              <div className="sop-profile-row">
                {/* <div className="sop-avatar">
               
              </div> */}
                <div>
                  <p
                    className="sop-profile-name"
                    style={{
                      display: "flex",
                      flexWrap: "wrap",
                      height: "auto",
                    }}
                  >
                    {staff?.access?.map((item, index) => (
                      <span
                        key={index}
                        className="chip"
                        style={{ marginRight: "5px", marginBottom: "10px" }}
                      >
                        {item}
                      </span>
                    ))}
                    {/* <span className="chip">{staff?.access}</span> */}
                    {/* <span className="chip">Issue raised</span> */}
                    {/* {role === "admins"
                    ? formatToDMY(admin?.joinDate)
                    :
                    formatToDMY(staff?.hireDate)} */}
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="sop-card">
            <h3 className="sop-section-title">Contact info</h3>
            <div className="sop-info-list">
              <div style={{ display: "inline-flex" }}>
                <DialIcon style={{ marginRight: "8px" }} />
                <div className="sop-info-item">
                  <span className="sop-info-label">Phone numner</span>
                  <span className="sop-info-value">
                    {role === "admins"
                      ? admin?.phoneNumber
                      : staff?.phoneNumber}
                  </span>
                </div>
              </div>

              <div style={{ display: "inline-flex" }}>
                <EmailIcon style={{ marginRight: "8px" }} />
                <div className="sop-info-item">
                  <span className="sop-info-label">Email address</span>
                  <span className="sop-info-value">
                    {role === "admins" ? admin?.email : staff?.email}
                  </span>
                </div>
              </div>

              <div style={{ display: "inline-flex" }}>
                <UserIcon style={{ marginRight: "8px" }} />
                <div className="sop-info-item">
                  <span className="sop-info-label">Permanent address</span>
                  <span className="sop-info-value">
                    {role === "admins" ? admin?.address : staff?.address}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {showDownloadModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Download not allowed</h3>
            <p>PDF and DOC files cannot be downloaded.</p>

            <button
              className="btn primary"
              onClick={() => setShowDownloadModal(false)}
            >
              Okay
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
