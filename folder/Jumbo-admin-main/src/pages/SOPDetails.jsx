import { useState, useEffect } from "react";
import { useParams, useNavigate, Link,useLocation } from "react-router-dom";
import { fetchSOPById } from "../services/api";
import VoiceNotePlayer from "../components/VoiceNote";
import SopBoxIcon from "../assets/sopDetails/SopBoxIcon.svg?react";
import CheckIcon from "../assets/sopDetails/CheckIcon.svg?react";
import CheckDoneIcon from "../assets/sopDetails/CheckDoneIcon.svg?react";
import TotalStepsIcon from "../assets/sopDetails/TotalStepsIcon.svg?react";
import DurationIcon from "../assets/sopDetails/DurationIcon.svg?react";
import UserIcon from "../assets/sopDetails/UserIcon.svg?react";
import DropUpIcon from "../assets/sopDetails/DropUpIcon.svg?react";
import DropDownIcon from "../assets/sopDetails/DropDownIcon.svg?react";
import {
  SquarePen
} from "lucide-react";

export default function SOPDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
   const previousTab = location.state?.tab || "cleaning";
  const [sop, setSop] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openSections, setOpenSections] = useState({});

  const toggleSection = (index) => {
    setOpenSections((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  useEffect(() => {
    const loadSop = async () => {
      try {
        const res = await fetchSOPById(id);
        setSop(res?.data);
      } catch (err) {
        setError("Failed to load SOP details");
        console.error("Error loading SOP:", err);
      } finally {
        setLoading(false);
      }
    };

    loadSop();
  }, [id]);

  const handleEditDetails = (id) => {
    navigate(`/sop/new/${id}`,
      {state:{tab:previousTab}}
    );
  };

  const firstStepComplete = sop?.steps[0]?.items?.map((_, idx) => idx === 0);
  if (loading) {
    return (
      <div className="task-create">
        <div className="task-create__panel">
          <div
            style={{
              textAlign: "center",
              padding: "40px",
              color: "var(--grey-100)",
            }}
          >
            Loading SOP details...
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="task-create">
        <div className="task-create__panel">
          <div className="task-create__breadcrumb">
            <Link
              to="/sop"
              className="crumb-dim"
              style={{
                textDecoration: "none",
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              Back to SOPs
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

  if (!sop) {
    return (
      <div className="task-create">
        <div className="task-create__panel">
          <div className="task-create__breadcrumb">
            <Link
              to="/sop"
              className="crumb-dim"
              style={{
                textDecoration: "none",
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              Back to SOPs
            </Link>
          </div>
          <div
            style={{
              textAlign: "center",
              padding: "40px",
              color: "var(--grey-100)",
            }}
          >
            SOP not found
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
            // to="/sop"  
            // state={{tab:previousTab}}
            to="/sop"
                state={{ tab: previousTab }}
            className="crumb-dim" 
            style={{
              textDecoration: "none",
            }}
          >
            SOP overview
          </Link>
          <span className="crumb-sep" 
          style={{padding:"8px", display :"inline-flex"}}>›</span>
          <span className="sop-breadcrumb__highlight">{sop?.title}</span>
        </div>
        <button
          type="button"
          className="btn create"
          onClick={() => handleEditDetails(id)}
        >
           <SquarePen size={18} color="white" strokeWidth={2} />
          Edit
        </button>
      </div>

      <div className="sop-layout">
        <div className="sop-card">
          <div className="sop-title-row">
            <div className="sop-title-left">
              <div className="sop-title-icon">
                <SopBoxIcon />
              </div>
              <div className="sop-title-text-wrapper">
                <h1 className="sop-title-text">{sop?.title}</h1>
                <div className="sop-tags-row">
                  <span className="sop-tag sop-tag--category">
                    {sop?.category}
                  </span>
                  <span className="sop-tag2 sop-tag--difficulty">
                    {sop?.difficultyLevel}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="sop-description-container">
            <h3 className="sop-section-title">Description</h3>
            <p className="sop-paragraph">{sop?.description}</p>
          </div>

          {sop?.voiceNote && (
            <div className="sop-audio-container">
              <h3 style={{ fontSize: "16px", color: "#0F0F0F" }}>
                Voice note by admin
              </h3>
              <VoiceNotePlayer src={sop?.voiceNote ||" "} />
            </div>
          )}

          <div className="sop-steps-wrapper">
            <h3 className="sop-section-title">SOP steps</h3>
            {sop?.steps?.map((step, index) => (
              <div key={step?.id} className="sop-step-section">
                <div
                  className="sop-step-header"
                  onClick={() => toggleSection(index)}
                  style={{ cursor: "pointer" }}
                >
                  <h4 className="sop-step-title">{step?.name}</h4>
                  <span className="sop-step-count">
                    {step?.items?.length} step
                    {step?.items?.length !== 1 ? "s" : ""}
                    <span style={{ fontSize: "16px" }}>
                      {openSections[index] ? <DropUpIcon style={{ marginLeft: "8px" }}  /> : <DropDownIcon style={{ marginLeft: "8px" }}/>}
                    </span>
                  </span>
                </div>
                {openSections[index] && (
                  <div>
                    {step?.items?.map((item, itemIndex) => {
                      const done =
                        index === 0 ? !!firstStepComplete?.[itemIndex] : false;
                      return (
                        <div
                          key={itemIndex}
                          className={`sop-checklist-item${
                            done ? " sop-checklist-item--done" : ""
                          }`}
                        >
                          <div
                            className={`sop-checklist-icon${
                              done ? " sop-checklist-icon--done" : ""
                            }`}
                          >
                            {done ? <CheckDoneIcon /> : <CheckIcon />}
                          </div>
                          <p className="sop-checklist-text">{item}</p>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="sop-sidebar-stack">
          <div className="sop-card">
            <h3 className="sop-section-title">Created by</h3>
            <div className="sop-profile-row">
              <div className="sop-avatar">
                {sop?.owner?.name[0]?.toUpperCase()}
              </div>
              <div>
                <p className="sop-profile-name">{sop?.owner?.name}</p>
                <p className="sop-profile-role">{sop?.owner?.role}</p>
              </div>
            </div>
          </div>

          <div className="sop-card">
            <h3 className="sop-section-title">SOP stats</h3>
            <div className="sop-info-list">
              <div style={{ display: "inline-flex" }}>
                <TotalStepsIcon style={{ marginRight: "8px" }} />
                <div className="sop-info-item">
                  <span className="sop-info-label">Total steps</span>
                  <span className="sop-info-value">{sop?.steps?.length}</span>
                </div>
              </div>

              <div style={{ display: "inline-flex" }}>
                <DurationIcon style={{ marginRight: "8px" }} />
                <div className="sop-info-item">
                  <span className="sop-info-label">Duration</span>
                  <span className="sop-info-value">{sop?.estimatedTime}</span>
                </div>
              </div>

              <div style={{ display: "inline-flex" }}>
                <UserIcon  style={{ marginRight: "8px" }}/>
                <div className="sop-info-item">
                  <span className="sop-info-label">Created</span>
                  <span className="sop-info-value">
                    {new Date(sop?.createdAt)?.toLocaleDateString()}
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
