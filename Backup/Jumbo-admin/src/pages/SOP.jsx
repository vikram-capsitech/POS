import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Search as SearchIcon } from "lucide-react";
import FilterIcon from "../assets/taskScreen/FilterIcon.svg";
import CreateTaskIcon from "../assets/homeScreen/CreateTaskIcon.svg";
import Calender from "../assets/Calender.svg";
import FilterModal from "../components/FilterModal";
import { fetchSopsbyFilter } from "../services/api";
import ReactPaginate from "react-paginate";

export default function SOP() {
  const navigate = useNavigate();
  const location = useLocation();
  const [tab, setTab] = useState(location.state?.tab || "cleaning");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);


  const [filteredSops, setFilteredSops] = useState([]);
  const [selectedFilters, setSelectedFilters] = useState({
    difficultyLevel: [],
  });



  const handleViewDetails = (sopId) => {
    navigate(`/sop/${sopId}`, {
      state: { tab },
    });
  };
  const handleCreateSOP = () => {
    navigate("/sop/new", { state: { tab } });
  };

  const handleViewDraft = () => {
    navigate("/sop/draft", { state: { tab } });
  };

  useEffect(() => {
    if (location.state?.tab) {
      setTab(location.state.tab);
    }
  }, [location.state]);

  const formatDate = (isoString) => {
    const date = new Date(isoString);
    // Format: YYYY-MM-DD
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0"); // months are 0-indexed
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const filterSections = [
    {
      key: "difficultyLevel",
      label: "Difficulty Level",
      options: ["Easy", "Medium", "Hard"],
    },
  ];

  useEffect(() => {
    setCurrentPage(0);
    handleApplyFilters(1);
  }, [tab, selectedFilters]);

  const TAB_CATEGORY_MAP = {
    cleaning: "Cleaning",
    kitchen: "Kitchen",
    maintenance: "Maintenance",
  };
  const handleApplyFilters = async (page = Number(import.meta.env.VITE_PAGE),
    limit = Number(import.meta.env.VITE_LIMIT)) => {
    try {
      const filter = { ...selectedFilters, category: TAB_CATEGORY_MAP[tab] };
      const response = await fetchSopsbyFilter(page, limit, filter);

      setFilteredSops(response?.data);
      setTotalPages(response.totalPages || 1);
    } catch (error) {
      console.error("Error fetching filtered SOPs:", error);
    }
  };

  const displayedSops = filteredSops.filter(
    (sop) =>
      sop.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sop.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handlePageChange = (e) => {
    const page = e.selected + 1;
    setCurrentPage(e.selected);
    handleApplyFilters(page);
  };

  const handleClearFilters = () => {
    setSelectedFilters({
      // category: [],
      difficultyLevel: [],
    });
  };

  return (
    <div>
      <div className="task-header">
        <div className="issue-tabs">
          <span
            className={`tab ${tab === "cleaning" ? "active underline" : "dim"}`}
            onClick={() => setTab("cleaning")}
            style={{ cursor: "pointer" }}
          >
            Cleaning
          </span>
          <span
            className={`tab ${tab === "kitchen" ? "active underline" : "dim"}`}
            onClick={() => setTab("kitchen")}
            style={{ cursor: "pointer" }}
          >
            Kitchen
          </span>
          <span
            className={`tab ${tab === "maintenance" ? "active underline" : "dim"
              }`}
            onClick={() => setTab("maintenance")}
            style={{ cursor: "pointer" }}
          >
            Maintenance
          </span>
        </div>
        <div className="task-actions">
          <FilterModal
            buttonIcon={FilterIcon}
            sections={filterSections}
            initialSelected={selectedFilters}
            onApply={(filters) => {
              setSelectedFilters(filters);
              setCurrentPage(0);
            }}
            onClear={() => {
              handleClearFilters();
              setCurrentPage(0);
            }}
          />

          <button
            className="btn create"
            type="button"
            onClick={handleCreateSOP}
          >
            {/* <Plus className="btn-icon" size={18} /> */}
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
            Add new SOP
          </button>
        </div>
      </div>

      <div className="sop-panel">
        <div className="issues-header">
          <div className="search">
            <SearchIcon size={18} style={{ color: "#A8B8C9", flexShrink: 0 }} />
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
          <button
            className="btn create"
            type="button"
            onClick={handleViewDraft}
          >
            View draft
          </button>
        </div>

        <div className="issues-list">
          {displayedSops?.length > 0 ? (
            displayedSops?.map((sop) => (
              <div key={sop?._id} className="issue-card">
                <div className="task-color" />
                <div className="issue-content">
                  <div className="issue-main">
                    <h3 className="task-heading">{sop?.title}</h3>
                    <p className="task-sub truncate">{sop?.description}</p>
                    <div className="task-meta">
                      <span>By: {sop?.owner?.name}</span>

                      <span
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "4px",
                        }}
                      >
                        {" "}
                        <img
                          src={Calender}
                          alt="Calander"
                          width={12}
                          height={14}
                        />{" "}
                        {formatDate(sop?.updatedAt)}
                      </span>
                      <span className={`badge ${sop?.statusClass}`}>
                        {sop?.status}
                      </span>
                    </div>
                  </div>
                  <div style={{ display: "inline-flex", gap: "6px" }}>
                    <button
                      className="btn ghost"
                      type="button"
                      onClick={() => handleViewDetails(sop._id)}
                    >
                      View details
                    </button>
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
              No SOPs found matching your criteria.
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
    </div>
  );
}
