export const formatToYMD = (isoDate) => {
  const date = new Date(isoDate);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};
export const formatToDMY = (isoDate) => {
  const date = new Date(isoDate);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${day}-${month}-${year}`;
};

export const formatMDYString = (isoDate) => {
  const date = new Date(isoDate);

  const options = { year: "numeric", month: "long", day: "numeric" };

  return date.toLocaleDateString("en-US", options);
};
export const formatDMYString = (isoDate) => {
  const date = new Date(isoDate);

  const day = String(date.getDate()).padStart(2, "0");
  const month = date.toLocaleString("en-US", { month: "short" });
  const year = date.getFullYear();

  return `${day}-${month}-${year}`;
};
