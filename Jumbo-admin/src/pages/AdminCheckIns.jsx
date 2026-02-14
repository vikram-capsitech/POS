import { useState, useEffect, useRef } from "react";
import { Search } from "lucide-react";
import { useLoader } from "../components/ui/LoaderContext";
import { Link } from "react-router-dom";
import ReactPaginate from "react-paginate";
import useStore from "../store/store";
import { getAdminDailyAttendance } from "../services/api";

export default function AdminCheckIns() {
  const { setLoading } = useLoader();
  const [searchQuery, setSearchQuery] = useState("");
  const [attendance, setAttendance] = useState([]);

  const [selectedDate, setSelectedDate] = useState(new Date());
  const inputRef = useRef(null);
  const [totalPages, setTotalPages] = useState(1);
  const { getAdmins, admins } = useStore();


  const formatTime = (time) => {
    if (!time) return "-";
    return new Date(time).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  useEffect(() => {
    getAdmins();
    fetchAttendance(new Date());
  }, []);



  const fetchAttendance = async (date = new Date()) => {

    try {
      setLoading(true);

      const formatted = date.toISOString().slice(0, 10);

      const response = await getAdminDailyAttendance(formatted);
      setAttendance(response?.data || []);

    } catch (error) {
      console.error("Error fetching attendance:", error);
    } finally {
      setLoading(false);
    }
  };
  const handlePageChange = (e) => {
    const selectedPage = e.selected + 1;
    getAdmins(selectedPage);
  };

  const handleNativeDateChange = async (e) => {
    const newDate = new Date(e.target.value);
    setSelectedDate(newDate);

    await fetchAttendance(newDate);
  };

  const finalList = admins?.map((adm) => {
    const record = attendance?.find(
      (a) => a?.admin?._id === adm?._id || a?.admin === adm?._id
    );
    const totalBreakMinutes = record?.breaks
      ? record.breaks.reduce((sum, b) => sum + (b.duration || 0), 0)
      : 0;



    let hoursWorked = "-";

    if (record?.checkIn) {
      const checkInTime = new Date(record.checkIn);
      const now = new Date();

      let checkOutTime = record.checkOut ? new Date(record.checkOut) : now;


      const checkInDate = new Date(checkInTime.getFullYear(), checkInTime.getMonth(), checkInTime.getDate());
      const todayDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());

      if (!record.checkOut && todayDate > checkInDate) {
        checkOutTime = new Date(checkInTime.getFullYear(), checkInTime.getMonth(), checkInTime.getDate(), 23, 59, 0);

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

      if (hour < 9 || (hour === 8)) {
        record.status = "Early";
      }
      else if (hour === 9 && minute <= 15) {
        record.status = "On time";
      }
      else {
        record.status = "Late";
      }
    };



    return {
      id: adm._id,
      name: adm.name,

      checkIn: record?.checkIn ? formatTime(record.checkIn) : "-",
      checkOut: record?.checkOut ? formatTime(record.checkOut) : "-",
      hours: hoursWorked || "-",

      status: record?.status || "Absent",
      statusClass:
        record?.status === "Late"
          ? "warning"
          : record?.status === "Early"
            ? "info"
            : record?.status === "On time"
              ? "success"
              : "error",

    };
  });



  return (
    <div style={{ marginBottom: "4.2rem" }}>
      <div className="panel"
      >
        <div className="attendance-header">
          <h1 className="att-title">Check-in record</h1>
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

        <div className="attendance-headings-admin">
          <span>Admin</span>
          <span>Check in</span>
          <span>Check out</span>
          <span>Total time</span>
          <span>Status</span>

        </div>

        <div className="attendance-rows">
          {finalList
            ?.filter(
              (adm) =>
                !searchQuery ||
                adm?.name?.toLowerCase().includes(searchQuery.toLowerCase())
            )
            ?.map((adm, idx) => (
              <div
                key={idx}
                className="att-row-admin"
              //   onClick={() => handleViewDetails(emp.name)}
              >
                <Link
                  to={`/user-profile/admins/${adm?.id}`}


                  className="att-name"
                  style={{
                    color: adm.status === "Absent" ? "#EF4444" : "inherit",
                    textDecoration: "none",
                  }}
                >
                  {adm.name}
                </Link>
                <span>{adm?.checkIn}</span>
                <span>{adm?.checkOut}</span>

                <span>
                  {adm?.hours}{" "}
                  {adm?.hours !== "-" ? (adm?.hours < 1 ? "Minutes" : "hours") : ""}

                </span>



                <span className={`time-badge ${adm?.statusClass}`}>
                  {adm?.status}
                </span>





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
