import type { GameDoc, RunRecord } from "../../../shared/types";
export function applyEvents(
  doc: GameDoc,
  events: import("../../../shared/types").FrameEvents,
): void {
  doc.stats.kills += events.kills.length;
  doc.stats.damage += events.damage;
  doc.stats.taken += events.taken;
  doc.stats.shots += events.shots;
  doc.stats.collected += events.collected;
  for (const weapon of ["pulse", "orbit", "nova"] as const)
    doc.stats.byWeapon[weapon] += events.weaponDamage?.[weapon] || 0;
}
export function makeRecord(doc: GameDoc): RunRecord {
  return {
    id: `${doc.initialSeed}-${Date.now().toString(36)}`,
    duration: doc.time,
    wave: doc.wave,
    level: doc.level,
    kills: doc.stats.kills,
    damage: Math.round(doc.stats.damage),
    weapons: doc.weapons.map((w) => `${w.id}:${w.level}`),
    victory: doc.victory,
    escort: doc.escort
      ? {
          progress: doc.escort.progress,
          damage: Math.round(doc.escort.damage),
          repairs: Math.round(doc.escort.repairs),
          secured: doc.escort.beacon.status === "secured",
        }
      : undefined,
  };
}
