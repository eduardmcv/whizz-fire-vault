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

function TypeBadge({ type }) {
  return (
    <span
      className={`inline-block rounded px-2 py-0.5 font-mono text-xs font-medium ${
        type === "buy"
          ? "bg-emerald-400/10 text-emerald-400"
          : "bg-orange-400/10 text-orange-400"
      }`}
    >
      {type === "buy" ? "COMPRA" : "VENTA"}
    </span>
  );
}

export default function OperationsTable({ rows = [], compact = false }) {
  const [tickerFilter, setTickerFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [userFilter, setUserFilter] = useState("");

  const filteredRows = useMemo(() => {
    let result = [...rows];
    const tickerNeedle = tickerFilter.trim().toUpperCase();
    const userNeedle = userFilter.trim().toUpperCase();

    if (tickerNeedle)
      result = result.filter((op) =>
        (op.ticker ?? "").toUpperCase().includes(tickerNeedle),
      );
    if (typeFilter) result = result.filter((op) => op.type === typeFilter);
    if (userNeedle)
      result = result.filter((op) =>
        (op.user_id ?? "").toUpperCase().includes(userNeedle),
      );

    result.sort(sortByNewest);
    return result;
  }, [rows, tickerFilter, typeFilter, userFilter]);

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-surface">
      {/* Filters */}
      <div className="border-b border-border px-4 py-4">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
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

      {/* Content */}
      <div
        className={`${compact ? "max-h-[62vh]" : "max-h-[680px]"} overflow-y-auto`}
      >
        {filteredRows.length === 0 ? (
          <p className="px-4 py-10 text-center text-sm text-text-muted">
            Sin resultados
          </p>
        ) : (
          <>
            {/* DESKTOP: tabla */}
            <table className="hidden w-full text-left text-sm md:table">
              <thead className="sticky top-0 z-10 border-b border-border bg-surface">
                <tr>
                  {[
                    "Fecha",
                    "Tipo",
                    "Ticker",
                    "Empresa",
                    "Precio",
                    "Acciones",
                    "Profit",
                    "Usuario",
                  ].map((h) => (
                    <th
                      key={h}
                      className="px-4 py-3 font-mono text-[11px] uppercase tracking-[0.16em] text-text-muted"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredRows.map((op, i) => (
                  <tr
                    key={`${op.date}-${op.user_id}-${op.ticker}-${i}`}
                    className="border-b border-border transition hover:bg-hover last:border-b-0"
                  >
                    <td className="px-4 py-3 font-mono text-xs text-text-muted">
                      {getEffectiveDate(op) || "—"}
                    </td>
                    <td className="px-4 py-3">
                      <TypeBadge type={op.type} />
                    </td>
                    <td className="px-4 py-3 font-mono text-sm text-text">
                      {op.ticker ?? "—"}
                    </td>
                    <td className="max-w-[220px] px-4 py-3 text-text">
                      <div className="truncate" title={op.company ?? ""}>
                        {op.company ?? "—"}
                      </div>
                      {op.flags?.length ? (
                        <div className="mt-1 text-[11px] text-orange-300">
                          {op.flags.join(" · ")}
                        </div>
                      ) : null}
                    </td>
                    <td className="px-4 py-3 font-mono text-sm text-text-muted">
                      {formatPrice(op)}
                    </td>
                    <td className="px-4 py-3 font-mono text-sm text-text-muted">
                      {op.shares != null ? op.shares : "—"}
                    </td>
                    <td className="px-4 py-3 font-mono text-sm text-yellow-300">
                      {formatProfit(op.profit_pct)}
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-text-muted">
                      {op.user_id ?? "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* MOBILE: tarjetas */}
            <ul className="divide-y divide-border md:hidden">
              {filteredRows.map((op, i) => (
                <li
                  key={`mob-${op.date}-${op.user_id}-${op.ticker}-${i}`}
                  className="px-4 py-4 transition hover:bg-hover"
                >
                  {/* Fila 1: tipo + ticker + fecha */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <TypeBadge type={op.type} />
                      <span className="font-mono text-sm font-semibold text-text">
                        {op.ticker ?? "—"}
                      </span>
                    </div>
                    <span className="font-mono text-xs text-text-muted">
                      {getEffectiveDate(op) || "—"}
                    </span>
                  </div>

                  {/* Fila 2: empresa */}
                  <p className="mt-1.5 text-sm text-text-muted">
                    {op.company ?? "—"}
                  </p>

                  {/* Fila 3: precio · acciones · profit */}
                  <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1">
                    <span className="font-mono text-xs text-text-muted">
                      <span className="opacity-50">precio </span>
                      {formatPrice(op)}
                    </span>
                    <span className="font-mono text-xs text-text-muted">
                      <span className="opacity-50">acc. </span>
                      {op.shares != null ? op.shares : "—"}
                    </span>
                    {op.profit_pct != null && (
                      <span className="font-mono text-xs text-yellow-300">
                        <span className="opacity-50">profit </span>
                        {formatProfit(op.profit_pct)}
                      </span>
                    )}
                  </div>

                  {/* Fila 4: usuario */}
                  <p className="mt-1.5 font-mono text-[11px] text-text-muted opacity-50">
                    {op.user_id ?? "—"}
                  </p>

                  {op.flags?.length ? (
                    <p className="mt-1 text-[11px] text-orange-300">
                      {op.flags.join(" · ")}
                    </p>
                  ) : null}
                </li>
              ))}
            </ul>
          </>
        )}
      </div>
    </div>
  );
}
