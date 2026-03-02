import { useState, useRef, useEffect } from "react";
import { useNavigate,useLocation, Link, useParams } from "react-router-dom";
import {
  Mic,
  MicOff,
  ChevronDown,
  Plus,
  Trash2,
} from "lucide-react";
import CreateTaskIcon from "../assets/homeScreen/CreateTaskIcon.svg";
import { createSop, fetchSOPById, updateSop } from "../services/api";
import { toast } from "sonner";

export default function CreateSOP() {
  const { id } = useParams();
  const navigate = useNavigate();
   const location = useLocation();
   const previousTab = location.state?.tab || "cleaning";
  const isEditMode = Boolean(id);
  const [recordingTime, setRecordingTime] = useState(0);
  const timerRef = useRef(null);
  const userId = localStorage.getItem("userId");

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    difficulty: "",
    estimateTime: "",
    restaurantID:"",
    // voiceNote: "",
    steps: [{ id: 1, name: "New Section", items: [""] }],
  });

  const [dropdowns, setDropdowns] = useState({
    category: false,
    difficulty: false,
    estimateTime: false,
  });

  const [isRecording, setIsRecording] = useState(false);
  const [errors, setErrors] = useState({});

  const [audioURL, setAudioURL] = useState(null);

  const [audioBlob, setAudioBlob] = useState(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const dropdownRefs = {
    category: useRef(null),
    difficulty: useRef(null),
    estimateTime: useRef(null),
  };

  const categories = ["Cleaning", "Kitchen", "Maintenance"];
  const difficulties = ["Easy", "Medium", "Hard"];
  const timeOptions = ["15 min", "30 min", "45 min", "1 hr", "2 hr", "3 hr"];
  useEffect(() => {
    if (isEditMode) {
      fetchSOPById(id).then((res) => {
        const sop = res.data;
        setFormData({
          title: sop.title,
          restaurantID:sop.restaurantID,
          description: sop.description,
          category: sop.category,
          difficulty: sop.difficultyLevel,
          estimateTime: sop.estimatedTime,
          steps: sop.steps || [],
        });
        if (sop.voiceNote) setAudioURL(sop.voiceNote);
      });
    }
  }, [id]);
  useEffect(() => {
    const handleClickOutside = (e) => {
      Object.keys(dropdownRefs).forEach((key) => {
        if (
          dropdownRefs[key].current &&
          !dropdownRefs[key].current.contains(e.target)
        ) {
          setDropdowns((prev) => ({ ...prev, [key]: false }));
        }
      });
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

  const handleVoiceNote = async () => {
    if (isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setRecordingTime(0);
      //   handleInputChange("voiceNote", "Recording completed");
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
          const blob = new Blob(audioChunksRef.current, {
            type: "audio/mp3",
          });
          const url = URL.createObjectURL(blob);
          setAudioURL(url);
          setAudioBlob(blob);
        };
        setRecordingTime(0);
        timerRef.current = setInterval(() => {
          setRecordingTime((prev) => prev + 1);
        }, 1000);

        mediaRecorder.start();
        setIsRecording(true);
        // handleInputChange("voiceNote", "Recording...");
      } catch (error) {
        console.error(error.message);
        toast.error("Please allow microphone access to record voice notes.");
      }
    }
  };
  const handleDeleteVoiceNote = () => {
    setAudioURL(null);
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const handleAddStep = (stepId) => {
    setFormData((prev) => ({
      ...prev,
      steps: prev.steps.map((step) =>
        step.id === stepId ? { ...step, items: [...step.items, ""] } : step
      ),
    }));
    // Set the new step item to be editable
  };

  const handleStepItemChange = (stepId, itemIndex, value) => {
    setFormData((prev) => ({
      ...prev,
      steps: prev.steps.map((step) =>
        step.id === stepId
          ? {
              ...step,
              items: step.items.map((item, idx) =>
                idx === itemIndex ? value : item
              ),
            }
          : step
      ),
    }));
  };

  const handleDeleteStepItem = (stepId, itemIndex) => {
    setFormData((prev) => ({
      ...prev,
      steps: prev.steps.map((step) =>
        step.id === stepId
          ? { ...step, items: step.items.filter((_, idx) => idx !== itemIndex) }
          : step
      ),
    }));
  };

  const handleAddNewSection = () => {
    const newId = Math.max(...formData.steps.map((s) => s.id), 0) + 1;
    setFormData((prev) => ({
      ...prev,
      steps: [...prev.steps, { id: newId, name: "New Section", items: [""] }],
    }));
    
  };

  const handleDeleteSection = (stepId) => {
    setFormData((prev) => ({
      ...prev,
      steps: prev.steps.filter((step) => step.id !== stepId),
    }));
  };

  const handleStepNameChange = (stepId, newName) => {
    setFormData((prev) => ({
      ...prev,
      steps: prev.steps.map((step) =>
        step.id === stepId ? { ...step, name: newName } : step
      ),
    }));
  };

  const validateForm = () => {
    
    const newErrors = {};
    if (!formData.title.trim()) newErrors.title = "SOP Title is required";
    if (!formData.description.trim())
      newErrors.description = "Description is required";
    if (!formData.category) newErrors.category = "Please select a category";
    if (!formData.difficulty)
      newErrors.difficulty = "Please select difficulty level";
    if (!formData.estimateTime)
      newErrors.estimateTime = "Please select estimated time";
    if(!formData.steps || formData.steps.length === 0)
       newErrors.steps = "Please create SOP";
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e, draftMode = false) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      const formPayload = new FormData();

      formPayload.append("title", formData.title);
      formPayload.append("restaurantID", formData.restaurantID);
      formPayload.append("description", formData.description);
      formPayload.append("category", formData.category);
      formPayload.append("difficultyLevel", formData.difficulty);
      formPayload.append("estimatedTime", formData.estimateTime);
      formPayload.append("owner", userId);
      //formPayload.append("owner", "691995df28fe965f98aca78c");

      formPayload.append("steps", JSON.stringify(formData.steps));
      formPayload.append("status", draftMode ? "Draft" : "Active");

      if (audioBlob) {
        formPayload.append("voiceNote", audioBlob, "voiceNote.mp3");
      }

      if (isEditMode) {
        await updateSop(id, formPayload);
        toast.success("Sop Updated Succesfully");
      } else {
        await createSop(formPayload);
        toast.success("SOP Created Succesfully");
      }

      if (draftMode) {
        navigate("/sop/draft",
         { state:{ tab: previousTab }}

        );
      } else {
        navigate("/sop",
         { state:{ tab: previousTab }}
        );
      }
    } catch (error) {
      console.error("Error submitting  SOP:", error);
      toast.error(error?.response?.data?.error||"Something went wrong ");
    }
  };

  return (
    <div className="task-create">
      <div className="task-create__panel">
        <div className="task-create__breadcrumb">
          <Link
            to="/sop" state={{tab:previousTab}}
            className="crumb-dim"
            style={{
              textDecoration: "none",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            SOP overview
          </Link>
          <span className="crumb-sep">›</span>
          <span className="crumb">
            {isEditMode ? "Edit SOP" : "Create SOP"}
          </span>
        </div>

        <form className="task-create__form" onSubmit={handleSubmit}>
          <div className="form-field">
            <label className="label-lg">
              {/* <FileText size={20} style={{ marginRight: '8px', verticalAlign: 'middle' }} /> */}
              SOP Title
            </label>
            <input
              className="input"
              placeholder="e.g. Kitchen deep cleaning procedure"
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
              placeholder="Provide description for the SOP"
              rows={4}
              value={formData?.description}
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
                                  // className="filter-option"
                                  // onClick={() => handleSelect("priority", pri)}
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
                                // alignItems: "center",
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
                          <div className="form-col" ref={dropdownRefs.difficulty}>
                                      <label className="label-lg">Difficulty level</label>
                                      <div style={{ position: "relative", width: "100%", display: "inline-block" }}>
                        
                                        <select
                                          className="input"
                                          value={formData.difficulty}
                                          onChange={(e) => handleSelect("difficulty", e.target.value)}
                                          style={{
                                            appearance: "none", // remove native arrow
                                            WebkitAppearance: "none",
                                            MozAppearance: "none",
                                            paddingRight: "5rem", // space for custom arrow
                                          }}
                                        >
                        
                                          <option>Select </option>
                                             {difficulties.map((diff) => (
                                            <option
                                             key={diff}
                                              value={diff}
                                               style={{
                                                fontSize: "1.5rem",
                                                fontWeight: 500,
                                                color: "var(--charcoal)"
                                              }}
                                              // className="filter-option"
                                              // onClick={() => handleSelect("priority", pri)}
                                            >
                                              {diff}
                                            </option>
                                          ))}
                                          
                                        </select>
                                        <ChevronDown
                                          size={18}
                                          style={{
                                            position: "absolute",
                                            top: "30%",
                                            // alignItems: "center",
                                            right: "1rem",
                                            color: "var(--grey-120)",
                                            flexShrink: 0,
                                            transition: "transform 0.2s",
                                            transform: dropdowns.difficulty
                                              ? "rotate(180deg)"
                                              : "rotate(0deg)",
                                          }}
                                        />
                                      </div>
                        
                        
                                      {errors.difficulty && (
                                        <span
                                          style={{
                                            color: "var(--error)",
                                            fontSize: "14px",
                                            marginTop: "4px",
                                          }}
                                        >
                                          {errors.difficulty}
                                        </span>
                                      )}
                                    </div>
            {/* <div className="form-col" ref={dropdownRefs.difficulty}>
              <label className="label-lg">Difficulty level</label>
              <div
                className="select"
                onClick={() => handleDropdownToggle("difficulty")}
                style={{
                  cursor: "pointer",
                  position: "relative",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: "12px",
                }}
              >
                <span
                  className="select-value"
                  style={{
                    color: formData.difficulty
                      ? "var(--charcoal)"
                      : "var(--grey-120)",
                    flex: 1,
                  }}
                >
                  {formData.difficulty || "Medium"}
                </span>
                <ChevronDown
                  size={18}
                  style={{
                    color: "var(--grey-120)",
                    flexShrink: 0,
                    transition: "transform 0.2s",
                    transform: dropdowns.difficulty
                      ? "rotate(180deg)"
                      : "rotate(0deg)",
                  }}
                />
              </div>
              {dropdowns.difficulty && (
                <div
                  className="filter-dropdown"
                  style={{
                    position: "absolute",
                    top: "100%",
                    left: 0,
                    width: "100%",
                    marginTop: "4px",
                    zIndex: 100,
                  }}
                >
                  {difficulties.map((diff) => (
                    <div
                      key={diff}
                      className="filter-option"
                      onClick={() => handleSelect("difficulty", diff)}
                    >
                      {diff}
                    </div>
                  ))}
                </div>
              )}
              {errors.difficulty && (
                <span
                  style={{
                    color: "var(--error)",
                    fontSize: "14px",
                    marginTop: "4px",
                  }}
                >
                  {errors.difficulty}
                </span>
              )}
            </div> */}
          </div>

          <div className="form-row">
            <div className="form-col" ref={dropdownRefs.estimateTime}>
                          <label className="label-lg"> Estimate time</label>
                          <div style={{ position: "relative", width: "100%", display: "inline-block" }}>
            
                            <select
                              className="input"
                              value={formData.estimateTime}
                              onChange={(e) => handleSelect("estimateTime", e.target.value)}
                              style={{
                                appearance: "none", // remove native arrow
                                WebkitAppearance: "none",
                                MozAppearance: "none",
                                paddingRight: "5rem", // space for custom arrow
                              }}
                            >
            
                              <option>Select </option>
                                 {timeOptions.map((time) => (
                                <option
                                 key={time}
                                  value={time}
                                   style={{
                                    fontSize: "1.5rem",
                                    fontWeight: 500,
                                    color: "var(--charcoal)"
                                  }}
                                  // className="filter-option"
                                  // onClick={() => handleSelect("priority", pri)}
                                >
                                  {time}
                                </option>
                              ))}
                              
                            </select>
                            <ChevronDown
                              size={18}
                              style={{
                                position: "absolute",
                                top: "30%",
                                // alignItems: "center",
                                right: "1rem",
                                color: "var(--grey-120)",
                                flexShrink: 0,
                                transition: "transform 0.2s",
                                transform: dropdowns.estimateTime
                                  ? "rotate(180deg)"
                                  : "rotate(0deg)",
                              }}
                            />
                          </div>
            
            
                          {errors.estimateTime && (
                            <span
                              style={{
                                color: "var(--error)",
                                fontSize: "14px",
                                marginTop: "4px",
                              }}
                            >
                              {errors.estimateTime}
                            </span>
                          )}
                        </div>
           
            <div className="form-col">
              <label className="label-lg">
                {/* <Mic size={20} style={{ marginRight: '8px', verticalAlign: 'middle' }} /> */}
                Voice note
              </label>
              <div
                className="select"
                onClick={handleVoiceNote}
                style={{
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: "12px",
                }}
              >
                <span
                  className="select-value"
                  style={{
                    color: audioURL ? "var(--charcoal)" : "var(--grey-120)",
                    flex: 1,
                  }}
                >
                  {/* {audioURL ? "Recording completed" : "Start recording"} */}

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
                    "Start recording"
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
          </div>

          <div className="form-field">
            <div
              className="sop-steps"
              style={{
                border: "1px solid var(--charcoal)",
                borderRadius: "8px",
                padding: "16px 12px",
                display: "flex",
                flexDirection: "column",
                gap: "25px",
              }}
            >
              <div
                className="sop-steps__header"
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <h3
                  style={{
                    margin: 0,
                    fontSize: "20px",
                    fontWeight: 500,
                    color: "var(--charcoal)",
                  }}
                >
                  Create SOP
                </h3>
                <button
                  type="button"
                  className="btn outline sm"
                  onClick={handleAddNewSection}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "5px",
                    border: "1px solid var(--purple)",
                    color: "#FFFFFF",
                    backgroundColor: "#5240D6",
                    borderRadius: "8px",
                    padding: "8px 12px",
                    fontSize: "15px",
                    fontWeight: 500,
                  }}
                >
                  {/* <Plus size={17} /> */}
                  <img
                    src={CreateTaskIcon}
                    alt="CreateTaskIcon"
                    width={12.75}
                    height={12.75}
                  />
                  Add section
                </button>
              </div>

              {formData?.steps?.map((step) => (
                <div
                  key={step.id}
                  className="sop-step"
                  style={{
                    border: "1px solid var(--border)",
                    borderRadius: "8px",
                    padding: "16px 22px",
                    display: "flex",
                    flexDirection: "column",
                    gap: "20px",
                  }}
                >
                  <div
                    className="sop-step__title"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
              
                    <input
                      type="text"
                      value={step.name}
                      onChange={(e) =>
                        handleStepNameChange(step.id, e.target.value)
                      }
                      
                      
                      style={{
                        fontSize: "20px",
                        fontWeight: 500,
                        color: "var(--grey-120)",
                        border: "1px solid var(--border)",
                        borderRadius: "8px",
                        padding: "8px 12px",
                        width: "auto",
                        background: "transparent",
                      }}
                    />
                  
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "12px",
                      }}
                    >
                      <button
                        type="button"
                        onClick={() => handleDeleteSection(step.id)}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          background: "transparent",
                          border: "none",
                          cursor: "pointer",
                          padding: "4px",
                        }}
                        title="Delete section"
                      >
                        <Trash2 size={18} style={{ color: "#EF4444" }} />
                      </button>
                      <button
                        type="button"
                        className="btn outline sm"
                        onClick={() => handleAddStep(step.id)}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "5px",
                          border: "1px solid #5240D6",
                          color: "#5240D6",
                          background: "transparent",
                          borderRadius: "8px",
                          padding: "8px 12px",
                          fontSize: "15px",
                          fontWeight: 500,
                        }}
                      >
                        <Plus size={17} />
                        Add step
                      </button>
                    </div>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "20px",
                    }}
                  >
                    {step.items.map((item, itemIndex) => (
                      <div
                        key={itemIndex}
                        className="sop-step__item bg"
                        style={{
                          background: "#F6F8FA",
                          borderRadius: "8px",
                          padding: "12px",
                          display: "flex",
                          alignItems: "center",
                          gap: "12px",
                        }}
                      >
                        <input
                          type="text"
                          value={item}
                          onChange={(e) =>
                            handleStepItemChange(
                              step.id,
                              itemIndex,
                              e.target.value
                            )
                          }
                          placeholder={`Enter step ${itemIndex + 1}...`}
                          style={{
                            flex: 1,
                            border: "none",
                            outline: "none",
                            background: "transparent",
                            fontSize: "16px",
                            fontWeight: 400,
                            color: item ? "var(--grey-100)" : "#A8B8C9",
                          }}
                        />
                        <button
                          type="button"
                          onClick={() =>
                            handleDeleteStepItem(step.id, itemIndex)
                          }
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            background: "transparent",
                            border: "none",
                            cursor: "pointer",
                            padding: "4px",
                            flexShrink: 0,
                          }}
                          title="Delete step"
                        >
                          <Trash2 size={16} style={{ color: "#EF4444" }} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
             {errors.steps && (
                <span
                  style={{
                    color: "var(--error)",
                    fontSize: "14px",
                    marginTop: "4px",
                  }}
                >
                  {errors.steps}
                </span>
              )}
          </div>

          <div
            className="form-row"
            style={{
              marginTop: "20px",
              display: "flex",
              gap: "30px",
              alignItems: "center",
              height: "52px",
            }}
          >
            <button
              type="button"
              className="btn ghost"
              onClick={(e) => handleSubmit(e, true)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                padding: "0 18px",
                fontSize: "19px",
                fontWeight: 600,
                background: "transparent",
                color: "#5240D6",
                flex: 1,
                justifyContent: "center",
              }}
            >
              Save as draft
            </button>
            <button
              type="submit"
              className="btn create"
              style={{
                padding: "0 24px",
                fontSize: "19px",
                fontWeight: 600,
                minWidth: "auto",
                color: "#FFFFFF",
                backgroundColor: "#5240D6",
                flex: 1,
                justifyContent: "center",
              }}
            >
              {isEditMode ? "Update" : "Publish"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
