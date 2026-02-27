import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { fetchIssueRequestById, updateRequestIssue } from "../services/api";
import { formatDate } from "../components/ui/DateFormat";
import SopBoxIcon from "../assets/sopDetails/SopBoxIcon.svg?react";
import CheckIcon from "../assets/sopDetails/CheckIcon.svg?react";
import CheckDoneIcon from "../assets/sopDetails/CheckDoneIcon.svg?react";
import TotalStepsIcon from "../assets/sopDetails/TotalStepsIcon.svg?react";
import DurationIcon from "../assets/sopDetails/DurationIcon.svg?react";
import UserIcon from "../assets/sopDetails/UserIcon.svg?react";
import DropUpIcon from "../assets/sopDetails/DropUpIcon.svg?react";
import DropDownIcon from "../assets/sopDetails/DropDownIcon.svg?react";
import EditIconBlue from "../assets/requestDetails/EditIconBlue.svg?react";
import CheckSignIcon from "../assets/requestDetails/CheckSignIcon.svg?react";
import VoiceNotePlayer from "../components/VoiceNote";
import { formatToYMD } from "./ui/DateFormatYMD";
import { useLoader } from "./ui/LoaderContext";
import moment from "moment";
import { toast } from "sonner";

export default function IssueDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { setLoading } = useLoader();
  const [request, setRequest] = useState(null);
  const [openSections, setOpenSections] = useState([]);
  const [error, setError] = useState(false);

  const queryParams = new URLSearchParams(location.search);
  const tab = queryParams.get("tab"); // "admin" or "user"
  const duration = moment.duration(
    moment(request?.deadline?.endDate).diff(
      moment(request?.deadline?.startDate)
    )
  );

  const days = duration.days();
  const hours = duration.hours();
  const minutes = duration.minutes();
  const estimatedDuration = `${days}d ${hours}h ${minutes}m`;

  useEffect(() => {
    loadData();
  }, [id]);

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await fetchIssueRequestById(id);
      setRequest(res?.data);
    } catch (err) {
      console.error("Error loading issue:", err);
      setError;
    } finally {
      setLoading(false);
    }
  };
  const handleIsuueRejectOrApprove = async (status) => {
    try {
      setLoading(true);
      await updateRequestIssue(id, status);
      const response = await fetchIssueRequestById(id);
      setRequest(response?.data);
      toast.success("Issue Updated ");
    } catch (err) {
      console.error("Error Updating issue:", err);
      toast.error("Issue Not updated");
    } finally {
      setLoading(false);
    }
  };
  const handleEditDetails = () => navigate(`/issue/edit/${id}`);

  const toggleSection = (i) => {
    setOpenSections((prev) => ({
      ...prev,
      [i]: !prev[i],
    }));
  };
  const firstStepComplete = request?.sop?.steps[0]?.items?.map(
    (_, idx) => idx === 0
  );
  if (error) {
    return (
      <div className="task-create">
        <div className="task-create__panel">
          <div className="task-create__breadcrumb">
            <Link
              to={`/issue?tab=${tab}`}
              className="crumb-dim"
              style={{
                textDecoration: "none",
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              Back to Issue
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

  if (!request) {
    return (
      <div className="task-create">
        <div className="task-create__panel">
          <div className="task-create__breadcrumb">
            <Link
              to={`/issue?tab=${tab}`}
              className="crumb-dim"
              style={{
                textDecoration: "none",
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              Back to Issue
            </Link>
          </div>
          <div
            style={{
              textAlign: "center",
              padding: "40px",
              color: "var(--grey-100)",
            }}
          >
            Request not found
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
            to={`/issue?tab=${tab}`}
            className="crumb-dim"
            style={{
              textDecoration: "none",
            }}
          >
            Issue raised
          </Link>
          <span
            className="crumb-sep"
            style={{ padding: "8px", display: "inline-flex" }}
          >
            ›
          </span>

          <Link
            to={`/issue?tab=${tab}`}
            className="crumb-dim"
            style={{
              textDecoration: "none",
            }}
          >
            {request?.raisedBy === "admin"
              ? "Issue raised by admin"
              : "Issue raised by user"}
          </Link>
          <span
            className="crumb-sep"
            style={{ padding: "8px", display: "inline-flex" }}
          >
            ›
          </span>

          <span className="sop-breadcrumb__highlight">{request?.title}</span>
        </div>
        <div style={{ display: "inline-flex", gap: "20px" }}>
          {request?.raisedBy === "admin" && (
            <button
              type="button"
              className="btn create"
              onClick={() => handleEditDetails(id)}
              style={{
                background: "#F6F8FA",
                color: "#5240D6",
                borderColor: "#5240D6",
              }}
            >
              <EditIconBlue />
              Edit
            </button>
          )}
          {request?.status !== "Completed" && (
            <button
              type="button"
              className="btn create"
              onClick={() => handleIsuueRejectOrApprove("Completed")}
            >
              <CheckSignIcon />
              Resolve
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
                <h1 className="sop-title-text">{request?.title}</h1>
                <div className="sop-tags-row">
                  <span className={`sop-tag sop-tag--${request?.status}`}>
                    {request?.status}
                  </span>
                  {request?.raisedBy === "admin" && (
                    <span className={`sop-tag2 sop-tag--${request?.priority}`}>
                      {request?.priority}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="sop-description-container">
            <h3 className="sop-section-title">Description</h3>
            <p className="sop-paragraph">{request?.description}</p>
          </div>

          {request?.voiceNote && (
            <div className="sop-audio-container">
              <h3 style={{ fontSize: "16px", color: "#0F0F0F" }}>
                Voice note by admin
              </h3>
              <VoiceNotePlayer src={request?.voiceNote || " "} />
            </div>
          )}
          {request?.raisedBy === "admin" && request?.title && request?.sop?.steps?.length > 0 && (
            <div className="sop-steps-wrapper">
              <h3 className="sop-section-title">{request?.title}</h3>
              {request?.sop?.steps?.map((step, index) => (
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
                        {openSections[index] ? (
                          <DropUpIcon style={{ marginLeft: "8px" }} />
                        ) : (
                          <DropDownIcon style={{ marginLeft: "8px" }} />
                        )}
                      </span>
                    </span>
                  </div>
                  {openSections[index] && (
                    <div>
                      {step?.items?.map((item, itemIndex) => {
                        const done =
                          index === 0
                            ? !!firstStepComplete?.[itemIndex]
                            : false;
                        return (
                          <div
                            key={itemIndex}
                            className={`sop-checklist-item${done ? " sop-checklist-item--done" : ""
                              }`}
                          >
                            <div
                              className={`sop-checklist-icon${done ? " sop-checklist-icon--done" : ""
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
          )}
        </div>

        <div className="sop-sidebar-stack">
          <div className="sop-card">
            <h3 className="sop-section-title">
              {request?.raisedBy === "admin" ? "Raised to" : "Raised by"}
            </h3>
            <div className="sop-profile-row">
              <div className="sop-avatar">
                {request?.assignTo?.[0]?.name[0]?.toUpperCase() ||
                  request?.createdBy?.name[0]?.toUpperCase()}
              </div>
              <div>
                <p className="sop-profile-name">
                  {request?.assignTo?.[0]?.name ||
                    request?.createdBy?.name}
                </p>
                <p className="sop-profile-role">
                  {request?.assignTo?.[0]?.role ||
                    request?.createdBy?.role}
                </p>
              </div>
            </div>
          </div>

          <div className="sop-card">
            <h3 className="sop-section-title">Issue details</h3>
            <div className="sop-info-list">
              <div style={{ display: "inline-flex" }}>
                <TotalStepsIcon style={{ marginRight: "8px" }} />
                <div className="sop-info-item">
                  <span className="sop-info-label">Due date</span>
                  <span className="sop-info-value">
                    {request?.deadline?.endDate
                      ? formatDate(request.deadline.endDate)
                      : " ----"}
                  </span>
                </div>
              </div>

              <div style={{ display: "inline-flex" }}>
                <DurationIcon style={{ marginRight: "8px" }} />
                <div className="sop-info-item">
                  <span className="sop-info-label">Estimated Duration</span>
                  <span className="sop-info-value">
                    {request?.deadline?.endDate ? estimatedDuration : " ----"}
                  </span>
                </div>
              </div>

              <div style={{ display: "inline-flex" }}>
                <UserIcon style={{ marginRight: "8px" }} />
                <div className="sop-info-item">
                  <span className="sop-info-label">Created</span>
                  <span className="sop-info-value">
                    {formatToYMD(request?.createdAt)}
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
