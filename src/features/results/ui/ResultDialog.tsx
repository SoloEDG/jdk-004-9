import type { GameDoc } from "../../../shared/types";
import { formatTime } from "../../../shared/math";
export function ResultDialog({
  doc,
  restart,
}: {
  doc: GameDoc;
  restart: () => void;
}) {
  const secured = doc.escort?.beacon.status === "secured";
  const beaconLost = doc.escort?.beacon.status === "lost";
  return (
    <div className="overlay">
      <div className="result-dialog">
        <div className="eyebrow">
          MISSION {secured || doc.victory ? "COMPLETE" : "ENDED"}
        </div>
        <h2>
          {secured
            ? "信标已送达。"
            : doc.victory
              ? "信号已保全。"
              : beaconLost
                ? "信标失守。"
                : "信号暂时中断。"}
        </h2>
        <p>每一次坠落，都是下一次进化的起点。</p>
        <div className="result-grid">
          <div>
            <strong>{formatTime(doc.time)}</strong>
            <small>生存时间</small>
          </div>
          <div>
            <strong>{doc.stats.kills}</strong>
            <small>击败敌人</small>
          </div>
          <div>
            <strong>{doc.level}</strong>
            <small>最终等级</small>
          </div>
        </div>
        <div className="damage-breakdown">
          {Object.entries(doc.stats.byWeapon).map(([key, value]) => (
            <div key={key}>
              <span>{key.toUpperCase()}</span>
              <span>{Math.round(value)} DMG</span>
            </div>
          ))}
        </div>
        {doc.escort && (
          <div className="escort-result">
            <div className="section-caption">
              <span>护送贡献</span>
              <span>
                {doc.escort.beacon.status === "secured"
                  ? "信标已送达"
                  : doc.escort.beacon.status === "lost"
                    ? "信标失守"
                    : "护送中断"}
              </span>
            </div>
            <div className="result-grid escort-grid">
              <div>
                <strong>{Math.floor(doc.escort.progress * 100)}%</strong>
                <small>护送进度</small>
              </div>
              <div>
                <strong>{Math.round(doc.escort.damage)}</strong>
                <small>信标承伤</small>
              </div>
              <div>
                <strong>{Math.round(doc.escort.repairs)}</strong>
                <small>修复贡献</small>
              </div>
            </div>
          </div>
        )}
        <button className="primary" onClick={restart}>
          重新接入 ↗
        </button>
        <p className="tiny">本地已记录 {doc.records.length} 次行动</p>
      </div>
    </div>
  );
}
