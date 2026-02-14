import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  approveLeaveRequest,
  fetchLeaveHistory,
  fetchLeaveRequestById,
  rejectLeaveRequest,
} from "../services/api";

import DurationIcon from "../assets/sopDetails/DurationIcon.svg?react";
import UserIcon from "../assets/sopDetails/UserIcon.svg?react";
import LeaveTitleIcon from "../assets/requestDetails/LeaveTitleIcon.svg?react";
import LeaveDateIcon from "../assets/requestDetails/LeaveDateIcon.svg?react"

import VoiceNotePlayer from "../components/VoiceNote";
import { calculateDuration } from "./ui/CalculateDuration";
import { formatToYMD } from "./ui/DateFormatYMD";
import { useLoader } from "./ui/LoaderContext";
import { toast } from "sonner";

export default function LeaveDetails({ id }) {
  const { setLoading } = useLoader();
  const [leave, setLeave] = useState(null);
  const [error, setError] = useState(false);
  const [history, setHistory] = useState();


  useEffect(() => {
    loadData();
  }, [id]);
  useEffect(() => {
    if (leave?.createdBy?._id) {
      loadHistory(leave.createdBy._id);
    }
  }, [leave]);

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await fetchLeaveRequestById(id);
      setLeave(res?.data);
    } catch (err) {
      console.error("Error loading issue:", err);
      setError;
    } finally {
      setLoading(false);
    }
  };

  const loadHistory = async (id) => {
    try {
      setLoading(true);
      const res = await fetchLeaveHistory(id);
      setHistory(res?.data);
    } catch (err) {
      console.error("Error loading issue:", err);
      setError;
    } finally {
      setLoading(false);
    }
  };
  const handleApproveLeave = async () => {
    try {
      setLoading(true);
      await approveLeaveRequest(id);
      toast.success("Leave Approved");
      await loadData();
      if (leave?.createdBy?._id) {
        await loadHistory(leave.createdBy._id);
      }
    } catch (err) {
      console.error("Error loading issue:", err);
      toast.error("Leave Not Approved");
    } finally {
      setLoading(false);
    }
  };
  const handleRejectLeave = async () => {
    try {
      setLoading(true);
      await rejectLeaveRequest(id);
      toast.success("Leave Rejected");
      await loadData();
      if (leave?.createdBy?._id) {
        await loadHistory(leave.createdBy._id);
      }
    } catch (err) {
      console.error("Error loading issue:", err);
      toast.error("Leave Not Approved");
    } finally {
      setLoading(false);
    }
  };

  const days = calculateDuration(leave?.startDate, leave?.endDate);

  if (error) {
    return (
      <div className="task-create">
        <div className="task-create__panel">
          <div className="task-create__breadcrumb">
            <Link
              to="/request?tab=leave"
              className="crumb-dim"
              style={{
                textDecoration: "none",
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              Back to Leave Requests
            </Link>
          </div>
          <div
            style={{
              textAlign: "center",
              padding: "40px",
              color: "var(--red-500)",
            }}
          >
            {error}
          </div>
        </div>
      </div>
    );
  }

  if (!leave) {
    return (
      <div className="task-create">
        <div className="task-create__panel">
          <div className="task-create__breadcrumb">
            <Link
              to="/request?tab=leave"
              className="crumb-dim"
              style={{
                textDecoration: "none",
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              Back to Leave Requests
            </Link>
          </div>
          <div
            style={{
              textAlign: "center",
              padding: "40px",
              color: "var(--grey-100)",
            }}
          >
            Leave Request not found
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="sop-header-row">
        <div className="sop-breadcrumb">
          <Link
            to="/request?tab=leave"
            className="crumb-dim"
            style={{
              textDecoration: "none",
            }}
          >
            Leave request
          </Link>
          <span
            className="crumb-sep"
            style={{ padding: "8px", display: "inline-flex" }}
          >
            ›
          </span>

          <span className="sop-breadcrumb__highlight">{leave?.title}</span>
        </div>
        {leave?.status === "Pending" && (
          <div style={{ display: "inline-flex", gap: "20px" }}>
            <button
              type="button"
              className="btn create"
              onClick={() => handleApproveLeave()}
              style={{
                background: "#10B981",
                color: "#FFFFFF",
              }}
            >
              Approve
            </button>

            <button
              type="button"
              className="btn create"
              onClick={() => handleRejectLeave()}
              style={{
                background: "#EF4444",
                color: "#FFFFFF",
              }}
            >
              Reject
            </button>
          </div>
        )}
      </div>

      <div className="sop-layout">
        <div className="sop-card">
          <div className="sop-title-row">
            <div className="sop-title-left">
              <div className="sop-title-icon">
                <LeaveTitleIcon />
              </div>
              <div className="sop-title-text-wrapper">
                <h1 className="sop-title-text">{leave?.title}</h1>
                <div className="sop-tags-row">
                  <span className={`sop-tag sop-tag--${leave?.status}`}>
                    {leave?.status}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="sop-description-container">
            <h3 className="sop-section-title">Reason for leave</h3>
            <p className="sop-paragraph">{leave?.reason}</p>
          </div>

          {leave?.voiceNote && (
            <div className="sop-audio-container">
              <h3 style={{ fontSize: "16px", color: "#0F0F0F" }}>
                Voice note by admin
              </h3>
              <VoiceNotePlayer src={leave?.voiceNote || " "} />
            </div>
          )}

          <div className="sop-steps-leaveBox">
            <h3 className="sop-section-title" style={{ fontWeight: "600" }}>
              Leave balance
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
              <span className="leave">Total available</span>
              <span className="leave">{leave?.totalLeave}</span>
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
              <span className="leave">{leave?.leaveTaken}</span>
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
              <span className="leave">{leave?.leaveLeft}</span>
            </div>
          </div>
          <div className="req-steps-wrapper">
            <h3 className="sop-section-title">Previous request</h3>

            <div className="req-steps-details">
              {history?.map((item) => {
                return (
                  item?.status !== "Pending" && (
                    <div key={item?._id} className="previous-request-card">
                      <h4 className="request-title">{item?.title}</h4>
                      <p className="request-date">
                        Date:{" "}
                        {item?.status === "Completed"
                          ? `${formatToYMD(item?.startDate)}${item?.endDate
                            ? ` to ${formatToYMD(item?.endDate)}`
                            : ""
                          }`
                          : formatToYMD(item?.createdAt)}
                      </p>

                      <span className={`status-badge ${item?.status}`}>
                        {item?.status === "Completed" ? "Approved" : "Declined"}
                      </span>
                    </div>
                  )
                );
              })}
            </div>
          </div>
        </div>

        <div className="sop-sidebar-stack">
          <div className="sop-card">
            <h3 className="sop-section-title">Applied by</h3>
            <div className="sop-profile-row">
              <div className="sop-avatar">
                {leave?.createdBy?.name[0]?.toUpperCase()}
              </div>
              <div>
                <p className="sop-profile-name">{leave?.createdBy?.name}</p>
                <p className="sop-profile-role">{leave?.createdBy?.role}</p>
              </div>
            </div>
          </div>

          <div className="sop-card">
            <h3 className="sop-section-title">Leave details</h3>
            <div className="sop-info-list">
              <div style={{ display: "inline-flex" }}>
                <LeaveDateIcon style={{ marginRight: "8px" }} />
                <div className="sop-info-item">
                  <span className="sop-info-label">Leave date</span>
                  <span className="sop-info-value">
                    {formatToYMD(leave?.startDate)}
                    {" to "}
                    {formatToYMD(leave?.endDate)}
                  </span>
                </div>
              </div>

              <div style={{ display: "inline-flex" }}>
                <DurationIcon style={{ marginRight: "8px" }} />
                <div className="sop-info-item">
                  <span className="sop-info-label">Total Duration</span>
                  <span className="sop-info-value">
                    {days} {days === 1 ? "day" : "days"}
                  </span>
                </div>
              </div>

              <div style={{ display: "inline-flex" }}>
                <UserIcon style={{ marginRight: "8px" }} />
                <div className="sop-info-item">
                  <span className="sop-info-label">Created</span>
                  <span className="sop-info-value">
                    {formatToYMD(leave?.createdAt)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
