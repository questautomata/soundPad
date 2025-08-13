import type { NoteOnEvent } from '../mapping/Events';

export interface Voice {
  trigger(engine: AudioContext, dest: GainNode, event: NoteOnEvent, when: number): () => void;
}

export function midiToFreq(midi: number): number {
  return 440 * Math.pow(2, (midi - 69) / 12);
}


