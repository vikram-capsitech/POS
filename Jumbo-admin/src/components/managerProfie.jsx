import { useEffect,  } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import DialIcon from "../assets/userProfileDetails/DialIcon.svg?react";
import UserIcon from "../assets/sopDetails/UserIcon.svg?react";
import LeaveDateIcon from "../assets/requestDetails/LeaveDateIcon.svg?react";
import EmailIcon from "../assets/userProfileDetails/EmailIcon.svg?react";

import EditIcon from "../assets/userProfileDetails/EditIcon.svg?react";

import { User } from "lucide-react";
import { formatToDMY } from "./ui/DateFormatYMD";

import useStore from "../store/store";

export default function ManagerProfile({ role, id }) {
  const navigate = useNavigate();
  const location = useLocation();
  const previousTab = location.state?.topTab || role === "managers";
  const { staff, getIndividualStaff } = useStore();

  useEffect(() => {
    getIndividualStaff(id);
  }, [id]);

  const handleEditProfile = () => {
    navigate(`/user-profile/add/${staff?._id}`, {
      state: { topTab: previousTab }, // Pass the current tab
    });
  };

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

          <span className="sop-breadcrumb__highlight">{staff?.name}</span>
        </div>

        <button
          type="button"
          className="btn create"
          onClick={() => handleEditProfile()}
        >
          <EditIcon />
          Edit
        </button>
      </div>

      <div className="manager-layout">
        <div className="sop-card">
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
          <div className="manager-card">
            <h3 className="sop-section-title">Joining date</h3>
            <div className="sop-profile-row">
              <div className="sop-avatar">
                <LeaveDateIcon />
              </div>
              <div>
                <p className="sop-profile-name">
                  {formatToDMY(staff?.hireDate)}
                </p>
              </div>
            </div>
          </div>
          <div className="manager-card">
            <h3 className="sop-section-title">Access alloted</h3>
            <div className="sop-profile-row">
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
                      className="manager-chip"
                      style={{ marginRight: "1rem", marginBottom: "10px" }}
                    >
                      {item}
                    </span>
                  ))}
                </p>
              </div>
            </div>
          </div>
          <div className="manager-card">
            <h3 className="sop-section-title">Contact info</h3>
            <div className="sop-info-list">
              <div style={{ display: "inline-flex" }}>
                <DialIcon style={{ marginRight: "8px" }} />
                <div className="sop-info-item">
                  <span className="sop-info-label">Phone numner</span>
                  <span className="sop-info-value">{staff?.phoneNumber}</span>
                </div>
              </div>

              <div style={{ display: "inline-flex" }}>
                <EmailIcon style={{ marginRight: "8px" }} />
                <div className="sop-info-item">
                  <span className="sop-info-label">Email address</span>
                  <span className="sop-info-value">{staff?.email}</span>
                </div>
              </div>

              <div style={{ display: "inline-flex" }}>
                <UserIcon style={{ marginRight: "8px" }} />
                <div className="sop-info-item">
                  <span className="sop-info-label">Permanent address</span>
                  <span className="sop-info-value">{staff?.address}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
