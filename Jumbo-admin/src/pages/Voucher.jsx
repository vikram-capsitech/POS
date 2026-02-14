import { useState,  useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import FilterIcon from "../assets/taskScreen/FilterIcon.svg";
import CreateTaskIcon from "../assets/homeScreen/CreateTaskIcon.svg";
import Calender from "../assets/Calender.svg";
import useStore from "../store/store";
import FilterModal from "../components/FilterModal";
import {  fetchVouchers } from "../services/api";
import ReactPaginate from "react-paginate";

export default function VOUCHER() {
  const navigate = useNavigate();
  const location = useLocation();
  const { fetchEmployees, employees } = useStore();
  const [tab, setTab] = useState(location.state?.tab || "Active");

  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const [vouchers, setVouchers] = useState([]);
  const [selectedFilters, setSelectedFilters] = useState({
    assignTo: [],
    monthYear: "", // format: YYYY-MM
  });

  const handleViewDetails = (sopId) => {
    navigate(`/voucher/${sopId}`, {
      state: { tab },
    });
  };
  const handleCreateVoucher = () => {
    navigate("/voucher/new", { state: { tab } });
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
      key: "assignTo",
      label: "User To",
      dynamicOptions: employees || [],
      type: "checkbox",
    },
    {
      key: "monthYear",
      label: "Month & Year",
      type: "month",
    },
  ];

  useEffect(() => {
    setCurrentPage(0);
    handleApplyFilters(1);
  }, [tab, selectedFilters]);

  const handleApplyFilters = async (
    page = Number(import.meta.env.VITE_PAGE),
    limit = Number(import.meta.env.VITE_LIMIT),
  ) => {
    try {
      const filter = {
      status: tab, // Active / In-active
      assignTo: selectedFilters.assignTo,
      monthYear: selectedFilters.monthYear, // YYYY-MM
    };
      const response = await fetchVouchers(page, limit, filter);

      setVouchers(response?.data);
      setTotalPages(response.pagination.totalPages || 1);
    } catch (error) {
      console.error("Error fetching filtered SOPs:", error);
    }
  };

  const handlePageChange = (e) => {
    const page = e.selected + 1;
    setCurrentPage(e.selected);
    handleApplyFilters(page);
  };

  const handleClearFilters = () => {
    setSelectedFilters({
      assignTo: [],
      monthYear: "",
    });
  };

  return (
    <div>
      <div className="task-header">
        <div className="issue-tabs">
          <span
            className={`tab ${tab === "Active" ? "active underline" : "dim"}`}
            onClick={() => setTab("Active")}
            style={{ cursor: "pointer" }}
          >
            Active
          </span>
          <span
            className={`tab ${tab === "In-active" ? "active underline" : "dim"}`}
            onClick={() => setTab("In-active")}
            style={{ cursor: "pointer" }}
          >
            In-active
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
            fetchEmployees={fetchEmployees}
            task={true}
          />

          <button
            className="btn create"
            type="button"
            onClick={handleCreateVoucher}
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
            Create new voucher
          </button>
        </div>
      </div>

      <div className="sop-panel">
        <div className="issues-list">
          {vouchers?.length > 0 ? (
            vouchers?.map((sop) => (
              <div key={sop?._id} className="issue-card">
                <div className="task-color" />
                <div className="issue-content">
                  <div className="issue-main">
                    <h3 className="task-heading">{sop?.title}</h3>
                    <p className="task-sub truncate">{sop?.description}</p>
                    <div className="task-meta">
                      <span>By: {sop?.createdBy?.name}</span>

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
                      <span
                        className={`badge ${sop?.status === "Active" ? "Completed" : "danger"}`}
                      >
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
              No Vouchers found.
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
