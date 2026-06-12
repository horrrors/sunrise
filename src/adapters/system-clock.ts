import type { Clock } from '../ports/index.ts';

// Both values use the user's local clock: "today" is the local calendar day
// (streak boundaries, weekday badges) and hour() the local hour, so a single
// completion never mixes two time bases.
export class SystemClock implements Clock {
  public today(): string {
    const d = new Date();
    const p = (n: number): string => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
  }
  public hour(): number {
    return new Date().getHours();
  }
}
