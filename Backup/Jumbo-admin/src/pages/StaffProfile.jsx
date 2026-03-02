import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Plus, Search as SearchIcon, User, UserPen } from "lucide-react";
import CreateTaskIcon from "../assets/homeScreen/CreateTaskIcon.svg";
import useStore from "../store/store";
import { formatToYMD } from "../components/ui/DateFormatYMD";

export default function StaffProfile({ roleCheck }) {
  const navigate = useNavigate();
  const location = useLocation();
  const defaultTab = location.state?.topTab
    ? location.state.topTab
    : roleCheck === "superadmin"
      ? "Admins"
      : "Managers";

  const { getAdmins, admins, fetchEmployees, employees } = useStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [topTab, setTopTab] = useState(defaultTab);

  useEffect(() => {
    if (roleCheck === "superadmin") {
      getAdmins();
    } else {
      fetchEmployees();
    }
  }, [roleCheck]);

  const handleAddAdmin = () => {
    navigate(`/user-profile/add/admin`, {
      state: { topTab },
    });
  };

  const handleAddEmployee = () => {
    navigate("/user-profile/add", {
      state: { topTab },
    });
  };

  const handleViewProfile = (role, id) => {
    navigate(`/user-profile/${role}/${id}`, {
      state: { topTab },
    });
  };

  const filteredAdmins = admins?.filter((ad) =>
    ad?.name?.toLowerCase().includes(searchQuery.toLowerCase()),
  );
  const filteredEmployees = employees
    ?.filter((emp) => emp?.position?.toLowerCase() !== "manager")
    ?.filter((emp) =>
      emp?.name?.toLowerCase().includes(searchQuery.toLowerCase()),
    );
  const filteredManagers = employees
    ?.filter((emp) => emp.position?.toLowerCase() === "manager")
    ?.filter((emp) =>
      emp?.name?.toLowerCase().includes(searchQuery.toLowerCase()),
    );

  return (
    <div>
      <div className="task-header">
        <div className="issue-tabs">
          {roleCheck === "superadmin" && (
            <span
              className={`tab ${topTab === "Admins" ? "active" : ""} ${
                topTab === "Admins" ? "underline" : ""
              }`}
              onClick={() => setTopTab("Admins")}
              style={{ cursor: "pointer" }}
            >
              Admins
            </span>
          )}
          {roleCheck !== "superadmin" && (
            <span
              className={`tab ${topTab === "Managers" ? "active" : ""} ${
                topTab === "Managers" ? "underline" : ""
              }`}
              onClick={() => setTopTab("Managers")}
              style={{ cursor: "pointer" }}
            >
              Managers
            </span>
          )}
          {roleCheck !== "superadmin" && (
            <span
              className={`tab ${topTab === "Staff" ? "active" : ""} ${
                topTab === "Staff" ? "underline" : ""
              }`}
              onClick={() => setTopTab("Staff")}
              style={{ cursor: "pointer" }}
            >
              Staff
            </span>
          )}
        </div>
        <div className="task-actions">
          {roleCheck !== "superadmin" && (
            <button
              className="btn create"
              type="button"
              onClick={handleAddEmployee}
            >
              <img
                src={CreateTaskIcon}
                alt="CreateTaskIcon"
                width={15}
                height={15}
                style={{
                  borderWidth: "2px",
                  transform: "rotate(0deg)",
                  opacity: 1,
                }}
              />
              Add new profile
            </button>
          )}

          {roleCheck === "superadmin" && (
            <button
              className="btn filter"
              type="button"
              onClick={handleAddAdmin}
            >
              <Plus />
              Add a new admin
            </button>
          )}
        </div>
      </div>
      {topTab === "Admins" && (
        <div className="panel">
          <div className="attendance-toolbar" style={{ marginBottom: 20 }}>
            <div className="search">
              <SearchIcon
                size={18}
                style={{ color: "#A8B8C9", flexShrink: 0 }}
              />
              <input
                type="text"
                className="search-input"
                placeholder="Search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  border: "none",
                  outline: "none",
                  background: "transparent",
                  fontSize: "17px",
                  fontWeight: 500,
                  color: searchQuery ? "var(--charcoal)" : "#A8B8C9",
                  flex: 1,
                }}
              />
            </div>
          </div>

          <div className="profile-grid">
            {filteredAdmins?.map((ad) => (
              <div key={ad?._id} className="profile-card">
                <div className="profile-row">
                  <div className="avatar">
                    {ad?.profilePhoto ? (
                      <img src={ad?.profilePhoto} className="round-img" />
                    ) : (
                      <div className="round-img">
                        <User size={42} color="#555" />
                      </div>
                    )}
                    {/* <img src={ad?.profilePhoto || UserPic} alt="User" className="round-img" /> */}
                  </div>
                  <div className="profile-main">
                    <div className="profile-top">
                      <h3 className="task-heading">{ad?.name}</h3>
                      {ad?.status === "active" ? (
                        <span className="badge success sm">Active</span>
                      ) : (
                        <span className="badge error sm">Not Active</span>
                      )}
                    </div>
                    <p className="task-sub">{ad?.role}</p>
                  </div>
                </div>
                <div className="profile-info">
                  <div className="info-row">
                    <span className="info-label">Phone number</span>
                    <span className="info-value">{ad?.email}</span>
                  </div>
                  <div className="info-row">
                    <span className="info-label">Join date</span>
                    <span className="info-value">
                      {formatToYMD(ad?.createdAt)}
                    </span>
                  </div>
                </div>
                <button
                  className="btn create"
                  type="button"
                  style={{ justifyContent: "center" }}
                  onClick={() => handleViewProfile("admins", ad?._id)}
                >
                  <User className="btn-icon" size={18} />
                  View profile
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
      {topTab === "Staff" && (
        <div className="panel">
          <div className="attendance-toolbar" style={{ marginBottom: 20 }}>
            <div className="search">
              <SearchIcon
                size={18}
                style={{ color: "#A8B8C9", flexShrink: 0 }}
              />
              <input
                type="text"
                className="search-input"
                placeholder="Search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  border: "none",
                  outline: "none",
                  background: "transparent",
                  fontSize: "17px",
                  fontWeight: 500,
                  color: searchQuery ? "var(--charcoal)" : "#A8B8C9",
                  flex: 1,
                }}
              />
            </div>
          </div>

          <div className="profile-grid">
            {filteredEmployees?.map((emp) => (
              <div key={emp?._id} className="profile-card">
                <div className="profile-row">
                  <div className="avatar">
                    {emp?.profilePhoto ? (
                      <img src={emp?.profilePhoto} className="round-img" />
                    ) : (
                      <div className="round-img">
                        <User size={42} color="#555" />
                      </div>
                    )}
                  </div>
                  <div className="profile-main">
                    <div className="profile-top">
                      <h3 className="profile-task-heading">{emp?.name}</h3>
                      {emp?.status === "active" ? (
                        <span className="badge success sm">Active</span>
                      ) : (
                        <span className="badge error sm">In Active</span>
                      )}
                    </div>
                    <p className="task-sub">{emp?.position}</p>
                  </div>
                </div>
                <div className="profile-info">
                  <div className="info-row">
                    <span className="info-label">Phone number</span>
                    <span className="info-value">{emp?.phoneNumber}</span>
                  </div>
                  <div className="info-row">
                    <span className="info-label">Join date</span>
                    <span className="info-value">
                      {formatToYMD(emp?.hireDate)}
                    </span>
                  </div>
                  {/* {emp?.documentCount!==0 && ( */}
                  <div className="info-row">
                    <span className="info-label">Documents</span>
                    <span className="info-value">{emp?.documentCount}</span>
                  </div>
                  {/* )} */}
                </div>
                <button
                  className="btn create"
                  type="button"
                  style={{ justifyContent: "center" }}
                  onClick={() => handleViewProfile("staff", emp?._id)}
                >
                  <User className="btn-icon" size={18} />
                  View profile
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {topTab === "Managers" && (
        <div className="panel">
          <div className="attendance-toolbar" style={{ marginBottom: 20 }}>
            <div className="search">
              <SearchIcon
                size={18}
                style={{ color: "#A8B8C9", flexShrink: 0 }}
              />
              <input
                type="text"
                className="search-input"
                placeholder="Search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  border: "none",
                  outline: "none",
                  background: "transparent",
                  fontSize: "17px",
                  fontWeight: 500,
                  color: searchQuery ? "var(--charcoal)" : "#A8B8C9",
                  flex: 1,
                }}
              />
            </div>
          </div>

          <div className="profile-grid">
            {filteredManagers?.map((emp) => (
              <div key={emp?._id} className="profile-card">
                <div className="profile-row">
                  <div className="avatar">
                    {emp?.profilePhoto ? (
                      <img src={emp?.profilePhoto} className="round-img" />
                    ) : (
                      <div className="round-img">
                        <User size={42} color="#555" />
                      </div>
                    )}
                  </div>
                  <div className="profile-main">
                    <div className="profile-top">
                      <h3 className="profile-task-heading">{emp?.name}</h3>
                      {emp?.status === "active" ? (
                        <span className="badge success sm">Active</span>
                      ) : (
                        <span className="badge error sm">In Active</span>
                      )}
                    </div>
                    <p className="task-sub">{emp?.position}</p>
                  </div>
                </div>
                <div className="profile-info">
                  <div className="info-row">
                    <span className="info-label">Phone number</span>
                    <span className="info-value">{emp?.phoneNumber}</span>
                  </div>
                  <div className="info-row">
                    <span className="info-label">Join date</span>
                    <span className="info-value">
                      {formatToYMD(emp?.hireDate)}
                    </span>
                  </div>
                </div>
                <button
                  className="btn create"
                  type="button"
                  style={{ justifyContent: "center" }}
                  onClick={() => handleViewProfile("manager", emp?._id)}
                >
                  <User className="btn-icon" size={18} />
                  View profile
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
