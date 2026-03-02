import { useState, useRef, useEffect } from "react";
import { Search, ChevronDown } from "lucide-react";
import useStore from "../store/store";
import { useLoader } from "../components/ui/LoaderContext";
import { Link } from "react-router-dom";
import ReactPaginate from "react-paginate";
import { getPaymentRecord, createPaymentRecord } from "../services/api";
import { toast } from "sonner";
import moment from "moment";

export default function Payments() {
  const [searchQuery, setSearchQuery] = useState("");
  const currentMonthName = new Date().toLocaleString("en-US", {
    month: "long",
  });
  const [period, setPeriod] = useState(currentMonthName);
  const [showPeriodDropdown, setShowPeriodDropdown] = useState(false);
  const periodDropdownRef = useRef(null);
  const [statusDropdown, setStatusDropdown] = useState(false);
  const statusDropdownRef = useRef(null);

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
  const { getAdmins, admins } = useStore();
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
    loadPayments();
    getAdmins();
  }, [period, searchQuery]);

  const loadPayments = async () => {
    try {
      setLoading(true);
      const month = monthIndex[period];
      const year = selectedYear;
      const res = await getPaymentRecord(month, year);
      setSalaryRecords(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getPaymentForAdmin = (adminId) => {
    return salaryRecords.find(
      (p) =>
        p.adminId === adminId &&
        p.month === monthIndex[period] &&
        p.year === selectedYear,
    );
  };

  const handlePageChange = (e) => {
    const selectedPage = e.selected + 1;
    getAdmins(selectedPage);
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

  function getStatusClass(status) {
    if (!status) return "warning";
    switch (status.toLowerCase()) {
      case "paid":
        return "success";
      case "pending":
        return "warning";
      case "overdue":
        return "error";
      default:
        return "error";
    }
  }

  const handleCheckboxChange = (empId) => {
    setSelectedEmployees((prev) =>
      prev.includes(empId)
        ? prev.filter((id) => id !== empId)
        : [...prev, empId],
    );
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        admins: selectedEmployees,
        status: selectedOption,
      };
      await createPaymentRecord(payload);
      toast.success("Status Update Successfully");
      loadPayments();
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
        <h1 className="att-title">Admin Payments</h1>
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
                width: "143px",
                height: "40px",
                borderRadius: "8px",
                padding: "10px",
                gap: "5px",
              }}
              type="button"
              onClick={() => {
                setShowDropdown(true);
                setShowCheckboxes(true);
                setUpdatebutton(true);
              }}
            >
              Update Payments
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
                <span>{selectedOption}</span>
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

      <div className="salary-headings-admin">
        <span>Admin</span>
        <span>Organization</span>
        <span>Payment</span>
        <span>Last payment</span>
        <span>Status</span>
      </div>

      <div className="salary-rows">
        {admins
          ?.filter(
            (adm) =>
              !searchQuery ||
              adm?.name?.toLowerCase().includes(searchQuery.toLowerCase()),
          )
          ?.map((adm) => {
            const payment = getPaymentForAdmin(adm._id);

            return (
              <div key={adm?._id} className="sal-row-admin">
                <span className="name-with-checkbox">
                  <span>
                    {showCheckboxes && (
                      <input
                        type="checkbox"
                        className="salary-checkbox"
                        checked={selectedEmployees.includes(adm?._id)}
                        onChange={() => handleCheckboxChange(adm?._id)}
                      />
                    )}
                  </span>
                  <Link
                    to={`/user-profile/admins/${adm?._id}`}
                    className="att-name"
                    style={{ color: "blue", textDecoration: "underline" }}
                  >
                    {adm?.name}
                  </Link>
                </span>
                <span>{adm?.organizationName}</span>
                <span>{adm?.monthlyfee}</span>

                <span>
                  {payment?.lastPaymentDate
                    ? moment(payment.lastPaymentDate).format("YYYY-MM-DD")
                    : "---"}
                </span>

                <span
                  className={`time-badge ${getStatusClass(
                    payment?.status || "Pending",
                  )}`}
                >
                  {payment?.status || "Pending"}
                </span>
              </div>
            );
          })}
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
