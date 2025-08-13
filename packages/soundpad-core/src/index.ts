export const CORE_PACKAGE_NAME = 'soundpad-core' as const;
export { Renderer } from './render/Renderer';
export { GridOverlay } from './render/GridOverlay';
export { SimpleBrush, type Brush, type BrushContext } from './drawing/Brush';
export { BrushRegistry } from './drawing/BrushRegistry';
export { StrokeBuffer } from './drawing/StrokeBuffer';
export type { Stroke, Point } from './drawing/Stroke';
export { BucketIndex } from './tools/HitTest';
export { Pointer } from './input/Pointer';
export type { Tool } from './tools/Tools';
export { MappingEngine } from './mapping/MappingEngine';
export type { MappingEvent } from './mapping/Events';
export { WorkerBridge } from './physics/WorkerBridge';
export { AudioEngine } from './audio/AudioEngine';

export type SoundPadOptions = {
  antialias?: boolean;
  debug?: boolean;
};

export type SoundPadApp = {
  play(): void;
  pause(): void;
  seek(seconds: number): void;
  dispose(): void;
  setTool(tool: import('./tools/Tools').Tool): void;
  getTool(): import('./tools/Tools').Tool;
  undo?(): void;
  redo?(): void;
};

export async function createSoundPad(root: HTMLElement, options: SoundPadOptions = {}): Promise<SoundPadApp> {
  const [{ Renderer }, { GridOverlay }] = await Promise.all([
    import('./render/Renderer'),
    import('./render/GridOverlay'),
  ]);
  const [{ SimpleBrush }, { BrushRegistry }] = await Promise.all([
    import('./drawing/Brush'),
    import('./drawing/BrushRegistry'),
  ]);
  const [{ StrokeBuffer }] = await Promise.all([import('./drawing/StrokeBuffer')]);
  const [{ BucketIndex }] = await Promise.all([import('./tools/HitTest')]);
  const [{ Pointer }] = await Promise.all([import('./input/Pointer')]);
  const [{ MappingEngine }] = await Promise.all([import('./mapping/MappingEngine')]);
  const [{ WorkerBridge }] = await Promise.all([import('./physics/WorkerBridge')]);
  const [{ AudioEngine }] = await Promise.all([import('./audio/AudioEngine')]);
  const { Graphics } = await import('pixi.js');

  const renderer = await Renderer.create(root, { antialias: options.antialias });
  const grid = new GridOverlay(renderer.gridLayer);
  const strokeGfx = new Graphics();
  // @ts-ignore Pixi v8: set stroke style once
  strokeGfx.setStrokeStyle({ width: 2, color: 0x000000, alpha: 1 });
  renderer.strokeLayer.addChild(strokeGfx);

  const brushes = new BrushRegistry();
  const brush = new SimpleBrush();
  brushes.register(brush, true);

  const buffer = new StrokeBuffer();
  const strokes: Array<import('./drawing/Stroke').Stroke> = [];
  const undoStack: Array<{ type: 'add' | 'remove'; stroke: import('./drawing/Stroke').Stroke; index?: number }> = [];
  const redoStack: Array<{ type: 'add' | 'remove'; stroke: import('./drawing/Stroke').Stroke; index?: number }> = [];
  const buckets = new BucketIndex(64);
  let currentTool: import('./tools/Tools').Tool = 'paint';
  const mapping = new MappingEngine();
  const physics = new WorkerBridge();
  physics.debug = options.debug ?? false;
  const audio = new AudioEngine();
  await physics.start({ seed: 1337 });
  const unsubscribe = physics.onFeatures((features) => {
    const events = mapping.mapFeaturesToEvents(features);
    if (physics.debug && events.length) console.log('[mapping] events', events);
    void audio.ensureStarted();
    audio.schedule(events);
  });

  const viewToWorld = (x: number, y: number) => {
    const s = renderer.transform.scale;
    const tx = renderer.transform.translateX;
    const ty = renderer.transform.translateY;
    return { x: (x - tx) / s, y: (y - ty) / s };
  };

  const redrawAll = () => {
    strokeGfx.clear();
    for (const s of strokes) {
      for (let i = 1; i < s.points.length; i++) {
        const a = s.points[i - 1]!;
        const b = s.points[i]!;
        strokeGfx.moveTo(a.x, a.y);
        strokeGfx.lineTo(b.x, b.y);
        // @ts-ignore
        strokeGfx.stroke({ width: s.width, color: s.color, alpha: 1 });
      }
    }
  };

  // eslint-disable-next-line no-new
  new Pointer(
    renderer.view,
    { throttleMs: 8, getSize: () => renderer.size },
    (s) => {
      if (currentTool !== 'paint') return;
      const p = viewToWorld(s.x, s.y);
      const stroke = buffer.begin(0x000000, 2);
      buffer.add(p.x, p.y, s.t);
      // dot on start
      strokeGfx.moveTo(p.x, p.y);
      strokeGfx.lineTo(p.x + 0.001, p.y + 0.001);
      // @ts-ignore
      strokeGfx.stroke({ width: stroke.width, color: stroke.color, alpha: 1 });
    },
    (s) => {
      if (currentTool !== 'paint') return;
      const p = viewToWorld(s.x, s.y);
      buffer.add(p.x, p.y, s.t);
      const active = (buffer as unknown as { active: import('./drawing/Stroke').Stroke | null }).active;
      if (active) {
        const pts = active.points;
        if (pts.length >= 2) {
          const a = pts[pts.length - 2]!;
          const b = pts[pts.length - 1]!;
          strokeGfx.moveTo(a.x, a.y);
          strokeGfx.lineTo(b.x, b.y);
          // @ts-ignore
          strokeGfx.stroke({ width: active.width, color: active.color, alpha: 1 });
        }
      }
    },
    (s) => {
      const p = viewToWorld(s.x, s.y);
      if (currentTool === 'paint') {
        const ended = buffer.end();
        if (ended) {
          strokes.push(ended);
          undoStack.push({ type: 'add', stroke: ended });
          redoStack.length = 0;
          buckets.build(strokes);
          physics.addStroke(ended);
          void physics.tick();
        }
      } else if (currentTool === 'erase') {
        const hit = buckets.query(p.x, p.y, 10);
        if (hit.length > 0) {
          const idx = hit[hit.length - 1]!;
          const [removed] = strokes.splice(idx, 1);
          if (removed) {
            undoStack.push({ type: 'remove', stroke: removed, index: idx });
            redoStack.length = 0;
            buckets.build(strokes);
            redrawAll();
          }
        }
      } else {
        // select: future work
      }
    },
  );

  const tick = () => {
    const { width, height } = renderer.size;
    grid.draw(width, height, renderer.transform.scale);
  };
  renderer.ticker.add(tick);

  return {
    async play() {
      // ensure audio starts on user gesture
      void audio.ensureStarted();
      await (audio as unknown);
    },
    pause() {},
    seek(_seconds: number) {},
    undo() {
      const op = undoStack.pop();
      if (!op) return;
      if (op.type === 'add') {
        const idx = strokes.lastIndexOf(op.stroke);
        if (idx >= 0) strokes.splice(idx, 1);
      } else if (op.type === 'remove') {
        const pos = typeof op.index === 'number' ? op.index : strokes.length;
        strokes.splice(pos, 0, op.stroke);
      }
      redoStack.push(op);
      buckets.build(strokes);
      redrawAll();
    },
    redo() {
      const op = redoStack.pop();
      if (!op) return;
      if (op.type === 'add') {
        strokes.push(op.stroke);
      } else if (op.type === 'remove') {
        const idx = strokes.indexOf(op.stroke);
        if (idx >= 0) strokes.splice(idx, 1);
      }
      undoStack.push(op);
      buckets.build(strokes);
      redrawAll();
    },
    dispose() {
      renderer.ticker.remove(tick);
      // Soft clear: keep canvas, remove drawings and stop engines
      strokes.length = 0;
      buckets.build(strokes);
      redrawAll();
      unsubscribe();
      physics.stop();
      audio.dispose();
    },
    setTool(tool) {
      currentTool = tool;
    },
    getTool() {
      return currentTool;
    },
  };
}

