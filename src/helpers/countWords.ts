export const CountStringWords = (strToCount: string): number => {
  const arr = strToCount.split(' ');

  return arr.filter(word => word !== '').length;
};
