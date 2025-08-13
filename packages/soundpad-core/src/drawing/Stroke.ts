export type Point = { x: number; y: number; t: number };

export type Stroke = {
  id: number;
  color: number;
  width: number;
  points: Point[];
};

export function createStroke(id: number, color: number, width: number): Stroke {
  return { id, color, width, points: [] };
}

export function addPoint(stroke: Stroke, x: number, y: number, t: number): void {
  stroke.points.push({ x, y, t });
}


