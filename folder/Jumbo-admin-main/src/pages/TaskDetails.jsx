import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { fetchTaskById, updateTask } from "../services/api";
import VoiceNotePlayer from "../components/VoiceNote";
import SopBoxIcon from "../assets/sopDetails/SopBoxIcon.svg?react";
import CheckIcon from "../assets/sopDetails/CheckIcon.svg?react";
import CheckDoneIcon from "../assets/sopDetails/CheckDoneIcon.svg?react";
import TotalStepsIcon from "../assets/sopDetails/TotalStepsIcon.svg?react";
import DurationIcon from "../assets/sopDetails/DurationIcon.svg?react";
import UserIcon from "../assets/sopDetails/UserIcon.svg?react";
import DropUpIcon from "../assets/sopDetails/DropUpIcon.svg?react";
import DropDownIcon from "../assets/sopDetails/DropDownIcon.svg?react";
import moment from "moment";

import {

  Check,
  SquarePen
} from "lucide-react";
import { toast } from "sonner";

export default function TaskDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openSections, setOpenSections] = useState({});

  const toggleSection = (index) => {
    setOpenSections((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };
const duration = moment.duration(
moment(task?.deadline?.endDate).diff(moment(task?.deadline?.startDate))
);

const days = duration.days();
const hours = duration.hours();
const minutes = duration.minutes();
const estimatedDuration = `${days}d ${hours}h ${minutes}m`;


  useEffect(() => {
    const loadTask = async () => {
      try {
        const taskData = await fetchTaskById(id);
        setTask(taskData);
      } catch (err) {
        setError("Failed to load task details");
        console.error("Error loading task:", err);
      } finally {
        setLoading(false);
      }
    };

    loadTask();
  }, [id]);

  const handleEditDetails = (id) => {
    navigate(`/task/edit/${id}`);
  };

  const handlestatus = async (id) => {
    try {
      const fd = new FormData();
      fd.append("status", "Completed");
      await updateTask(id, fd);
      toast.success("Status Updated");

      navigate("/task");

    }
    catch {
      console.error("error to update status", error);
      alert("failed to update status");
    }

  }

  const firstStepComplete = task?.sop?.steps[0]?.items?.map(
    (_, idx) => idx === 0
  );
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
            Loading Task details...
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
              to="/task"
              className="crumb-dim"
              style={{
                textDecoration: "none",
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              Back to Tasks
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

  if (!task) {
    return (
      <div className="task-create">
        <div className="task-create__panel">
          <div className="task-create__breadcrumb">
            <Link
              to="/task"
              className="crumb-dim"
              style={{
                textDecoration: "none",
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              Back to Tasks
            </Link>
          </div>
          <div
            style={{
              textAlign: "center",
              padding: "40px",
              color: "var(--grey-100)",
            }}
          >
            Task not found
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="task-header">
        <div className="task-title">
          <Link
            to="/task"
            className="crumb-dim"
            style={{
              textDecoration: "none",
            }}
          >
            Task overview
          </Link>
          <span className="crumb-dim"
            style={{ padding: "4px", display: "inline-flex" }}>›</span>
          <span className="sop-breadcrumb__highlight">{task?.title}</span>
        </div>
        <div className="task-actions">
          {(task?.status !== "Completed" &&

            <button
              type="button"

              className="btn create" style={{ backgroundColor: "transparent", borderColor: "blue", color: "blue" }}

              onClick={() => handlestatus(id)}
            >
              <Check size={18} color="blue" strokeWidth={2} />
              Complete
            </button>
          )}
          <button
            type="button"
            className="btn create"
            onClick={() => handleEditDetails(id)}
          >
            <SquarePen size={18} color="white" strokeWidth={2} />
            Edit Task
          </button>
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
                <h1 className="sop-title-text">{task?.title}</h1>
                <div className="sop-tags-row">
                  <span className={`sop-tag sop-tag--${task?.status}`}>
                    {task?.status}
                  </span>
                  <span className="sop-tag sop-tag--category">
                    {task?.category}
                  </span>
                  <span className="sop-tag2 sop-tag--difficulty">
                    {task?.priority}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="sop-description-container">
            <h3 className="sop-section-title">Description</h3>
            <p className="sop-paragraph">{task?.description}</p>
          </div>

          {task?.voiceNote && (
            <div className="sop-audio-container">
              <h3 style={{ fontSize: "16px", color: "#181515ff" }}>
                Voice note by admin
              </h3>
              <VoiceNotePlayer src={task?.voiceNote} />
            </div>
          )}

          {task?.sop && task?.sop?.steps?.length > 0 && (
          <div className="sop-steps-wrapper">
            <h3 className="sop-section-title">{task?.sop?.title}</h3>
            {task?.sop?.steps?.map((step, index) => (
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
                        index === 0 ? !!firstStepComplete?.[itemIndex] : false;

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
          {/* <div className="sop-card">
            <h3 className="sop-section-title">Assign To</h3>
            <div className="sop-profile-row">
              <div className="sop-avatar">
                {task?.assignTo?.[0]?.name[0]?.toU  pperCase()}
              </div>
              <div>
                <p className="sop-profile-name">{task?.assignTo?.[0]?.name}</p>
                <p className="sop-profile-role">{task?.asignTo?.[0]?.role}</p>
              </div>
            </div>
          </div> */}
           <div className="sop-card">
            <h3 className="sop-section-title">Assign To</h3>
            <div className="sop-profile-row">
              <div className="sop-avatar">
                {task?.assignTo?.[0]?.name[0]?.toUpperCase()}
              </div>
              <div>
                <p className="sop-profile-name">{task?.assignTo?.[0]?.name}</p>
                <p className="sop-profile-role">{task?.assignTo?.[0]?.jobRole||task?.assignTo?.[0]?.position}</p>
              </div>
            </div>
          </div>

          <div className="sop-card">
            <h3 className="sop-section-title">Task Details</h3>
            <div className="sop-info-list">
              <div style={{ display: "inline-flex" }}>
                <TotalStepsIcon style={{ marginRight: "8px" }} />
                <div className="sop-info-item">
                  <span className="sop-info-label">Due date</span>
                  <span className="sop-info-value"> {task?.deadline?.endDate
                    ? moment(task.deadline?.endDate).format(
                      "YYYY-MM-DD [at] h:mm A"
                    )
                    : ""}</span>
                </div>
              </div>

              <div style={{ display: "inline-flex" }}>
                <DurationIcon style={{ marginRight: "8px" }} />
                <div className="sop-info-item">
                  <span className="sop-info-label">Estimated Duration</span>
                  <span className="sop-info-value">{estimatedDuration}</span>
                </div>
              </div>

              <div style={{ display: "inline-flex" }}>
                <UserIcon style={{ marginRight: "8px" }} />
                <div className="sop-info-item">
                  <span className="sop-info-label">Created</span>
                  <span className="sop-info-value">
                    {/* {new Date(task?.createdAt)?.toLocaleDateString()} */}
                     {task?.createdAt
                    ? moment(task?.createdAt).format(
                      "YYYY-MM-DD"
                    )
                    : ""}
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
