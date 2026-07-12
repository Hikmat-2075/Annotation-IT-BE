export const calculatePercentage = (value: number, total: number) => {
  if (total === 0) return 0;
  return Number(((value / total) * 100).toFixed(2));
};
