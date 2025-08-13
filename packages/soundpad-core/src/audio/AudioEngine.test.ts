import { describe, expect, test } from 'vitest';
import { AudioEngine } from './AudioEngine';

describe('AudioEngine scheduler', () => {
  test('constructs and exposes transport', () => {
    const engine = new AudioEngine();
    expect(engine.transport.bpm).toBeGreaterThan(0);
  });
});

