import type { Random } from '../ports/index.ts';

export class MathRandom implements Random {
  next(): number { return Math.random(); }
}
