import type { MappingEvent } from '../mapping/Events';
import { Transport } from '../timeline/Transport';
import { VoiceManager } from './VoiceManager';

export class AudioEngine {
  private ctx: AudioContext | null = null;
  private out: GainNode | null = null;
  private voiceManager: VoiceManager | null = null;
  private readonly lookAheadMs = 100;
  readonly transport = new Transport(120);
  private workletLoaded = false;
  private metronomeOsc: OscillatorNode | null = null;
  private metronomeGain: GainNode | null = null;

  async ensureStarted(): Promise<void> {
    if (this.ctx) return;
    const ctx = new AudioContext({ latencyHint: 'interactive' });
    const out = new GainNode(ctx, { gain: 0.9 });
    out.connect(ctx.destination);
    this.ctx = ctx;
    this.out = out;
    this.voiceManager = new VoiceManager(ctx, out, 24);
    try { await ctx.resume(); } catch {}
    if (!this.workletLoaded) {
      try {
        await ctx.audioWorklet.addModule(new URL('./processors/Envelope.worklet.ts', import.meta.url));
        this.workletLoaded = true;
      } catch {
        // ignore; voices will use param automation fallback
      }
    }
    // metronome chain
    const mg = new GainNode(ctx, { gain: 0 });
    const mo = new OscillatorNode(ctx, { type: 'square', frequency: 1760 });
    mo.connect(mg).connect(out);
    mo.start();
    this.metronomeGain = mg;
    this.metronomeOsc = mo;
  }

  schedule(events: MappingEvent[]): void {
    if (!this.ctx || !this.voiceManager) return;
    const now = this.ctx.currentTime;
    for (const ev of events) {
      const when = now + Math.max(0, ev.time);
      if ((when - now) * 1000 <= this.lookAheadMs) {
        this.voiceManager.handleEvent(ev, when);
      }
    }
  }

  dispose(): void {
    try { this.out?.disconnect(); } catch {}
    try { this.ctx?.close(); } catch {}
    this.ctx = null;
    this.out = null;
    this.voiceManager = null;
    this.metronomeOsc = null;
    this.metronomeGain = null;
  }

  tickMetronome(): void {
    if (!this.ctx || !this.metronomeGain) return;
    const now = this.ctx.currentTime;
    const secPerBeat = this.transport.secondsPerBeat();
    // schedule a short blip at next beat boundary
    const nextBeat = Math.ceil(now / secPerBeat) * secPerBeat + 0.001;
    this.metronomeGain.gain.setValueAtTime(0.25, nextBeat);
    this.metronomeGain.gain.setTargetAtTime(0, nextBeat + 0.02, 0.02);
  }
}


