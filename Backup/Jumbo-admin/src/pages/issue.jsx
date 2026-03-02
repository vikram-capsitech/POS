import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Search as SearchIcon } from "lucide-react";
import FilterIcon from "../assets/taskScreen/FilterIcon.svg";
import CreateTaskIcon from "../assets/homeScreen/CreateTaskIcon.svg";
import Calender from "../assets/Calender.svg?react";
import {
  getAllIssueRequest,
  updateRequestIssue,
  fetchRequestbyFilter,
} from "../services/api";
import { formatDate } from "../components/ui/DateFormat";
import FilterModal from "../components/FilterModal";
import { useLoader } from "../components/ui/LoaderContext";
import { useSearchStore } from "../store/searchStore";
import ReactPaginate from "react-paginate";
import { toast } from "sonner";

export default function IssueRaise() {
  const navigate = useNavigate();
  const location = useLocation();

  const { setLoading } = useLoader();
  const [topTab, setTopTab] = useState("admin");
  const [requestIssue, setRequestIssue] = useState([]);
  const searchQuery = useSearchStore((state) => state.searchQuery);
  const setSearchQuery = useSearchStore((state) => state.setSearchQuery);
  const queryParams = new URLSearchParams(location.search);
  const tab = queryParams.get("tab");
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedFilters, setSelectedFilters] = useState({
    priority: [],
    status: [],
  });
  const TAB_RaisedBy_MAP = {
    admin: "admin",
    user: "user",
  };

  useEffect(() => {
    return () => {
      setSearchQuery("");
    };
  }, []);

  useEffect(() => {
    const activeTab = tab || "admin";

    setTopTab(activeTab); // UI highlight only
    setSelectedFilters({ priority: [], status: [] });
    setCurrentPage(0);

    fetchData(1, undefined, activeTab);
  }, [tab]);

  const fetchData = async (
    page = Number(import.meta.env.VITE_PAGE),
    limit = Number(import.meta.env.VITE_LIMIT),
    activeTab = topTab,
  ) => {
    const filters = {
      search: searchQuery,
      raisedBy: TAB_RaisedBy_MAP[activeTab],
    };
    try {
      setLoading(true);
      const response = await getAllIssueRequest(page, limit, filters);
      setRequestIssue(response?.data);
      setTotalPages(response.totalPages || 1);
    } catch (error) {
      console.error("Error fetching Request Issues:", error);
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (e) => {
    const selectedPage = e.selected + 1;
    setCurrentPage(selectedPage - 1);
    const activeTab = tab || "admin";

    const hasFilters = Object.values(selectedFilters).some(
      (arr) => arr.length > 0,
    );
    if (hasFilters) {
      handleApplyFilters(selectedFilters, selectedPage);
    }

    //  }
    else {
      fetchData(selectedPage, undefined, activeTab);
    }
  };

  const filterSections = [
    {
      key: "priority",
      label: "Priority",
      options: ["Low", "Medium", "High", "Critical"],
    },
    {
      key: "status",
      label: "Status",
      options: ["Pending", "Completed", "Rejected"],
    },
  ];

  const handleRaiseIssue = () => {
    navigate("/issue/raise");
  };

  const handleViewDetails = (id) => {
    navigate(`/issue/${id}?tab=${topTab}`);
  };
  const handleIsuueRejectOrApprove = async (id, status) => {
    try {
      setLoading(true);
      await updateRequestIssue(id, status);
      const activeTab = tab || topTab;
      const page = currentPage + 1;
      const hasFilters = Object.values(selectedFilters).some(
        (arr) => arr.length > 0,
      );

      if (hasFilters) {
        await handleApplyFilters(selectedFilters, page);
      } else {
        await fetchData(page, undefined, activeTab);
      }

      toast.success("Issue Updated ");
    } catch (err) {
      console.error("Error Updating issue:", err);
      toast.error("Issue Not updated");
    } finally {
      setLoading(false);
    }
  };
  const applyStatusFilter = (data, status) => {
    if (status === "all") return data;

    return data.filter(
      (item) => item.status?.toLowerCase() === status.toLowerCase(),
    );
  };

  const filterIssues = (issues) => {
    if (!searchQuery.trim()) return issues;
    const query = searchQuery.toLowerCase();

    return issues.filter((issue) => {
      const assignee = issue.assignTo?.[0]?.name || "";
      return (
        issue.title?.toLowerCase().includes(query) ||
        issue.description?.toLowerCase().includes(query) ||
        assignee.toLowerCase().includes(query) ||
        issue.priority?.toLowerCase().includes(query)
      );
    });
  };

  const adminIssues = requestIssue?.filter((i) => i?.raisedBy === "admin");
  const userIssues = requestIssue?.filter((i) => i?.raisedBy === "user");

  const filteredUserIssues = applyStatusFilter(filterIssues(userIssues), "all");
  const filteredAdminIssues = applyStatusFilter(
    filterIssues(adminIssues),
    "all",
  );

  const handleApplyFilters = async (
    filters,
    page = Number(import.meta.env.VITE_PAGE),
    limit = Number(import.meta.env.VITE_LIMIT),
  ) => {
    try {
      const filter = {
        status: [],
        priority: [],
        raisedBy: TAB_RaisedBy_MAP[topTab],
        ...filters,
      };

      setSelectedFilters(filter);

      const response = await fetchRequestbyFilter(page, limit, filter);

      setRequestIssue(response.requests);
      setTotalPages(response.totalPages || 1);
    } catch (error) {
      console.error("Error fetching issues:", error);
    }
  };
  const handleClearFilters = () => {
    setSelectedFilters({
      priority: [],
      status: [],
    });
  };

  return (
    <div>
      <div className="task-header">
        <div className="issue-tabs">
          <span
            className={`tab ${topTab === "admin" ? "active" : ""} ${
              topTab === "admin" ? "underline" : ""
            }`}
            onClick={() => navigate(`/issue?tab=admin`)}
            style={{ cursor: "pointer" }}
          >
            Issue raised by admin
          </span>
          <span
            className={`tab ${topTab === "user" ? "active" : ""} ${
              topTab === "user" ? "underline" : ""
            }`}
            onClick={() => navigate(`/issue?tab=user`)}
            style={{ cursor: "pointer" }}
          >
            Issue raised by user
          </span>
        </div>
        <div className="task-actions">
          <FilterModal
            buttonIcon={FilterIcon}
            sections={filterSections}
            initialSelected={selectedFilters}
            onApply={handleApplyFilters}
            onClear={handleClearFilters}
          />

          <button
            className="btn create"
            type="button"
            onClick={handleRaiseIssue}
          >
            <img
              src={CreateTaskIcon}
              alt="CreateTaskIcon"
              width={15}
              height={15}
              style={{
                borderWidth: "2px",
                transform: "rotate(0deg)",
                opacity: 1,
              }}
            />
            Raise an issue
          </button>
        </div>
      </div>

      {topTab === "admin" && (
        <div className="issues-panel">
          <div className="issues-list">
            {filteredAdminIssues?.length > 0 ? (
              filteredAdminIssues?.map((issue) => (
                <div key={issue?._id} className="issue-card">
                  <div className={`task-color ${issue?.status}`} />
                  <div className="issue-content">
                    <div className="issue-main">
                      <h3 className="task-heading">{issue?.title}</h3>
                      <p className="task-sub truncate">{issue?.description}</p>
                      <div className="task-meta">
                        <span>To: {issue?.assignTo?.[0]?.name}</span>

                        <span
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "4px",
                          }}
                        >
                          <Calender />
                          {formatDate(issue?.createdAt)}
                        </span>
                        <span className={`badge ${issue?.status}`}>
                          {issue?.status}
                        </span>
                        {issue?.category && (
                          <span className="badge category">
                            {issue?.category}
                          </span>
                        )}
                      </div>
                    </div>
                    <div style={{ display: "inline-flex", gap: "8px" }}>
                      <button
                        className="btn ghost"
                        type="button"
                        style={{ color: "#0F0F0F" }}
                        onClick={() => handleViewDetails(issue?._id)}
                      >
                        View details
                      </button>
                      {issue?.status === "Pending" && (
                        <button
                          className="btn ghost"
                          type="button"
                          style={{ background: "#10B981", color: "#FFFFFF" }}
                          onClick={() =>
                            handleIsuueRejectOrApprove(issue?._id, "Completed")
                          }
                        >
                          Resolve
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
                No issues found matching your search.
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
              activeClassName={"active"}
              previousClassName={"page"}
              nextClassName={"page"}
              breakClassName={"page break"}
              disabledClassName={"disabled"}
            />
          </div>
        </div>
      )}

      {topTab === "user" && (
        <div className="issues-panel">
          <div className="issues-list">
            {filteredUserIssues?.length > 0 ? (
              filteredUserIssues?.map((issue) => (
                <div key={issue?._id} className="issue-card">
                  <div className={`task-color ${issue?.status}`} />
                  <div className="issue-content">
                    <div className="issue-main">
                      <h3 className="task-heading">{issue?.title}</h3>
                      <p className="task-sub truncate">{issue?.description}</p>
                      <div className="task-meta">
                        <span>By: {issue?.createdBy?.name}</span>
                        <span
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "4px",
                          }}
                        >
                          <Calender />
                          {formatDate(issue?.createdAt)}
                        </span>
                        <span className={`badge ${issue?.status}`}>
                          {issue?.status}
                        </span>
                      </div>
                    </div>
                    <div style={{ display: "inline-flex", gap: "8px" }}>
                      <button
                        className="btn ghost"
                        type="button"
                        onClick={() => handleViewDetails(issue?._id)}
                      >
                        View details
                      </button>
                      {issue?.status === "Pending" && (
                        <button
                          className="btn ghost"
                          type="button"
                          style={{ background: "#10B981", color: "#FFFFFF" }}
                          onClick={() =>
                            handleIsuueRejectOrApprove(issue?._id, "Completed")
                          }
                        >
                          Resolve
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
                No issues found matching your search.
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
