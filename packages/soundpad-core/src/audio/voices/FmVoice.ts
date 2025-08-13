import type { Voice } from '../Voice';
import { midiToFreq } from '../Voice';
import type { NoteOnEvent } from '../../mapping/Events';

export class FmVoice implements Voice {
  trigger(ctx: AudioContext, dest: GainNode, ev: NoteOnEvent, when: number): () => void {
    const carrier = new OscillatorNode(ctx, { type: 'sine', frequency: midiToFreq(ev.pitch) });
    const mod = new OscillatorNode(ctx, { type: 'sine', frequency: midiToFreq(ev.pitch + 12) });
    const modGain = new GainNode(ctx, { gain: 100 });
    const amp = new GainNode(ctx, { gain: 0 });

    mod.connect(modGain).connect((carrier.frequency as unknown) as AudioNode);
    carrier.connect(amp).connect(dest);

    const now = when;
    const a = 0.003, d = 0.05, s = 0.5 * ev.velocity, r = Math.max(0.02, ev.duration * 0.3);
    amp.gain.setValueAtTime(0, now);
    amp.gain.linearRampToValueAtTime(ev.velocity, now + a);
    amp.gain.linearRampToValueAtTime(s, now + a + d);
    amp.gain.setTargetAtTime(0, now + ev.duration, r);

    mod.start(now);
    carrier.start(now);
    carrier.stop(now + ev.duration + r + 0.05);
    mod.stop(now + ev.duration + r + 0.05);
    return () => { try { mod.disconnect(); modGain.disconnect(); carrier.disconnect(); amp.disconnect(); } catch {} };
  }
}


