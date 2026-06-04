function ms(s: string): number {
  const [y, m, d] = s.split('-').map(Number) as [number, number, number];
  return Date.UTC(y, m - 1, d);
}
export function addDays(s: string, n: number): string {
  const dt = new Date(ms(s));
  dt.setUTCDate(dt.getUTCDate() + n);
  return dt.toISOString().slice(0, 10);
}
export function diffDays(a: string, b: string): number {
  return Math.round((ms(b) - ms(a)) / 86400000);
}
export function weekdayMon(s: string): number {
  return ((diffDays('2024-01-01', s) % 7) + 7) % 7; // 0=Mon..6=Sun
}
