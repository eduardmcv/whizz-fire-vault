import { useMemo, useState } from "react";

export default function AssetSummaryTable({ rows = [], onSelectTicker }) {
  const [query, setQuery] = useState("");

  const filteredRows = useMemo(() => {
    const needle = query.trim().toUpperCase();
    if (!needle) return rows;
    return rows.filter(
      (item) =>
        (item.ticker ?? "").toUpperCase().includes(needle) ||
        (item.company ?? "").toUpperCase().includes(needle),
    );
  }, [rows, query]);

  return (
    <div className="space-y-4">
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Buscar activo"
        className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text outline-none transition placeholder:text-text-muted focus:border-emerald-400"
      />

      <div className="overflow-hidden rounded-2xl border border-border">
        {/* DESKTOP: tabla */}
        <table className="hidden w-full text-left text-sm md:table">
          <thead className="border-b border-border bg-surface">
            <tr>
              {[
                "Ticker",
                "Empresa",
                "Compradores únicos",
                "Compras",
                "Ventas",
                "Total ops",
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
            {filteredRows.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  className="px-4 py-10 text-center text-sm text-text-muted"
                >
                  Sin resultados
                </td>
              </tr>
            ) : (
              filteredRows.map((item) => (
                <tr
                  key={item.ticker}
                  className="border-b border-border transition hover:bg-white/5 last:border-b-0"
                >
                  <td className="px-4 py-3">
                    <button
                      type="button"
                      onClick={() => onSelectTicker?.(item.ticker)}
                      className="font-mono text-sm text-text transition hover:text-emerald-400"
                    >
                      {item.ticker}
                    </button>
                  </td>
                  <td className="max-w-[260px] px-4 py-3 text-text">
                    <div className="truncate" title={item.company}>
                      {item.company}
                    </div>
                  </td>
                  <td className="px-4 py-3 font-mono text-sm text-emerald-400">
                    {item.uniqueBuyers}
                  </td>
                  <td className="px-4 py-3 font-mono text-sm text-text">
                    {item.buys}
                  </td>
                  <td className="px-4 py-3 font-mono text-sm text-text">
                    {item.sells}
                  </td>
                  <td className="px-4 py-3 font-mono text-sm text-text">
                    {item.totalOps}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* MOBILE: tarjetas */}
        <ul className="divide-y divide-border md:hidden">
          {filteredRows.length === 0 ? (
            <li className="px-4 py-10 text-center text-sm text-text-muted">
              Sin resultados
            </li>
          ) : (
            filteredRows.map((item) => (
              <li
                key={`mob-${item.ticker}`}
                className="px-4 py-4 transition hover:bg-white/5"
              >
                {/* Fila 1: ticker (clickable) + empresa */}
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <button
                      type="button"
                      onClick={() => onSelectTicker?.(item.ticker)}
                      className="font-mono text-sm font-semibold text-text transition hover:text-emerald-400"
                    >
                      {item.ticker}
                    </button>
                    <p className="mt-0.5 text-sm text-text-muted">
                      {item.company}
                    </p>
                  </div>
                  {/* Compradores únicos destacado */}
                  <div className="text-right">
                    <span className="font-mono text-lg font-semibold text-emerald-400">
                      {item.uniqueBuyers}
                    </span>
                    <p className="text-[11px] text-text-muted opacity-60">
                      compradores
                    </p>
                  </div>
                </div>

                {/* Fila 2: compras · ventas · total */}
                <div className="mt-2 flex gap-4">
                  <span className="font-mono text-xs text-text-muted">
                    <span className="opacity-50">compras </span>
                    <span className="text-text">{item.buys}</span>
                  </span>
                  <span className="font-mono text-xs text-text-muted">
                    <span className="opacity-50">ventas </span>
                    <span className="text-text">{item.sells}</span>
                  </span>
                  <span className="font-mono text-xs text-text-muted">
                    <span className="opacity-50">total </span>
                    <span className="text-text">{item.totalOps}</span>
                  </span>
                </div>
              </li>
            ))
          )}
        </ul>
      </div>
    </div>
  );
}
