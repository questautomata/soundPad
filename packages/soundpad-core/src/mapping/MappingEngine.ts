import type { Feature } from '../physics/FeatureExtract';
import type { MappingEvent } from './Events';

export type MappingOptions = {
  basePitch?: number; // MIDI
};

export class MappingEngine {
  private readonly basePitch: number;
  constructor(options: MappingOptions = {}) {
    this.basePitch = options.basePitch ?? 60;
  }

  mapFeaturesToEvents(features: Feature[]): MappingEvent[] {
    const events: MappingEvent[] = [];
    for (const f of features) {
      // Simple deterministic mapping
      const velocity = Math.max(0.05, Math.min(1, (f.width / 16 + f.avgSpeed * 100) * 0.5));
      const sustain = Math.max(0.1, Math.min(2, f.length / 200));
      const vibrato = Math.max(0, Math.min(1, f.curvature / Math.PI));
      const pitch = Math.round(this.basePitch + (f.color % 12) - 6);
      const instrument: 'subtractive' | 'fm' | 'sampler' = ((f.color >>> 16) & 1) ? 'fm' : 'subtractive';

      events.push({ type: 'noteOn', time: 0, instrument, pitch, velocity, duration: sustain });
      events.push({ type: 'paramMod', time: 0, target: 'vibrato', value: vibrato });
      events.push({ type: 'noteOff', time: sustain, pitch });
    }
    return events;
  }
}


