import type { EscortState, GameDoc } from "../../../shared/types";
import {
  BEACON_ARMOR,
  BEACON_HIT_COOLDOWN,
  BEACON_MAX_HP,
  BEACON_RADIUS,
  ESCORT_ROUTE,
} from "./catalog";

export function createEscort(id: number): EscortState {
  const start = ESCORT_ROUTE[0];
  return {
    beacon: {
      id,
      x: start.x,
      y: start.y,
      hp: BEACON_MAX_HP,
      maxHp: BEACON_MAX_HP,
      radius: BEACON_RADIUS,
      invincible: 0,
      status: "active",
    },
    progress: 0,
    damage: 0,
    repairs: 0,
  };
}

/**
 * The beacon absorbs damage on its own health bar, so operator injuries never
 * silently fail the escort. Dedicated cooldown stops stacked contacts and
 * pellet batteries from erasing the bar in a single frame.
 */
export function hurtBeacon(doc: GameDoc, damage: number): number {
  const escort = doc.escort;
  if (!escort) return 0;
  const beacon = escort.beacon;
  if (
    beacon.status !== "active" ||
    beacon.invincible > 0 ||
    beacon.hp <= 0
  )
    return 0;
  const taken = Math.min(beacon.hp, Math.max(1, damage * (1 - BEACON_ARMOR)));
  beacon.hp -= taken;
  beacon.invincible = BEACON_HIT_COOLDOWN;
  escort.damage += taken;
  if (beacon.hp <= 0) {
    beacon.hp = 0;
    beacon.status = "lost";
    doc.notice = "信标失守 · 护送失败";
  }
  return taken;
}
