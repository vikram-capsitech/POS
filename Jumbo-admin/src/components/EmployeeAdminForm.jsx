import { useEffect, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Radius, UserPen, Weight, ChevronDown } from "lucide-react";
import CreateTaskIcon from "../assets/homeScreen/CreateTaskIcon.svg?react";
import { toast } from "sonner";
import Select from "react-select";
import { customStyles } from "../lib/constant";

export default function EmployeeAdminForm({
  type,
  id,
  data,
  fetchFn,
  createFn,
  updateFn, // API Update fn
  redirectPath = "/user-profile",
}) {
  const isEditMode = Boolean(id);
  const navigate = useNavigate();
  const location = useLocation();
  const previousTab = location.state?.topTab || "Admins";

  const [errors, setErrors] = useState({});
  const [imageURL, setImageURL] = useState(null);
  const [restaurantLogoURL, setRestaurantLogoURL] = useState(null);
  const [selectedAccess, setSelectedAccess] = useState([]);
  const [allotedItems, setAllotedItems] = useState([]);

// ... (options array)

  const handleRestaurantLogoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const allowedTypes = ["image/jpeg", "image/png", "image/jpg", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      toast.error("Only JPG, PNG, or WEBP images are allowed");
      e.target.value = null;
      setFormData((prev) => ({ ...prev, restaurantLogo: null }));
      setRestaurantLogoURL(null);
      return;
    }

    const isLt5MB = file.size / (1024 * 1024) < 5;
    if (!isLt5MB) {
        toast.error("Image must be smaller than 5MB");
        return;
    }

    setFormData({ ...formData, restaurantLogo: file });
    setRestaurantLogoURL(URL.createObjectURL(file));
  };
  
  const handleDeleteRestaurantLogo = () => {
      setRestaurantLogoURL(null);
      setFormData((prev) => ({ ...prev, restaurantLogo: null }));
      const input = document.getElementById("restaurantLogoInput");
      if(input) input.value = "";
  };

  const options = [
    { value: "task", label: "Task" },
    { value: "issueRaised", label: "Issue Raised" },
    { value: "request", label: "Request" },
    { value: "attendance", label: "Attendance" },
    { value: "sop", label: "sop" },
    { value: "ai-Review", label: "Ai-Review" },
    { value: "salaryManagement", label: "Salary Management" },
    { value: "userProfile", label: "User Profile" },
    { value: "voucher", label: "Voucher" },
  ];

  const handleChangeAccess = (selected) => {
    setSelectedAccess(selected);
    const accessValues = selected ? selected.map((item) => item.value) : [];

    setFormData((prev) => ({
      ...prev,
      access: accessValues,
    }));
  };
  const [formData, setFormData] = useState({
    name: "",
    restaurantID: "",
    address: "",
    phoneNumber: "",
    email: "",
    gender: "",
    role: type === "employee" ? "" : "admin",
    jobRole: "",
    salary: "",
    profilePhoto: "",
    access: [],
    monthlyfee: "",
    organizationName: "",
    leavesProvided: "",
    CoinsPerMonth: "",
    gstIn: "",
    fssaiLicense: "",
    contactPhone: "",
    restaurantLogo: "",
  });

  // --- Fetch Data for Edit Mode ---
  useEffect(() => {
    setFormData(formData);
    setSelectedAccess([]);
    setAllotedItems([]);
    setImageURL("");
  }, [id]);
  useEffect(() => {
    if (!isEditMode || !id) return;

    fetchFn(id);
  }, [id]);

  useEffect(() => {
    if (!data) {
      return;
    }

    setFormData((prev) => ({
      ...prev,
      name: data.name || "",
      restaurantID: data.restaurantID,
      address: data.address || "",
      email: data.email || "",
      gender: data.gender || "",
      role: type === "employee" ? data.position || "" : data.role || "",
      jobRole: data.jobRole || "",
      salary: data.salary || "",
      phoneNumber: data.phoneNumber || "",
      profilePhoto: data.profilePhoto || "",
      access: data.access || [],
      monthlyfee: data.monthlyfee || "",
      organizationName: data.organizationName || "",
      leavesProvided: data.leavesProvided || "",
      CoinsPerMonth: data.CoinsPerMonth || "",
    }));
    if (data.position === "manager" && data?.access?.length) {
      const selected = options.filter((opt) => data.access.includes(opt.value));
      setSelectedAccess(selected);
    }
    if (data.allotedItems && data.allotedItems.length) {
      setAllotedItems(data.allotedItems);
    }

    if (data.profilePhoto) setImageURL(data.profilePhoto);
  }, [id, data]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === "phoneNumber") {
      if (/^\d*$/.test(value) && value.length <= 10) {
        setFormData((prev) => ({ ...prev, [name]: value }));
      }
    } else if (
      name === "leavesProvided" ||
      name === "CoinsPerMonth" ||
      name === "salary"
    ) {
      if (/^\d*$/.test(value)) {
        setFormData((prev) => ({ ...prev, [name]: value }));
      }
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }

    setErrors((prevErrors) => {
      if (!prevErrors[name]) return prevErrors;

      const newErrors = { ...prevErrors };
      delete newErrors[name];
      return newErrors;
    });
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) newErrors.name = "Name is required";
    if (!formData.address.trim()) newErrors.address = "Address is required";
    if (!formData.phoneNumber.toString().trim())
      newErrors.phoneNumber = "Phone number is required";
    if (!formData.email.trim()) newErrors.email = "Email is required";
    if (!formData.gender.trim()) newErrors.gender = "Gender is required";

    if (type === "employee") {
      if (!formData.salary.toString().trim())
        newErrors.salary = "Salary is required";
      if (!formData.role.trim()) newErrors.role = "Profile Status is required";
    }
    if (formData.role === "manager") {
      if (formData.access.length === 0)
        newErrors.access = "Atleast One Access Provided";
    }

    if (formData.role === "employee") {
      if (!formData.jobRole.trim()) newErrors.jobRole = "Job Role is Provided";
      if (!formData.leavesProvided.toString().trim()) {
        newErrors.leavesProvided = "Leaves are required";
      } else if (Number(formData.leavesProvided) <= 0) {
        newErrors.leavesProvided = "Leaves must be greater than 0";
      }
      if (!formData.CoinsPerMonth.toString().trim()) {
        newErrors.CoinsPerMonth = "Coins per month is required";
      } else if (Number(formData.CoinsPerMonth) < 0) {
        newErrors.CoinsPerMonth = "Coins cannot be negative";
      }
      if (allotedItems.length === 0) {
        newErrors.allotedItems = "At least one allotted item is required";
      }
    }

    if (formData.role === "admin") {
      if (!formData.organizationName.trim())
        newErrors.organizationName = "Organization Name is required";
      if (!formData.monthlyfee.trim())
        newErrors.monthlyfee = "Monthly Subscription is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // return true; //

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // 1. Validate file type
    const allowedTypes = ["image/jpeg", "image/png", "image/jpg", "image/webp"];

    if (!allowedTypes.includes(file.type)) {
      toast.error("Only JPG, PNG, or WEBP images are allowed");
      e.target.value = null;
      setFormData((prev) => ({ ...prev, profilePhoto: null }));
      setImageURL(null);
      return;
    }

    const isLt5MB = file.size / (1024 * 1024) < 5;
    if (!isLt5MB) {
      toast.error("Image must be smaller than 5MB");
      e.target.value = null;
      setFormData((prev) => ({ ...prev, profilePhoto: null }));
      setImageURL(null);

      return;
    }

    // if (file) {
    setFormData({ ...formData, profilePhoto: file });
    setImageURL(URL.createObjectURL(file));
    // }
  };

  const handleDeleteAvatar = async () => {
    setImageURL(null);
    setFormData((prev) => ({ ...prev, profilePhoto: null }));
    document.getElementById("photoInput").value = "";
    if (!isEditMode) return;

    const fd = new FormData();
    fd.append("profilePhoto", "");

    try {
      await updateFn(id, fd);
      toast.success("Avatar removed");
    } catch (err) {
      toast.error("Failed to remove avatar");
      console.error(err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    const fd = new FormData();
    fd.append("name", formData.name);
    fd.append("address", formData.address);
    fd.append("phoneNumber", formData.phoneNumber);
    fd.append("email", formData.email);
    fd.append("gender", formData.gender);
    if (formData.role === "employee") fd.append("jobRole", formData.jobRole);
    if (type === "employee") {
      fd.append("salary", formData.salary);
      fd.append("leavesProvided", Number(formData.leavesProvided));
      fd.append("CoinsPerMonth", Number(formData.CoinsPerMonth));
      fd.append("allotedItems", JSON.stringify(allotedItems));
    }
    if (type === "employee") {
      fd.append("position", formData.role);
    } else {
      fd.append("role", formData.role);
      if (!isEditMode) {
        fd.append("password", "123456");
      }
    }
    if (formData.role === "manager") {
      fd.append("access", JSON.stringify(formData.access));
    }

    if (type !== "employee") {
      fd.append("organizationName", formData.organizationName);
      fd.append("monthlyfee", formData.monthlyfee);
      fd.append("gstIn", formData.gstIn);
      fd.append("fssaiLicense", formData.fssaiLicense);
      fd.append("contactPhone", formData.contactPhone);
      if (formData.restaurantLogo) {
          fd.append("restaurantLogo", formData.restaurantLogo);
      }
    }
    if (formData.profilePhoto) fd.append("profilePhoto", formData.profilePhoto);

    try {
      if (isEditMode) {
        await updateFn(id, fd);
        toast.success(`${type} Updated`);
      } else {
        await createFn(fd);
        toast.success(`${type} Created`);
      }
      navigate(redirectPath);
    } catch (err) {
      toast.error(err.response.data.message || "Something went wrong!");
    }
  };

  return (
    <div className="task-create">
      <div className="task-create__panel">
        {/* Breadcrumb */}
        <div className="task-create__breadcrumb">
          <Link
            to={redirectPath}
            state={{ topTab: previousTab }}
            className="crumb-dim"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              textDecoration: "none",
            }}
          >
            User Profile
          </Link>
          <span className="crumb-sep">›</span>
          <span className="crumb">
            {isEditMode ? "Edit Profile" : "Add new profile"}
          </span>
        </div>

        <div className="task-details">
          {/* Avatar */}
          <div className="task-details__header">
            <div style={{ display: "flex", alignItems: "center" }}>
              {imageURL ? (
                <img src={imageURL} className="user-imgAdd" />
              ) : (
                <div className="user-img-placeholder">
                  <UserPen size={48} color="#555" />
                </div>
              )}

              <div style={{ display: "flex", gap: "10px" }}>
                <input
                  type="file"
                  id="photoInput"
                  accept="image/*"
                  style={{ display: "none" }}
                  onChange={handlePhotoChange}
                />
                <button
                  type="button"
                  className="userButton"
                  onClick={() => document.getElementById("photoInput").click()}
                >
                  <CreateTaskIcon style={{ height: "12.75px" }} />
                  Upload new
                </button>

                {imageURL && (
                  <button
                    type="button"
                    className="userButton2"
                    onClick={handleDeleteAvatar}
                  >
                    Delete Avatar
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Form */}
          <form className="task-create__form" onSubmit={handleSubmit}>
            {/* Reused Input Fields */}
            {/** Name */}

            {type === "employee" ? (
              <>
                <div className="form-field">
                  <label className="label-lg">User Name</label>
                  <input
                    type="text"
                    name="name"
                    className="input"
                    placeholder="Add name"
                    value={formData.name}
                    onChange={handleInputChange}
                  />
                  {errors.name && <span className="error">{errors.name}</span>}
                </div>
              </>
            ) : (
              <>
              <div className="form-row">
                <div className="form-col">
                  <label className="label-lg">Admin Name</label>
                  <input
                    type="text"
                    name="name"
                    className="input"
                    placeholder="Add name"
                    value={formData.name}
                    onChange={handleInputChange}
                  />
                  {errors.name && <span className="error">{errors.name}</span>}
                </div>
                <div className="form-col">
                  <label className="label-lg">Organization name</label>
                  <input
                    type="text"
                    name="organizationName"
                    className="input"
                    placeholder="Organization name"
                    value={formData.organizationName}
                    onChange={handleInputChange}
                  />
                  {errors.organizationName && (
                    <span className="error">{errors.organizationName}</span>
                  )}
                </div>
              </div>
                <div style={{ padding: '10px 0', borderTop: '1px dashed #eee', marginTop: '15px' }}>
                    <div className="form-row" style={{ alignItems: 'flex-start' }}>
                        <div className="form-col">
                            <label className="label-lg">Restaurant Logo</label>
                            <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
                                {restaurantLogoURL ? (
                                    <img src={restaurantLogoURL} style={{ width: 60, height: 60, borderRadius: '8px', objectFit: 'cover', border: '1px solid #ddd' }} />
                                ) : (
                                    <div style={{ width: 60, height: 60, borderRadius: '8px', background: '#f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px dashed #ccc' }}>
                                        <span style={{ fontSize: '10px', color: '#999' }}>No Logo</span>
                                    </div>
                                )}
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                                    <label className="userButton" style={{cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', padding: '0.4rem 1rem', fontSize: '13px'}}>
                                        Upload Logo
                                        <input type="file" id="restaurantLogoInput" accept="image/*" style={{display: 'none'}} onChange={handleRestaurantLogoChange} />
                                    </label>
                                    {restaurantLogoURL && (
                                        <button type="button" className="userButton2" style={{ fontSize: '12px', padding: '0.3rem' }} onClick={handleDeleteRestaurantLogo}>
                                            Remove
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                        <div className="form-col">
                            <label className="label-lg">Restaurant Contact Phone</label>
                            <input type="tel" name="contactPhone" className="input" placeholder="Restaurant Contact" value={formData.contactPhone} onChange={handleInputChange} maxLength={15} />
                        </div>
                    </div>
                    <div className="form-row" style={{ marginTop: '1rem' }}>
                        <div className="form-col">
                            <label className="label-lg">GSTIN / Tax ID</label>
                            <input type="text" name="gstIn" className="input" placeholder="GSTIN / Tax Number" value={formData.gstIn} onChange={handleInputChange} />
                        </div>
                        <div className="form-col">
                            <label className="label-lg">FSSAI License (Optional)</label>
                            <input type="text" name="fssaiLicense" className="input" placeholder="FSSAI License" value={formData.fssaiLicense} onChange={handleInputChange} />
                        </div>
                    </div>
                </div>
              </>
            )}

            {/** Address */}
            <div className="form-field">
              <label className="label-lg">Permanent address</label>
              <textarea
                name="address"
                className="input"
                style={{ height: "10.4rem", gap: "1.2rem" }}
                placeholder="Add full address"
                value={formData.address}
                onChange={handleInputChange}
              />
              {errors.address && (
                <span className="error">{errors.address}</span>
              )}
            </div>

            <div className="form-row">
              {/** Phone */}
              <div className="form-col">
                <label className="label-lg">Phone Number</label>
                <input
                  type="tel"
                  name="phoneNumber"
                  className="input"
                  maxLength={10}
                  placeholder="Enter 10-digit phone number"
                  value={formData.phoneNumber}
                  onChange={handleInputChange}
                />
                {errors.phoneNumber && (
                  <span className="error">{errors.phoneNumber}</span>
                )}
              </div>

              {/** Email */}
              <div className="form-col">
                <label className="label-lg">Email address</label>
                <input
                  type="email"
                  name="email"
                  className="input"
                  placeholder="Add email address"
                  value={formData.email}
                  onChange={handleInputChange}
                />
                {errors.email && <span className="error">{errors.email}</span>}
              </div>
            </div>

            {/* Only for Employees */}
            {type === "employee" && (
              <div className="form-row">
                <div
                  className="form-col"
                  style={{
                    gridColumn:
                      formData.role === "employee" ? "auto" : "1 / -1",
                  }}
                >
                  <label className="label-lg">Profile Status</label>
                  <select
                    name="role"
                    className="input"
                    value={formData.role}
                    onChange={handleInputChange}
                    style={{
                      appearance: "none", // remove native arrow
                      WebkitAppearance: "none",
                      MozAppearance: "none",
                      paddingRight: "5rem", // space for custom arrow
                    }}
                  >
                    <option value="">Select</option>
                    <option value="employee">Employee</option>
                    <option value="manager">Manager</option>
                  </select>
                  <ChevronDown
                    size={18}
                    style={{
                      position: "absolute",
                      top: "60%",
                      right: "1rem",
                      color: "var(--grey-120)",
                      flexShrink: 0,
                      transition: "transform 0.2s",
                    }}
                  />
                  {errors.role && <span className="error">{errors.role}</span>}
                </div>

                {formData.role === "employee" && (
                  <>
                    <div className="form-col">
                      <label className="label-lg">Job role</label>
                      <select
                        name="jobRole"
                        className="input"
                        value={formData.jobRole}
                        onChange={handleInputChange}
                        style={{
                          appearance: "none", // remove native arrow
                          WebkitAppearance: "none",
                          MozAppearance: "none",
                          paddingRight: "5rem", // space for custom arrow
                        }}
                      >
                        <option value="">Select job</option>
                        <option value="kitchenStaff">Kitchen Staff</option>
                        <option value="counterStaff">Counter Staff</option>
                        <option value="serviceStaff">Service Staff</option>
                        <option value="others">Others</option>
                      </select>
                      <ChevronDown
                        size={18}
                        style={{
                          position: "absolute",
                          top: "60%",
                          right: "1rem",
                          color: "var(--grey-120)",
                          flexShrink: 0,
                          transition: "transform 0.2s",
                        }}
                      />
                      {errors.jobRole && (
                        <span className="error">{errors.jobRole}</span>
                      )}
                    </div>
                    <div className="form-field">
                      <label className="label-lg">Leaves provided</label>
                      <input
                        type="tel"
                        name="leavesProvided"
                        className="input"
                        placeholder="Add leaves Provided"
                        value={formData.leavesProvided}
                        onChange={handleInputChange}
                      />
                      {errors.leavesProvided && (
                        <span className="error">{errors.leavesProvided}</span>
                      )}
                    </div>
                    <div className="form-field">
                      <label className="label-lg">Coins per month</label>
                      <input
                        type="tel"
                        name="CoinsPerMonth"
                        className="input"
                        placeholder="Add Coins Per Month"
                        value={formData.CoinsPerMonth}
                        onChange={handleInputChange}
                      />
                      {errors.CoinsPerMonth && (
                        <span className="error">{errors.CoinsPerMonth}</span>
                      )}
                    </div>
                  </>
                )}
              </div>
            )}

            {type === "employee" ? (
              <>
                <div className="form-row">
                  {/* Gender */}
                  <div className="form-field">
                    <label className="label-lg">Gender</label>
                    <select
                      name="gender"
                      className="input"
                      value={formData.gender}
                      onChange={handleInputChange}
                      style={{
                        appearance: "none", // remove native arrow
                        WebkitAppearance: "none",
                        MozAppearance: "none",
                        paddingRight: "5rem", // space for custom arrow
                      }}
                    >
                      <option value="">Select gender</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                    </select>
                    <ChevronDown
                      size={18}
                      style={{
                        position: "absolute",
                        top: "60%",
                        right: "1rem",
                        color: "var(--grey-120)",
                        flexShrink: 0,
                        transition: "transform 0.2s",
                      }}
                    />
                    {errors.gender && (
                      <span className="error">{errors.gender}</span>
                    )}
                  </div>
                  <div className="form-field">
                    <label className="label-lg">Add Salary</label>
                    <input
                      type="tel"
                      name="salary"
                      className="input"
                      placeholder="Add salary"
                      value={formData.salary}
                      onChange={handleInputChange}
                    />
                    {errors.salary && (
                      <span className="error">{errors.salary}</span>
                    )}
                  </div>
                </div>
                {formData.role === "manager" && (
                  <div className="form-field">
                    <label className="label-lg">Access Provided</label>
                    <Select
                      style={{ minHeight: "100px" }}
                      options={options}
                      value={selectedAccess}
                      onChange={handleChangeAccess}
                      isMulti
                      styles={customStyles}
                      placeholder="Select..."
                    />
                    {errors.access && (
                      <span className="error">{errors.access}</span>
                    )}
                  </div>
                )}
                {formData.role === "employee" && (
                  <div className="form-field">
                    <label className="label-lg">Alloted Items</label>

                    <div className="tag-input-wrapper">
                      {allotedItems.map((item, index) => (
                        <span key={index} className="tag-chip">
                          {item?.name}
                          <button
                            type="button"
                            className="tag-remove"
                            onClick={() =>
                              setAllotedItems(
                                allotedItems.filter((_, i) => i !== index),
                              )
                            }
                          >
                            ×
                          </button>
                        </span>
                      ))}

                      <input
                        type="text"
                        className="tag-input"
                        placeholder="Type and press Enter"
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && e.target.value.trim()) {
                            e.preventDefault();

                            const value = e.target.value.trim();

                            const exists = allotedItems.some(
                              (item) =>
                                item.name.toLowerCase() === value.toLowerCase(),
                            );

                            if (!exists) {
                              setAllotedItems([
                                ...allotedItems,
                                {
                                  name: value,
                                  isReceived: "Pending",
                                },
                              ]);
                            }

                            e.target.value = "";
                          }
                        }}
                      />
                    </div>

                    {errors.allotedItems && (
                      <span className="error">{errors.allotedItems}</span>
                    )}
                  </div>
                )}
              </>
            ) : (
              <div className="form-row">
                <div className="form-col">
                  <label className="label-lg">Gender</label>
                  <select
                    name="gender"
                    className="input"
                    value={formData.gender}
                    onChange={handleInputChange}
                    style={{
                      appearance: "none", // remove native arrow
                      WebkitAppearance: "none",
                      MozAppearance: "none",
                      paddingRight: "5rem", // space for custom arrow
                    }}
                  >
                    <option value="">Select gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                  </select>
                  <ChevronDown
                    size={18}
                    style={{
                      position: "absolute",
                      top: "60%",
                      right: "1rem",
                      color: "var(--grey-120)",
                      flexShrink: 0,
                      transition: "transform 0.2s",
                    }}
                  />
                  {errors.gender && (
                    <span className="error">{errors.gender}</span>
                  )}
                </div>

                <div className="form-col">
                  <label className="label-lg">Monthly subscription fee</label>
                  <input
                    type="tel"
                    name="monthlyfee"
                    className="input"
                    placeholder="Enter Monthly Subscription fee"
                    value={formData.monthlyfee}
                    onChange={handleInputChange}
                  />
                  {errors.monthlyfee && (
                    <span className="error">{errors.monthlyfee}</span>
                  )}
                </div>
              </div>
            )}

            {/* Button */}
            <div className="task-details__actions">
              <button type="submit" className="btn create block">
                {isEditMode ? "Update Profile" : "Create New Profile"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
