import { useState, useRef, useEffect } from "react";
import { useNavigate, Link, useParams } from "react-router-dom";
import {
  fetchEmployees,
  fetchTaskById,
  allSopApi,
  updateTask,
  createTask,
} from "../services/api";
import { toast } from "sonner";
import { DateRange } from "react-date-range";
import TimePicker from "react-time-picker";
import dayjs from "dayjs";
import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";
import "react-time-picker/dist/TimePicker.css";
import "react-clock/dist/Clock.css";
import {
  Mic,
  MicOff,
  Plus,
  ChevronDown,
  Trash2,
} from "lucide-react";

export default function CreateTask() {
  const { id } = useParams();
  const isEditMode = Boolean(id);
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: "",
    restaurantID: "",
    description: "",
    assignTo: "",
    category: "",
    priority: "",
    deadline: {},
    voiceNote: "",
    sop: null,
    status: "",
    aiReview: false,
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
    const [hour, minute] = time.split(":");
    return dayjs(date)
      .hour(Number(hour))
      .minute(Number(minute))
      .second(0)
      .toDate();
  };

  const [startTime, setStartTime] = useState(
    new Date().toLocaleTimeString([],
      { hour: '2-digit', minute: '2-digit', hour12: false }));
  const [endTime, setEndTime] = useState(
    new Date().toLocaleTimeString([],
      { hour: '2-digit', minute: '2-digit', hour12: false })); // default start time 


  const handleRangeChange = (item) => {
    const { startDate, endDate } = item.selection;
    setRange([item.selection]);
    setFormData((prev) => ({
      ...prev,
      deadline: {
        startDate: buildDateTime(startDate, startTime),
        endDate: buildDateTime(endDate, endTime),
      },
    })
    );

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

  const [employees, setEmployees] = useState();
  const [sops, setSops] = useState();
  const [dropdowns, setDropdowns] = useState({
    assignTo: false,
    category: false,
    deadline: false,
    sop: false,
    priority: false,
  });

  const [isRecording, setIsRecording] = useState(false);
  const [errors, setErrors] = useState({});
  const dropdownRefs = {
    assignTo: useRef(null),
    category: useRef(null),
    deadline: useRef(null),
    sop: useRef(null),
    priority: useRef(null),

  };
  const calendarRef = useRef(null);
  const inputRef = useRef(null);

  const [audioURL, setAudioURL] = useState(null);
  const [audioBlob, setAudioBlob] = useState(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const [recordingTime, setRecordingTime] = useState([]);
  const timerRef = useRef(null);

  const categories = ["Cleaning", "Kitchen", "Purchase", "Others"];
  const priorities = ["Low", "Medium", "High"];

  useEffect(() => {
    if (isEditMode) {
      fetchTaskById(id).then((res) => {
        const task = res;

        setFormData({
          title: task?.title,
          description: task?.description,
          category: task?.category,
          priority: task?.priority,
          assignTo: task?.assignTo?.[0]?._id,
          sop: task.sop?._id,
          aiReview: task.aiReview,

          deadline: task.deadline || [],
        });
        if (task.deadline.startDate && task.deadline.endDate) {
          setRange([
            {
              startDate: new Date(task.deadline.startDate),
              endDate: new Date(task.deadline.endDate),
              key: "selection",
            },
          ]);
          setStartTime(dayjs(task.deadline.startDate).format("HH:mm"));
          setEndTime(dayjs(task.deadline.endDate).format("HH:mm"));
        }

        if (task.voiceNote) setAudioURL(task.voiceNote);
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
      if (calendarRef.current && !calendarRef.current.contains(e.target) && !inputRef.current.contains(e.target)) {
        setCalendarOpen(false);
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

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
  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };
  const handleVoiceNote = async () => {
    if (isRecording) {
      mediaRecorderRef.current.stop();
      clearInterval(timerRef.current);
      setIsRecording(false);
      setRecordingTime(0);

    } else {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: true,
        });
        const mediaRecorder = new MediaRecorder(stream);
        mediaRecorderRef.current = mediaRecorder;
        audioChunksRef.current = [];

        mediaRecorder.ondataavailable = (event) => {
          if (event.data.size > 0) {
            audioChunksRef.current.push(event.data);
          }
        };

        mediaRecorder.onstop = async () => {
          const audioBlob = new Blob(audioChunksRef.current, {
            type: "audio/webm",
          });
          const audioUrl = URL.createObjectURL(audioBlob);
          setAudioURL(audioUrl);
          setAudioBlob(audioBlob);
        };
        setRecordingTime(0);
        timerRef.current = setInterval(() => {
          setRecordingTime((prev) => prev + 1);
        }, 1000);

        mediaRecorder.start();
        setIsRecording(true);
          } catch (error) {
        console.error("Microphone access denied:", error);
        alert("Please allow microphone access to record voice notes.");
      }
    }
  };

  const handleDeleteVoiceNote = () => {
    setAudioURL(null);
    handleInputChange("voiceNote", ""); // clear from your form data if needed
  };


  const validateForm = () => {
    const newErrors = {};
    if (!formData.title.trim()) newErrors.title = "Task title is required";
    if (!formData.description.trim())
      newErrors.description = "Description is required";
    if (!formData.assignTo) newErrors.assignTo = "Please assign to an employee";
    if (!formData.category) newErrors.category = "Please select a category";
       setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validateForm()) {
      try {
        const fd = new FormData();
        fd.append("title", formData.title);
        fd.append("description", formData.description);
        fd.append("assignTo", formData.assignTo);
        fd.append("category", formData.category);
        fd.append("deadline[startDate]", formData.deadline.startDate);
        fd.append("deadline[endDate]", formData.deadline.endDate);
        fd.append("priority", formData.priority);
        formData.sop && fd.append("sop", formData.sop);
        fd.append("aiReview", formData.aiReview);
        if (audioBlob) {
          fd.append("voiceNote", audioBlob, "voiceNote.mp3");
        }

        if (isEditMode) {
          await updateTask(id, fd);
          toast.success("Task Updated Succesfully");
          navigate("/task");
        } else {
          await createTask(fd);
          toast.success("Task Created Succesfully");
          navigate("/task");
        }
      } catch (error) {

        toast.error(error.response?.data?.error?.message || "Something went wrong!");
      }
    }
  };

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
            {isEditMode ? "EditTask" : "Task Overview"}
          </Link>
          <span className="crumb-sep">›</span>
          <span className="crumb">
            {isEditMode ? formData?.title : "Create Task"}
          </span>
        </div>

        <form className="task-create__form" onSubmit={handleSubmit}>
          <div className="form-field">
            <label className="label-lg">Task Title</label>
            <input
              className="input"
              placeholder="e.g. Kitchen deep cleaning"
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
              className="input"
              placeholder="Provide description for the task"
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
              <div style={{ position: "relative", width: "100%", display: "inline-block" }}>

                <select
                  className="input"
                  value={formData.assignTo}
                  onChange={(e) => handleSelect("assignTo", e.target.value)}
                  style={{
                    appearance: "none", // remove native arrow
                    WebkitAppearance: "none",
                    MozAppearance: "none",
                    paddingRight: "5rem", // space for custom arrow
                  }}
                >

                  <option>Select Employee</option>
                  {employees?.filter((employees) => employees?.position === "employee")?.map((emp) => (
                    <option
                      key={emp?._id}

                      value={emp?._id}
                      style={{
                        fontSize: "1.5rem",
                        fontWeight: 500,
                        color: "var(--charcoal)"
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
              <div style={{ position: "relative", width: "100%", display: "inline-block" }}>

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
                      key={pri}
                      value={pri}
                      style={{
                        fontSize: "1.5rem",
                        fontWeight: 500,
                        color: "var(--charcoal)"
                      }}
                    >
                      {pri}
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
            <div className="form-col">
              <label className="label-lg">Attach SOP (optional)</label>
              <div style={{ position: "relative", width: "100%", display: "inline-block" }}>
                <select
                  className="input"
                  value={formData.sop}
                  onChange={(e) => handleSelect("sop", e.target.value)}
                  style={{
                    appearance: "none",
                  }}
                >
                  <option>Select Sop</option>

                  {sops?.filter((sop) => sop?.status === "Active")?.map((sop) => (
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
              {errors.sop && (
                <span
                  style={{
                    color: "var(--error)",
                    fontSize: "14px",
                    marginTop: "4px",
                  }}
                >
                  {errors.sop}
                </span>
              )}
            </div>

            <div className="form-col" ref={dropdownRefs.category}>
              <label className="label-lg">Category</label>
              <div style={{ position: "relative", width: "100%", display: "inline-block" }}>

                <select
                  className="input"
                  value={formData.category}
                  onChange={(e) => handleSelect("category", e.target.value)}
                  style={{
                    appearance: "none", // remove native arrow
                    WebkitAppearance: "none",
                    MozAppearance: "none",
                    paddingRight: "5rem", // space for custom arrow
                  }}
                >

                  <option>Select </option>
                  {categories.map((cat) => (
                    <option
                      key={cat}
                      value={cat}
                      style={{
                        fontSize: "1.5rem",
                        fontWeight: 500,
                        color: "var(--charcoal)"
                      }}

                    >
                      {cat}
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
                    transform: dropdowns.category
                      ? "rotate(180deg)"
                      : "rotate(0deg)",
                  }}
                />
              </div>
              {errors.category && (
                <span
                  style={{
                    color: "var(--error)",
                    fontSize: "14px",
                    marginTop: "4px",
                  }}
                >
                  {errors.category}
                </span>
              )}
            </div>
          </div>

          <div className="form-row">
            <div className="form-col" ref={dropdownRefs.deadline}>
              <label className="label-lg">Deadline</label>

              <input className="input"
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
                value={formData?.deadline?.startDate ?
                  `${dayjs(range[0].startDate).format("YYYY-MM-DD")} at ${startTime}   To   ${dayjs(range[0].endDate).format("YYYY-MM-DD")} at ${endTime}`
                  : ""}

                placeholder="Pick a deadline"
              />

              {calendarOpen && (
                <div
                  ref={calendarRef}
                  style={{
                    position: "absolute",
                                     zIndex: 10,
                    border: "1px solid #ddd",
                    borderRadius: "8px",
                    background: "#fff",
                    display: "flex",
                                      transform: "translateY(-20px)",
                    gap: "20px", // space between calendar and time pickers
                  }}
                >
                                    <DateRange
                    ranges={range}
                    onChange={handleRangeChange}
                    moveRangeOnFirstSelection={false}
                    minDate={new Date()}
                  // Important to keep calendar open after first selection
                  />
                  {/* Time Pickers */}
                  <div style={{ display: "flex", flexDirection: "column", marginTop: 10, gap: "10px" }}>

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
           </div>

            <div className="form-col">
              <label className="label-lg">Voice note</label>
              <div
                className="input"
                onClick={handleVoiceNote}
                style={{
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                }}
              >
                <span
                                    style={{
                    color: formData.voiceNote
                      ? "var(--charcoal)"
                      : "var(--grey-120)",
                    flex: 1,
                  }}
                >
                  {isRecording ? (
                    <>
                      <span
                        className="blink-dot"
                        style={{ display: "inline-block", marginRight: "8px" }}
                      ></span>
                      <span>
                        Recording...{" "}
                        <span style={{ color: "#5240D6", fontWeight: 600 }}>
                          {formatTime(recordingTime)}
                        </span>
                      </span>
                    </>
                  ) : (
                    formData.voiceNote || "Start recording"
                  )}
                </span>
                {isRecording ? (
                  <MicOff size={22} style={{ color: "#5240D6" }} />
                ) : (
                  <Mic size={22} style={{ color: "#5240D6" }} />
                )}
              </div>
              {audioURL && (
                <div
                  style={{
                    marginTop: "10px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: "12px",
                    width: "100%",
                  }}
                >
                  <audio
                    controls
                    src={audioURL}
                    style={{ flex: 1, borderRadius: "8px", outline: "none" }}
                  />
                  <button
                    type="button"
                    onClick={() => handleDeleteVoiceNote()}
                    style={{
                      background: "transparent",
                      border: "none",
                    }}
                  >
                    <Trash2
                      size={18}
                      style={{ cursor: "pointer", color: "#5240D6" }}
                    />
                  </button>
                </div>
              )}
            </div>
            
            <div className="form-col">
              <label className="label-lg">AI Review</label>

              <div
                className="select"
                onClick={() =>
                  handleInputChange("aiReview", !formData.aiReview)
                }
              >
                <input
                  type="checkbox"
                  checked={formData.aiReview === true}
                  onChange={(e) =>
                    handleInputChange("aiReview", e.target.checked)
                  }
                  style={{ width: "18px", height: "18px", cursor: "pointer", color: "#5240D6" }}
                />

                <span
                  style={{
                    color: "var(--charcoal)",
                    fontSize: "1.7rem",
                  }}
                >
                  Do You Want To Enable AI Review
                </span>
              </div>

            </div>
          </div>
          <button type="submit" className="btn create block">
            <Plus size={20} style={{ marginRight: "8px" }} />
            {isEditMode ? "Update" : "Save"}
          </button>
        </form >
      </div >
    </div >
  );
}
