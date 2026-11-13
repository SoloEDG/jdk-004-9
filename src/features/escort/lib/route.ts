import type { Vec } from "../../../shared/types";
import { ESCORT_ROUTE } from "../model/catalog";

const segments = ESCORT_ROUTE.slice(1).map((point, index) => {
  const from = ESCORT_ROUTE[index];
  return { from, point, length: Math.hypot(point.x - from.x, point.y - from.y) };
});

export const ESCORT_ROUTE_LENGTH = segments.reduce(
  (total, segment) => total + segment.length,
  0,
);

/** Position along the route for progress 0..1, clamped to the route ends. */
export function routePoint(progress: number): Vec {
  const t = Math.max(0, Math.min(1, progress));
  let remaining = t * ESCORT_ROUTE_LENGTH;
  for (const segment of segments) {
    if (remaining <= segment.length || segment === segments[segments.length - 1]) {
      const ratio = segment.length ? Math.min(1, remaining / segment.length) : 0;
      return {
        x: segment.from.x + (segment.point.x - segment.from.x) * ratio,
        y: segment.from.y + (segment.point.y - segment.from.y) * ratio,
      };
    }
    remaining -= segment.length;
  }
  return { ...ESCORT_ROUTE[ESCORT_ROUTE.length - 1] };
}
