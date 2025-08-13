import type { Stroke } from '../drawing/Stroke';

// Simple coarse grid bucket indexing for hit testing
export class BucketIndex {
  private readonly cellSize: number;
  private readonly buckets = new Map<string, number[]>();

  constructor(cellSize = 64) {
    this.cellSize = Math.max(16, cellSize);
  }

  private key(x: number, y: number): string {
    const cx = Math.floor(x / this.cellSize);
    const cy = Math.floor(y / this.cellSize);
    return `${cx}:${cy}`;
  }

  build(strokes: Stroke[]): void {
    this.buckets.clear();
    for (let i = 0; i < strokes.length; i++) {
      const s = strokes[i]!;
      for (const p of s.points) {
        const k = this.key(p.x, p.y);
        let arr = this.buckets.get(k);
        if (!arr) {
          arr = [];
          this.buckets.set(k, arr);
        }
        if (arr[arr.length - 1] !== i) arr.push(i);
      }
    }
  }

  query(x: number, y: number, radius = 8): number[] {
    const cx = Math.floor(x / this.cellSize);
    const cy = Math.floor(y / this.cellSize);
    const hits = new Set<number>();
    const rCells = Math.max(0, Math.floor(radius / this.cellSize));
    for (let dx = -rCells; dx <= rCells; dx++) {
      for (let dy = -rCells; dy <= rCells; dy++) {
        const k = `${cx + dx}:${cy + dy}`;
        const arr = this.buckets.get(k);
        if (arr) arr.forEach((i) => hits.add(i));
      }
    }
    return Array.from(hits);
  }
}


