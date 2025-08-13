import type { Voice } from '../Voice';
import { midiToFreq } from '../Voice';
import type { NoteOnEvent } from '../../mapping/Events';

export class SubtractiveVoice implements Voice {
  trigger(ctx: AudioContext, dest: GainNode, ev: NoteOnEvent, when: number): () => void {
    const osc = new OscillatorNode(ctx, { type: 'sawtooth', frequency: midiToFreq(ev.pitch) });
    const amp = new GainNode(ctx, { gain: 0 });
    const filter = new BiquadFilterNode(ctx, { type: 'lowpass', Q: 0.7, frequency: 12000 });

    osc.connect(filter).connect(amp).connect(dest);

    const now = when;
    const a = 0.005;
    const d = 0.08;
    const s = 0.7 * ev.velocity;
    const r = Math.max(0.02, ev.duration * 0.3);
    amp.gain.cancelScheduledValues(now);
    amp.gain.setValueAtTime(0, now);
    amp.gain.linearRampToValueAtTime(ev.velocity, now + a);
    amp.gain.linearRampToValueAtTime(s, now + a + d);
    amp.gain.setTargetAtTime(0, now + ev.duration, r);

    osc.start(now);
    osc.stop(now + ev.duration + r + 0.05);
    return () => {
      try { osc.disconnect(); amp.disconnect(); filter.disconnect(); } catch {}
    };
  }
}


