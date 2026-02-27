import { useState, useRef, useEffect } from "react";
import Icon from "../assets/homeScreen/Icon.svg";
import HandRaiseIcon from "../assets/homeScreen/HandRaiseIcon.svg";
import CheckIcon from "../assets/homeScreen/CheckIcon.svg";
import BankIcon from "../assets/homeScreen/BankIcon.svg";

import SopIcon from "../assets/homeScreen/SopIcon.svg";
import BlueCheckIcon from "../assets/homeScreen/BlueCheckIcon.svg";
import IssueIcon from "../assets/homeScreen/IssueIcon.svg";
import ArrowRight from "../assets/homeScreen/ArrowRight.svg";
import BlueArrow from "../assets/homeScreen/BlueArrow.svg";
import GreenArrow from "../assets/homeScreen/GreenArrow.svg";
import Arrow from "../assets/Arrow.svg";
import Vector from "../assets/homeScreen/Vector.svg";
import { useNavigate } from "react-router-dom";
import { PlusSquare } from "lucide-react";
import { PieChart } from "@mui/x-charts";
import DonutChart from "../components/DonutChart";
import useStore from "../store/store";


import { useAppTheme } from "../context/ThemeContext";

export default function Home() {
  const navigate = useNavigate();
  const { primaryColor } = useAppTheme();

  const {
    fetchHome,
    home,
  } = useStore();
  const [period, setPeriod] = useState("Daily");
  const [showPeriodDropdown, setShowPeriodDropdown] = useState(false);
  const role = localStorage.getItem("role");

  const periodDropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        periodDropdownRef.current &&
        !periodDropdownRef.current.contains(e.target)
      ) {
        setShowPeriodDropdown(false);
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  const periods = ["Daily", "Weekly", "Monthly"];
  useEffect(() => {
    fetchHome(period.toLowerCase());
  }, [period]);

  const total = (home?.taskStats?.average?.completed || 0) + (home?.taskStats?.average?.inProgress || 0)
    + (home?.taskStats?.average?.pending || 0);
  const data = [
    {
      label: "Completed Task",
      value: home?.taskStats?.average?.completed,
      color: "#10B981",
    },
    {
      label: "In-Progress Task",
      value: home?.taskStats?.average?.inProgress,
      color: "#FF8514",
    },
    {
      label: "Pending Task",
      value: home?.taskStats?.average?.pending,
      color: "#EF4444",
    },
    {
      label: "No Recent Task",
      value: total === 0,
      color: primaryColor,
    },
  ];

  const totalpayment =(home?.totalpaidpayment||0) +(home?.totalpendingpayment||0);

  const paymentchart = [
    {
      label: "Payment received",
      value: home?.totalpaidpayment,
      color: "#10B981"
    },

    {
      label: "Payment pending",
      value: home?.totalpendingpayment,
      color: "#EF4444",
    },
     {
      label: "No Recent Payment",
      value: totalpayment === 0,
      color: primaryColor,
    },

  ]

  const settings = {
    margin: { right: 5 },
    width: 200,
    height: 200,
    hideLegend: true,
  };

  return (
    <div>
      <section className="stats-grid" aria-label="Stats">
        <div
          className="home-card"
          style={{ cursor: "pointer" }}
          onClick={() => { role === "superadmin" ? navigate("/checkin") : navigate("/task"); }}
        >
          <div className="card-holder">
            <div className="card-upper">
              <div className="card-heading">
                <div className="heading-text">
                  {role === "superadmin" ? "Total check-Ins" : "Today's task"}
                </div>
                <div className="icon">
                  <img
                    src={Icon}
                    alt="CheckSquare"
                    width={15.83}
                    height={17}
                    style={{
                      borderWidth: "2px",
                      transform: "rotate(0deg)",
                      opacity: 1,
                    }}
                  />
                </div>
              </div>
            </div>
            <div className="card-lower">
              <div className="card-number">
                <span>
                  {role === "superadmin"
                    ? home?.todayCheckIn
                    : home?.taskStats?.today?.total}
                </span>
              </div>
              <div className="card-stats success">
                <div className="stats-text">
                  
                      <img src={GreenArrow} alt="GreenArrow" width={13} height={10}                 />
                                   {role === "superadmin"
                    ? `${home?.todayCheckIn || 0} CheckIn, ${home?.totalAdminOrEmployee - home?.todayCheckIn} Pending`
                    : `${home?.taskStats?.today?.completed || 0} completed, ${home?.taskStats?.today?.pending || 0
                    } pending`}
                </div>
              </div>
            </div>
          </div>
        </div>
        <div
          className="home-card"
          style={{ cursor: "pointer" }}

          onClick={() => {
            role === "superadmin" ? navigate("/user-profile") : navigate("/attendance")
          }}

        >
          <div className="card-holder">
            <div className="card-upper">
              <div className="card-heading">
                <div className="heading-text">
                  {role === "superadmin"
                    ? "Total admin profiles"
                    : "Staff check-in"}
                </div>
                <div className="icon">
                  <img
                    src={HandRaiseIcon}
                    alt="HandRaiseIcon"
                    width={22}
                    height={22}
                    style={{
                      transform: "rotate(0deg)",
                      opacity: 1,
                    }}
                  />
                </div>
              </div>
            </div>
            <div className="card-lower">
              <div className="card-number">
                <span>
                  
                  {role === "superadmin" ? home?.totalAdminOrEmployee :
                    `${home?.todayCheckedIn} / 
                  
                  ${home?.totalAdminOrEmployee}`}
                </span>
              </div>
              <div className="card-stats warning">
                <div className="stats-text">
                  <span>

                    <img src={Arrow} alt="Arrow" width={13} height={10}
                      style={{
                        transform: "rotate(90deg)",
                      }}
                    />
                  </span>
                  {role === "superadmin" ? "New profile this month" :
                  ( `${home?.totalAdminOrEmployee-home?.todayCheckedIn} user Pending`)}</div>
              </div>
            </div>
          </div>
        </div>
        <div
          className="home-card"
          style={{ cursor: "pointer" }}
          onClick={() => {
            role === "superadmin" ? navigate("/payments") : navigate("/ai-review")
          }}

        >
          <div className="card-holder">
            <div className="card-upper">
              <div className="card-heading">
                <div className="heading-text">
                  {role === "superadmin"
                    ? "Pending payments"
                    : "Pending AI Review"}
                </div>
                <div className="icon">
                  <img
                    src={CheckIcon}
                    alt="CheckIcon"
                    width={16}
                    height={16}
                    style={{
                      borderWidth: "2px",
                      transform: "rotate(0deg)",
                      opacity: 1,
                    }}
                  />
                </div>
              </div>
            </div>
            <div className="card-lower">
              <div className="card-number">
                <span>
                  {role === "superadmin" ? home?.totalpendingpayment : home?.pendingAiReviews}

                </span>
              </div>
              {role === "superadmin" ?
                (<div className="card-stats error">
                  <div className="stats-text">

                    <span>

                      <img src={Arrow} alt="Arrow" width={10} height={10} /> Pending this month
                    </span>
                  </div>
                </div>
                ) : (
                  <div className="card-stats info">
                    <div className="stats-text">
                      <span>

                      <img src={BlueArrow} alt="BlueArrow" width={10} height={10} />
                    </span>
                      Awaiting validation
                    </div>
                  </div>
                )}
            </div>
          </div>
        </div>
        <div
          className="home-card"
          style={{ cursor: "pointer" }}
          onClick={() => {
            role === "superadmin" ? navigate("/payments") : navigate("/salary-management")
          }}>
          <div className="card-holder">
            <div className="card-upper">
              <div className="card-heading">
                <div className="heading-text">
                  {role === "superadmin"
                    ? "Payments's this month"
                    : "This month payroll"}
                </div>
                <div className="icon">
                  <img
                    src={BankIcon}
                    alt="Bank Icon"
                    width={17.6}
                    height={17.6}
                    style={{
                      top: "2.2px",
                      left: "2.2px",
                      borderWidth: "2px",
                      transform: "rotate(0deg)",
                      opacity: 1,
                    }}
                  />
                </div>
              </div>
            </div>
            <div className="card-lower">
              <div className="card-number">
                <span>
                  {role === "superadmin" ? home?.totalMonthlyFee : home?.totalMonthlysalary}
                </span>
              </div>
              {role === "superadmin" ?
                (<div className="card-stats info">
                  <div className="stats-text">

                    <span>
                      <img src={BlueArrow} alt="BlueArrow" width={13} height={10} />
                      </span>{home?.totalpaidpayment} payment's
                    
                  </div>
                </div>
                ) : (
                  <div className="card-stats error">
                    <div className="stats-text">
                       <span>
                      <img src={Arrow} alt="Arrow" width={13} height={10} />
                      </span>
                     {home?.totalpaidsalary} employee's
                    </div>
                  </div>
                )}
              
            </div>
          </div>
        </div>
      </section>



      <section className="quick-actions-section" aria-label="Quick actions">
        <div className="quick-holder">
          <h2 className="quick-heading">Quick actions</h2>

          {role === "superadmin" ? (
            <div
              className="quick-buttons"
              style={{
                gridTemplateColumns: "1fr",
                backgroundColor: primaryColor,
                borderRadius: "8px",

              }}
            >
              <button
                type="button"
                className="quick-action outline"
                style={{
                  cursor: "Pointer",
                  transform: "none",
                }}

                onClick={() => navigate("/user-profile/add/admin")}
              >
                <div className="action-holder">
                  <PlusSquare size={20} stroke="#FFFFFF" className="icon" />
                  <div className="action-text" style={{ color: "#FFFFFF" }}>
                    Add a new admin
                  </div>
                </div>
              </button>
            </div>
          ) : (
            <div className="quick-buttons"

            >
              <button
                type="button"
                className="quick-action outline"
                style={{ cursor: "Pointer" }}
                onClick={() => navigate("/task/new")}
              >
                <div className="action-holder">
                  <PlusSquare size={20} stroke={primaryColor} className="icon" />
                  <div className="action-text">Create new task</div>
                </div>
              </button>
              <button
                type="button"
                className="quick-action outline"
                style={{ cursor: "Pointer" }}
                onClick={() => navigate("/sop/new")}
              >
                <div className="action-holder">
                  <img
                    src={SopIcon}
                    alt="SopIcon"
                    width={17}
                    height={17}
                    style={{
                      borderWidth: "2px",
                      transform: "rotate(0deg)",
                    }}
                  />
                  <div className="action-text">Add new SOP</div>
                </div>
              </button>
              <button
                type="button"
                className="quick-action outline"
                style={{ cursor: "Pointer" }}
                onClick={() => navigate("/ai-review")}

              >
                <div className="action-holder">

                  <img
                    src={BlueCheckIcon}
                    alt="CheckIcon"
                    width={16}
                    height={16}
                    style={{
                      borderWidth: "2px",
                      transform: "rotate(0deg)",
                 
                    }}
                  />
                  <div className="action-text">Review AI validation</div>
                </div>
              </button>
              <button
                type="button"
                className="quick-action outline"
                style={{ cursor: "Pointer" }}
                onClick={() => navigate("/issue")}
              >
                <div className="action-holder">
                
                  <img
                    src={IssueIcon}
                    alt="IssueIcon"
                    width={15.07}
                    height={15.07}
                    style={{
                      borderWidth: "2px",
                      transform: "rotate(0deg)",
                    }}
                  />
                  <div className="action-text">Issue raised</div>
                </div>
              </button>
            </div>
          )}
        </div>
      </section>


      <section className="home-lower" aria-label="Lower cards">
        <div className="activity-panel">
          <div className="panel-header">
            <h2 className="panel-heading">
              {role === "superadmin"
                ? "Total payments"
                : "Recent task activity"}
            </h2>
            <div
              className="period-selector"
              style={{ position: "relative", cursor: "pointer" }}
              onClick={() => setShowPeriodDropdown(!showPeriodDropdown)}
            >
              <div className="period-text">{period}</div>

              <img
                src={Vector}
                alt="Vector"
                width={9}
                height={11}
                style={{
                  transition: "0.3s",
                  transform: showPeriodDropdown ? "none" : "rotate(180deg)",
                }}
              ></img>

              {showPeriodDropdown && (
                <div className="period-dropdown">
                  {periods
                    .filter((p) => p !== period)
                    .map((p) => (
                      <div
                        key={p}
                        className={`period-option ${period === p ? "active" : ""
                          }`}
                        onClick={(e) => {
                          e.stopPropagation();
                          setPeriod(p);
                          setShowPeriodDropdown(false);
                        }}
                      >
                        {p}
                      </div>
                    ))}
                </div>
              )}
            </div>
          </div>
          <div className="activity-content">
            {role === "superadmin" ? (
              <>
                <div className="pie-chart-container" style={{ marginTop: "4rem" }}>
                  <PieChart
                    series={[
                      {
                        innerRadius: 60,
                        outerRadius: 100,
                        data: paymentchart,
                        arcLabel: (item) => {
                          const total = paymentchart.reduce(
                            (sum, d) => sum + (d.value || 0),
                            0
                          );

                          if (!item.value || total === 0) return "";

                          const percent = ((item.value / total) * 100).toFixed(0);

                          return `${percent}%`;
                        },
                      },
                    ]}
                    {...settings}
                  />

                </div>
                <div className="chart-legend">
                  <h3 className="legend-heading">Payments</h3>
                  <div className="legend-items">
                    <div className="legend-item">
                      <div className="legend-dot success"></div>
                      <div className="legend-text">Payment received</div>
                    </div>
                    <div className="legend-item">
                      <div className="legend-dot error"></div>
                      <div className="legend-text">Payment pending</div>
                    </div>
                  </div>
                </div>
              </>

            ) : (
              <>
                <div className="pie-chart-container" style={{ marginTop: "4rem" }}>
                  <PieChart
                    series={[
                      {
                        innerRadius: 60,
                        outerRadius: 100,
                        data,
                        arcLabel: (item) => {
                          const total = data.reduce(
                            (sum, d) => sum + (d.value || 0),
                            0
                          );

                          if (!item.value || total === 0) return "";

                          const percent = ((item.value / total) * 100).toFixed(0);

                          return `${percent}%`;
                        },
                      },
                    ]}
                    {...settings}
                  />

                </div>


                <div className="chart-legend">
                  <h3 className="legend-heading">Tasks</h3>
                  <div className="legend-items">
                    <div className="legend-item">
                      <div className="legend-dot success"></div>
                      <div className="legend-text">Completed task</div>
                    </div>
                    <div className="legend-item">
                      <div className="legend-dot warning"></div>
                      <div className="legend-text">In-progress task</div>
                    </div>
                    <div className="legend-item">
                      <div className="legend-dot error"></div>
                      <div className="legend-text">Pending task</div>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
        <div className="checkin-panel">
          <div className="panel-header">
            <h2 className="panel-heading">Today's check-in</h2>
            <div
              className="view-all"
              style={{ cursor: "pointer" }}
              onClick={() => {
                role === "superadmin" ? navigate("/checkin") : navigate("/attendance")
              }}>
              <div className="view-text">
                View all
                <img
                  src={ArrowRight}
                  alt="ArrowRight"
                  width={7}
                  height={11}
                  style={{ marginLeft: "5px" }}
                ></img>
              </div>

            </div>
          </div>

          {role !== "superadmin" ?
            <div className="checkin-stats">

              {home?.CheckInEmployee?.slice(0, 7).map((att) => {
                const checkInTime = att?.checkIn ? new Date(att.checkIn) : null;

                const formattedTime = checkInTime
                  ? checkInTime.toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: true,
                  })
                  : "Absent";

                const status = !checkInTime
                  ? "error" // absent
                  : checkInTime.getHours() < 9 ||
                    (checkInTime.getHours() === 9 &&
                      checkInTime.getMinutes() === 0)
                    ? "success" // on-time
                    : "warning"; // late

                return (
                  <div className="checkin-row" key={att._id}>
                    <div className="checkin-name">{att?.name}</div>

                    <div className="checkin-time">
                      <div className={`time-stat ${status}`}>
                        <div className="time-text">{formattedTime}</div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            :
            <div className="checkin-stats">
              {home?.checkedInAdmins?.slice(0, 7).map((admin) => {
                const checkInTime = admin?.checkIn
                  ? new Date(admin.checkIn)
                  : null;

                const formattedTime = checkInTime
                  ? checkInTime.toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: true,
                  })
                  : "Absent";

                const status = !checkInTime
                  ? "error"
                  : checkInTime.getHours() < 9
                    ? "success"
                    : "warning";

                return (
                  <div className="checkin-row" key={admin.adminId}>
                    <div className="checkin-name">{admin.name}</div>

                    <div className="checkin-time">
                      <div className={`time-stat ${status}`}>
                        <div className="time-text">{formattedTime}</div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          }

        </div>
      </section>
    </div>
  );
}
