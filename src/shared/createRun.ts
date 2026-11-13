import type { GameDoc, RunRecord } from "./types";
import { createEscort } from "../features/escort/model/escort";
export function createRun(seed = 204004, records: RunRecord[] = []): GameDoc {
  const doc: GameDoc = {
    version: 1,
    seed,
    initialSeed: seed,
    nextId: 1,
    phase: "ready",
    time: 0,
    player: {
      x: 500,
      y: 325,
      hp: 100,
      maxHp: 100,
      speed: 190,
      radius: 12,
      invincible: 0,
    },
    enemies: [],
    bullets: [],
    drops: [],
    weapons: [{ id: "pulse", level: 1, cooldown: 0 }],
    upgrades: {},
    choices: [],
    xp: 0,
    level: 1,
    pendingLevels: 0,
    wave: 0,
    waveTime: 0,
    spawnBudget: 0,
    escort: null,
    repairTarget: "player",
    stats: {
      kills: 0,
      damage: 0,
      taken: 0,
      collected: 0,
      shots: 0,
      byWeapon: { pulse: 0, orbit: 0, nova: 0 },
    },
    records,
    notice: "等待接入战场",
    victory: false,
  };
  // A fresh run always deploys a fresh beacon; discarded runs cannot leak beacons.
  doc.escort = createEscort(doc.nextId++);
  return doc;
}
