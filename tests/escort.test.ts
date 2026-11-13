import { test } from "node:test";
import assert from "node:assert/strict";
import { createRun } from "../src/shared/createRun";
import { simulate } from "../src/app/simulate";
import { hurtBeacon, stepEscort, applyRepair } from "../src/features/escort";
import { resolveTarget } from "../src/features/escort/lib/targeting";
import { BEACON_LINK_RADIUS } from "../src/features/escort/model/catalog";
import { routePoint } from "../src/features/escort/lib/route";
import { stepCombat } from "../src/features/combat";
import { stepResults } from "../src/features/results";

const input = { x: 0, y: 0, aim: { x: 0, y: 0 }, firing: false };

function runWithBeacon() {
  const d = createRun();
  d.phase = "playing";
  // Place the operator right next to the deployed beacon so it can advance.
  d.player.x = d.escort!.beacon.x;
  d.player.y = d.escort!.beacon.y;
  return d;
}

test("beacon progresses while the operator is in link range and holds when they leave", () => {
  const d = runWithBeacon();
  stepEscort(d, 0.5);
  assert.ok(d.escort!.progress > 0);
  const progress = d.escort!.progress;
  d.player.x = 900;
  d.player.y = 600;
  stepEscort(d, 0.5);
  assert.equal(d.escort!.progress, progress);
  const held = { x: d.escort!.beacon.x, y: d.escort!.beacon.y };
  // Beacon stays exactly where it stopped; it does not follow the operator.
  const point = routePoint(progress);
  assert.ok(Math.abs(held.x - point.x) < 0.001);
  assert.ok(Math.abs(held.y - point.y) < 0.001);
});

test("beacon damage is independent from operator health", () => {
  const d = createRun();
  d.phase = "playing";
  const before = d.player.hp;
  hurtBeacon(d, 40);
  assert.equal(d.player.hp, before);
  assert.ok(d.escort!.beacon.hp < d.escort!.beacon.maxHp);
  assert.ok(d.escort!.damage > 0);
});

test("destroying the beacon marks it lost and blocks further damage without ending by itself", () => {
  const d = createRun();
  d.escort!.beacon.hp = 1;
  hurtBeacon(d, 50);
  assert.equal(d.escort!.beacon.status, "lost");
  assert.equal(hurtBeacon(d, 50), 0);
  const damage = d.escort!.damage;
  hurtBeacon(d, 50);
  assert.equal(d.escort!.damage, damage);
});

test("repair pickup allocation routes the kit to the chosen body first", () => {
  const d = createRun();
  d.escort!.beacon.hp = 100;
  d.player.hp = 40;
  d.repairTarget = "beacon";
  applyRepair(d, 20);
  assert.equal(d.player.hp, 40);
  assert.equal(d.escort!.beacon.hp, 120);
  assert.equal(d.escort!.repairs, 20);

  d.player.hp = 40;
  d.repairTarget = "player";
  applyRepair(d, 20);
  assert.equal(d.player.hp, 60);
  assert.equal(d.escort!.beacon.hp, 120);
});

test("enemy targeting pressure rises with escort progress", () => {
  const d = createRun();
  d.phase = "playing";
  const early = resolveTarget(d, 0.3);
  d.escort!.progress = 0.9;
  const late = resolveTarget(d, 0.3);
  assert.equal(early, "player");
  assert.equal(late, "beacon");
});

test("beacon contact and projectile damage are absorbed by the beacon, not the player", () => {
  const d = createRun();
  d.phase = "playing";
  d.player.x = 900;
  d.player.y = 600;
  const beacon = d.escort!.beacon;
  beacon.invincible = 0;
  d.enemies = [
    {
      id: 9,
      kind: "chaser",
      x: beacon.x,
      y: beacon.y,
      hp: 10,
      maxHp: 10,
      radius: 12,
      cooldown: 0,
    },
  ];
  d.bullets = [
    {
      id: 10,
      x: beacon.x,
      y: beacon.y,
      vx: 0,
      vy: 0,
      radius: 5,
      damage: 100,
      life: 1,
      owner: "enemy",
      weapon: "enemy",
      pierce: 0,
      hit: [],
    },
  ];
  const hpBefore = beacon.hp;
  const playerBefore = d.player.hp;
  stepCombat(d, input, 0);
  assert.ok(beacon.hp < hpBefore);
  assert.equal(d.player.hp, playerBefore);
});

test("operator and beacon dying in the same frame produce a single settlement", () => {
  const d = createRun();
  d.phase = "playing";
  d.player.hp = 0;
  d.escort!.beacon.hp = 0;
  d.escort!.beacon.status = "lost";
  stepResults(d, {
    kills: [],
    damage: 0,
    taken: 0,
    shots: 0,
    collected: 0,
  });
  assert.equal(d.phase, "ended");
  assert.equal(d.records.length, 1);
  stepResults(d, {
    kills: [],
    damage: 0,
    taken: 0,
    shots: 0,
    collected: 0,
  });
  assert.equal(d.records.length, 1);
});

test("reaching the extraction point secures the beacon and survives late fire", () => {
  const d = runWithBeacon();
  d.escort!.progress = 0.9999;
  stepEscort(d, 1);
  assert.equal(d.escort!.beacon.status, "secured");
  assert.equal(d.victory, true);
  const damage = d.escort!.damage;
  hurtBeacon(d, 100);
  assert.equal(d.escort!.damage, damage);
  stepResults(d, {
    kills: [],
    damage: 0,
    taken: 0,
    shots: 0,
    collected: 0,
  });
  assert.equal(d.phase, "ended");
  assert.equal(d.records.length, 1);
  assert.equal(d.records[0].escort?.secured, true);
});

test("restarting deploys a new beacon so the old one cannot linger", () => {
  const first = createRun();
  first.escort!.beacon.status = "lost";
  const second = createRun(204004, first.records);
  assert.notEqual(second.escort!.beacon, first.escort!.beacon);
  assert.equal(second.escort!.beacon.status, "active");
  assert.equal(second.escort!.beacon.hp, second.escort!.beacon.maxHp);
  assert.equal(second.escort!.progress, 0);
});

test("upgrade phase freezes beacon movement and beacon damage", () => {
  const d = runWithBeacon();
  d.phase = "upgrade";
  d.enemies = [
    {
      id: 21,
      kind: "chaser",
      x: d.escort!.beacon.x,
      y: d.escort!.beacon.y,
      hp: 10,
      maxHp: 10,
      radius: 12,
      cooldown: 0,
      target: "beacon",
    },
  ];
  const state = JSON.stringify(d.escort);
  simulate(d, input, 1 / 60);
  assert.equal(JSON.stringify(d.escort), state);
});

test("link radius boundary is respected", () => {
  const d = createRun();
  d.phase = "playing";
  d.player.x = d.escort!.beacon.x + BEACON_LINK_RADIUS + 1;
  d.player.y = d.escort!.beacon.y;
  stepEscort(d, 1);
  assert.equal(d.escort!.progress, 0);
});
