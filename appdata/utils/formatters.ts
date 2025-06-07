
// No specific imports needed from other new utils for this simple formatter

export const formatNumber = (num: number): string => {
  if (num === undefined || num === null || Number.isNaN(num)) return '0';
  if (num >= 1e9) return (num / 1e9).toFixed(2) + 'B';
  if (num >= 1e6) return (num / 1e6).toFixed(2) + 'M';
  if (num >= 1e3) {
    const kVal = num / 1000;
    return (Number.isInteger(kVal) ? kVal.toFixed(0) : kVal.toFixed(1)) + 'K';
  }
  return Number.isInteger(num) ? num.toFixed(0) : num.toFixed(1);
};
