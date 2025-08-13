import type { Brush } from './Brush';

export class BrushRegistry {
  private brushes = new Map<string, Brush>();
  private defaultName: string | null = null;

  register(brush: Brush, isDefault = false): void {
    this.brushes.set(brush.name, brush);
    if (isDefault || !this.defaultName) this.defaultName = brush.name;
  }

  get(name?: string): Brush | null {
    const key = name ?? this.defaultName;
    return key ? this.brushes.get(key) ?? null : null;
  }
}


