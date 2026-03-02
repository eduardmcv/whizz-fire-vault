import { useMemo, useState } from "react";

export default function AssetSummaryTable({ rows = [], onSelectTicker }) {
  const [query, setQuery] = useState("");

  const filteredRows = useMemo(() => {
    const needle = query.trim().toUpperCase();

    if (!needle) return rows;

    return rows.filter((item) => {
      const ticker = (item.ticker ?? "").toUpperCase();
      const company = (item.company ?? "").toUpperCase();

      return ticker.includes(needle) || company.includes(needle);
    });
  }, [rows, query]);

  return (
    <div className="space-y-4">
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Buscar activo"
        className="w-full rounded-lg border border-white/10 bg-[#11151d] px-3 py-2 text-sm text-slate-100 outline-none transition placeholder:text-slate-500 focus:border-emerald-400"
      />

      <div className="overflow-hidden rounded-2xl border border-white/10">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-white/10 bg-[#11151d]">
              <tr>
                <th className="px-4 py-3 font-mono text-[11px] uppercase tracking-[0.16em] text-slate-500">
                  Ticker
                </th>
                <th className="px-4 py-3 font-mono text-[11px] uppercase tracking-[0.16em] text-slate-500">
                  Empresa
                </th>
                <th className="px-4 py-3 font-mono text-[11px] uppercase tracking-[0.16em] text-slate-500">
                  Compradores únicos
                </th>
                <th className="px-4 py-3 font-mono text-[11px] uppercase tracking-[0.16em] text-slate-500">
                  Compras
                </th>
                <th className="px-4 py-3 font-mono text-[11px] uppercase tracking-[0.16em] text-slate-500">
                  Ventas
                </th>
                <th className="px-4 py-3 font-mono text-[11px] uppercase tracking-[0.16em] text-slate-500">
                  Total ops
                </th>
              </tr>
            </thead>

            <tbody>
              {filteredRows.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-4 py-10 text-center text-slate-500"
                  >
                    Sin resultados
                  </td>
                </tr>
              ) : (
                filteredRows.map((item) => (
                  <tr
                    key={item.ticker}
                    className="border-b border-white/10 transition hover:bg-white/5 last:border-b-0"
                  >
                    <td className="px-4 py-3">
                      <button
                        type="button"
                        onClick={() => onSelectTicker?.(item.ticker)}
                        className="font-mono text-sm text-slate-100 transition hover:text-emerald-400"
                      >
                        {item.ticker}
                      </button>
                    </td>

                    <td className="max-w-[260px] px-4 py-3 text-slate-400">
                      <div className="truncate" title={item.company}>
                        {item.company}
                      </div>
                    </td>

                    <td className="px-4 py-3 font-mono text-sm text-emerald-400">
                      {item.uniqueBuyers}
                    </td>

                    <td className="px-4 py-3 font-mono text-sm text-slate-200">
                      {item.buys}
                    </td>

                    <td className="px-4 py-3 font-mono text-sm text-slate-200">
                      {item.sells}
                    </td>

                    <td className="px-4 py-3 font-mono text-sm text-slate-400">
                      {item.totalOps}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
