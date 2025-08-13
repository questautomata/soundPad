import { describe, expect, test } from 'vitest';
import { SeededRng } from './SeededRng';

describe('SeededRng determinism', () => {
  test('same seed -> same sequence', () => {
    const a = new SeededRng(42);
    const b = new SeededRng(42);
    const seqA = Array.from({ length: 5 }, () => a.next());
    const seqB = Array.from({ length: 5 }, () => b.next());
    expect(seqA).toEqual(seqB);
  });
});

