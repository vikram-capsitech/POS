import { useState, useRef, useEffect } from "react";
import { useNavigate, Link, useParams } from "react-router-dom";
import {
  fetchEmployees,
  createVoucher,
  updateVoucher,
  fetchVoucherById,
} from "../services/api";
import { toast } from "sonner";
import { DateRange } from "react-date-range";
import TimePicker from "react-time-picker";
import dayjs from "dayjs";
import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";
import "react-time-picker/dist/TimePicker.css";
import "react-clock/dist/Clock.css";
import { Plus} from "lucide-react";
import Select from "react-select";
import { customStyles } from "../lib/constant";

export default function CreateVOUCHER() {
  const { id } = useParams();
  const isEditMode = Boolean(id);
  const navigate = useNavigate();
  const [selectedAccess, setSelectedAccess] = useState([]);
  const [employees, setEmployees] = useState();
  const [voucher, setVoucher] = useState();

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    coins: "",
    assignType: "SPECIFIC",
    assignTo: [],
    timeline: {
      startDate: null,
      endDate: null,
    },
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
    new Date().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }),
  );
  const [endTime, setEndTime] = useState(
    new Date().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }),
  );

  useEffect(() => {
    loademployee();
    fetchVoucher();
  }, [id]);
  const fetchVoucher = async () => {
    try {
      const res = await fetchVoucherById(id);
      setVoucher(res);
    } catch (err) {
      console.error("Error loading SOP:", err);
    }
  };
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
  useEffect(() => {
    if (!isEditMode) return;
    if (!voucher) return;
    if (!employees) return;
    setFormData({
      title: voucher.title,
      description: voucher.description,
      assignType: voucher.assignType,
      coins: voucher.coins,
      assignTo: voucher.assignTo || [],
      timeline: voucher.timeline,
    });
    if (voucher.assignType === "ALL") {
      setSelectedAccess([{ value: "ALL", label: "All Users" }]);
    } else {
      setSelectedAccess(
        voucher.assignTo.map((emp) => ({
          value: emp._id,
          label: emp.name,
        })),
      );
    }
    if (voucher.timeline?.startDate && voucher.timeline?.endDate) {
      setRange([
        {
          startDate: new Date(voucher.timeline.startDate),
          endDate: new Date(voucher.timeline.endDate),
          key: "selection",
        },
      ]);
      setStartTime(dayjs(voucher.timeline.startDate).format("HH:mm"));
      setEndTime(dayjs(voucher.timeline.endDate).format("HH:mm"));
    }
  }, [voucher, employees]);
  const handleRangeChange = (item) => {
    const { startDate, endDate } = item.selection;
    setRange([item.selection]);

    setFormData((prev) => ({
      ...prev,
      timeline: {
        startDate: buildDateTime(startDate, startTime),
        endDate: buildDateTime(endDate, endTime),
      },
    }));

    if (startDate && endDate && startDate.getTime() !== endDate.getTime()) {
      setCalendarOpen(false);
    }
  };

  useEffect(() => {
    if (!range[0]?.startDate || !range[0]?.endDate) return;

    setFormData((prev) => ({
      ...prev,
      timeline: {
        startDate: buildDateTime(range[0].startDate, startTime),
        endDate: buildDateTime(range[0].endDate, endTime),
      },
    }));
  }, [startTime, endTime]);

  const [dropdowns, setDropdowns] = useState({
    assignTo: false,
    category: false,
    deadline: false,
    sop: false,
    priority: false,
  });

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
  const assignOptions = [
    { value: "ALL", label: "All Users" },
    ...(employees
      ?.filter((emp) => emp.position === "employee")
      ?.map((emp) => ({
        value: emp._id,
        label: emp.name,
      })) || []),
  ];

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

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };
  const handleAssignChange = (selected) => {
    if (!selected || selected.length === 0) {
      setSelectedAccess([]);
      setFormData((prev) => ({
        ...prev,
        assignType: "SPECIFIC",
        assignTo: [],
      }));
      return;
    }

    const hasAll = selected.some((opt) => opt.value === "ALL");

    if (hasAll) {
      setSelectedAccess([{ value: "ALL", label: "All Users" }]);

      setFormData((prev) => ({
        ...prev,
        assignType: "ALL",
        assignTo: [],
      }));
      setErrors((prev) => ({ ...prev, assignTo: "" }));
      return;
    }

    setSelectedAccess(selected);

    setFormData((prev) => ({
      ...prev,
      assignType: "SPECIFIC",
      assignTo: selected.map((opt) => opt.value),
    }));
    setErrors((prev) => ({ ...prev, assignTo: "" }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.title.trim()) newErrors.title = "Voucher title is required";
    if (!formData.description.trim())
      newErrors.description = "Description is required";
    const coins = Number(formData.coins);
    if (formData.coins === "") {
      newErrors.coins = "Coins required";
    } else if (isNaN(coins)) {
      newErrors.coins = "Coins must be a valid number";
    } else if (coins <= 0) {
      newErrors.coins = "Coins must be greater than 0";
    }
    if (
      formData.assignType === "SPECIFIC" &&
      (!formData.assignTo || formData.assignTo.length === 0)
    ) {
      newErrors.assignTo = "Please select at least one employee";
    }
    if (!formData.timeline?.startDate || !formData.timeline?.endDate) {
      newErrors.timeline = "Timeline required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    const payload = {
      ...formData,
      coins: Number(formData.coins), // 🔑 convert here
    };

    try {
      if (isEditMode) {
        await updateVoucher(id, payload);
        toast.success("Voucher Updated Successfully");
      } else {
        await createVoucher(payload);
        toast.success("Voucher Created Successfully");
      }
      navigate("/voucher");
    } catch (error) {
      toast.error(error.response?.data?.error || "Something went wrong!");
    }
  };

  return (
    <div className="task-create">
      <div className="task-create__panel">
        <div className="task-create__breadcrumb">
          <Link
            to="/voucher"
            className="crumb-dim"
            style={{
              textDecoration: "none",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            {isEditMode ? "Edit Voucher" : "voucher Overview"}
          </Link>
          <span className="crumb-sep">›</span>
          <span className="crumb">
            {isEditMode ? formData?.title : "Create Voucher"}
          </span>
        </div>

        <form className="task-create__form" onSubmit={handleSubmit}>
          <div className="form-field">
            <label className="label-lg">Voucher title</label>
            <input
              className="input"
              placeholder="e.g. Extra day off"
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
              placeholder="This description is only for admin and managers"
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
            <div className="form-field">
              <label className="label-lg">Coins to redeem </label>
              <input
                type="text"
                className="input"
                placeholder="Coins to redeem"
                value={formData.coins}
                onChange={(e) => {
                  const value = e.target.value;
                  const regex = /^\d*\.?\d*$/;

                  if (regex.test(value)) {
                    handleInputChange("coins", value);
                  }
                }}
              />
              {errors.coins && <span className="error">{errors.coins}</span>}
            </div>

            <div className="form-field">
              <label className="label-lg">Assign To</label>

              <Select
                options={assignOptions}
                value={selectedAccess}
                onChange={handleAssignChange}
                isMulti
                styles={customStyles}
                placeholder="Select employees or All Users"
              />

              {errors.assignTo && (
                <span className="error">{errors.assignTo}</span>
              )}
            </div>
          </div>

          {/* <div className="form-row"> */}
          <div className="form-col" ref={dropdownRefs.deadline}>
            <label className="label-lg">Timeline </label>

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
                formData?.timeline?.startDate
                  ? `${dayjs(formData.timeline.startDate).format("DD-MMM-YYYY")} 
                   To
                   ${dayjs(formData.timeline.endDate).format("DD-MMM-YYYY")} `
                  : ""
              }
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
            {/* </div> */}
          </div>
          <button type="submit" className="btn create block">
            <Plus size={20} style={{ marginRight: "8px" }} />
            {isEditMode ? "Update" : "Save"}
          </button>
        </form>
      </div>
    </div>
  );
}
