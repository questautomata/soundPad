import type { Voice } from '../Voice';
import type { NoteOnEvent } from '../../mapping/Events';

export class SamplerVoice implements Voice {
  private buffer: AudioBuffer | null = null;
  async load(ctx: AudioContext, data: ArrayBuffer): Promise<void> {
    this.buffer = await ctx.decodeAudioData(data.slice(0));
  }
  trigger(ctx: AudioContext, dest: GainNode, ev: NoteOnEvent, when: number): () => void {
    const src = new AudioBufferSourceNode(ctx, { buffer: this.buffer ?? null, playbackRate: 1 });
    const amp = new GainNode(ctx, { gain: ev.velocity });
    src.connect(amp).connect(dest);
    src.start(when);
    src.stop(when + ev.duration);
    return () => { try { src.disconnect(); amp.disconnect(); } catch {} };
  }
}


