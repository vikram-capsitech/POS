import { useState, useEffect, useRef } from "react";
import { Search } from "lucide-react";
import { fetchEmployees, getDailyAttendence } from "../services/api";
import { useLoader } from "../components/ui/LoaderContext";
import { Link } from "react-router-dom";
import ReactPaginate from "react-paginate";

export default function Attendance() {
  const { setLoading } = useLoader();
  const [searchQuery, setSearchQuery] = useState("");
  const [attendance, setAttendance] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const inputRef = useRef(null);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedFilters, setSelectedFilters] = useState();
  const [modalImage, setModalImage] = useState(null);

  const formatTime = (time) => {
    if (!time) return "-";
    return new Date(time).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  useEffect(() => {
    loademployee(1);
    fetchAttendance(new Date());
  }, []);

  const loademployee = async (
    page = Number(import.meta.env.VITE_PAGE),
    limit = Number(import.meta.env.VITE_LIMIT),
  ) => {
    const filters = { search: searchQuery, ...selectedFilters };
    try {
      setLoading(true);
      const employees = await fetchEmployees(page, limit, filters);
      if (employees?.data?.length > 0) {
        setEmployees(employees?.data);
        setTotalPages(employees.totalPages || 1);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAttendance = async (date = new Date()) => {
    try {
      setLoading(true);

      const formatted = date.toISOString().slice(0, 10);

      const response = await getDailyAttendence(formatted);
      setAttendance(response?.data || []);
    } catch (error) {
      console.error("Error fetching attendance:", error);
    } finally {
      setLoading(false);
    }
  };
  const handlePageChange = (e) => {
    const selectedPage = e.selected + 1;
    loademployee(selectedPage);
  };

  const handleNativeDateChange = async (e) => {
    const newDate = new Date(e.target.value);
    setSelectedDate(newDate);

    await fetchAttendance(newDate);
  };

  const finalList = employees?.map((emp) => {
    const record = attendance?.find(
      (a) => a?.employee?._id === emp?._id || a?.employee === emp?._id,
    );
    const totalBreakMinutes = record?.breaks
      ? record.breaks.reduce((sum, b) => sum + (b.duration || 0), 0)
      : 0;

    let hoursWorked = "-";

    if (record?.checkIn) {
      const checkInTime = new Date(record.checkIn);
      const now = new Date();

      let checkOutTime = record.checkOut ? new Date(record.checkOut) : now;

      const checkInDate = new Date(
        checkInTime.getFullYear(),
        checkInTime.getMonth(),
        checkInTime.getDate(),
      );
      const todayDate = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate(),
      );

      if (!record.checkOut && todayDate > checkInDate) {
        checkOutTime = new Date(
          checkInTime.getFullYear(),
          checkInTime.getMonth(),
          checkInTime.getDate(),
          23,
          59,
          0,
        );

        record.checkOut = checkOutTime;
      }

      let diffMs = checkOutTime - checkInTime;
      diffMs -= (totalBreakMinutes || 0) * 60 * 1000;

      const totalMinutes = Math.floor(diffMs / 1000 / 60);
      const hours = Math.floor(totalMinutes / 60);
      const minutes = totalMinutes % 60;

      hoursWorked = `${hours}:${minutes.toString().padStart(2, "0")}`;
    }

    if (record?.checkIn) {
      const checkIn = new Date(record.checkIn);
      const hour = checkIn.getHours();
      const minute = checkIn.getMinutes();

      if (hour < 9 || hour === 8) {
        record.status = "Early";
      } else if (hour === 9 && minute <= 15) {
        record.status = "On time";
      }
      // else if(hour>=9 && hour<12){
      //   record.status ="Late";
      // }
      else {
        record.status = "Late";
      }
    }

    return {
      id: emp._id,
      name: emp.name,
      position: emp.position,
      checkIn: record?.checkIn ? formatTime(record.checkIn) : "-",
      checkOut: record?.checkOut ? formatTime(record.checkOut) : "-",
      hours: hoursWorked || "-",
      overtime: record?.overtime || "-",
      break: totalBreakMinutes || "-",
      status: record?.status || "Absent",
      statusClass:
        record?.status === "Late"
          ? "warning"
          : record?.status === "Early"
            ? "info"
            : record?.status === "On time"
              ? "success"
              : "error",

      image: record?.selfie || "-",
    };
  });

  return (
    <div style={{ marginBottom: "4.2rem" }}>
      <div className="panel">
        <div className="attendance-header">
          <h1 className="att-title">Attendance record</h1>
        </div>
        <div className="attendance-toolbar">
          <div className="search search--light" style={{ flex: 1 }}>
            <Search size={18} style={{ color: "#A8B8C9", flexShrink: 0 }} />
            <input
              type="text"
              className="search-input"
              placeholder="Search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                border: "none",
                outline: "none",
                background: "transparent",
                fontSize: "17px",
                fontWeight: 500,
                color: searchQuery ? "var(--charcoal)" : "#A8B8C9",
                flex: 1,
              }}
            />
          </div>
          <div
            className="period"
            style={{
              position: "relative",
              cursor: "pointer",
              padding: "8px 12px",
              border: "1px solid #ddd",
              borderRadius: "6px",
              display: "inline-block",
              userSelect: "none",
            }}
            onClick={() => inputRef.current?.showPicker()}
          >
            <span>
              {selectedDate.toDateString() === new Date().toDateString()
                ? "Today"
                : selectedDate.toLocaleDateString("en-GB")}
            </span>

            <input
              ref={inputRef}
              type="date"
              value={selectedDate.toISOString().slice(0, 10)}
              onChange={handleNativeDateChange}
              style={{
                opacity: 0,
                position: "absolute",
                top: 0,
                left: 0,
                height: "100%",
                width: "100%",
                cursor: "pointer",
              }}
            />
          </div>
        </div>

        <div className="attendance-headings">
          <span>Employee</span>
          <span>Check in</span>
          <span>Check out</span>
          <span>Hours worked</span>
          <span>Overtime</span>
          <span>Break taken</span>
          <span>Status</span>
          <span>image</span>
        </div>

        <div className="attendance-rows">
          {finalList
            ?.filter(
              (emp) =>
                !searchQuery ||
                emp?.name?.toLowerCase().includes(searchQuery.toLowerCase()),
            )
            ?.map((emp, idx) => (
              <div
                key={idx}
                className="att-row"
                //   onClick={() => handleViewDetails(emp.name)}
              >
                <Link
                  to={`/user-profile/${emp?.position === "employee" ? "staff" : "manager"}/${emp?.id}`}
                  className="att-name"
                  style={{
                    color: emp.status === "Absent" ? "#EF4444" : "inherit",
                    textDecoration: "underline",
                  }}
                >
                  {emp.name}
                </Link>
                <span>{emp?.checkIn}</span>
                <span>{emp?.checkOut}</span>

                <span>
                  {emp?.hours}{" "}
                  {emp?.hours !== "-"
                    ? emp?.hours < 1
                      ? "Minutes"
                      : "hours"
                    : ""}
                </span>
                <span
                  style={{
                    color: emp?.status === "Absent" ? "inherit" : "#EF4444",
                  }}
                >
                  {emp?.overtime}{" "}
                  {emp?.overtime !== "-"
                    ? emp?.overtime < 1
                      ? "hour"
                      : "hours"
                    : ""}
                </span>
                <span>
                  {emp?.break} {emp?.break !== "-" ? "min" : " "}
                </span>

                <span className={`time-badge ${emp?.statusClass}`}>
                  {emp?.status}
                </span>

                <span>
                  {emp?.image && emp?.image !== "-" ? (
                    <img
                      src={emp.image}
                      style={{
                        width: "31px",
                        height: "33px",
                        borderRadius: "4px",
                        cursor: "pointer",
                      }}
                      onClick={() => setModalImage(emp.image)}
                    />
                  ) : (
                    "-"
                  )}
                </span>
                {modalImage && (
                  <div
                    onClick={() => setModalImage(null)} // close modal on click outside
                    style={{
                      position: "fixed",
                      top: 0,
                      left: 0,
                      width: "100vw",
                      height: "100vh",
                      backdropFilter: "blur(1px)",
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      zIndex: 1000,
                    }}
                  >
                    <img
                      src={modalImage}
                      alt="profile"
                      style={{
                        width: "455px",
                        height: "auto",
                        // height:"629px",
                        marginTop: "136px",
                        borderRadius: 15,
                      }}
                    />
                  </div>
                )}
              </div>
            ))}
          <ReactPaginate
            previousLabel={"<"}
            nextLabel={">"}
            breakLabel={"..."}
            pageCount={totalPages}
            marginPagesDisplayed={1}
            pageRangeDisplayed={5}
            onPageChange={handlePageChange}
            containerClassName={"pagination"}
            pageClassName={"page"}
            activeClassName={"active"}
            previousClassName={"page"}
            nextClassName={"page"}
            breakClassName={"page break"}
            disabledClassName={"disabled"}
          />
        </div>
      </div>
    </div>
  );
}
