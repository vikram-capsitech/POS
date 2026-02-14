import { useEffect, useState } from "react";
import { Link} from "react-router-dom";
import {
  approveAdvanceRequest,
  getAdvanceRequestById,
  getEmployeeTransaction,
  rejectAdvanceRequest,

} from "../services/api";
import DurationIcon from "../assets/sopDetails/DurationIcon.svg?react";
import UserIcon from "../assets/sopDetails/UserIcon.svg?react";
import LeaveDateIcon from "../assets/requestDetails/LeaveDateIcon.svg?react"
import BankIcon from"../assets/requestDetails/BankIcon.svg?react"

import VoiceNotePlayer from "../components/VoiceNote";
import { calculateDuration } from "./ui/CalculateDuration";
import { formatToYMD } from "./ui/DateFormatYMD";
import { useLoader } from "./ui/LoaderContext";
import { toast } from "sonner";
import { formatDate } from "./ui/DateFormat";

export default function AdvanceDetails({ id }) {

  const { setLoading } = useLoader();
  const [adv, setAdv] = useState(null);
  const [error, setError] = useState(false);
  const [history, setHistory] = useState();

  useEffect(() => {
    loadData();
  }, [id]);
  useEffect(() => {
    if (adv?.createdBy?._id) {
      loadHistory(adv.createdBy._id);
    }
  }, [adv]);

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await getAdvanceRequestById(id);
      setAdv(res?.data);
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
      const res = await getEmployeeTransaction(id);
      setHistory(res?.data);
    } catch (err) {
      console.error("Error loading issue:", err);
      setError;
    } finally {
      setLoading(false);
    }
  };

  const handleApproveAdvance = async () => {
    try {
      setLoading(true);
      await approveAdvanceRequest(id);
      await loadData();
      if (adv?.createdBy?._id) {
        await loadHistory(adv.createdBy._id);
      }
       toast.success("Advance Approved");
    } catch (err) {
      console.error("Error loading issue:", err);
      toast.error("Advance Not Approved");
    } finally {
      setLoading(false);
    }
  };
  const handleRejectAdvance = async () => {
    try {
      setLoading(true);
      await rejectAdvanceRequest(id);
      await loadData();
      toast.success("Advance Rejected");
    } catch (err) {
      console.error("Error loading issue:", err);
      toast.error("Advance Not Approved");
    } finally {
      setLoading(false);
    }
  };

  const days = calculateDuration(adv?.createdAt, adv?.requestDate);

  if (error) {
    return (
      <div className="task-create">
        <div className="task-create__panel">
          <div className="task-create__breadcrumb">
            <Link
              to="/request?tab=advance"
              className="crumb-dim"
              style={{
                textDecoration: "none",
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
            
              Back to Advance Requests
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

  if (!adv) {
    return (
      <div className="task-create">
        <div className="task-create__panel">
          <div className="task-create__breadcrumb">
            <Link
              to="/request?tab=advance"
              className="crumb-dim"
              style={{
                textDecoration: "none",
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
            
              Back to Advance Requests
            </Link>
          </div>
          <div
            style={{
              textAlign: "center",
              padding: "40px",
              color: "var(--grey-100)",
            }}
          >
           Advance Request not found
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
            to="/request?tab=advance"
            className="crumb-dim"
            style={{
              textDecoration: "none",
            }}
          >
            Advance request
          </Link>
          <span
            className="crumb-sep"
            style={{ padding: "8px", display: "inline-flex" }}
          >
            ›
          </span>

          <span className="sop-breadcrumb__highlight">Asked {adv?.askedMoney}</span>
        </div>
        {adv?.status === "Pending" && (
          <div style={{ display: "inline-flex", gap: "20px" }}>
            <button
              type="button"
              className="btn create"
              onClick={() => handleApproveAdvance()}
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
              onClick={() => handleRejectAdvance()}
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
                <BankIcon />
              </div>
              <div className="sop-title-text-wrapper">
                <h1 className="sop-title-text">Asked {adv?.askedMoney}</h1>
                <div className="sop-tags-row">
                  <span className={`sop-tag sop-tag--${adv?.status}`}>
                    {adv?.status}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="sop-description-container">
            <h3 className="sop-section-title">Reason for advance</h3>
            <p className="sop-paragraph">{adv?.description}</p>
          </div>

          {adv?.voiceNote && (
            <div className="sop-audio-container">
              <h3 style={{ fontSize: "16px", color: "#0F0F0F" }}>
                Voice note by admin
              </h3>
              <VoiceNotePlayer src={adv?.voiceNote || " "} />
            </div>
          )}

          <div className="sop-steps-leaveBox">
            <h3 className="sop-section-title" style={{ fontWeight: "600" }}>
              Total balance
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
              <span className="leave">Monthly salary</span>
              <span className="leave">{adv?.employee?.salary}</span>
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
              <span className="leave">Max balance</span>
              <span className="leave">{adv?.employee?.salary * 0.6}</span>
             
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
              {/* <span className="leave">{(adv?.employee?.salary)-(adv?.remainingBalance)}</span> */}
              <span className="leave">{adv?.employee?.monthlyAdvanceTaken === 0 ? " " :adv?.employee?.monthlyAdvanceTaken}</span>
             
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
              {/* <span className="leave">{adv?.remainingBalance}</span> */}
              <span className="leave">{(adv?.employee?.salary * 0.6)-(adv?.employee?.monthlyAdvanceTaken)}</span> 
              
            </div>
          </div>
          <div className="req-steps-wrapper">
            <h3 className="sop-section-title">Recent Transactions</h3>

            <div className="req-steps-details">
              {history?.map((item) => {
                return (
                 
                    <div key={item?._id} className="previous-request-card">
                      <h4 className="request-title">{item?.type?.charAt(0).toUpperCase() + item?.type?.slice(1)}</h4>
                      <p className="request-date">
                        {formatToYMD(item?.date)}
                      </p>

                      <span className={`status-badge ${item?.type==="advance"?"Rejected":"Completed"}`}>
                        {item?.type==="advance"?"-":"+"}{" "}{item?.amount }
                      </span>
                    </div>
                  )
              })}
            </div>
          </div>
        </div>

        <div className="sop-sidebar-stack">
          <div className="sop-card">
            <h3 className="sop-section-title">Requested by</h3>
            <div className="sop-profile-row">
              <div className="sop-avatar">
                {adv?.createdBy?.name[0]?.toUpperCase()}
              </div>
              <div>
                <p className="sop-profile-name">{adv?.createdBy?.name}</p>
                <p className="sop-profile-role">{adv?.createdBy?.role}</p>
              </div>
            </div>
          </div>

          <div className="sop-card">
            <h3 className="sop-section-title">Request details</h3>
            <div className="sop-info-list">
              <div style={{ display: "inline-flex" }}>
                <LeaveDateIcon style={{ marginRight: "8px" }} />
                <div className="sop-info-item">
                  <span className="sop-info-label">Due date</span>
                  <span className="sop-info-value">
                    {formatDate(adv?.requestDate)}
                   
                  </span>
                </div>
              </div>

              <div style={{ display: "inline-flex" }}>
                <DurationIcon style={{ marginRight: "8px" }} />
                <div className="sop-info-item">
                  <span className="sop-info-label">Estimated Duration</span>
                  <span className="sop-info-value">
                    {days} {days <= 1 ? "day" : "days"}
                  </span>
                </div>
              </div>

              <div style={{ display: "inline-flex" }}>
                <UserIcon style={{ marginRight: "8px" }} />
                <div className="sop-info-item">
                  <span className="sop-info-label">Created</span>
                  <span className="sop-info-value">
                    {formatToYMD(adv?.createdAt)}
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
