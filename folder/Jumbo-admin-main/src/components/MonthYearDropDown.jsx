import { useState, useRef, useEffect } from "react";
import { ChevronDown } from "lucide-react";

const months = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December",
];

export default function MonthYearDropdown({
  selectedMonth,
  selectedYear,
  onChange,
}) {
  const now = new Date();
  const currentMonthIndex = now.getMonth();
  const currentYear = now.getFullYear();

  const [open, setOpen] = useState(false);
  const dropDownRef = useRef(null);

  // Close on outside click (same behavior as before)
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropDownRef.current && !dropDownRef.current.contains(event.target)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div
      className="profile-period"
      ref={dropDownRef}
      style={{ position: "relative", cursor: "pointer" }}
      onClick={() => setOpen(!open)}
    >
      <span>
        {selectedMonth === currentMonthIndex &&
        selectedYear === currentYear
          ? "This month"
          : months[selectedMonth]}
      </span>

      <ChevronDown
        size={18}
        style={{
          color: "var(--grey-120)",
          transition: "transform 0.2s",
          transform: open ? "rotate(180deg)" : "rotate(0deg)",
        }}
      />

      {open && (
        <div className="profile-period-dropdown">
          {/* Year navigation row */}
          <div
            className="year-nav"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "8px 12px",
              borderBottom: "1px solid #eaefff",
              fontWeight: 600,
              fontSize: "14px",
            }}
          >
            <span
              style={{ cursor: "pointer", padding: "4px 8px" }}
              onClick={(e) => {
                e.stopPropagation();
                onChange(selectedMonth, selectedYear - 1);
              }}
            >
              &lt;
            </span>

            <span>{selectedYear}</span>

            <span
              style={{ cursor: "pointer", padding: "4px 8px" }}
              onClick={(e) => {
                e.stopPropagation();
                onChange(selectedMonth, selectedYear + 1);
              }}
            >
              &gt;
            </span>
          </div>

          {/* Month list vertically */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "4px",
              padding: "8px 12px",
            }}
          >
            {months.map((month, index) => {
              const isCurrent =
                index === currentMonthIndex &&
                selectedYear === currentYear;

              const isActive = index === selectedMonth;

              return (
                <div
                  key={month}
                  onClick={(e) => {
                    e.stopPropagation();
                    onChange(index, selectedYear);
                    setOpen(false);
                  }}
                  className={`period-option ${
                    isActive ? "active" : ""
                  }`}
                  style={{
                    padding: "6px 10px",
                    borderRadius: "4px",
                    background: isActive ? "#eaefff" : "transparent",
                    color: isActive ? "var(--purple)" : "#3d3d3d",
                    fontWeight: isActive ? 600 : 500,
                    cursor: "pointer",
                  }}
                >
                  {isCurrent ? "This Month" : month}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
