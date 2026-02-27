export const calculateDuration = (startDate, endDate) => {
  const start = new Date(startDate);
  const end = new Date(endDate);

  const diffMs = end - start; // difference in milliseconds
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  return diffDays +1;
};
