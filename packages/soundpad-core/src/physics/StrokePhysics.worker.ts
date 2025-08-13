/* eslint-disable no-restricted-globals */
import type { Stroke } from '../drawing/Stroke';
import { SeededRng } from './SeededRng';
import { analyzeStroke, type Feature } from './FeatureExtract';

export type PhysicsInitMsg = { type: 'init'; seed: number };
export type PhysicsAddStrokeMsg = { type: 'addStroke'; stroke: Stroke };
export type PhysicsClearMsg = { type: 'clear' };
export type PhysicsTickMsg = { type: 'tick' };
export type PhysicsInMsg = PhysicsInitMsg | PhysicsAddStrokeMsg | PhysicsClearMsg | PhysicsTickMsg;

export type PhysicsOutMsg = { type: 'features'; features: Feature[] };

let rng = new SeededRng(1234);
let strokes: Stroke[] = [];

self.onmessage = (ev: MessageEvent<PhysicsInMsg>) => {
  const msg = ev.data;
  switch (msg.type) {
    case 'init':
      rng = new SeededRng(msg.seed);
      strokes = [];
      break;
    case 'addStroke':
      strokes.push(msg.stroke);
      break;
    case 'clear':
      strokes = [];
      break;
    case 'tick': {
      const features = strokes.map(analyzeStroke);
      const out: PhysicsOutMsg = { type: 'features', features };
      // mimic fixed-step determinism, avoid non-deterministic ordering
      (self as unknown as Worker).postMessage(out);
      break;
    }
  }
};


