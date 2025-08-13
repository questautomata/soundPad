import type { Stroke } from '../drawing/Stroke';

export type Feature = {
  id: number;
  length: number;
  avgSpeed: number;
  curvature: number;
  width: number;
  color: number;
};

export function analyzeStroke(stroke: Stroke): Feature {
  const pts = stroke.points;
  let length = 0;
  let last = pts[0];
  let totalSpeed = 0;
  let samples = 0;
  let curvatureAccum = 0;
  for (let i = 1; i < pts.length; i++) {
    const a = last!;
    const b = pts[i]!;
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    const dt = Math.max(1, b.t - a.t);
    const dist = Math.hypot(dx, dy);
    length += dist;
    totalSpeed += dist / dt;
    samples++;
    if (i + 1 < pts.length) {
      const c = pts[i + 1]!;
      const angle1 = Math.atan2(b.y - a.y, b.x - a.x);
      const angle2 = Math.atan2(c.y - b.y, c.x - b.x);
      const da = Math.abs(angle2 - angle1);
      curvatureAccum += Math.min(Math.PI, da);
    }
    last = b;
  }
  const avgSpeed = samples > 0 ? totalSpeed / samples : 0;
  const curvature = samples > 1 ? curvatureAccum / (samples - 1) : 0;
  return {
    id: stroke.id,
    length,
    avgSpeed,
    curvature,
    width: stroke.width,
    color: stroke.color,
  };
}


