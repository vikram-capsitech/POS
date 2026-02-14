import { useState, useRef, useEffect } from "react";
import { Search, Eye, ChevronDown } from "lucide-react";
import { useLoader } from "../components/ui/LoaderContext";
import { Link } from "react-router-dom";
import ReactPaginate from "react-paginate";
import {
  createSalaryRecord,
  getSalaryRecord,
  // getEmployeeTransactions,
} from "../services/api";
import { toast } from "sonner";
import useStore from "../store/store";

export default function SalaryManagement() {
  const [searchQuery, setSearchQuery] = useState("");
  const currentMonthName = new Date().toLocaleString("en-US", {
    month: "long",
  });
  const { fetchEmployees } = useStore();
  const [period, setPeriod] = useState(currentMonthName);
  const [showPeriodDropdown, setShowPeriodDropdown] = useState(false);
  const periodDropdownRef = useRef(null);
  const [statusDropdown, setStatusDropdown] = useState(false);
  const statusDropdownRef = useRef(null);
  // const [employees, setEmployees] = useState([]);
  const { setLoading } = useLoader();
  const [totalPages, setTotalPages] = useState(1);

  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [updatebutton, setUpdatebutton] = useState(false);
  const [showCheckboxes, setShowCheckboxes] = useState(false);
  const [selectedEmployees, setSelectedEmployees] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedOption, setSelectedOption] = useState("Paid");
  const [salaryRecords, setSalaryRecords] = useState([]);
  const statusOptions = ["Paid"];
  const monthIndex = {
    January: 0,
    February: 1,
    March: 2,
    April: 3,
    May: 4,
    June: 5,
    July: 6,
    August: 7,
    September: 8,
    October: 9,
    November: 10,
    December: 11,
  };

  useEffect(() => {
    loadrecord();
  }, [period]);

  const loadrecord = async () => {
    try {
      setLoading(true);
      const response = await getSalaryRecord(monthIndex[period], selectedYear);
      setSalaryRecords(response?.data);
    } catch (error) {
      console.error(error);
    }
  };

  const handlePageChange = (e) => {
    const selectedPage = e.selected + 1;
    // setCurrentPage(selectedPage-1);
    fetchEmployees(selectedPage);
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        periodDropdownRef.current &&
        !periodDropdownRef.current.contains(e.target)
      ) {
        setShowPeriodDropdown(false);
      }
      if (
        statusDropdownRef.current &&
        !statusDropdownRef.current.contains(e.target)
      ) {
        setStatusDropdown(false);
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  const handleCheckboxChange = (empId) => {
    setSelectedEmployees((prev) =>
      prev.includes(empId)
        ? prev.filter((id) => id !== empId)
        : [...prev, empId],
    );
    setUpdatebutton(true);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        employee: selectedEmployees,
        status: selectedOption,
      };
      await createSalaryRecord(payload);
      toast.success("Status Update Successfully");
      fetchEmployees();
      loadrecord();
      setShowCheckboxes(false);
      setShowDropdown(false);

      setUpdatebutton(false);
    } catch (err) {
      toast.error("Failed to update salary");
      console.error(err);
    }
  };

  return (
    <div className="panel">
      <div
        className="attendance-header"
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <h1 className="att-title">Employee salaries</h1>
        <div>
          {updatebutton && (
            <button
              className="period"
              style={{
                backgroundColor: "#5240D6",
                width: "89px",
                height: "42px",
                borderRadius: "8px",
                padding: "18px",
                gap: "10px",
                color: "white",
                fontSize: "15px",
                fontWeight: "500px",
                fontFamily: "inter",
                cursor: "pointer",
              }}
              type="button"
              onClick={handleUpdate}
            >
              Update
            </button>
          )}
        </div>
      </div>
      <div className="attendance-toolbar">
        <div className="search search--light " style={{ flex: 1 }}>
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
          ref={periodDropdownRef}
          style={{ position: "relative", cursor: "pointer" }}
          onClick={() => setShowPeriodDropdown(!showPeriodDropdown)}
        >
          <span>{period}</span>
          <ChevronDown
            size={18}
            style={{
              color: "var(--grey-120)",
              transition: "transform 0.2s",
              // transition: "translateY(-50px)",
              transform: showPeriodDropdown ? "rotate(180deg)" : "rotate(0deg)",
            }}
          />
          {showPeriodDropdown && (
            <div
              className="period-dropdown"
              style={{
                width: "169px",
                position: "absolute",
                top: "100%",
                right: 0,
                maxHeight: "300px",
                overflowY: "auto",
                marginTop: "8px",
                zIndex: 100,
              }}
            >
              <div
                className="year-selector"
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "8px",
                  fontWeight: "bold",
                  transition: "translateY(-50px)",
                }}
              >
                <span
                  style={{ cursor: "pointer", padding: "4px 8px" }}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedYear((prev) => prev - 1);
                  }}
                >
                  &lt;
                </span>

                <span>{selectedYear}</span>

                <span
                  style={{ cursor: "pointer", padding: "4px 8px" }}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedYear((prev) => prev + 1);
                  }}
                >
                  &gt;
                </span>
              </div>

              {Object.keys(monthIndex).map((m) => (
                <div
                  key={m}
                  className={`period-option  ${period === m ? "active" : ""}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    //  handleMonthSelect(m);
                    setPeriod(m);
                    setShowPeriodDropdown(false);
                  }}
                >
                  {m}
                </div>
              ))}
            </div>
          )}
        </div>
        <div
          style={{
            position: "relative",
            display: "inline-block",
            width: "128px",
          }}
        >
          {!showDropdown && (
            <button
              className="period"
              style={{
                fontWeight: "500px",
                fontSize: "15px",
                fontFamily: "inter",
                backgroundColor: "white",
                width: "128px",
                height: "40px",
                borderRadius: "8px",
                padding: "10px",
                gap: "10px",
              }}
              type="button"
              onClick={() => {
                setShowDropdown(true);
                setShowCheckboxes(true);
              }}
            >
              Credit Salary
            </button>
          )}

          {showDropdown && (
            <div
              ref={statusDropdownRef}
              style={{ position: "relative", width: "128px" }}
            >
              <button
                type="button"
                className="period"
                style={{
                  fontWeight: "500px",
                  size: "15px",
                  fontSize: "15px",
                  fontFamily: "inter",
                  backgroundColor: "white",
                  width: "128px",
                  height: "40px",
                  borderRadius: "8px",
                  padding: "14px 18px",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  border: "1px solid #ccc",
                  cursor: "pointer",
                }}
                onClick={() => setStatusDropdown((prev) => !prev)}
              >
                <span>{selectedOption || "Pending"}</span>
                <ChevronDown
                  size={18}
                  style={{
                    color: "var(--grey-120)",
                    transition: "transform 0.2s",
                    transform: statusDropdown
                      ? "rotate(180deg)"
                      : "rotate(0deg)",
                  }}
                />
              </button>

              {statusDropdown && (
                <div
                  className="period-dropdown"
                  style={{
                    fontWeight: "500px",
                    size: "15px",
                    fontSize: "15px",
                    fontFamily: "inter",
                    position: "absolute",
                    top: "100%",
                    left: 0,
                    width: "128px",
                    backgroundColor: "white",
                    border: "1px solid #ccc",
                    borderRadius: "8px",
                    marginTop: "8px",
                    zIndex: 100,
                  }}
                >
                  {statusOptions.map((status) => (
                    <div
                      key={status}
                      style={{
                        padding: "10px",
                        cursor: "pointer",
                        borderBottom: "1px solid #eee",
                        backgroundColor:
                          selectedOption === status ? "#f0f0f0" : "white",
                      }}
                      onClick={() => {
                        setSelectedOption(status); // select the status
                        setStatusDropdown(false); // close the dropdown
                      }}
                    >
                      {status}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="salary-headings">
        <span style={{ width: "10px" }}></span>
        <span>Employee</span>
        <span>Position</span>
        <span>Salary</span>
        <span>Advance</span>
        <span>Remaining</span>
        <span>Last paid</span>
        <span>Status</span>
      </div>

      <div className="salary-rows">
        {salaryRecords
          ?.filter((emp) => {
            const matchesSearch =
              !searchQuery ||
              emp?.name?.toLowerCase()?.includes(searchQuery?.toLowerCase());
            return matchesSearch;
          })
          ?.map((emp) => (
            <div key={emp?.employeeId} className="sal-row">
              <span>
                {showCheckboxes && (
                  <input
                    type="checkbox"
                    style={{
                      width: "20px",
                      height: "20px",
                      radius: "4px",
                      padding: "10px",
                      border: "1px",
                      color: "#0F0F0F",
                      marginRight: "10px",
                      cursor: "pointer",
                    }}
                    checked={selectedEmployees.includes(emp?.employeeId)}
                    onChange={() => handleCheckboxChange(emp?.employeeId)}
                  />
                )}
              </span>
              <span>
                <Link
                  to={`/user-profile/${emp?.position === "employee" ? "staff" : "manager"}/${emp?.employeeId}`}
                  className="att-name"
                  style={{ color: "blue", textDecoration: "underline" }}
                >
                  {emp?.name}
                </Link>
              </span>
              <span>{emp?.position}</span>
              <span>{emp?.salary}</span>
              <span
                className={emp?.advanceTaken !== 0 ? "error-text" : ""}
                style={{
                  color: emp?.advanceTaken == 0 ? "inherit" : "#EF4444",
                }}
              >
                {emp?.advanceTaken <= 0 ? 0 : emp?.advanceTaken}
              </span>
              <span>{emp?.remainingSalary}</span>

              <span>
                {emp?.lastSalaryPaidDate
                  ? new Date(emp.lastSalaryPaidDate)
                      .toLocaleDateString("en-GB")
                      .replace(/\//g, "-")
                  : "-"}
              </span>

              <span
                className={`time-badge ${emp?.salaryStatus === "Paid" ? "success" : "error"}`}
              >
                {emp?.salaryStatus}
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
  );
}
