import type { Stroke } from '../drawing/Stroke';
import type { Feature } from './FeatureExtract';

export type WorkerBridgeOptions = { seed?: number };

export class WorkerBridge {
  private worker: Worker | null = null;
  private featureListeners: Array<(features: Feature[]) => void> = [];
  private fallback = false;
  private pending: Stroke[] = [];
  public debug = false;

  async start(options: WorkerBridgeOptions = {}): Promise<void> {
    if (this.worker || this.fallback) return;
    try {
    // The worker file is emitted next to the ESM build as JS
    const url = new URL('./physics/StrokePhysics.worker.js', import.meta.url);
    this.worker = new Worker(url, { type: 'module' });
      this.worker.onmessage = (ev: MessageEvent) => {
        const data = ev.data as { type: 'features'; features: Feature[] };
        if (data?.type === 'features') {
          if (this.debug) console.log('[physics] features', data.features.length);
          for (const cb of this.featureListeners) cb(data.features);
        }
      };
      this.worker.postMessage({ type: 'init', seed: options.seed ?? 1337 });
      if (this.debug) console.log('[physics] worker started');
    } catch {
      this.fallback = true;
      if (this.debug) console.log('[physics] fallback enabled (no Worker or import.meta.url)');
    }
  }

  onFeatures(cb: (features: Feature[]) => void): () => void {
    this.featureListeners.push(cb);
    return () => {
      this.featureListeners = this.featureListeners.filter((f) => f !== cb);
    };
  }

  addStroke(stroke: Stroke): void {
    if (this.fallback) {
      this.pending.push(stroke);
      return;
    }
    this.worker?.postMessage({ type: 'addStroke', stroke });
  }

  clear(): void {
    if (this.fallback) {
      this.pending = [];
      return;
    }
    this.worker?.postMessage({ type: 'clear' });
  }

  async tick(): Promise<void> {
    if (this.fallback) {
      if (this.pending.length === 0) return;
      const [{ analyzeStroke }] = await Promise.all([import('./FeatureExtract')]);
      const features = this.pending.map((s) => analyzeStroke(s));
      this.pending = [];
      if (this.debug) console.log('[physics] features', features.length);
      for (const cb of this.featureListeners) cb(features);
      return;
    }
    this.worker?.postMessage({ type: 'tick' });
  }

  stop(): void {
    try {
      this.worker?.terminate();
    } catch {}
    this.worker = null;
    this.fallback = false;
    this.pending = [];
    this.featureListeners = [];
  }
}


