import { useState,  useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import FilterIcon from "../assets/taskScreen/FilterIcon.svg";
import FilterModal from "../components/FilterModal";
import CreateTaskIcon from "../assets/homeScreen/CreateTaskIcon.svg";
import useStore from "../store/store";
import { fetchTasks, fetchTasksbyFilter } from "../services/api";
import Calender from "../assets/Calender.svg";
import moment from "moment";
import ReactPaginate from "react-paginate";
export default function Task() {
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");
  const { fetchEmployees, employees } = useStore();

  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    getTasks(1);
    setCurrentPage(0);
  }, []);

  useEffect(() => {
    const handleSearch = (e) => {
      if (e.detail.page === "/task" || e.detail.page === "/task/new") {
        setSearchQuery(e.detail.query);
      }
    };

    window.addEventListener("navbar-search", handleSearch);
    return () => window.removeEventListener("navbar-search", handleSearch);
  }, []);

  const [selectedFilters, setSelectedFilters] = useState({
    category: [],
    assignTo: [],
    priority: [],
    status: [],
  });
  const filterSections = [
    {
      key: "category",
      label: "Category",
      options: ["Cleaning", "Kitchen", "Purchase", "Others"],
    },
    {
      key: "assignTo",
      label: "Assign To",
      dynamicOptions: employees || [],
    },
    {
      key: "priority",
      label: "Priority",
      options: ["High", "Medium", "Low"],
    },
    {
      key: "status",
      label: "Status",
      options: ["Completed", "Pending", "In-progress"],
    },
  ];

  const handleClearFilters = () => {
    setSelectedFilters({
      category: [],
      assignTo: [],
      priority: [],
      status: [],
    });
    getTasks(1);
  };


  const handleViewDetails = async (taskId) => {
    navigate(`/task/${taskId}`);
  };



  const getTasks = async (
    page = Number(import.meta.env.VITE_PAGE),
    limit = Number(import.meta.env.VITE_LIMIT),
  ) => {
    const filters = { search: searchQuery };
    try {
      const response = await fetchTasks(page, limit, filters);

      setData(response.tasks);
      setTotalPages(response.totalPages || 1);
      //  setNewTasksCount(response.newTasksCount || 0);
    } catch (error) {
      console.error(error);
    }
  };
  const handlePageChange = (e) => {
    const selectedPage = e.selected + 1;
    setCurrentPage(selectedPage - 1);
    const hasFilters = Object.values(selectedFilters).some(
      (arr) => arr.length > 0,
    );
    if (hasFilters) {
      handleApplyFilters(selectedFilters, selectedPage);
    } else {
      getTasks(selectedPage);
    }
  };

  // Apply filters
  let filteredTasks = data;

  // Apply category filter
  if (activeFilter !== "all") {
    filteredTasks = filteredTasks.filter(
      (t) => t.category.toLowerCase() === activeFilter.toLowerCase(),
    );
  }

  // Apply search filter
  if (searchQuery.trim()) {
    const query = searchQuery?.toLowerCase();
    filteredTasks = filteredTasks?.filter(
      (task) =>
        task?.title?.toLowerCase()?.includes(query) ||
        task?.description?.toLowerCase()?.includes(query) ||
        task?.assignTo?.some((emp) =>
          emp?.name?.toLowerCase()?.includes(query?.toLowerCase()),
        ) ||
        task?.category?.toLowerCase()?.includes(query),
    );
  }

  const handleApplyFilters = async (
    filters,
    page = Number(import.meta.env.VITE_PAGE),
    limit = Number(import.meta.env.VITE_LIMIT),
  ) => {
    if (!filters) {
      filters = {
        category: [],
        assignTo: [],
        priority: [],
        status: [],
      };
    }
    setSelectedFilters(filters);
    try {
      const response = await fetchTasksbyFilter({ page, limit, filters });
      setData(response.tasks);
      setTotalPages(response.totalPages || 1);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div>
      <div className="task-header">
        <h1 className="task-title">Task overview</h1>
        <div className="task-actions">
          <div className="filter-wrapper" style={{ position: "relative" }}>
            <FilterModal
              buttonIcon={FilterIcon}
              sections={filterSections}
              initialSelected={selectedFilters}
              onApply={handleApplyFilters}
              onClear={handleClearFilters}
              task={true}
              fetchEmployees={fetchEmployees}
            />
          </div>
          <Link className="btn create" to="/task/new">
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
            Create new task
          </Link>
        </div>
      </div>
      <div className="sop-panel">
        <div className="issues-list">
          {filteredTasks.length > 0 ? (
            filteredTasks.map((task) => (
              <div key={task.id} className="issue-card">
                <div
                  className="task-color"
                  style={{
                    backgroundColor:
                      task?.priority === "Medium"
                        ? "orange"
                        : task?.priority === "Low"
                          ? "lightgreen"
                          : task?.priority === "High"
                            ? "red"
                            : "blue",
                  }}
                />
                <div className="issue-content">
                  <div className="issue-main">
                    <h3 className="task-heading">{task?.title}</h3>
                    <p className="task-sub truncate">{task?.description}</p>

                    <div className="task-meta">
                      <span>{task?.assignTo?.[0]?.name}</span>

                      <span
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "4px",
                        }}
                      >
                        {""}
                        <img
                          src={Calender}
                          alt="Calander"
                          width={12}
                          height={14}
                        />
                        {task?.deadline?.endDate
                          ? moment(task.deadline?.endDate).format(
                              "YYYY-MM-DD [at] h:mm A",
                            )
                          : ""}
                      </span>
                      <span className="chip">{task?.category}</span>
                    </div>
                  </div>
                  <button
                    className="btn ghost"
                    type="button"
                    onClick={() => handleViewDetails(task._id)}
                  >
                    View details
                  </button>
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
              No tasks found matching your search criteria.
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
            forcePage={currentPage}
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
