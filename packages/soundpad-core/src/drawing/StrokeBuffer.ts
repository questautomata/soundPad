import { Stroke, createStroke, addPoint } from './Stroke';

export class StrokeBuffer {
  private nextId = 1;
  private pool: Stroke[] = [];
  private active: Stroke | null = null;

  begin(color: number, width: number): Stroke {
    const stroke = this.pool.pop() ?? createStroke(this.nextId++, color, width);
    stroke.color = color;
    stroke.width = width;
    stroke.points.length = 0;
    this.active = stroke;
    return stroke;
  }

  add(x: number, y: number, t: number): void {
    if (!this.active) return;
    addPoint(this.active, x, y, t);
  }

  end(): Stroke | null {
    const s = this.active;
    this.active = null;
    return s ?? null;
  }

  recycle(stroke: Stroke): void {
    stroke.points.length = 0;
    this.pool.push(stroke);
  }
}


