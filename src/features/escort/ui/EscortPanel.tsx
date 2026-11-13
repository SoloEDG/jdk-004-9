import type { GameDoc } from "../../../shared/types";

/**
 * Escort telemetry: beacon integrity, route progress and repair allocation.
 * The operator and beacon deliberately track separate health pools.
 */
export function EscortPanel({
  doc,
  allocate,
}: {
  doc: GameDoc;
  allocate: (target: "player" | "beacon") => void;
}) {
  const escort = doc.escort;
  if (!escort) return null;
  const beacon = escort.beacon;
  const status =
    beacon.status === "secured"
      ? "已抵达终点"
      : beacon.status === "lost"
        ? "信标已失守"
        : "护航进行中";
  return (
    <section className="panel escort">
      <div className="section-caption">
        <span>护送信标</span>
        <span className={`badge escort-${beacon.status}`}>{status}</span>
      </div>
      <div className="stat-row">
        <span>信标完整度</span>
        <strong className="mono">
          {Math.ceil(beacon.hp)} <small>/ {beacon.maxHp}</small>
        </strong>
      </div>
      <div className="bar health beacon">
        <i style={{ width: `${(beacon.hp / beacon.maxHp) * 100}%` }} />
      </div>
      <div className="section-caption muted escort-progress-label">
        <span>护航进度</span>
        <span className="mono">{Math.floor(escort.progress * 100)}%</span>
      </div>
      <div className="bar escort-route">
        <i style={{ width: `${escort.progress * 100}%` }} />
      </div>
      <p className="tiny">
        靠近信标才能推进；离开后它会停在原地，敌人仍会继续攻击它。
      </p>
      <div className="repair-allocate">
        <button
          className={doc.repairTarget === "player" ? "active" : ""}
          onClick={() => allocate("player")}
          disabled={beacon.status !== "active"}
        >
          修复机体
        </button>
        <button
          className={doc.repairTarget === "beacon" ? "active" : ""}
          onClick={() => allocate("beacon")}
          disabled={beacon.status !== "active"}
        >
          修复信标
        </button>
      </div>
      <div className="section-caption muted escort-metrics">
        <span>信标承伤 {Math.round(escort.damage)}</span>
        <span>修复贡献 {Math.round(escort.repairs)}</span>
      </div>
    </section>
  );
}
