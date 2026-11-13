import type { GameDoc } from "../../../shared/types";
import { clamp } from "../../../shared/math";

/**
 * Escort progress (and the current wave) decides how much of the hostile
 * force peels off to attack the beacon instead of the operator.
 */
export function beaconPressure(doc: GameDoc): number {
  const escort = doc.escort;
  if (!escort || escort.beacon.status !== "active") return 0;
  return clamp(0.18 + escort.progress * 0.38 + doc.wave * 0.02, 0, 0.68);
}

/** Stable per-enemy roll: follow direction flips only as pressure rises. */
export function resolveTarget(
  doc: GameDoc,
  bias: number,
): "player" | "beacon" {
  return bias < beaconPressure(doc) ? "beacon" : "player";
}
