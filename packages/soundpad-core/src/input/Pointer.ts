export type PointerSample = { x: number; y: number; t: number };

export class Pointer {
  private isDown = false;
  private lastEmit = 0;
  private readonly minDeltaMs: number;
  private readonly onDown: (s: PointerSample) => void;
  private readonly onMove: (s: PointerSample) => void;
  private readonly onUp: (s: PointerSample) => void;

  constructor(
    target: HTMLElement,
    opts: { throttleMs?: number; getSize?: () => { width: number; height: number } },
    onDown: (s: PointerSample) => void,
    onMove: (s: PointerSample) => void,
    onUp: (s: PointerSample) => void,
  ) {
    this.minDeltaMs = Math.max(4, opts.throttleMs ?? 8);
    this.onDown = onDown;
    this.onMove = onMove;
    this.onUp = onUp;

    const toSample = (ev: PointerEvent): PointerSample => {
      const o = ev as unknown as { offsetX?: number; offsetY?: number };
      if (typeof o.offsetX === 'number' && typeof o.offsetY === 'number') {
        return { x: o.offsetX, y: o.offsetY, t: performance.now() };
      }
      const targetEl = ev.currentTarget as HTMLElement;
      const rect = targetEl.getBoundingClientRect();
      return { x: ev.clientX - rect.left, y: ev.clientY - rect.top, t: performance.now() };
    };

    target.addEventListener('pointerdown', (ev) => {
      target.setPointerCapture(ev.pointerId);
      this.isDown = true;
      this.lastEmit = 0;
      this.onDown(toSample(ev));
    });

    target.addEventListener('pointermove', (ev) => {
      if (!this.isDown) return;
      const now = performance.now();
      if (now - this.lastEmit < this.minDeltaMs) return;
      this.lastEmit = now;
      this.onMove(toSample(ev));
    });

    const end = (ev: PointerEvent) => {
      if (!this.isDown) return;
      this.isDown = false;
      this.onUp(toSample(ev));
      try { target.releasePointerCapture(ev.pointerId); } catch {}
    };
    target.addEventListener('pointerup', end);
    target.addEventListener('pointercancel', end);
    target.addEventListener('pointerupoutside', end as unknown as EventListener);
    target.addEventListener('pointerleave', end);
  }
}


