import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Search as SearchIcon } from "lucide-react";
import FilterIcon from "../assets/taskScreen/FilterIcon.svg";
import Calender from "../assets/Calender.svg?react";
import {
  approveAdvanceRequest,
  approveLeaveRequest,
  getAllAdvanceRequest,
  getAllLeaveRequest,
  fetchAdvancebyFilter,
  fetchLeavebyFilter,

  rejectAdvanceRequest,
  rejectLeaveRequest,
} from "../services/api";
import ReactPaginate from "react-paginate";
import { formatDate } from "../components/ui/DateFormat";
import { formatToYMD } from "../components/ui/DateFormatYMD";
import { useLoader } from "../components/ui/LoaderContext";
import FilterModal from "../components/FilterModal";
import { toast } from "sonner";
export default function Request() {
  const navigate = useNavigate();
  const location = useLocation();
  const { setLoading } = useLoader();
  const [topTab, setTopTab] = useState("advance"); // 'issue' | 'advance' | 'leave'
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");
  const [advanceRequests, setAdvanceRequests] = useState([]);
  const [leaveRequests, setLeaveRequests] = useState([]);
  const queryParams = new URLSearchParams(location.search);
  const tab = queryParams.get("tab");
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);


  useEffect(() => {
    if (tab) {
      setTopTab(tab); // restore correct tab
    }
  }, [tab]);



  const handleViewDetails = (type, id) => {
    navigate(`/request/${type}/${id}?tab=${topTab}`);
  };
  const handleApproveLeave = async (id) => {
    try {
      setLoading(true);
      await approveLeaveRequest(id);
      const page = Number(import.meta.env.VITE_PAGE);
      const limit = Number(import.meta.env.VITE_LIMIT);
      const response = await getAllLeaveRequest(page, limit);
      setLeaveRequests(response?.data || []);
      toast.success("Leave Approved");
    } catch (err) {
      console.error("Error loading issue:", err);
      toast.error("Leave Not Approved");
    } finally {
      setLoading(false);
    }
  };
  const handleRejectLeave = async (id) => {
    try {


      setLoading(true);
      await rejectLeaveRequest(id);
      const page = Number(import.meta.env.VITE_PAGE);
      const limit = Number(import.meta.env.VITE_LIMIT);
      const response = await getAllLeaveRequest(page, limit);
      setLeaveRequests(response?.data || []);
      toast.success("Leave Rejected");
    } catch (err) {
      console.error("Error loading issue:", err);
      toast.error("Leave Not Approved");
    } finally {
      setLoading(false);
    }
  };

  const handleApproveAdvance = async (id) => {
    try {

      setLoading(true);
      await approveAdvanceRequest(id);
      const page = Number(import.meta.env.VITE_PAGE);
      const limit = Number(import.meta.env.VITE_LIMIT);

      const response = await getAllAdvanceRequest(page, limit);
      setAdvanceRequests(response?.data);

      toast.success("Advance Approved");
    } catch (err) {
      console.error("Error loading issue:", err);
      toast.error("Advance Not Approved");
    } finally {
      setLoading(false);
    }
  };
  const handleRejectAdvance = async (id) => {
    try {

      setLoading(true);
      await rejectAdvanceRequest(id);
      const page = Number(import.meta.env.VITE_PAGE);
      const limit = Number(import.meta.env.VITE_LIMIT);
      const response = await getAllAdvanceRequest(page, limit);
      setAdvanceRequests(response?.data);

      toast.success("Advance Rejected");
    } catch (err) {
      console.error("Error loading issue:", err);
      toast.error("Advance Not Approved");
    } finally {
      setLoading(false);
    }
  };

  const applyStatusFilter = (data, status) => {
    if (status === "all") return data;

  };

  const filterAdvanceRequests = (requests) => {
    if (!searchQuery.trim()) return requests;
    const query = searchQuery.toLowerCase();
    return requests.filter(
      (req) =>
        req?.assignTo?.name?.toLowerCase().includes(query) ||
        req?.description?.toLowerCase().includes(query) ||
        req?.status?.toLowerCase().includes(query)

    );
  };

  const filterLeaveRequests = (requests) => {
    if (!searchQuery.trim()) return requests;
    const query = searchQuery.toLowerCase();
    return requests.filter(
      (req) =>
        req?.title?.toLowerCase().includes(query) ||
        req?.reason?.toLowerCase().includes(query) ||
        req?.createdBy?.name?.toLowerCase().includes(query) ||
        req.status.toLowerCase().includes(query)
    );
  };

  const filteredAdvanceRequests = applyStatusFilter(
    filterAdvanceRequests(advanceRequests),
    activeFilter
  );

  const filteredLeaveRequests = applyStatusFilter(
    filterLeaveRequests(leaveRequests),
    activeFilter
  );

  const [selectedFilters, setSelectedFilters] = useState({
    //  priority: [],
    status: [],
  });

  const fetchData = async (page = Number(import.meta.env.VITE_PAGE), limit = Number(import.meta.env.VITE_LIMIT)) => {

    const filters = { search: searchQuery }
    try {

      if (topTab === "advance") {
        const response = await getAllAdvanceRequest(page, limit, filters);
        setAdvanceRequests(response?.data || []);
        setTotalPages(response.totalPages || 1);
      } else if (topTab === "leave") {
        const response = await getAllLeaveRequest(page, limit, filters);
        setLeaveRequests(response?.data || []);
        setTotalPages(response.totalPages || 1);
      }
    } catch (error) {
      console.error("Error fetching requests:", error);
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    setSelectedFilters({ status: [] });
    setSearchQuery("");
    setCurrentPage(0);
    fetchData(1);
  }, [topTab]);


  const handlePageChange = (e) => {

    const selectedPage = e.selected + 1;
    setCurrentPage(selectedPage - 1);
    //  getTasks(selectedPage);
    const hasFilters = Object.values(selectedFilters).some(arr => arr.length > 0);
    if (hasFilters && topTab === "advance") {

      handleApplyAdvanceFilters(selectedFilters, selectedPage);
    }
    else if (hasFilters && topTab === "leave") {
      handleApplyLeaveFilters(selectedFilters, selectedPage);
    }
    else {
      fetchData(selectedPage);
    }

  };

  const filterSections = [
    // {
    //   key: "priority",
    //   label: "Priority",
    //   options: ["Low", "Medium", "High", "Critical"],
    // },
    {
      key: "status",
      label: "Status",
      options: ["Pending", "Completed", "Rejected"],
    },
  ];

  const handleApplyAdvanceFilters = async (filters, page = Number(import.meta.env.VITE_PAGE), limit = Number(import.meta.env.VITE_LIMIT)) => {

    if (!filters) {
      filters = {
        status: [],
        topTab,
      };
    }
    setSelectedFilters(filters);

    try {
      const response = await fetchAdvancebyFilter({ page, limit, filters });

      setAdvanceRequests(response.requests);
      setTotalPages(response.totalPages || 1);
    } catch (error) {
      console.error("Error fetching issues:", error);
    }
  };

  const handleApplyLeaveFilters = async (filters, page = Number(import.meta.env.VITE_PAGE), limit = Number(import.meta.env.VITE_LIMIT)) => {

    if (!filters) {
      filters = {
        status: [],
        topTab,
      };
    }
    setSelectedFilters(filters);

    try {

      const response = await fetchLeavebyFilter({ page, limit, filters });
      setLeaveRequests(response.requests);
      setTotalPages(response.totalPages || 1);
    } catch (error) {
      console.error("Error fetching issues:", error);
    }
  };

  const handleClearFilters = () => {
    setSelectedFilters({
      //priority: [],
      status: [],
    });
  };


  return (
    <div>
      <div className="task-header">
        <div className="issue-tabs">
          <span
            className={`tab ${topTab === "advance" ? "active" : ""} ${topTab === "advance" ? "underline" : ""
              }`}
            onClick={() => setTopTab("advance")}
            style={{ cursor: "pointer" }}
          >
            Advance request
          </span>
          <span
            className={`tab ${topTab === "leave" ? "active" : ""} ${topTab === "leave" ? "underline" : ""
              }`}
            onClick={() => setTopTab("leave")}
            style={{ cursor: "pointer" }}
          >
            Leave request
          </span>
        </div>
        <div className="task-actions">
          {topTab === "advance" && (<FilterModal
            buttonIcon={FilterIcon}
            sections={filterSections}
            initialSelected={selectedFilters}
            onApply={handleApplyAdvanceFilters}
            onClear={handleClearFilters}
          />)}

          {topTab === "leave" && (<FilterModal
            buttonIcon={FilterIcon}
            sections={filterSections}
            initialSelected={selectedFilters}
            onApply={handleApplyLeaveFilters}
            onClear={handleClearFilters}
          />)}

        </div>
      </div>
      {topTab === "advance" && (
        <div className="issues-panel">
          <div
            className="issues-header"
            style={{ display: "flex", alignItems: "center", gap: "20px" }}
          >
            <div className="search">
              <SearchIcon
                size={18}
                style={{ color: "#A8B8C9", flexShrink: 0 }}
              />
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
          </div>
          <div className="issues-list">
            {filteredAdvanceRequests?.length > 0 ? (
              filteredAdvanceRequests?.map((req) => (
                <div key={req?._id} className="issue-card">
                  <div
                    className={`task-color ${req?.status === "Pending" ? "pending" : req?.status
                      }`}
                  />

                  <div className="issue-content">
                    <div className="issue-main">
                      <h3 className="task-heading">
                        Asked: {req?.askedMoney} | Remaining:{" "}
                        {req?.remainingBalance}
                      </h3>
                      <p className="task-sub truncate">
                        Reason for advance: {req?.description}
                      </p>
                      <div className="task-meta">
                        <span>To: {req?.createdBy?.name}</span>

                        <span
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "4px",
                          }}
                        >
                          <Calender />
                          {formatDate(req?.requestDate)}
                        </span>
                        <span
                          className={`badge ${req?.status === "Pending" ? "pending" : req?.status
                            }`}
                        >
                          {req?.status}
                        </span>
                      </div>
                    </div>
                    <div className="issue-actions">
                      <button
                        className="btn ghost"
                        type="button"
                        onClick={() => handleViewDetails("advance", req?._id)}
                      >
                        View details
                      </button>
                      {req?.status === "Pending" && (
                        <button
                          className="btn create"
                          type="button"
                          style={{ background: "#10B981", color: "#FFFFFF" }}
                          onClick={() => handleApproveAdvance(req?._id)}
                        >
                          Approve
                        </button>
                      )}
                      {req?.status === "Pending" && (
                        <button
                          className="btn create"
                          type="button"
                          style={{ background: "#EF4444", color: "#FFFFFF" }}
                          onClick={() => handleRejectAdvance(req?._id)}
                        >
                          Reject
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div
                style={{
                  textAlign: "center",
                  padding: "40px",
                  color: "var(--grey-100)",
                }}
              >
                No advance requests found matching your search.
              </div>
            )}
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
              forcePage={currentPage}
              activeClassName={"active"}
              previousClassName={"page"}
              nextClassName={"page"}
              breakClassName={"page break"}
              disabledClassName={"disabled"}
            />
          </div>
        </div>
      )}

      {topTab === "leave" && (
        <div className="issues-panel">
          <div
            className="issues-header"
            style={{ display: "flex", alignItems: "center", gap: "20px" }}
          >
            <div className="search">
              <SearchIcon
                size={18}
                style={{ color: "#A8B8C9", flexShrink: 0 }}
              />
              <input
                type="text"
                className="search-input"
                placeholder="Search..."
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
          </div>
          <div className="issues-list">
            {filteredLeaveRequests.length > 0 ? (
              filteredLeaveRequests.map((req) => (
                <div key={req?._id} className="issue-card">
                  <div
                    className={`task-color ${req?.status === "Pending" ? "pending" : req?.status
                      }`}
                  />
                  <div className="issue-content">
                    <div className="issue-main">
                      <h3 className="task-heading">{req?.title}</h3>
                      <p
                        className="task-sub"
                        style={{
                          display: "inline-flex",
                          gap: "4px",
                          alignItems: "center",
                        }}
                      >
                        <Calender />
                        {formatToYMD(req?.startDate)} to{" "}
                        {formatToYMD(req?.endDate)}
                      </p>
                      <div className="task-meta">
                        <span>From: {req?.createdBy?.name}</span>
                        {/* <span>{req.date}</span> */}
                        <span
                          className={`badge ${req?.status === "Pending" ? "pending" : req?.status
                            }`}
                        >
                          {req?.status}
                        </span>
                      </div>
                    </div>
                    <div className="issue-actions">
                      <button
                        className="btn ghost"
                        type="button"
                        onClick={() => handleViewDetails("leave", req?._id)}
                      >
                        {/* <Eye className="btn-icon" size={18} /> */}
                        View details
                      </button>
                      {req?.status === "Pending" && (
                        <button
                          className="btn create"
                          type="button"
                          style={{ background: "#10B981", color: "#FFFFFF" }}
                          onClick={() => handleApproveLeave(req?._id)}
                        >
                          Approve
                        </button>
                      )}
                      {req?.status === "Pending" && (
                        <button
                          className="btn create"
                          type="button"
                          style={{ background: "#EF4444", color: "#FFFFFF" }}
                          onClick={() => handleRejectLeave(req?._id)}
                        >
                          Reject
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div
                style={{
                  textAlign: "center",
                  padding: "40px",
                  color: "var(--grey-100)",
                }}
              >
                No leave requests found matching your search.
              </div>
            )}
            <ReactPaginate
              previousLabel={"<"}
              nextLabel={">"}
              breakLabel={"..."}
              pageCount={totalPages}
              marginPagesDisplayed={1}
              pageRangeDisplayed={5}
              onPageChange={handlePageChange}
              forcePage={currentPage}
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
      )}
    </div>
  );
}
