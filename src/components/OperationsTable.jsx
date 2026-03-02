import { useMemo, useState } from "react";

function getEffectiveDate(op) {
  return op.trade_date ?? op.date ?? "";
}

function sortByNewest(a, b) {
  const aDate = getEffectiveDate(a);
  const bDate = getEffectiveDate(b);

  if (aDate !== bDate) return bDate.localeCompare(aDate);
  return (b.date ?? "").localeCompare(a.date ?? "");
}

function formatPrice(op) {
  if (op.price == null) return "—";
  return `${op.price}${op.currency ? ` ${op.currency}` : ""}`;
}

function formatProfit(value) {
  if (value == null) return "—";
  const sign = value > 0 ? "+" : "";
  return `${sign}${value}%`;
}

export default function OperationsTable({ rows = [], compact = false }) {
  const [tickerFilter, setTickerFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [userFilter, setUserFilter] = useState("");

  const filteredRows = useMemo(() => {
    let result = [...rows];

    const tickerNeedle = tickerFilter.trim().toUpperCase();
    const userNeedle = userFilter.trim().toUpperCase();

    if (tickerNeedle) {
      result = result.filter((op) =>
        (op.ticker ?? "").toUpperCase().includes(tickerNeedle),
      );
    }

    if (typeFilter) {
      result = result.filter((op) => op.type === typeFilter);
    }

    if (userNeedle) {
      result = result.filter((op) =>
        (op.user_id ?? "").toUpperCase().includes(userNeedle),
      );
    }

    result.sort(sortByNewest);

    return result;
  }, [rows, tickerFilter, typeFilter, userFilter]);

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-surface">
      <div className="border-b border-border px-4 py-4">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          <input
            type="text"
            value={tickerFilter}
            onChange={(e) => setTickerFilter(e.target.value)}
            placeholder="Filtrar por ticker"
            className="rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text-muted outline-none transition placeholder:text-text-muted focus:border-emerald-400"
          />

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text-muted outline-none transition focus:border-emerald-400"
          >
            <option value="">Todos los tipos</option>
            <option value="buy">Compras</option>
            <option value="sell">Ventas</option>
          </select>

          <input
            type="text"
            value={userFilter}
            onChange={(e) => setUserFilter(e.target.value)}
            placeholder="Filtrar por usuario"
            className="rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text-muted outline-none transition placeholder:text-text-muted focus:border-emerald-400"
          />
        </div>
      </div>

      <div
        className={`${compact ? "max-h-[62vh]" : "max-h-[480px]"} overflow-auto`}
      >
        <table className="min-w-full text-left text-sm">
          <thead className="sticky top-0 z-10 border-b border-border bg-surface">
            <tr>
              <th className="px-4 py-3 font-mono text-[11px] uppercase tracking-[0.16em] text-text-muted">
                Fecha
              </th>
              <th className="px-4 py-3 font-mono text-[11px] uppercase tracking-[0.16em] text-text-muted">
                Tipo
              </th>
              <th className="px-4 py-3 font-mono text-[11px] uppercase tracking-[0.16em] text-text-muted">
                Ticker
              </th>
              <th className="px-4 py-3 font-mono text-[11px] uppercase tracking-[0.16em] text-text-muted">
                Empresa
              </th>
              <th className="px-4 py-3 font-mono text-[11px] uppercase tracking-[0.16em] text-text-muted">
                Precio
              </th>
              <th className="px-4 py-3 font-mono text-[11px] uppercase tracking-[0.16em] text-text-muted">
                Acciones
              </th>
              <th className="px-4 py-3 font-mono text-[11px] uppercase tracking-[0.16em] text-text-muted">
                Profit
              </th>
              <th className="px-4 py-3 font-mono text-[11px] uppercase tracking-[0.16em] text-text-muted">
                Usuario
              </th>
            </tr>
          </thead>

          <tbody>
            {filteredRows.length === 0 ? (
              <tr>
                <td
                  colSpan={8}
                  className="px-4 py-10 text-center text-text-muted"
                >
                  Sin resultados
                </td>
              </tr>
            ) : (
              filteredRows.map((op, index) => (
                <tr
                  key={`${op.date}-${op.user_id}-${op.ticker}-${index}`}
                  className="border-b border-border transition hover:bg-hover last:border-b-0"
                >
                  <td className="px-4 py-3 align-middle">
                    <div className="font-mono text-xs text-text-muted">
                      {getEffectiveDate(op) || "—"}
                    </div>
                  </td>

                  <td className="px-4 py-3 align-middle">
                    <span
                      className={`font-mono text-xs ${
                        op.type === "buy"
                          ? "text-emerald-400"
                          : "text-orange-400"
                      }`}
                    >
                      {op.type === "buy" ? "COMPRA" : "VENTA"}
                    </span>
                  </td>

                  <td className="px-4 py-3 align-middle font-mono text-sm text-text">
                    {op.ticker ?? "—"}
                  </td>

                  <td className="max-w-[260px] px-4 py-3 align-middle text-text">
                    <div className="truncate" title={op.company ?? ""}>
                      {op.company ?? "—"}
                    </div>
                    {op.flags?.length ? (
                      <div className="mt-1 text-[11px] text-orange-300">
                        {op.flags.join(" · ")}
                      </div>
                    ) : null}
                  </td>

                  <td className="px-4 py-3 align-middle font-mono text-sm text-text-muted">
                    {formatPrice(op)}
                  </td>

                  <td className="px-4 py-3 align-middle font-mono text-sm text-text-muted">
                    {op.shares != null ? op.shares : "—"}
                  </td>

                  <td className="px-4 py-3 align-middle font-mono text-sm text-yellow-300">
                    {formatProfit(op.profit_pct)}
                  </td>

                  <td className="px-4 py-3 align-middle font-mono text-xs text-text-muted">
                    {op.user_id ?? "—"}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
