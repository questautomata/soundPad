import { Container, Graphics } from 'pixi.js';

export type GridOptions = {
  beatsPerBar: number;
  beatSpacingPx: number;
  minorColor?: number;
  majorColor?: number;
  alpha?: number;
};

export class GridOverlay {
  readonly container: Container;
  private readonly gfx: Graphics;
  private options: GridOptions;

  constructor(parent: Container, options?: Partial<GridOptions>) {
    this.container = new Container();
    parent.addChild(this.container);
    this.gfx = new Graphics();
    this.container.addChild(this.gfx);
    this.options = {
      beatsPerBar: 4,
      beatSpacingPx: 64,
      minorColor: 0x2a2a33,
      majorColor: 0x3a3a55,
      alpha: 1,
      ...options,
    } as GridOptions;
  }

  draw(width: number, height: number, scale: number): void {
    const { beatsPerBar, beatSpacingPx, minorColor, majorColor, alpha } = this.options;
    const spacing = beatSpacingPx * scale;
    this.gfx.clear();
    this.gfx.alpha = alpha ?? 1;

    // Vertical lines (time axis)
    for (let x = 0; x <= width + 0.5; x += spacing) {
      const isBar = Math.round(x / spacing) % beatsPerBar === 0;
      const color = isBar ? majorColor! : minorColor!;
      this.gfx.moveTo(x, 0);
      this.gfx.lineTo(x, height);
      // @ts-ignore - Pixi v8 stroke
      this.gfx.stroke({ width: 1, color, alpha: 1 });
    }

    // Horizontal lines: 4 evenly spaced
    const lanes = 4;
    const laneSpacing = height / (lanes + 1);
    for (let i = 1; i <= lanes; i++) {
      const y = Math.round(i * laneSpacing) + 0.5;
      this.gfx.moveTo(0, y);
      this.gfx.lineTo(width, y);
      // @ts-ignore
      this.gfx.stroke({ width: 1, color: minorColor!, alpha: 0.6 });
    }
  }
}


