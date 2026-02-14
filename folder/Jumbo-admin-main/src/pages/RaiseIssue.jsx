import { useState, useRef, useEffect } from "react";
import { useNavigate, Link, useParams } from "react-router-dom";
import { ChevronDown } from "lucide-react";
import VoiceRecorder from "../components/VoiceRecorder";
import {
  allSopApi,
  createRequestIssue,
  editRequestIssue,
  fetchEmployees,
  fetchIssueRequestById,
} from "../services/api";
import { toast } from "sonner";
import { DateRange } from "react-date-range";
import TimePicker from "react-time-picker";
import dayjs from "dayjs";
import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";
import "react-time-picker/dist/TimePicker.css";
import "react-clock/dist/Clock.css";

export default function RaiseIssue() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = Boolean(id);
  const [formData, setFormData] = useState({
    title: "",
    restaurantId: "",
    description: "",
    assignTo: "",
    priority: "",
    deadline: {},
    sop: "",
    voiceNote: null,
  });
  const [range, setRange] = useState([
    {
      startDate: new Date(),
      endDate: new Date(),
      key: "selection",
    },
  ]);
  const [calendarOpen, setCalendarOpen] = useState(false);
  const buildDateTime = (date, time) => {
    const [hour, minute] = time?.split(":") || "00:00".split(":");
    return dayjs(date)
      .hour(Number(hour))
      .minute(Number(minute))
      .second(0)
      .toDate();
  };

  const [startTime, setStartTime] = useState(
    new Date().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }),
  ); // default start time
  const [endTime, setEndTime] = useState(
    new Date().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }),
  );

  const handleRangeChange = (item) => {
    const { startDate, endDate } = item.selection;
    setRange([item.selection]);
    setFormData((prev) => ({
      ...prev,
      deadline: {
        startDate: buildDateTime(startDate, startTime),
        endDate: buildDateTime(endDate, endTime),
      },
    }));

    // Close calendar after selecting the second date
    if (startDate && endDate && startDate.getTime() !== endDate.getTime()) {
      setCalendarOpen(false);
    }
  };

  useEffect(() => {
    const startDate = range?.[0]?.startDate;
    const endDate = range?.[0]?.endDate;

    if (!startDate || !endDate || !startTime || !endTime) return;

    setFormData((prev) => ({
      ...prev,
      deadline: {
        startDate: buildDateTime(startDate, startTime),
        endDate: buildDateTime(endDate, endTime),
      },
    }));
  }, [startTime, endTime]);

  const [dropdowns, setDropdowns] = useState({
    assignTo: false,
    priority: false,
    sop: false,
  });
  const [employees, setEmployees] = useState([]);
  const [sops, setSops] = useState([]);
  const [audioBlob, setAudioBlob] = useState(null);
  const [audioPreviewURL, setAudioPreviewURL] = useState(null);
  const [errors, setErrors] = useState({});
  const dropdownRefs = {
    assignTo: useRef(null),
    priority: useRef(null),
    sop: useRef(null),
  };

  const priorities = [
    { value: "High", label: "High", class: "error" },
    { value: "Medium", label: "Medium", class: "warning" },
    { value: "Low", label: "Low", class: "info" },
  ];

  useEffect(() => {
    if (isEditMode) {
      fetchIssueRequestById(id).then((res) => {
        const request = res?.data;
        setFormData({
          title: request?.title,
          description: request?.description,
          priority: request?.priority,
          assignTo: request?.assignTo?.[0]?._id,
          sop: request.sop?._id,
          deadline: request.deadline || [],
        });
        if (request.deadline.startDate && request.deadline.endDate) {
          setRange([
            {
              startDate: new Date(request.deadline.startDate),
              endDate: new Date(request.deadline.endDate),
              key: "selection",
            },
          ]);
          setStartTime(dayjs(request.deadline.startDate).format("HH:mm"));
          setEndTime(dayjs(request.deadline.endDate).format("HH:mm"));
        }

        if (request?.voiceNote) setAudioPreviewURL(request?.voiceNote);
      });
    }
  }, [id]);

  useEffect(() => {
    loademployee();
    loadsop();
    const handleClickOutside = (e) => {
      Object.keys(dropdownRefs).forEach((key) => {
        if (
          dropdownRefs[key].current &&
          !dropdownRefs[key].current.contains(e.target)
        ) {
          setDropdowns((prev) => ({ ...prev, [key]: false }));
        }
      });
      if (
        calendarRef.current &&
        !calendarRef.current.contains(e.target) &&
        !inputRef.current.contains(e.target)
      ) {
        setCalendarOpen(false);
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const handleSelect = (field, value) => {
    handleInputChange(field, value);
    setDropdowns((prev) => ({ ...prev, [field]: false }));
  };

  const loadsop = async () => {
    try {
      const sops = await allSopApi();
      if (sops?.data?.length > 0) {
        setSops(sops?.data);
      }
    } catch (error) {
      console.error(error);
    }
  };
  const loademployee = async () => {
    try {
      const employees = await fetchEmployees();
      if (employees?.data?.length > 0) {
        setEmployees(employees?.data);
      }
    } catch (error) {
      console.error(error);
    }
  };
  const calendarRef = useRef(null);
  const inputRef = useRef(null);

  const validateForm = () => {
    const newErrors = {};
    if (!formData.title.trim()) newErrors.title = "Issue title is required";
    if (!formData.description.trim())
      newErrors.description = "Description is required";
    if (!formData.assignTo) newErrors.assignTo = "Please assign to an employee";
    if (!formData.priority) newErrors.priority = "Please select a priority";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      const formPayload = new FormData();

      formPayload.append("title", formData.title);

      formPayload.append("restaurantId", formData.restaurantId);
      formPayload.append("description", formData.description);
      formPayload.append("raisedBy", "admin");
      formPayload.append("assignTo", formData.assignTo);
      formPayload.append("deadline[startDate]", formData.deadline.startDate);
      formPayload.append("deadline[endDate]", formData.deadline.endDate);
      formPayload.append("requestType", "Issue");
      formPayload.append("category", "Cleaning");
      formPayload.append("priority", formData.priority);
      formData.sop && formPayload.append("sop", formData.sop);
      formPayload.append("status", "Pending");

      if (audioBlob) {
        formPayload.append("voiceNote", audioBlob, "voiceNote.mp3");
      } else if (!audioPreviewURL && isEditMode) {
        formPayload.append("voiceNote", "");
      }

      if (isEditMode) {
        await editRequestIssue(id, formPayload);
        toast.success("Issue Updated");
      } else {
        await createRequestIssue(formPayload);
        toast.success("Issue Created Succesfully!!!");
      }
      navigate("/issue");
    } catch (error) {
      console.error("Error submitting  Issue:", error);
      toast.error(error?.response?.data?.error || "Something Went Wrong!!!");
    }
  };

  return (
    <div className="task-create">
      <div className="task-create__panel">
        <div className="task-create__breadcrumb">
          <Link
            to={"/issue"}
            className="crumb-dim"
            style={{
              textDecoration: "none",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            Issue raised
          </Link>
          <span className="crumb-sep">›</span>
          <span className="crumb">
            {isEditMode === true ? "Edit issue" : "Raise a new issue"}
          </span>
        </div>

        <form className="task-create__form" onSubmit={handleSubmit}>
          <div className="form-field">
            <label className="label-lg">Issue Title</label>
            <input
              className="input"
              placeholder="e.g. Broken equipment, Maintenance required"
              value={formData.title}
              onChange={(e) => handleInputChange("title", e.target.value)}
            />
            {errors.title && (
              <span
                style={{
                  color: "var(--error)",
                  fontSize: "14px",
                  marginTop: "4px",
                }}
              >
                {errors.title}
              </span>
            )}
          </div>

          <div className="form-field">
            <label className="label-lg">Description</label>
            <textarea
              className="textarea"
              placeholder="Provide detailed description of the issue"
              rows={4}
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
            />
            {errors.description && (
              <span
                style={{
                  color: "var(--error)",
                  fontSize: "14px",
                  marginTop: "4px",
                }}
              >
                {errors.description}
              </span>
            )}
          </div>

          <div className="form-row">
            <div className="form-col" ref={dropdownRefs.assignTo}>
              <label className="label-lg">Assign to</label>
              <div
                style={{
                  position: "relative",
                  width: "100%",
                  display: "inline-block",
                }}
              >
                <select
                  className="input"
                  value={formData.assignTo}
                  onChange={(e) => handleSelect("assignTo", e.target.value)}
                  style={{
                    appearance: "none",
                    WebkitAppearance: "none",
                    MozAppearance: "none",
                    paddingRight: "5rem",
                  }}
                >
                  <option>Select Employee</option>
                  {employees
                    ?.filter((employees) => employees?.position === "employee")
                    ?.map((emp) => (
                      <option
                        key={emp?._id}
                        value={emp?._id}
                        style={{
                          fontSize: "1.5rem",
                          fontWeight: 500,
                          color: "var(--charcoal)",
                        }}
                      >
                        {emp?.name}
                      </option>
                    ))}
                </select>
                <ChevronDown
                  size={18}
                  style={{
                    position: "absolute",
                    top: "30%",
                    right: "1rem",
                    color: "var(--grey-120)",
                    flexShrink: 0,
                    transition: "transform 0.2s",
                    transform: dropdowns.assignTo
                      ? "rotate(180deg)"
                      : "rotate(0deg)",
                  }}
                />
              </div>

              {errors.assignTo && (
                <span
                  style={{
                    color: "var(--error)",
                    fontSize: "14px",
                    marginTop: "4px",
                  }}
                >
                  {errors.assignTo}
                </span>
              )}
            </div>

            <div className="form-col" ref={dropdownRefs.priority}>
              <label className="label-lg">Priority</label>
              <div
                style={{
                  position: "relative",
                  width: "100%",
                  display: "inline-block",
                }}
              >
                <select
                  className="input"
                  value={formData.priority}
                  onChange={(e) => handleSelect("priority", e.target.value)}
                  style={{
                    appearance: "none", // remove native arrow
                    WebkitAppearance: "none",
                    MozAppearance: "none",
                    paddingRight: "5rem", // space for custom arrow
                  }}
                >
                  <option>Select </option>
                  {priorities.map((pri) => (
                    <option
                      key={pri.value}
                      value={pri.value}
                      style={{
                        fontSize: "1.5rem",
                        fontWeight: 500,
                        color: "var(--charcoal)",
                      }}
                    >
                      {pri.value}
                    </option>
                  ))}
                </select>
                <ChevronDown
                  size={18}
                  style={{
                    position: "absolute",
                    top: "30%",
                    right: "1rem",
                    color: "var(--grey-120)",
                    flexShrink: 0,
                    transition: "transform 0.2s",
                    transform: dropdowns.priority
                      ? "rotate(180deg)"
                      : "rotate(0deg)",
                  }}
                />
              </div>

              {errors.priority && (
                <span
                  style={{
                    color: "var(--error)",
                    fontSize: "14px",
                    marginTop: "4px",
                  }}
                >
                  {errors.priority}
                </span>
              )}
            </div>
          </div>
          <div className="form-row">
            <div className="form-col" ref={dropdownRefs.deadline}>
              <label className="label-lg">Deadline</label>
              <input
                className="input"
                ref={inputRef}
                style={{
                  cursor: "pointer",
                  position: "relative",
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  fontFamily: "inherit",
                  color: "var(--grey-120)",
                }}
                type="text"
                readOnly
                onClick={() => setCalendarOpen(true)}
                value={
                  formData?.deadline?.startDate
                    ? `${dayjs(range[0].startDate).format(
                        "YYYY-MM-DD",
                      )} at ${startTime}   To   ${dayjs(
                        range[0].endDate,
                      ).format("YYYY-MM-DD")} at ${endTime}`
                    : ""
                }
                placeholder="Pick a deadline"
              />

              {calendarOpen && (
                <div
                  ref={calendarRef}
                  style={{
                    position: "absolute",
                    top: "40px",
                    zIndex: 10,
                    border: "1px solid #ddd",
                    borderRadius: "8px",
                    background: "#fff",
                    display: "flex",
                    transform: "translateY(-40px)",
                    gap: "20px", // space between calendar and time pickers
                    padding: "10px",
                  }}
                >
                  <DateRange
                    ranges={range}
                    onChange={handleRangeChange}
                    moveRangeOnFirstSelection={false}
                    minDate={new Date()}
                  />
                  {/* Time Pickers */}
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      marginTop: 10,
                      gap: "10px",
                    }}
                  >
                    <div>
                      <label>Start Time</label>
                      <TimePicker
                        onChange={setStartTime}
                        value={startTime}
                        disableClock
                        clearIcon={null}
                      />
                    </div>

                    <div>
                      <label>End Time</label>
                      <TimePicker
                        onChange={setEndTime}
                        value={endTime}
                        disableClock
                        clearIcon={null}
                      />
                    </div>
                  </div>
                </div>
              )}

              {errors.deadline && (
                <span
                  style={{
                    color: "var(--error)",
                    fontSize: "14px",
                    marginTop: "4px",
                  }}
                >
                  {errors.deadline}
                </span>
              )}
            </div>
            <VoiceRecorder
              label="Voice Note"
              onAudioChange={(blob) => {
                setAudioBlob(blob);

                // Convert blob → local preview URL
                if (blob) {
                  const url = URL.createObjectURL(blob);
                  setAudioPreviewURL(url);
                } else {
                  setAudioPreviewURL(null);
                }
              }}
              initialAudioURL={audioPreviewURL} // This must be a URL always
            />
          </div>

          <div className="form-col">
            <label className="label-lg">Attach SOP (optional)</label>
            <div
              style={{
                position: "relative",
                width: "100%",
                display: "inline-block",
              }}
            >
              <select
                className="input"
                value={formData.sop}
                onChange={(e) => handleSelect("sop", e.target.value)}
                style={{
                  appearance: "none",
                }}
              >
                <option>Select Sop</option>

                {sops
                  ?.filter((sop) => sop?.status === "Active")
                  ?.map((sop) => (
                    <option
                      key={sop?._id}
                      className="filter-option"
                      value={sop?._id}
                    >
                      {sop?.title}
                    </option>
                  ))}
              </select>
              <ChevronDown
                size={18}
                style={{
                  position: "absolute",
                  top: "35%",
                  right: "1rem",
                  color: "var(--grey-120)",
                  flexShrink: 0,
                  transition: "transform 0.2s",
                  transform: dropdowns.assignTo
                    ? "rotate(180deg)"
                    : "rotate(0deg)",
                }}
              />
            </div>
          </div>

          <button type="submit" className="btn create block">
            {isEditMode === true ? "Update issue" : "Raise new issue"}
          </button>
        </form>
      </div>
    </div>
  );
}
