/** A length in m:ss: 43 -> "0:43", 75.4 -> "1:15" */
export function clock(seconds: number): string {
  const s = Math.round(seconds);
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
}
