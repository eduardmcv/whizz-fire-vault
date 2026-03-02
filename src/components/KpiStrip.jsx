export default function KpiStrip({
  monthLabel,
  totalOperations,
  totalBuys,
  totalSells,
  uniqueAssets,
  uniqueInvestors,
}) {
  const buyPct = totalOperations
    ? Math.round((totalBuys / totalOperations) * 100)
    : 0;

  const sellPct = totalOperations
    ? Math.round((totalSells / totalOperations) * 100)
    : 0;

  return (
    <div className="kpi-strip">
      <div className="kpi">
        <div className="kpi-label">Operaciones totales</div>
        <div className="kpi-value total">{totalOperations}</div>
        <div className="kpi-sub">{monthLabel}</div>
      </div>

      <div className="kpi">
        <div className="kpi-label">Compras</div>
        <div className="kpi-value buy">{totalBuys}</div>
        <div className="kpi-sub">{buyPct}% del total</div>
      </div>

      <div className="kpi">
        <div className="kpi-label">Ventas</div>
        <div className="kpi-value sell">{totalSells}</div>
        <div className="kpi-sub">{sellPct}% del total</div>
      </div>

      <div className="kpi">
        <div className="kpi-label">Activos únicos</div>
        <div className="kpi-value total">{uniqueAssets}</div>
        <div className="kpi-sub">{uniqueInvestors} inversores únicos</div>
      </div>
    </div>
  );
}
