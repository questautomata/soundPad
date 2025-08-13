import { Graphics } from 'pixi.js';
import type { Stroke } from './Stroke';

export type BrushContext = {
  layer: Graphics;
};

export interface Brush {
  name: string;
  begin(ctx: BrushContext, stroke: Stroke): void;
  draw(ctx: BrushContext, stroke: Stroke): void;
  end(ctx: BrushContext, stroke: Stroke): void;
}

export class SimpleBrush implements Brush {
  readonly name: string = 'simple';
  begin(ctx: BrushContext, stroke: Stroke): void {
    ctx.layer.lineStyle(stroke.width, stroke.color, 1);
  }
  draw(ctx: BrushContext, stroke: Stroke): void {
    const pts = stroke.points;
    if (pts.length < 2) return;
    const last = pts[pts.length - 2]!;
    const cur = pts[pts.length - 1]!;
    ctx.layer.moveTo(last.x, last.y);
    ctx.layer.lineTo(cur.x, cur.y);
  }
  end(_ctx: BrushContext, _stroke: Stroke): void {
    // no-op
  }
}

export class MalletBrush extends SimpleBrush { override readonly name: string = 'mallet'; }
export class PluckBrush extends SimpleBrush { override readonly name: string = 'pluck'; }
export class BowBrush extends SimpleBrush { override readonly name: string = 'bow'; }
export class GranularBrush extends SimpleBrush { override readonly name: string = 'granular'; }


