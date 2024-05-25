export function dateUTC(date: number): Date {
  const now: Date = new Date(date - 10800000);
  return now;
}
