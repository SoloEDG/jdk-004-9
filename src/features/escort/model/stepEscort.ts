import type { GameDoc } from "../../../shared/types";
import { distance } from "../../../shared/math";
import { ESCORT_ROUTE_LENGTH, routePoint } from "../lib/route";
import { BEACON_LINK_RADIUS, ESCORT_SPEED } from "./catalog";

/**
 * The beacon advances only while the operator is inside the link radius. When
 * the operator leaves, the beacon holds position but stays a live target, so
 * the escort cannot be completed by parking safety at range.
 */
export function stepEscort(doc: GameDoc, dt: number): void {
  // Upgrade and pause phases freeze the beacon together with the battlefield.
  if (doc.phase !== "playing") return;
  const escort = doc.escort;
  if (!escort) return;
  const beacon = escort.beacon;
  if (beacon.status !== "active") return;
  if (beacon.hp <= 0) {
    beacon.hp = 0;
    beacon.status = "lost";
    doc.notice = "信标失守 · 护送失败";
    return;
  }
  beacon.invincible = Math.max(0, beacon.invincible - dt);
  if (doc.player.hp > 0 && distance(doc.player, beacon) <= BEACON_LINK_RADIUS)
    escort.progress = Math.min(
      1,
      escort.progress + (ESCORT_SPEED * dt) / ESCORT_ROUTE_LENGTH,
    );
  const point = routePoint(escort.progress);
  beacon.x = point.x;
  beacon.y = point.y;
  if (escort.progress >= 1) {
    beacon.status = "secured";
    doc.victory = true;
    doc.notice = "信标抵达终点 · 护送成功";
  }
}
