import type { GameDoc, RepairTarget } from "../../../shared/types";

function activeEscort(doc: GameDoc) {
  const escort = doc.escort;
  return escort && escort.beacon.status === "active" ? escort : null;
}

/**
 * Repair kits are allocated to the operator's chosen body first and overflow
 * to the other one, so a kit is never wasted on a full health bar. The two
 * health pools stay independent: healing the beacon does not heal the player.
 */
export function applyRepair(
  doc: GameDoc,
  amount: number,
): void {
  const escort = activeEscort(doc);
  const order: RepairTarget[] =
    doc.repairTarget === "beacon" && escort
      ? ["beacon", "player"]
      : ["player", "beacon"];
  let remaining = amount;
  for (const target of order) {
    if (remaining <= 0) break;
    if (target === "beacon") {
      if (!escort) continue;
      const healed = Math.min(
        escort.beacon.maxHp - escort.beacon.hp,
        remaining,
      );
      if (healed <= 0) continue;
      escort.beacon.hp += healed;
      escort.repairs += healed;
      remaining -= healed;
    } else {
      // A downed operator stays down; repairs cannot revive mid-frame.
      if (doc.player.hp <= 0) continue;
      const healed = Math.min(doc.player.maxHp - doc.player.hp, remaining);
      if (healed <= 0) continue;
      doc.player.hp += healed;
      remaining -= healed;
    }
  }
}
