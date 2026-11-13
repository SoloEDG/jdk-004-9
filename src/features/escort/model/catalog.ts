import type { Vec } from "../../../shared/types";

export const BEACON_MAX_HP = 320;
export const BEACON_RADIUS = 17;
export const BEACON_LINK_RADIUS = 130;
/** Slow enough that the escort needs defending while it travels the route. */
export const ESCORT_SPEED = 18;
export const BEACON_ARMOR = 0.55;
export const BEACON_HIT_COOLDOWN = 0.6;

/** Route runs from the deployment point to the extraction gate. */
export const ESCORT_ROUTE: readonly Vec[] = [
  { x: 350, y: 500 },
  { x: 560, y: 430 },
  { x: 560, y: 250 },
  { x: 330, y: 190 },
  { x: 700, y: 160 },
  { x: 880, y: 160 },
];
