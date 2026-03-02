import { useMemo, useState } from "react";
import monthDataFile from "./data/2026-02.json";
import DashboardModal from "./components/DashboardModal";
import OperationsTable from "./components/OperationsTable";
import AssetSummaryTable from "./components/AssetSummaryTable";

const DATA = {
  [monthDataFile.month]: monthDataFile,
};

const MONTH_KEYS = Object.keys(DATA).sort().reverse();

function getEffectiveDate(op) {
  return op.trade_date ?? op.date ?? "";
}

function sortByNewest(a, b) {
  const aDate = getEffectiveDate(a);
  const bDate = getEffectiveDate(b);

  if (aDate !== bDate) return bDate.localeCompare(aDate);
  return (b.date ?? "").localeCompare(a.date ?? "");
}

function buildTickerStats(operations, type) {
  const filtered = type
    ? operations.filter((op) => op.type === type && op.ticker)
    : operations.filter((op) => op.ticker);

  const map = new Map();

  filtered.forEach((op) => {
    if (!map.has(op.ticker)) {
      map.set(op.ticker, {
        ticker: op.ticker,
        company: op.company ?? op.ticker,
        count: 0,
        buyers: new Set(),
        sellers: new Set(),
        profits: [],
      });
    }

    const item = map.get(op.ticker);
    item.count += 1;

    if (op.type === "buy") item.buyers.add(op.user_id);
    if (op.type === "sell") item.sellers.add(op.user_id);
    if (op.profit_pct != null) item.profits.push(op.profit_pct);
  });

  return [...map.values()].sort((a, b) => {
    if (b.count !== a.count) return b.count - a.count;
    return a.ticker.localeCompare(b.ticker);
  });
}

function buildAssetSummary(operations) {
  const map = new Map();

  operations.forEach((op) => {
    if (!op.ticker) return;

    if (!map.has(op.ticker)) {
      map.set(op.ticker, {
        ticker: op.ticker,
        company: op.company ?? op.ticker,
        buyers: new Set(),
        sellers: new Set(),
        buys: 0,
        sells: 0,
        totalOps: 0,
      });
    }

    const item = map.get(op.ticker);

    item.totalOps += 1;

    if (op.type === "buy") {
      item.buys += 1;
      item.buyers.add(op.user_id);
    }

    if (op.type === "sell") {
      item.sells += 1;
      item.sellers.add(op.user_id);
    }
  });

  return [...map.values()]
    .map((item) => ({
      ...item,
      uniqueBuyers: item.buyers.size,
      uniqueSellers: item.sellers.size,
    }))
    .sort((a, b) => {
      if (b.uniqueBuyers !== a.uniqueBuyers)
        return b.uniqueBuyers - a.uniqueBuyers;
      if (b.totalOps !== a.totalOps) return b.totalOps - a.totalOps;
      return a.ticker.localeCompare(b.ticker);
    });
}

function formatCoverage(coverage) {
  if (!coverage?.from || !coverage?.to) return null;
  return `${coverage.from} → ${coverage.to}`;
}

function getRankWidth(value, max) {
  const safeMax = max || 1;
  const pct = Math.round((value / safeMax) * 100);
  return `${Math.max(10, pct)}%`;
}

function KpiButton({ label, value, sub, tone = "default", onClick }) {
  const valueClass =
    tone === "buy"
      ? "text-emerald-400"
      : tone === "sell"
        ? "text-orange-400"
        : "text-slate-100";

  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-xl border border-white/10 bg-[#161920] p-5 text-left transition hover:border-white/20 hover:bg-[#1b1f28]"
    >
      <div className="text-[11px] uppercase tracking-[0.18em] text-slate-500">
        {label}
      </div>
      <div className={`mt-2 font-mono text-3xl font-semibold ${valueClass}`}>
        {value}
      </div>
      <div className="mt-1 text-xs text-slate-500">{sub}</div>
    </button>
  );
}

