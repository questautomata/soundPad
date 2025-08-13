/*
  Minimal gain envelope AudioWorkletProcessor
*/

// @ts-ignore
export class EnvelopeProcessor extends AudioWorkletProcessor {
  static get parameterDescriptors() {
    return [
      { name: 'attack', defaultValue: 0.005, minValue: 0, maxValue: 2 },
      { name: 'decay', defaultValue: 0.05, minValue: 0, maxValue: 2 },
      { name: 'sustain', defaultValue: 0.7, minValue: 0, maxValue: 1 },
      { name: 'release', defaultValue: 0.1, minValue: 0, maxValue: 4 },
      { name: 'gate', defaultValue: 0, minValue: 0, maxValue: 1 },
    ];
  }

  private state: 'idle' | 'attack' | 'decay' | 'sustain' | 'release' = 'idle';
  private level = 0;

  process(_inputs: Float32Array[][], outputs: Float32Array[][], parameters: Record<string, Float32Array | number[]>): boolean {
    const outs = outputs as unknown as Float32Array[][];
    const out = outs[0]?.[0];
    if (!out) return true;
    // @ts-ignore
    const sr: number = (globalThis as any).sampleRate ?? 48000;
    const att = (parameters.attack as Float32Array)[0] ?? 0.005;
    const dec = (parameters.decay as Float32Array)[0] ?? 0.05;
    const sus = (parameters.sustain as Float32Array)[0] ?? 0.7;
    const rel = (parameters.release as Float32Array)[0] ?? 0.1;
    const gate = (parameters.gate as Float32Array)[0] ?? 0;

    for (let i = 0; i < out.length; i++) {
      if (gate >= 0.5) {
        if (this.state === 'idle' || this.state === 'release') this.state = 'attack';
        if (this.state === 'attack') {
          const step = att > 0 ? 1 / (att * sr) : 1;
          this.level += step;
          if (this.level >= 1) { this.level = 1; this.state = 'decay'; }
        }
        if (this.state === 'decay') {
          const step = dec > 0 ? (1 - sus) / (dec * sr) : 1;
          this.level -= step;
          if (this.level <= sus) { this.level = sus; this.state = 'sustain'; }
        }
        if (this.state === 'sustain') this.level = sus;
      } else {
        if (this.state !== 'idle') this.state = 'release';
        if (this.state === 'release') {
          const step = rel > 0 ? this.level / (rel * sr) : 1;
          this.level -= step;
          if (this.level <= 0) { this.level = 0; this.state = 'idle'; }
        }
      }
      out[i] = this.level;
    }
    return true;
  }
}

// @ts-ignore
registerProcessor('sp-envelope', EnvelopeProcessor);


