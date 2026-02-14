import { useParams, Link } from "react-router-dom";
import SopBoxIcon from "../assets/sopDetails/SopBoxIcon.svg?react";
import TotalStepsIcon from "../assets/sopDetails/TotalStepsIcon.svg?react";
import DurationIcon from "../assets/sopDetails/DurationIcon.svg?react";
import UserIcon from "../assets/sopDetails/UserIcon.svg?react";

import { useEffect, useState } from "react";
import { fetchAiReviewById, updateAiReview } from "../services/api";
import { toast } from "sonner";

export default function AIReviewDetails() {
  const { id } = useParams();

  const [aiReview, setAiReview] = useState(null);

  useEffect(() => {
    const loadReview = async () => {
      try {
        const res = await fetchAiReviewById(id);
        setAiReview(res?.data);
      } catch (err) {
        console.error("Error loading AiReview:", err);
      }
    };

    loadReview();
  }, [id]);
  const handleRejectReview = async () => {
    try {
      const form = new FormData();
      form.append("status", "Rejected");
      await updateAiReview(id, form);

      const res = await fetchAiReviewById(id);
      setAiReview(res?.data);
      toast.success("Review Rejected!");
    } catch (error) {
      console.error("Error Rejected  Review:", error);
      toast.error("Something went wrong while Rejecting the Review!");
    }
  };

  const handleApproveReview = async () => {
    try {
      const form = new FormData();
      form.append("status", "Passed");
      await updateAiReview(id, form);

      const res = await fetchAiReviewById(id);
      setAiReview(res?.data);
      toast.success("Review Approved!");
    } catch (error) {
      console.error("Error Approve  Review:", error);
      toast.error("Something went wrong while Approving the Review!");
    }
  };

  if (!aiReview) {
    return (
      <div className="task-create">
        <div className="task-create__panel">
          <div className="task-create__breadcrumb">
            <Link
              to="/ai-review"
              className="crumb-dim"
              style={{
                textDecoration: "none",
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              Back to AI Reviews
            </Link>
          </div>
          <div
            style={{
              textAlign: "center",
              padding: "40px",
              color: "var(--grey-100)",
            }}
          >
            Review not found
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div
        className="task-create__breadcrumb"
        style={{ justifyContent: "space-between" }}
      >
        <div style={{ display: "inline-flex", gap: "4px" }}>
          <Link
            to="/ai-review"
            className="crumb-dim"
            style={{
              textDecoration: "none",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            AI Review overview
          </Link>
          <span className="crumb-sep">›</span>
          <span className="crumb">Review Details</span>
        </div>
        <div style={{ display: "inline-flex", gap: "8px" }}>
          {aiReview?.status !== "Passed" && (
            <button
              type="button"
              className="btn create"
              style={{ background: "#10B981" }}
              onClick={() => handleApproveReview()}
            >
              Approve
            </button>
          )}
          {aiReview?.status !== "Rejected" && (
            <button
              type="button"
              className="btn create"
              style={{ background: "#EF4444" }}
              onClick={() => handleRejectReview()}
            >
              Reject
            </button>
          )}
        </div>
      </div>
      <div className="sop-layout">
        <div className="sop-card">
          <div className="sop-title-row">
            <div className="sop-title-left">
              <div className="sop-title-icon">
                <SopBoxIcon />
              </div>
              <div className="sop-title-text-wrapper">
                <h1 className="sop-title-text">{aiReview?.task?.title}</h1>
                <div className="sop-tags-row">
                  <span
                    className="sop-tag sop-tag--category"
                    style={{
                      background:
                        aiReview?.status === "Passed" ? "#D2FFF0" : "#FFDCDC",
                      color:
                        aiReview?.status === "Passed" ? "#10B981" : "#EF4444",
                      border: `1px solid ${
                        aiReview?.status === "Passed" ? "#90E8CB" : "#FD9F9F"
                      }`,
                    }}
                  >
                    {aiReview?.status}
                  </span>
                  <span
                    className="sop-tag2 sop-tag--difficulty"
                    style={{
                      color: "#3B82F6",
                      background: "#E1ECFF",
                      border: "1px solid #A4C2F2",
                    }}
                  >
                    {aiReview?.task?.category}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="sop-description-container">
            <h3 className="sop-section-title">Review</h3>
            <p className="sop-paragraph">{aiReview?.task?.description}</p>
          </div>

          <div className="task-details__content">
            <div
              style={{
                marginTop: "24px",
                borderRadius: "var(--radius-md)",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  width: "100%",
                  height: "478px",
                  background: "var(--border)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "var(--grey-120)",
                }}
              >
                <img
                  src={aiReview?.images[0]}
                  alt="Preview"
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              </div>
            </div>
          </div>
        </div>
        <div className="sop-sidebar-stack">
          <div className="sop-card">
            <h3 className="sop-section-title">Uploaded by</h3>
            <div className="sop-profile-row">
              <div className="sop-avatar">
                {aiReview?.owner?.name[0]?.toUpperCase()}
              </div>
              <div>
                <p className="sop-profile-name">{aiReview?.owner?.name}</p>
                <p className="sop-profile-role">{aiReview?.owner?.role}</p>
              </div>
            </div>
          </div>

          <div className="sop-card">
            <h3 className="sop-section-title">Review stats</h3>
            <div className="sop-info-list">
              <div style={{ display: "inline-flex" }}>
                <TotalStepsIcon style={{ marginRight: "8px" }} />
                <div className="sop-info-item">
                  <span className="sop-info-label">Total attempt</span>
                  <span className="sop-info-value">{aiReview?.attempts}</span>
                </div>
              </div>

              <div style={{ display: "inline-flex" }}>
                <DurationIcon style={{ marginRight: "8px" }} />
                <div className="sop-info-item">
                  <span className="sop-info-label">Recorded</span>
                  <span className="sop-info-value">
                    {aiReview?.recordedTime}
                    {" min"}
                  </span>
                </div>
              </div>

              <div style={{ display: "inline-flex" }}>
                <UserIcon style={{ marginRight: "8px" }} />
                <div className="sop-info-item">
                  <span className="sop-info-label">Uploaded on</span>
                  <span className="sop-info-value">
                    {new Date(aiReview?.createdAt)?.toLocaleDateString()}
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
