import { useMemo, useState } from "react";

function formatDate(date) {
  if (!date) return "–";
  return date.slice(5).replace("-", "/");
}

function formatPrice(price, currency) {
  if (price == null) return "–";
  return `${price}${currency ? ` ${currency}` : ""}`;
}

export default function OpsTable({ operations = [] }) {
  const [tickerFilter, setTickerFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");

  const filteredOps = useMemo(() => {
    let result = [...operations];

    const normalizedTicker = tickerFilter.trim().toUpperCase();

    if (normalizedTicker) {
      result = result.filter((op) =>
        op.ticker.toUpperCase().includes(normalizedTicker),
      );
    }

    if (typeFilter) {
      result = result.filter((op) => op.type === typeFilter);
    }

    result.sort((a, b) => b.date.localeCompare(a.date));

    return result;
  }, [operations, tickerFilter, typeFilter]);

  return (
    <>
      <div className="filter-bar" style={{ marginBottom: 14 }}>
        <label htmlFor="filterTicker">Ticker:</label>
        <input
          id="filterTicker"
          type="text"
          placeholder="Ej: RHI, NVO…"
          maxLength={10}
          value={tickerFilter}
          onChange={(e) => setTickerFilter(e.target.value)}
        />

        <label htmlFor="filterType">Tipo:</label>
        <select
          id="filterType"
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
        >
          <option value="">Todos</option>
          <option value="buy">Compras</option>
          <option value="sell">Ventas</option>
        </select>
      </div>

      <div className="detail-panel">
        <div className="table-wrap">
          <table className="detail-table">
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Tipo</th>
                <th>Ticker</th>
                <th>Empresa</th>
                <th>Precio</th>
                <th>Acciones</th>
                <th>% Profit</th>
                <th>Inversor</th>
              </tr>
            </thead>

            <tbody>
              {!filteredOps.length ? (
                <tr>
                  <td colSpan="8" className="empty-state">
                    Sin resultados
                  </td>
                </tr>
              ) : (
                filteredOps.map((op, index) => (
                  <tr key={`${op.date}-${op.user_id}-${op.ticker}-${index}`}>
                    <td className="td-date">{formatDate(op.date)}</td>
                    <td
                      className={
                        op.type === "buy" ? "td-type-buy" : "td-type-sell"
                      }
                    >
                      {op.type === "buy" ? "COMPRA" : "VENTA"}
                    </td>
                    <td className="td-ticker">{op.ticker}</td>
                    <td className="td-company" title={op.company}>
                      {op.company}
                    </td>
                    <td className="td-price">
                      {formatPrice(op.price, op.currency)}
                    </td>
                    <td className="td-shares">
                      {op.shares != null ? op.shares : "–"}
                    </td>
                    <td className="td-profit">
                      {op.profit_pct != null ? `+${op.profit_pct}%` : "–"}
                    </td>
                    <td className="td-user">{op.user_id}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
