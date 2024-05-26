export const setPoints = (
  homePredict: number,
  awayPredict: number,
  homeScore: number,
  awayScore: number
): number => {
  if (homePredict == homeScore && awayPredict == awayScore) {
    return 3;
  }
  if (
    (homeScore > awayScore && homePredict > awayPredict) ||
    (homeScore < awayScore && homePredict < awayPredict) ||
    (homeScore == awayScore && homePredict == awayPredict)
  ) {
    return 1;
  }
  return 0;
};
