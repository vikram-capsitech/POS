import { useState, useEffect } from "react";
import { useParams, useNavigate, Link, useLocation } from "react-router-dom";
import { fetchVoucherById, updateVoucher } from "../services/api";
import SopBoxIcon from "../assets/sopDetails/SopBoxIcon.svg?react";
import TotalStepsIcon from "../assets/sopDetails/TotalStepsIcon.svg?react";
import UserIcon from "../assets/sopDetails/UserIcon.svg?react";
import { SquarePen } from "lucide-react";
import { formatDMYString } from "../components/ui/DateFormatYMD";

export default function VoucherDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const previousTab = location.state?.tab || "cleaning";
  const [voucher, setVoucher] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadVouchers();
  }, [id]);
  const loadVouchers = async () => {
    try {
      const res = await fetchVoucherById(id);
      setVoucher(res);
    } catch (err) {
      setError("Failed to load SOP details");
      console.error("Error loading SOP:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleEditDetails = (id) => {
    navigate(`/voucher/new/${id}`, { state: { tab: previousTab } });
  };
  const handleStatusChange = async (id, status) => {
    const payload = {
      status: status === "Active" ? "In-active" : "Active",
    };

    try {
      await updateVoucher(id, payload);
      await loadVouchers();
    } catch (error) {
      console.error(error);
    }
  };

  if (loading) {
    return (
      <div className="task-create">
        <div className="task-create__panel">
          <div
            style={{
              textAlign: "center",
              padding: "40px",
              color: "var(--grey-100)",
            }}
          >
            Loading Voucher details...
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="task-create">
        <div className="task-create__panel">
          <div className="task-create__breadcrumb">
            <Link
              to="/voucher"
              className="crumb-dim"
              style={{
                textDecoration: "none",
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              Back to Voucher
            </Link>
          </div>
          <div
            style={{
              textAlign: "center",
              padding: "40px",
              color: "var(--red-500)",
            }}
          >
            {error}
          </div>
        </div>
      </div>
    );
  }

  if (!voucher) {
    return (
      <div className="task-create">
        <div className="task-create__panel">
          <div className="task-create__breadcrumb">
            <Link
              to="/voucher"
              className="crumb-dim"
              style={{
                textDecoration: "none",
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              Back to voucherS
            </Link>
          </div>
          <div
            style={{
              textAlign: "center",
              padding: "40px",
              color: "var(--grey-100)",
            }}
          >
            Vouchers not found
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="sop-header-row">
        <div className="sop-breadcrumb">
          <Link
            to="/voucher"
            state={{ tab: previousTab }}
            className="crumb-dim"
            style={{
              textDecoration: "none",
            }}
          >
            Vouchers overview
          </Link>
          <span
            className="crumb-sep"
            style={{ padding: "8px", display: "inline-flex" }}
          >
            ›
          </span>
          <span className="sop-breadcrumb__highlight">{voucher?.title}</span>
        </div>
        <div style={{ display: "inline-flex", gap: "20px" }}>
          <button
            type="button"
            className={`btn ${voucher?.status === "Active" ? "deactive" : "active"}`}
            onClick={() => handleStatusChange(id, voucher?.status)}
          >
            {`${voucher?.status === "Active" ? "Deactivate" : "Activate"}`}
          </button>
          <button
            type="button"
            className="btn create"
            onClick={() => handleEditDetails(id)}
          >
            <SquarePen size={18} color="white" strokeWidth={2} />
            Edit
          </button>
        </div>
      </div>

      <div className="sop-layout">
        <div className="sop-card">
          <div className="sop-title-row">
            <div className="sop-title-left">
              <div className="sop-title-icon">
                <SopBoxIcon />
              </div>
              <div className="sop-title-text-wrapper">
                <h1 className="sop-title-text">{voucher?.title}</h1>
                <div className="sop-tags-row">
                  <span
                    className={`sop-tag ${
                      voucher?.status === "Active"
                        ? "sop-tag--Completed"
                        : "sop-tag--Error"
                    }`}
                  >
                    {voucher?.status}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="sop-description-container">
            <h3 className="sop-section-title">Description</h3>
            <p className="sop-paragraph">{voucher?.description}</p>
          </div>
          <div className="sop-description-container">
            <h3 className="sop-section-title">Timeline</h3>
            <p className="sop-paragraph">
              {formatDMYString(voucher?.timeline?.startDate)} to{" "}
              {formatDMYString(voucher?.timeline?.endDate)}
            </p>
          </div>
        </div>

        <div className="sop-sidebar-stack">
          <div className="sop-card">
            <h3 className="sop-section-title">Created by</h3>
            <div className="sop-profile-row">
              <div className="sop-avatar">
                {voucher?.createdBy?.name[0]?.toUpperCase()}
              </div>
              <div>
                <p className="sop-profile-name">{voucher?.createdBy?.name}</p>
                <p className="sop-profile-role">{voucher?.createdBy?.role}</p>
              </div>
            </div>
          </div>
          <div className="sop-card">
            <h3 className="sop-section-title">Assign to</h3>
            <div className="sop-profile-row">
              <div>
                <p
                  className="sop-profile-name"
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    height: "auto",
                  }}
                >
                  {voucher?.assignType === "SPECIFIC" ? (
                    voucher?.assignTo?.map((item, index) => (
                      <span
                        key={index}
                        className="manager-chip"
                        style={{ marginRight: "1rem", marginBottom: "10px" }}
                      >
                        {item.name}
                      </span>
                    ))
                  ) : (
                    <span
                      className="manager-chip"
                      style={{ marginRight: "1rem", marginBottom: "10px" }}
                    >
                      All Users
                    </span>
                  )}
                </p>
              </div>
            </div>
          </div>
          <div className="sop-card">
            <h3 className="sop-section-title">Voucher details</h3>
            <div className="sop-info-list">
              <div style={{ display: "inline-flex" }}>
                <TotalStepsIcon style={{ marginRight: "8px" }} />
                <div className="sop-info-item">
                  <span className="sop-info-label">Coins to redeem</span>
                  <span className="sop-info-value">
                    {voucher?.coins}
                    {" Coins"}
                  </span>
                </div>
              </div>
              <div style={{ display: "inline-flex" }}>
                <UserIcon style={{ marginRight: "8px" }} />
                <div className="sop-info-item">
                  <span className="sop-info-label">Created</span>
                  <span className="sop-info-value">
                    {new Date(voucher?.createdAt)?.toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
