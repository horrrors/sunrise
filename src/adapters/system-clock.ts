import type { Clock } from '../ports/index.ts';

export class SystemClock implements Clock {
  public today(): string { return new Date().toISOString().slice(0, 10); } // UTC date (parity)
  public hour(): number { return new Date().getHours(); }                   // local hour (parity)
}
