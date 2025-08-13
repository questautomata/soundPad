import type { MappingEvent } from '../mapping/Events';
import { Transport } from '../timeline/Transport';
import { VoiceManager } from './VoiceManager';

export class AudioEngine {
  private ctx: AudioContext | null = null;
  private out: GainNode | null = null;
  private voiceManager: VoiceManager | null = null;
  private readonly lookAheadMs = 100;
  readonly transport = new Transport(120);

  async ensureStarted(): Promise<void> {
    if (this.ctx) return;
    const ctx = new AudioContext({ latencyHint: 'interactive' });
    const out = new GainNode(ctx, { gain: 0.9 });
    out.connect(ctx.destination);
    this.ctx = ctx;
    this.out = out;
    this.voiceManager = new VoiceManager(ctx, out, 24);
    try { await ctx.resume(); } catch {}
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
  }
}


