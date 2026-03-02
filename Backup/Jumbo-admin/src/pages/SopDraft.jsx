import { useNavigate, useLocation } from "react-router-dom";

import { useEffect,  useState } from "react";
import CreateTaskIcon from "../assets/homeScreen/CreateTaskIcon.svg";
import Calender from "../assets/Calender.svg";
import { SearchIcon } from "lucide-react";
import { toast } from "sonner";
import { deleteSOPById} from "../services/api";
import useStore from "../store/store";
import ReactPaginate from "react-paginate";
export default function SOPDRAFT() {

  const navigate = useNavigate();
  const location = useLocation();
  const [tab, setTab] = useState(location.state?.tab || "cleaning");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(0);


  const { sops, fetchSops, totalPages} = useStore();

  const TAB_CATEGORY_MAP = {
    cleaning: "Cleaning",
    kitchen: "Kitchen",
    maintenance: "Maintenance",
  };


  const filters = ({
    search: searchQuery,
    status: "Draft",
    category: TAB_CATEGORY_MAP[tab] || "Cleaning",
  });
  useEffect(() => {

    setCurrentPage(0);
    fetchSops(Number(import.meta.env.VITE_PAGE),
      Number(import.meta.env.VITE_LIMIT), { search: searchQuery, status: "Draft", category: TAB_CATEGORY_MAP[tab] || "Cleaning" }); // fetch SOPs on mount
  }, [tab]);



  const handleViewSop = () => {
    navigate("/sop", { state: { tab } });
  };

  const handleResumeSop = (id) => {
    navigate(`/sop/new/${id}`, { state: { tab } });
  };

  const handlePageChange = (e) => {
    const selectedPage = e.selected + 1;
    setCurrentPage(selectedPage - 1);


    fetchSops(selectedPage, 2, filters);

  };
  const handleDiscardSop = async (sopId) => {
    try {
      await deleteSOPById(sopId);
      toast.success("SOP Discarded Succesfully");
      await fetchSops();
    } catch (error) {
      console.error("Error submitting  SOP:", error);
      toast.error("Something went wrong while Deleting the SOP!");
    }
  }

  const handleCreateSOP = () => {
    navigate("/sop/new");
  };

  const formatDate = (isoString) => {
    const date = new Date(isoString);
    // Format: YYYY-MM-DD
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0'); // months are 0-indexed
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const filteredSops = sops?.filter((sop) => {
    if (sop?.status !== "Draft") return false;
    if (tab.toLowerCase() !== sop?.category?.toLowerCase()) return false;

    if (
      searchQuery &&
      !sop?.title?.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !sop?.description?.toLowerCase().includes(searchQuery.toLowerCase())
    )
      return false;
    return true;
  });

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
          <button
            className="btn create"
            type="button"
            onClick={handleCreateSOP}
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
            onClick={handleViewSop}
          >
            View SOP
          </button>
        </div>

        <div className="issues-list">
          {filteredSops?.length > 0 ? (
            filteredSops?.map((sop) => (
              <div key={sop?._id} className="issue-card">
                <div className="task-color" />
                <div className="issue-content">
                  <div className="issue-main">
                    <h3 className="task-heading">{sop?.title}</h3>
                    <p className="task-sub">{sop?.description}</p>
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
                      onClick={() => handleResumeSop(sop._id)}
                      style={{ backgroundColor: "#10B981", color: "#FFFFFF" }}
                    >
                      Resume
                    </button>
                    <button
                      className="btn ghost"
                      type="button"
                      onClick={() => handleDiscardSop(sop._id)}
                      style={{ backgroundColor: "#EF4444", color: "#FFFFFF" }}
                    >
                      Discard
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
  )
}