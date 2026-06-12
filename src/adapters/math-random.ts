import type { Random } from '../ports/index.ts';

export class MathRandom implements Random {
  public next(): number {
    return Math.random();
  }
}
