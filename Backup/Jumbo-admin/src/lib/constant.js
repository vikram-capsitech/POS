export const customStyles = {
  control: (provided) => ({
    ...provided,
    borderRadius: "0.8rem;", // rounded input box
    border: "0.1rem solid #A8B8C9",
    minHeight: "5.2rem",
    padding: "0 1.2rem",
    boxShadow: "none", // remove default shadow
    fontSize: "1.6rem",
    backgroundColor: "#fff", // input background
  }),
  menuList: (provided) => ({
    ...provided,
    maxHeight: "125px",
    overflowY: "auto", // dropdown height
  }),
  multiValue: (provided) => ({
    ...provided,
    minwidth: "100px",
    height: "32px",
    borderRadius: "30px",
    paddingTop: "5px",
    backgroundColor: "transparent",

    border: "1px solid #3D3D3D",
    fontSize: "15px",
    Weight: "500px",
  }),
  multiValueRemove: (provided) => ({
    ...provided,
    height: "20px",
    width: "20px",
    color: "#3D3D3D",
    borderRadius: "50%",
    paddingTop: "0",
    ":hover": {},
  }),
};