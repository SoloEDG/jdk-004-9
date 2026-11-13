import type { GameDoc } from "../../../shared/types";
import { WIDTH, HEIGHT } from "../../../shared/types";
import {
  BEACON_LINK_RADIUS,
  ESCORT_ROUTE,
} from "../../escort/model/catalog";

function drawEscort(ctx: CanvasRenderingContext2D, d: GameDoc) {
  const escort = d.escort;
  if (!escort) return;
  const beacon = escort.beacon;
  const locked =
    beacon.status === "active" &&
    Math.hypot(d.player.x - beacon.x, d.player.y - beacon.y) <=
      BEACON_LINK_RADIUS;
  const color =
    beacon.status === "secured"
      ? "#8ff0c3"
      : beacon.status === "lost"
        ? "#5c6672"
        : locked
          ? "#9fe6ff"
          : "#6e8fa8";

  ctx.save();
  ctx.setLineDash([4, 10]);
  ctx.strokeStyle = beacon.status === "lost" ? "#2c3b46" : "#3d6b7d";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(ESCORT_ROUTE[0].x, ESCORT_ROUTE[0].y);
  for (const point of ESCORT_ROUTE.slice(1)) ctx.lineTo(point.x, point.y);
  ctx.stroke();
  ctx.setLineDash([]);
  const gate = ESCORT_ROUTE[ESCORT_ROUTE.length - 1];
  ctx.strokeStyle = "#4c7c72";
  ctx.strokeRect(gate.x - 16, gate.y - 16, 32, 32);
  ctx.restore();

  if (beacon.status === "active") {
    ctx.strokeStyle = locked ? "#6fd6ff55" : "#44616f33";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(beacon.x, beacon.y, BEACON_LINK_RADIUS, 0, Math.PI * 2);
    ctx.stroke();
  }

  ctx.save();
  ctx.translate(beacon.x, beacon.y);
  ctx.shadowColor = color;
  ctx.shadowBlur = beacon.status === "lost" ? 0 : 18;
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(0, -beacon.radius);
  ctx.lineTo(beacon.radius, 0);
  ctx.lineTo(0, beacon.radius);
  ctx.lineTo(-beacon.radius, 0);
  ctx.closePath();
  ctx.fill();
  ctx.shadowBlur = 0;
  ctx.fillStyle = "#0b1620";
  ctx.beginPath();
  ctx.arc(0, 0, 5, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  if (beacon.hp < beacon.maxHp || beacon.status !== "secured") {
    ctx.fillStyle = "#24323d";
    ctx.fillRect(beacon.x - 22, beacon.y - 30, 44, 3);
    ctx.fillStyle =
      beacon.status === "lost"
        ? "#4a5561"
        : beacon.hp / beacon.maxHp < 0.3
          ? "#ff7d7d"
          : "#7fdcff";
    ctx.fillRect(
      beacon.x - 22,
      beacon.y - 30,
      (44 * Math.max(0, beacon.hp)) / beacon.maxHp,
      3,
    );
  }
  ctx.fillStyle = color;
  ctx.font = "9px monospace";
  ctx.fillText(
    beacon.status === "secured"
      ? "BEACON SECURED"
      : beacon.status === "lost"
        ? "BEACON LOST"
        : `BEACON ${Math.floor(escort.progress * 100)}%`,
    beacon.x - 30,
    beacon.y + 34,
  );
}

export function renderScene(ctx: CanvasRenderingContext2D, d: GameDoc) {
  ctx.clearRect(0, 0, WIDTH, HEIGHT);
  ctx.fillStyle = "#0a1019";
  ctx.fillRect(0, 0, WIDTH, HEIGHT);
  ctx.strokeStyle = "#172431";
  ctx.lineWidth = 0.6;
  for (let x = 0; x < WIDTH; x += 40) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, HEIGHT);
    ctx.stroke();
  }
  for (let y = 0; y < HEIGHT; y += 40) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(WIDTH, y);
    ctx.stroke();
  }
  ctx.strokeStyle = "#2d424d";
  ctx.setLineDash([6, 8]);
  ctx.strokeRect(28, 28, WIDTH - 56, HEIGHT - 56);
  ctx.setLineDash([]);
  ctx.strokeStyle = "#152c35";
  for (const r of [110, 220, 330]) {
    ctx.beginPath();
    ctx.arc(500, 325, r, 0, Math.PI * 2);
    ctx.stroke();
  }
  drawEscort(ctx, d);
  for (const drop of d.drops) {
    ctx.fillStyle =
      drop.kind === "xp"
        ? "#9eeaa6"
        : drop.kind === "heal"
          ? "#fc91aa"
          : "#8ac6ff";
    ctx.shadowColor = ctx.fillStyle;
    ctx.shadowBlur = 10;
    ctx.save();
    ctx.translate(drop.x, drop.y);
    ctx.rotate(Math.PI / 4);
    ctx.fillRect(-4, -4, 8, 8);
    ctx.restore();
  }
  ctx.shadowBlur = 0;
  for (const e of d.enemies) {
    const color =
      e.kind === "shooter"
        ? "#bb9eff"
        : e.kind === "elite"
          ? "#ffae70"
          : "#ed697b";
    ctx.fillStyle = color;
    ctx.shadowColor = color;
    ctx.shadowBlur = 12;
    ctx.beginPath();
    if (e.kind === "chaser") {
      ctx.moveTo(e.x, e.y - 12);
      ctx.lineTo(e.x + 11, e.y + 9);
      ctx.lineTo(e.x - 11, e.y + 9);
      ctx.closePath();
    } else {
      ctx.arc(e.x, e.y, e.radius, 0, Math.PI * 2);
    }
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.fillStyle = "#10121d";
    ctx.beginPath();
    ctx.arc(e.x, e.y, 4, 0, Math.PI * 2);
    ctx.fill();
    if (e.hp < e.maxHp) {
      ctx.fillStyle = "#ef7287";
      ctx.fillRect(e.x - 14, e.y - 22, (28 * e.hp) / e.maxHp, 2);
    }
  }
  for (const b of d.bullets) {
    ctx.fillStyle =
      b.owner === "enemy"
        ? "#ff827d"
        : b.weapon === "nova"
          ? "#ba9fff"
          : b.weapon === "orbit"
            ? "#f7cd79"
            : "#a7ffe1";
    ctx.shadowColor = ctx.fillStyle;
    ctx.shadowBlur = 8;
    ctx.beginPath();
    ctx.arc(b.x, b.y, b.radius, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.shadowBlur = 0;
  const p = d.player;
  ctx.save();
  ctx.translate(p.x, p.y);
  ctx.strokeStyle = "#9eeeb3";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.arc(0, 0, 24, 0, Math.PI * 2);
  ctx.stroke();
  ctx.globalAlpha = p.invincible > 0 ? 0.45 : 1;
  ctx.shadowColor = "#a9ffd7";
  ctx.shadowBlur = 24;
  ctx.fillStyle = "#cdfedc";
  ctx.beginPath();
  ctx.moveTo(0, -17);
  ctx.lineTo(12, 11);
  ctx.lineTo(0, 7);
  ctx.lineTo(-12, 11);
  ctx.closePath();
  ctx.fill();
  ctx.shadowBlur = 0;
  ctx.fillStyle = "#193b3b";
  ctx.fillRect(-3, -3, 6, 6);
  ctx.restore();
  ctx.fillStyle = "#526571";
  ctx.font = "10px monospace";
  ctx.fillText("SECTOR 07 / SIGNAL ACTIVE", 48, HEIGHT - 42);
  ctx.fillText(
    `${d.enemies.length.toString().padStart(3, "0")} HOSTILES`,
    WIDTH - 145,
    HEIGHT - 42,
  );
}
