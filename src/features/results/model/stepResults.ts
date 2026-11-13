import type { GameDoc, FrameEvents } from "../../../shared/types";
import { applyEvents, makeRecord } from "./ledger";
import { saveRecords } from "../lib/storage";
export function stepResults(doc: GameDoc, events: FrameEvents): void {
  if (doc.phase === "ended") return;
  applyEvents(doc, events);
  const beaconStatus = doc.escort?.beacon.status;
  const beaconLost = beaconStatus === "lost";
  const secured = beaconStatus === "secured";
  if (doc.player.hp > 0 && !doc.victory && !beaconLost) return;
  // End the run before persistence. If the operator and the beacon fall in the
  // same frame, both conditions arrive here once and share one settlement.
  doc.phase = "ended";
  doc.choices = [];
  doc.notice = secured
    ? "护送成功 · 信标抵达终点"
    : doc.victory
      ? "撤离成功 · 信号保全"
      : beaconLost
        ? "信标失守 · 护送失败"
        : "信号中断 · 再次连接";
  doc.records = [makeRecord(doc), ...doc.records].slice(0, 20);
  saveRecords(doc.records);
}
