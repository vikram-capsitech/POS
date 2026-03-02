import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Search as SearchIcon } from "lucide-react";
import Calender from "../assets/Calender.svg";
import {
  deleteAiReviewById,
  updateAiReview,
  fetchAiReviewsbyFilter,
} from "../services/api";
import { toast } from "sonner";
import FilterModal from "../components/FilterModal";
import FilterIcon from "../assets/taskScreen/FilterIcon.svg";
import useStore from "../store/store";

export default function AIReview() {
  const navigate = useNavigate();
  const [tab, setTab] = useState("all");
  const { aiReview, getAiReview } = useStore();

  const [searchQuery, setSearchQuery] = useState("");
  const [filteredAiReviews, setFilteredAiReviews] = useState([]);


  useEffect(() => {
    getAiReview();
  }, []);

  const handleApproveReview = async (id) => {
    try {
      const form = new FormData();
      form.append("status", "Passed");
      await updateAiReview(id, form);
      toast.success("Review Approved!");
      await getAiReview();
    } catch (error) {
      console.error("Error Approve  Review:", error);
      toast.error("Something went wrong while Approving the Review!");
    }
  };

  const handleViewDetails = (id) => {
    navigate(`/ai-review/${id}`);
  };
  const handleRejectReview = async (id) => {
    try {
      await deleteAiReviewById(id);
      toast.success("Review Rejected!");
      await getAiReview();
    } catch (error) {
      console.error("Error Rejected  Review:", error);
      toast.error("Something went wrong while Rejecting the Review!");
    }
  };
  const formatDate = (dateString) => {
    const date = new Date(dateString);

    const year = date.getFullYear();

    const month = String(date.getMonth() + 1).padStart(2, "0");

    const day = String(date.getDate()).padStart(2, "0");

    let hours = date.getHours();
    const minutes = String(date.getMinutes()).padStart(2, "0");

    const ampm = hours >= 12 ? "PM" : "AM";
    hours = hours % 12 || 12;

    return `${year}-${month}-${day} at ${hours}:${minutes} ${ampm}`;
  };
  //
  const [selectedFilters, setSelectedFilters] = useState({
    category: [],
    status: [],
  });
  const statusColorMap = {
    Passed: "success",
    Rejected: "danger",
    Pending: "warning",
  };

  useEffect(() => {
    let data = [...aiReview];

    if (tab === "kitchen") {
      data = data.filter((ai) => ai?.task?.category === "Cleaning");
    } else if (tab === "Maintenance") {
      data = data.filter((ai) => ai?.task?.category === "Maintenance");
    }

    //   // SEARCH FILTER
    if (searchQuery.trim()) {
      data = data.filter(
        (ai) =>
          ai?.task?.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          ai?.task?.description.toLowerCase().includes(searchQuery.toLowerCase()),
      );
    }
    if (selectedFilters.category.length > 0) {
      data = data.filter((ai) =>
        selectedFilters.category.includes(ai?.task?.category),
      );
    }

    // FILTER MODAL

    if (selectedFilters.status.length > 0) {
      data = data.filter((ai) => selectedFilters.status.includes(ai.status));
    }
    setFilteredAiReviews(data);
  }, [tab, aiReview, searchQuery, selectedFilters]);

  const filterSections = [
    {
      key: "category",
      label: "Category",
      options: ["Cleaning", "Maintenance"],
    },
    {
      key: "status",
      label: "Status",
      options: ["Rejected", "Passed"],
    },
  ];

  const handleApplyFilters = async (filters) => {
    setSelectedFilters(filters);
    try {
      const body = {
        category: filters.category,
        status: filters.status,
        searchQuery,
        tab,
      };
      const response = await fetchAiReviewsbyFilter(body);
      setFilteredAiReviews(response?.data);

      let data = [...response];

      // TAB FILTER
      if (tab === "kitchen") {
        data = data.filter((ai) => ai.category === "Cleaning");
      } else if (tab === "Maintenance") {
        data = data.filter((ai) => ai.category === "Maintenance");
      }
      if (searchQuery.trim()) {
        data = data.filter(
          (ai) =>
            ai.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            ai.description.toLowerCase().includes(searchQuery.toLowerCase()),
        );
      }
    } catch (error) {
      console.error("Error fetching filtered AI Reviews:", error);
    }
  };

  const handleClearFilters = () => {
    setSelectedFilters({
      category: [],
      status: [],
    });
  };

  return (
    <div>
      <div className="task-header">
        <div className="issue-tabs">
          <span
            className={`tab ${tab === "all" ? "active underline" : "dim"}`}
            onClick={() => setTab("all")}
            style={{ cursor: "pointer" }}
          >
            All
          </span>
          <span
            className={`tab ${tab === "kitchen" ? "active underline" : "dim"}`}
            onClick={() => setTab("kitchen")}
            style={{ cursor: "pointer" }}
          >
            Kitchen
          </span>
          <span
            className={`tab ${
              tab === "Maintenance" ? "active underline" : "dim"
            }`}
            onClick={() => setTab("Maintenance")}
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
            onApply={handleApplyFilters}
            onClear={handleClearFilters}
          />
        </div>
      </div>

      <div className="panel">
        <div className="issues-header">
          <div className="search">
            <SearchIcon size={18} style={{ color: "#A8B8C9", flexShrink: 0 }} />
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

        {filteredAiReviews?.map((ai) => (
          <div className="ai-review-list" key={ai?._id}>
            <div className="ai-card">
              <div
                className="ai-image"
                style={{
                  backgroundImage: `url(${ai?.images[0]})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }}
              ></div>
              <div className="ai-content">
                <div className="task-main">
                  <h3 className="task-heading">{ai?.task?.title}</h3>
                  <p className="task-sub truncate">{ai?.task?.description}</p>
                  <div className="task-meta">
                    <span>By: {ai?.owner?.name}</span>
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
                        alt="Calender"
                        width={12}
                        height={14}
                      />{" "}
                      {formatDate(ai?.updatedAt)}
                    </span>
                    <span className="badge info">{ai?.task?.category}</span>
                    <span
                      className={`badge ${
                        statusColorMap[ai?.status] || "info"
                      }`}
                    >
                      {ai?.status}
                    </span>
                  </div>
                  <div style={{ display: "inline-flex", gap: "4px" }}>
                    <button
                      className="btn ghost"
                      type="button"
                      onClick={() => handleViewDetails(ai?._id)}
                    >
                      View details
                    </button>
                    {ai?.status !== "Passed" && (
                      <button
                        className="btn ghost"
                        type="button"
                        onClick={() => handleApproveReview(ai?._id)}
                        style={{ backgroundColor: "#10B981", color: "#FFFFFF" }}
                      >
                        Approve
                      </button>
                    )}
                    {ai?.status !== "Rejected" && (
                      <button
                        className="btn ghost"
                        type="button"
                        onClick={() => handleRejectReview(ai?._id)}
                        style={{ backgroundColor: "#EF4444", color: "#FFFFFF" }}
                      >
                        Reject
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
