import type { MappingEvent, NoteOnEvent } from '../mapping/Events';
import { SubtractiveVoice } from './voices/SubtractiveVoice';
import { FmVoice } from './voices/FmVoice';
import { SamplerVoice } from './voices/SamplerVoice';

export class VoiceManager {
  private readonly ctx: AudioContext;
  private readonly out: GainNode;
  private readonly maxVoices: number;
  private activeStops: Array<() => void> = [];

  private readonly subtractive = new SubtractiveVoice();
  private readonly fm = new FmVoice();
  private readonly sampler = new SamplerVoice();

  constructor(ctx: AudioContext, out: GainNode, maxVoices = 24) {
    this.ctx = ctx;
    this.out = out;
    this.maxVoices = maxVoices;
  }

  handleEvent(ev: MappingEvent, when: number): void {
    if (ev.type === 'noteOn') {
      this.noteOn(ev, when);
    } else if (ev.type === 'noteOff') {
      // duration-based stopping already scheduled by voices; could enforce cutoff here
    } else if (ev.type === 'paramMod') {
      // future: mod destinations
    }
  }

  private noteOn(ev: NoteOnEvent, when: number): void {
    while (this.activeStops.length >= this.maxVoices) {
      const stop = this.activeStops.shift();
      try { stop?.(); } catch {}
    }
    const voice = ev.instrument === 'fm' ? this.fm : ev.instrument === 'sampler' ? this.sampler : this.subtractive;
    const stop = voice.trigger(this.ctx, this.out, ev, when);
    this.activeStops.push(stop);
  }
}


