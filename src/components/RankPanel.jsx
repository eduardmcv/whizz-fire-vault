const MEDALS = ["🥇", "🥈", "🥉"];

function getRankClass(index) {
  if (index === 0) return "gold";
  if (index === 1) return "silver";
  if (index === 2) return "bronze";
  return "";
}

function getRankLabel(index) {
  return MEDALS[index] ?? `#${index + 1}`;
}

export default function RankPanel({
  title,
  accent = "buy",
  items = [],
  emptyText = "Sin datos",
}) {
  return (
    <div className="panel">
      <div className="panel-header">
        <span className="panel-title">{title}</span>
        <span className={`panel-accent ${accent}`} />
      </div>

      {!items.length ? (
        <ul className="rank-list">
          <li className="rank-item">
            <div className="rank-info">
              <span className="rank-company">{emptyText}</span>
            </div>
          </li>
        </ul>
      ) : (
        <ul className="rank-list">
          {items.map((item, index) => {
            const isGold = item.tone === "gold";

            return (
              <li className="rank-item" key={`${item.ticker}-${index}`}>
                <span className={`rank-num ${getRankClass(index)}`}>
                  {getRankLabel(index)}
                </span>

                <div className="rank-info">
                  <span className="rank-ticker">{item.ticker}</span>
                  <span className="rank-company">{item.company}</span>
                </div>

                <div className="rank-bar-wrap">
                  <span
                    className={`rank-count ${isGold ? "" : item.tone}`}
                    style={isGold ? { color: "var(--gold)" } : undefined}
                  >
                    {item.primaryValue}
                  </span>

                  {item.secondaryValue ? (
                    <span className="rank-sub-info">{item.secondaryValue}</span>
                  ) : null}

                  <div
                    className={isGold ? "bar" : `bar ${item.tone}`}
                    style={
                      isGold
                        ? {
                            width: item.width,
                            background: "var(--gold)",
                            opacity: 0.6,
                          }
                        : { width: item.width }
                    }
                  />
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