function RankPanel({
  title,
  accent = "buy",
  items,
  onItemClick,
  valueFormatter,
}) {
  const accentClass =
    accent === "buy"
      ? "bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.5)]"
      : "bg-orange-400 shadow-[0_0_10px_rgba(251,146,60,0.5)]";

  const max = items[0]?.count ?? 1;

  return (
    <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#161920]">
      <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
        <span className="text-[11px] uppercase tracking-[0.14em] text-slate-500">
          {title}
        </span>
        <span className={`h-2 w-2 rounded-full ${accentClass}`} />
      </div>

      <div>
        {items.length === 0 ? (
          <div className="px-5 py-8 text-sm text-slate-500">Sin datos</div>
        ) : (
          items.map((item, index) => (
            <button
              key={`${item.ticker}-${index}`}
              type="button"
              onClick={() =>
                onItemClick(item.ticker, accent === "buy" ? "buy" : "sell")
              }
              className="grid w-full grid-cols-[32px_minmax(0,1fr)_110px] items-center gap-3 border-b border-white/10 px-5 py-3 text-left transition hover:bg-white/5 last:border-b-0"
            >
              <span
                className={`text-right font-mono text-xs ${
                  index === 0
                    ? "text-yellow-400"
                    : index === 1
                      ? "text-slate-400"
                      : index === 2
                        ? "text-amber-700"
                        : "text-slate-500"
                }`}
              >
                #{index + 1}
              </span>

              <div className="min-w-0">
                <div className="truncate font-mono text-sm text-slate-100">
                  {item.ticker}
                </div>
                <div className="truncate text-xs text-slate-500">
                  {item.company}
                </div>
              </div>

              <div className="flex flex-col items-end gap-1">
                <div
                  className={`font-mono text-sm ${
                    accent === "buy" ? "text-emerald-400" : "text-orange-400"
                  }`}
                >
                  {valueFormatter(item)}
                </div>
                <div className="h-1.5 w-24 rounded-full bg-white/5">
                  <div
                    className={`h-1.5 rounded-full ${
                      accent === "buy"
                        ? "bg-emerald-400/70"
                        : "bg-orange-400/70"
                    }`}
                    style={{ width: getRankWidth(item.count, max) }}
                  />
                </div>
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  );
}

export default function App() {
  const [currentMonth, setCurrentMonth] = useState(MONTH_KEYS[0] ?? "");
  const [modal, setModal] = useState({
    open: false,
    mode: null,
    side: null,
    ticker: null,
  });

  const monthData = DATA[currentMonth];
  const allOps = useMemo(
    () => [...(monthData?.operations ?? [])].sort(sortByNewest),
    [monthData],
  );
  const allOrders = monthData?.orders ?? [];
  const allUnresolved = monthData?.unresolved_messages ?? [];

  const buys = useMemo(
    () => allOps.filter((op) => op.type === "buy"),
    [allOps],
  );
  const sells = useMemo(
    () => allOps.filter((op) => op.type === "sell"),
    [allOps],
  );

  const uniqueAssets = useMemo(
    () => new Set(allOps.map((op) => op.ticker).filter(Boolean)).size,
    [allOps],
  );

  const uniqueInvestors = useMemo(
    () => new Set(allOps.map((op) => op.user_id).filter(Boolean)).size,
    [allOps],
  );

  const buyStats = useMemo(() => buildTickerStats(allOps, "buy"), [allOps]);
  const sellStats = useMemo(() => buildTickerStats(allOps, "sell"), [allOps]);
  const assetSummary = useMemo(() => buildAssetSummary(allOps), [allOps]);

  const topBuys = useMemo(() => buyStats.slice(0, 10), [buyStats]);
  const topSells = useMemo(() => sellStats.slice(0, 10), [sellStats]);

  const topAssetsByBuyers = useMemo(
    () => assetSummary.slice(0, 8),
    [assetSummary],
  );

  const topProfitAssets = useMemo(() => {
    const items = sellStats
      .map((item) => {
        const avgProfit = item.profits.length
          ? item.profits.reduce((acc, value) => acc + value, 0) /
            item.profits.length
          : null;

        return {
          ...item,
          avgProfit,
        };
      })
      .filter((item) => item.avgProfit != null)
      .sort((a, b) => b.avgProfit - a.avgProfit);

    return items.slice(0, 8);
  }, [sellStats]);

  const buyPct = monthData?.total_operations
    ? Math.round((monthData.total_buys / monthData.total_operations) * 100)
    : 0;

  const sellPct = monthData?.total_operations
    ? Math.round((monthData.total_sells / monthData.total_operations) * 100)
    : 0;

  function openModal(next) {
    setModal({
      open: true,
      mode: next.mode,
      side: next.side ?? null,
      ticker: next.ticker ?? null,
    });
  }

  function closeModal() {
    setModal({
      open: false,
      mode: null,
      side: null,
      ticker: null,
    });
  }

  const filteredTickerOps = useMemo(() => {
    if (!modal.ticker || !modal.side) return [];
    return allOps.filter(
      (op) => op.ticker === modal.ticker && op.type === modal.side,
    );
  }, [allOps, modal.ticker, modal.side]);

  const selectedAssetSummary = useMemo(() => {
    if (!modal.ticker) return null;
    return assetSummary.find((item) => item.ticker === modal.ticker) ?? null;
  }, [assetSummary, modal.ticker]);

  const modalTitle = useMemo(() => {
    if (!modal.open) return "";

    if (modal.mode === "all-ops") return "Todas las operaciones";
    if (modal.mode === "buy-ops") return "Todas las compras";
    if (modal.mode === "sell-ops") return "Todas las ventas";
    if (modal.mode === "assets") return "Todos los activos";
    if (modal.mode === "orders") return "Órdenes";
    if (modal.mode === "unresolved") return "Mensajes sin resolver";

    if (modal.mode === "ticker-ops" && modal.ticker && modal.side) {
      return `${modal.ticker} · ${modal.side === "buy" ? "Compras" : "Ventas"}`;
    }

    if (modal.mode === "asset-all" && modal.ticker) {
      return `${modal.ticker} · Resumen del activo`;
    }

    return "";
  }, [modal]);

  if (!monthData) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0d0f14] px-6 text-slate-400">
        No hay datos cargados
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0d0f14] text-slate-100">
      <header className="border-b border-white/10">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-5 md:flex-row md:items-center md:justify-between md:px-6">
          <div>
            <div className="flex items-center gap-3">
              <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.6)]" />
              <span className="font-mono text-xs uppercase tracking-[0.16em] text-slate-500">
                Operaciones · Dashboard
              </span>
            </div>

            <div className="mt-2 text-sm text-slate-400">
              {monthData.month_label}
              {formatCoverage(monthData.coverage) ? (
                <span className="ml-2 text-slate-500">
                  · Cobertura: {formatCoverage(monthData.coverage)}
                </span>
              ) : null}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <label
              htmlFor="monthSelect"
              className="font-mono text-xs uppercase tracking-[0.16em] text-slate-500"
            >
              Mes
            </label>

            <select
              id="monthSelect"
              value={currentMonth}
              onChange={(e) => setCurrentMonth(e.target.value)}
              className="rounded-lg border border-white/10 bg-[#161920] px-3 py-2 text-sm text-slate-100 outline-none transition focus:border-emerald-400"
            >
              {MONTH_KEYS.map((monthKey) => (
                <option key={monthKey} value={monthKey}>
                  {DATA[monthKey].month_label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </header>

      <main className="mx-auto flex max-w-7xl flex-col gap-8 px-4 py-6 md:px-6">
        <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <KpiButton
            label="Operaciones totales"
            value={monthData.total_operations}
            sub={`${uniqueInvestors} inversores únicos`}
            onClick={() => openModal({ mode: "all-ops" })}
          />

          <KpiButton
            label="Compras"
            value={monthData.total_buys}
            sub={`${buyPct}% del total`}
            tone="buy"
            onClick={() => openModal({ mode: "buy-ops" })}
          />

          <KpiButton
            label="Ventas"
            value={monthData.total_sells}
            sub={`${sellPct}% del total`}
            tone="sell"
            onClick={() => openModal({ mode: "sell-ops" })}
          />

          <KpiButton
            label="Activos únicos"
            value={uniqueAssets}
            sub={`${allOrders.length} órdenes · ${allUnresolved.length} sin resolver`}
            onClick={() => openModal({ mode: "assets" })}
          />
        </section>

        <section>
          <div className="mb-4 flex items-center gap-3">
            <h2 className="font-mono text-xs uppercase tracking-[0.18em] text-slate-400">
              Ranking principal
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
            <RankPanel
              title="Más comprados · operaciones"
              accent="buy"
              items={topBuys}
              onItemClick={(ticker, side) =>
                openModal({ mode: "ticker-ops", ticker, side })
              }
              valueFormatter={(item) => `${item.count} ops`}
            />

            <RankPanel
              title="Más vendidos · operaciones"
              accent="sell"
              items={topSells}
              onItemClick={(ticker, side) =>
                openModal({ mode: "ticker-ops", ticker, side })
              }
              valueFormatter={(item) => `${item.count} ops`}
            />
          </div>
        </section>

        <section className="grid grid-cols-1 gap-5 xl:grid-cols-2">
          <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#161920]">
            <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
              <span className="text-[11px] uppercase tracking-[0.14em] text-slate-500">
                Activos con más compradores únicos
              </span>

              <button
                type="button"
                onClick={() => openModal({ mode: "assets" })}
                className="text-xs text-slate-400 transition hover:text-slate-200"
              >
                Ver todos
              </button>
            </div>

            <div>
              {topAssetsByBuyers.map((item) => (
                <button
                  key={item.ticker}
                  type="button"
                  onClick={() =>
                    openModal({ mode: "asset-all", ticker: item.ticker })
                  }
                  className="grid w-full grid-cols-[minmax(0,1fr)_90px_90px] items-center gap-3 border-b border-white/10 px-5 py-3 text-left transition hover:bg-white/5 last:border-b-0"
                >
                  <div className="min-w-0">
                    <div className="truncate font-mono text-sm text-slate-100">
                      {item.ticker}
                    </div>
                    <div className="truncate text-xs text-slate-500">
                      {item.company}
                    </div>
                  </div>

                  <div className="text-right font-mono text-sm text-emerald-400">
                    {item.uniqueBuyers} inv.
                  </div>

                  <div className="text-right text-xs text-slate-500">
                    {item.buys} compras
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#161920]">
            <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
              <span className="text-[11px] uppercase tracking-[0.14em] text-slate-500">
                Ventas con profit informado
              </span>
              <span className="h-2 w-2 rounded-full bg-yellow-400 shadow-[0_0_10px_rgba(250,204,21,0.5)]" />
            </div>

            <div>
              {topProfitAssets.length === 0 ? (
                <div className="px-5 py-8 text-sm text-slate-500">
                  Sin datos
                </div>
              ) : (
                topProfitAssets.map((item) => (
                  <button
                    key={item.ticker}
                    type="button"
                    onClick={() =>
                      openModal({
                        mode: "ticker-ops",
                        ticker: item.ticker,
                        side: "sell",
                      })
                    }
                    className="grid w-full grid-cols-[minmax(0,1fr)_100px] items-center gap-3 border-b border-white/10 px-5 py-3 text-left transition hover:bg-white/5 last:border-b-0"
                  >
                    <div className="min-w-0">
                      <div className="truncate font-mono text-sm text-slate-100">
                        {item.ticker}
                      </div>
                      <div className="truncate text-xs text-slate-500">
                        {item.company}
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="font-mono text-sm text-yellow-400">
                        +{item.avgProfit.toFixed(1)}%
                      </div>
                      <div className="text-xs text-slate-500">
                        {item.profits.length} ventas
                      </div>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>
        </section>

        <section>
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="font-mono text-xs uppercase tracking-[0.18em] text-slate-400">
              Explorador de operaciones
            </h2>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => openModal({ mode: "orders" })}
                className="rounded-lg border border-white/10 bg-[#161920] px-3 py-1.5 text-xs text-slate-300 transition hover:bg-[#1b1f28]"
              >
                Órdenes ({allOrders.length})
              </button>

              <button
                type="button"
                onClick={() => openModal({ mode: "unresolved" })}
                className="rounded-lg border border-white/10 bg-[#161920] px-3 py-1.5 text-xs text-slate-300 transition hover:bg-[#1b1f28]"
              >
                Sin resolver ({allUnresolved.length})
              </button>
            </div>
          </div>

          <OperationsTable rows={allOps} />
        </section>
      </main>

      <DashboardModal open={modal.open} title={modalTitle} onClose={closeModal}>
        {modal.mode === "all-ops" && <OperationsTable rows={allOps} compact />}

        {modal.mode === "buy-ops" && <OperationsTable rows={buys} compact />}

        {modal.mode === "sell-ops" && <OperationsTable rows={sells} compact />}

        {modal.mode === "assets" && (
          <AssetSummaryTable
            rows={assetSummary}
            onSelectTicker={(ticker) =>
              openModal({ mode: "asset-all", ticker })
            }
          />
        )}

        {modal.mode === "ticker-ops" && (
          <OperationsTable rows={filteredTickerOps} compact />
        )}

        {modal.mode === "asset-all" && (
          <div className="space-y-4">
            {selectedAssetSummary ? (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-4">
                <div className="rounded-xl border border-white/10 bg-[#11151d] p-4">
                  <div className="text-[11px] uppercase tracking-[0.16em] text-slate-500">
                    Ticker
                  </div>
                  <div className="mt-2 font-mono text-xl text-slate-100">
                    {selectedAssetSummary.ticker}
                  </div>
                </div>

                <div className="rounded-xl border border-white/10 bg-[#11151d] p-4">
                  <div className="text-[11px] uppercase tracking-[0.16em] text-slate-500">
                    Compradores únicos
                  </div>
                  <div className="mt-2 font-mono text-xl text-emerald-400">
                    {selectedAssetSummary.uniqueBuyers}
                  </div>
                </div>

                <div className="rounded-xl border border-white/10 bg-[#11151d] p-4">
                  <div className="text-[11px] uppercase tracking-[0.16em] text-slate-500">
                    Compras
                  </div>
                  <div className="mt-2 font-mono text-xl text-slate-100">
                    {selectedAssetSummary.buys}
                  </div>
                </div>

                <div className="rounded-xl border border-white/10 bg-[#11151d] p-4">
                  <div className="text-[11px] uppercase tracking-[0.16em] text-slate-500">
                    Ventas
                  </div>
                  <div className="mt-2 font-mono text-xl text-slate-100">
                    {selectedAssetSummary.sells}
                  </div>
                </div>
              </div>
            ) : null}

            <OperationsTable
              rows={allOps.filter((op) => op.ticker === modal.ticker)}
              compact
            />
          </div>
        )}

        {modal.mode === "orders" && (
          <div className="overflow-hidden rounded-2xl border border-white/10">
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead className="border-b border-white/10 bg-[#11151d]">
                  <tr>
                    <th className="px-4 py-3 font-mono text-[11px] uppercase tracking-[0.16em] text-slate-500">
                      Fecha
                    </th>
                    <th className="px-4 py-3 font-mono text-[11px] uppercase tracking-[0.16em] text-slate-500">
                      Lado
                    </th>
                    <th className="px-4 py-3 font-mono text-[11px] uppercase tracking-[0.16em] text-slate-500">
                      Ticker
                    </th>
                    <th className="px-4 py-3 font-mono text-[11px] uppercase tracking-[0.16em] text-slate-500">
                      Empresa
                    </th>
                    <th className="px-4 py-3 font-mono text-[11px] uppercase tracking-[0.16em] text-slate-500">
                      Precio
                    </th>
                    <th className="px-4 py-3 font-mono text-[11px] uppercase tracking-[0.16em] text-slate-500">
                      Usuario
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {allOrders.length === 0 ? (
                    <tr>
                      <td
                        colSpan={6}
                        className="px-4 py-8 text-center text-slate-500"
                      >
                        Sin órdenes
                      </td>
                    </tr>
                  ) : (
                    allOrders.map((order, index) => (
                      <tr
                        key={`${order.date}-${order.user_id}-${order.ticker}-${index}`}
                        className="border-b border-white/10 last:border-b-0"
                      >
                        <td className="px-4 py-3 font-mono text-xs text-slate-400">
                          {order.date}
                        </td>
                        <td className="px-4 py-3 font-mono text-xs text-orange-400">
                          {order.side?.toUpperCase() ?? "—"}
                        </td>
                        <td className="px-4 py-3 font-mono text-sm text-slate-100">
                          {order.ticker ?? "—"}
                        </td>
                        <td className="px-4 py-3 text-slate-400">
                          {order.company ?? "—"}
                        </td>
                        <td className="px-4 py-3 font-mono text-sm text-slate-200">
                          {order.price != null
                            ? `${order.price}${order.currency ? ` ${order.currency}` : ""}`
                            : "—"}
                        </td>
                        <td className="px-4 py-3 font-mono text-xs text-slate-500">
                          {order.user_id ?? "—"}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {modal.mode === "unresolved" && (
          <div className="space-y-3">
            {allUnresolved.length === 0 ? (
              <div className="rounded-xl border border-white/10 bg-[#11151d] p-6 text-sm text-slate-500">
                Sin mensajes pendientes
              </div>
            ) : (
              allUnresolved.map((item, index) => (
                <div
                  key={`${item.date}-${item.user_id}-${index}`}
                  className="rounded-xl border border-white/10 bg-[#11151d] p-4"
                >
                  <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                    <span className="font-mono">{item.date}</span>
                    <span>·</span>
                    <span className="font-mono">{item.user_id}</span>
                  </div>

                  <div className="mt-3 text-sm text-slate-200">
                    {item.source_text}
                  </div>
                  <div className="mt-2 text-xs text-orange-300">
                    {item.reason}
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </DashboardModal>
    </div>
  );
}
