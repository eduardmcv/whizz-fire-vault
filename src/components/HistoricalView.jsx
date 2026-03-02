import { useMemo, useState } from "react";
import DashboardModal from "./DashboardModal";
import OperationsTable from "./OperationsTable";
import AssetSummaryTable from "./AssetSummaryTable";

// ── Helpers ────────────────────────────────────────────────────────────────

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

function getRankWidth(value, max) {
  return `${Math.max(8, Math.round((value / (max || 1)) * 100))}%`;
}

// ── Sub-components ──────────────────────────────────────────────────────────

function KpiCard({ label, value, sub, tone = "default", onClick }) {
  const valueClass =
    tone === "buy"
      ? "text-emerald-400"
      : tone === "sell"
        ? "text-orange-400"
        : "text-slate-100";

  const El = onClick ? "button" : "div";
  return (
    <El
      type={onClick ? "button" : undefined}
      onClick={onClick}
      className={`rounded-xl border border-border bg-surface p-5 text-left transition ${onClick ? "cursor-pointer hover:bg-hover" : ""}`}
    >
      <div className={`mb-3 font-mono text-5xl font-semibold ${valueClass}`}>
        {value}
      </div>
      <div className="text-[11px] uppercase tracking-[0.18em] text-text">
        {label}
      </div>
      <div className="mt-1 text-xs text-text-muted">{sub}</div>
    </El>
  );
}

function RankPanel({
  title,
  accent = "buy",
  items,
  onItemClick,
  valueFormatter,
}) {
  const accentDot =
    accent === "buy"
      ? "bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.5)]"
      : "bg-orange-400 shadow-[0_0_10px_rgba(251,146,60,0.5)]";
  const max = items[0]?.count ?? 1;

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-surface">
      <div className="flex items-center justify-between border-b border-border px-5 py-4">
        <span className="text-[11px] uppercase tracking-[0.14em] text-text">
          {title}
        </span>
        <span className={`h-2 w-2 rounded-full ${accentDot}`} />
      </div>
      <div>
        {items.length === 0 ? (
          <div className="px-5 py-8 text-sm text-text-muted">Sin datos</div>
        ) : (
          items.map((item, i) => (
            <button
              key={`${item.ticker}-${i}`}
              type="button"
              onClick={() =>
                onItemClick(item.ticker, accent === "buy" ? "buy" : "sell")
              }
              className="grid w-full cursor-pointer grid-cols-[32px_minmax(0,1fr)_110px] items-center gap-4 border-b border-border py-3 pl-2 pr-4 text-left transition hover:bg-hover last:border-b-0"
            >
              <span
                className={`text-right font-mono text-md ${
                  i === 0
                    ? "text-yellow-400"
                    : i === 1
                      ? "text-slate-400"
                      : i === 2
                        ? "text-amber-700"
                        : "text-text-muted"
                }`}
              >
                #{i + 1}
              </span>
              <div className="min-w-0">
                <div className="truncate text-lg text-text">{item.company}</div>
                <div className="truncate font-mono text-sm text-text-muted">
                  {item.ticker}
                </div>
              </div>
              <div className="flex flex-col items-end gap-1">
                <div
                  className={`font-mono text-sm ${accent === "buy" ? "text-emerald-400" : "text-orange-400"}`}
                >
                  {valueFormatter(item)}
                </div>
                <div className="h-1.5 w-24 rounded-full bg-white/5">
                  <div
                    className={`h-1.5 rounded-full ${accent === "buy" ? "bg-emerald-400/70" : "bg-orange-400/70"}`}
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

function ActivityByMonth({ monthKeys, allData, fromMonth, toMonth }) {
  const months = monthKeys.filter((k) => k >= fromMonth && k <= toMonth).sort();

  const entries = months.map((k) => ({
    key: k,
    label: allData[k]?.month_label ?? k,
    buys: allData[k]?.total_buys ?? 0,
    sells: allData[k]?.total_sells ?? 0,
    total: allData[k]?.total_operations ?? 0,
  }));

  const maxTotal = Math.max(...entries.map((e) => e.total), 1);

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-surface">
      <div className="border-b border-border px-5 py-4">
        <span className="text-[11px] uppercase tracking-[0.14em] text-text">
          Actividad por mes
        </span>
      </div>
      <div className="divide-y divide-border">
        {entries.length === 0 ? (
          <div className="px-5 py-8 text-sm text-text-muted">Sin datos</div>
        ) : (
          entries.map((e) => (
            <div
              key={e.key}
              className="grid grid-cols-[minmax(120px,1fr)_auto] items-center gap-4 px-5 py-3"
            >
              <div>
                <div className="mb-1.5 text-sm text-text">{e.label}</div>
                <div
                  className="flex gap-1 overflow-hidden rounded-full"
                  style={{ height: "6px" }}
                >
                  <div
                    className="bg-emerald-400/70 rounded-l-full"
                    style={{
                      width: `${Math.round((e.buys / maxTotal) * 100)}%`,
                    }}
                  />
                  <div
                    className="bg-orange-400/70 rounded-r-full"
                    style={{
                      width: `${Math.round((e.sells / maxTotal) * 100)}%`,
                    }}
                  />
                </div>
              </div>
              <div className="text-right">
                <div className="font-mono text-sm text-text">{e.total} ops</div>
                <div className="font-mono text-xs text-text-muted">
                  <span className="text-emerald-400">{e.buys}↑</span>
                  {" · "}
                  <span className="text-orange-400">{e.sells}↓</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

// ── Main component ──────────────────────────────────────────────────────────

export default function HistoricalView({ allData, monthKeys }) {
  const sortedKeys = [...monthKeys].sort();
  const firstMonth = sortedKeys[0] ?? "";
  const lastMonth = sortedKeys[sortedKeys.length - 1] ?? "";

  const [fromMonth, setFromMonth] = useState(firstMonth);
  const [toMonth, setToMonth] = useState(lastMonth);
  const [modal, setModal] = useState({
    open: false,
    mode: null,
    ticker: null,
    side: null,
  });

  // Aggregate operations within range
  const ops = useMemo(() => {
    return monthKeys
      .filter((k) => k >= fromMonth && k <= toMonth)
      .flatMap((k) => allData[k]?.operations ?? []);
  }, [allData, monthKeys, fromMonth, toMonth]);

  const buys = useMemo(() => ops.filter((o) => o.type === "buy"), [ops]);
  const sells = useMemo(() => ops.filter((o) => o.type === "sell"), [ops]);
  const uniqueAssets = useMemo(
    () => new Set(ops.map((o) => o.ticker).filter(Boolean)).size,
    [ops],
  );
  const uniqueInvestors = useMemo(
    () => new Set(ops.map((o) => o.user_id).filter(Boolean)).size,
    [ops],
  );

  const buyStats = useMemo(() => buildTickerStats(ops, "buy"), [ops]);
  const sellStats = useMemo(() => buildTickerStats(ops, "sell"), [ops]);
  const assetSummary = useMemo(() => buildAssetSummary(ops), [ops]);

  const topBuys = useMemo(() => buyStats.slice(0, 10), [buyStats]);
  const topSells = useMemo(() => sellStats.slice(0, 10), [sellStats]);
  const topAssetsByBuyers = useMemo(
    () => assetSummary.slice(0, 8),
    [assetSummary],
  );

  const topProfitAssets = useMemo(() => {
    return sellStats
      .map((item) => {
        const avgProfit = item.profits.length
          ? item.profits.reduce((a, b) => a + b, 0) / item.profits.length
          : null;
        return { ...item, avgProfit };
      })
      .filter((item) => item.avgProfit != null)
      .sort((a, b) => b.avgProfit - a.avgProfit)
      .slice(0, 8);
  }, [sellStats]);

  const filteredTickerOps = useMemo(() => {
    if (!modal.ticker || !modal.side) return [];
    return ops.filter(
      (op) => op.ticker === modal.ticker && op.type === modal.side,
    );
  }, [ops, modal.ticker, modal.side]);

  const selectedAssetSummary = useMemo(() => {
    if (!modal.ticker) return null;
    return assetSummary.find((item) => item.ticker === modal.ticker) ?? null;
  }, [assetSummary, modal.ticker]);

  function openModal(next) {
    setModal({
      open: true,
      mode: next.mode,
      ticker: next.ticker ?? null,
      side: next.side ?? null,
    });
  }
  function closeModal() {
    setModal({ open: false, mode: null, ticker: null, side: null });
  }

  const modalTitle = useMemo(() => {
    if (!modal.open) return "";
    if (modal.mode === "all-ops") return "Todas las operaciones";
    if (modal.mode === "buy-ops") return "Todas las compras";
    if (modal.mode === "sell-ops") return "Todas las ventas";
    if (modal.mode === "assets") return "Todos los activos";
    if (modal.mode === "ticker-ops" && modal.ticker)
      return `${modal.ticker} · ${modal.side === "buy" ? "Compras" : "Ventas"}`;
    if (modal.mode === "asset-all" && modal.ticker)
      return `${modal.ticker} · Resumen del activo`;
    return "";
  }, [modal]);

  const buyPct = ops.length ? Math.round((buys.length / ops.length) * 100) : 0;
  const sellPct = ops.length
    ? Math.round((sells.length / ops.length) * 100)
    : 0;

  const activeMonthCount = monthKeys.filter(
    (k) => k >= fromMonth && k <= toMonth,
  ).length;

  return (
    <div className="flex flex-col gap-8">
      {/* ── Range filter ── */}
      <div className="flex flex-wrap items-center gap-3 rounded-xl border border-border bg-surface px-4 py-3">
        <span className="font-mono text-xs uppercase tracking-[0.14em] text-text-muted">
          Rango
        </span>
        <select
          value={fromMonth}
          onChange={(e) => {
            const val = e.target.value;
            setFromMonth(val);
            if (val > toMonth) setToMonth(val);
          }}
          className="rounded-lg border border-border bg-surface px-3 py-1.5 text-sm text-text outline-none transition focus:border-emerald-400"
        >
          {sortedKeys.map((k) => (
            <option key={k} value={k}>
              {allData[k]?.month_label ?? k}
            </option>
          ))}
        </select>
        <span className="text-text-muted">→</span>
        <select
          value={toMonth}
          onChange={(e) => {
            const val = e.target.value;
            setToMonth(val);
            if (val < fromMonth) setFromMonth(val);
          }}
          className="rounded-lg border border-border bg-surface px-3 py-1.5 text-sm text-text outline-none transition focus:border-emerald-400"
        >
          {sortedKeys.map((k) => (
            <option key={k} value={k}>
              {allData[k]?.month_label ?? k}
            </option>
          ))}
        </select>
        <span className="ml-auto font-mono text-xs text-text-muted">
          {activeMonthCount} {activeMonthCount === 1 ? "mes" : "meses"} ·{" "}
          {ops.length} operaciones
        </span>
      </div>

      {/* ── KPIs ── */}
      <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          label="Operaciones totales"
          value={ops.length}
          sub={`${activeMonthCount} meses agregados`}
          onClick={() => openModal({ mode: "all-ops" })}
        />
        <KpiCard
          label="Compras"
          value={buys.length}
          sub={`${buyPct}% del total`}
          tone="buy"
          onClick={() => openModal({ mode: "buy-ops" })}
        />
        <KpiCard
          label="Ventas"
          value={sells.length}
          sub={`${sellPct}% del total`}
          tone="sell"
          onClick={() => openModal({ mode: "sell-ops" })}
        />
        <KpiCard
          label="Activos únicos"
          value={uniqueAssets}
          sub={`${uniqueInvestors} inversores únicos`}
          onClick={() => openModal({ mode: "assets" })}
        />
      </section>

      {/* ── Rank panels ── */}
      <section>
        <div className="mb-4">
          <h2 className="font-mono text-xs uppercase tracking-[0.18em] text-text-muted">
            Ranking acumulado
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

      {/* ── Secondary panels ── */}
      <section className="grid grid-cols-1 gap-5 xl:grid-cols-3">
        {/* Actividad por mes */}
        <ActivityByMonth
          monthKeys={monthKeys}
          allData={allData}
          fromMonth={fromMonth}
          toMonth={toMonth}
        />

        {/* Compradores únicos */}
        <div className="overflow-hidden rounded-2xl border border-border bg-surface">
          <div className="flex items-center justify-between border-b border-border px-5 py-4">
            <span className="text-[11px] uppercase tracking-[0.14em] text-text">
              Más compradores únicos
            </span>
            <button
              type="button"
              onClick={() => openModal({ mode: "assets" })}
              className="text-xs text-text-muted transition hover:text-text"
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
                className="grid w-full cursor-pointer grid-cols-[minmax(0,1fr)_90px_80px] items-center gap-3 border-b border-border px-5 py-3 text-left transition hover:bg-hover last:border-b-0"
              >
                <div className="min-w-0">
                  <div className="truncate text-sm text-text">
                    {item.company}
                  </div>
                  <div className="truncate font-mono text-xs text-text-muted">
                    {item.ticker}
                  </div>
                </div>
                <div className="text-right font-mono text-sm text-emerald-400">
                  {item.uniqueBuyers} inv.
                </div>
                <div className="text-right text-xs text-text-muted">
                  {item.buys} compras
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Profit informado */}
        <div className="overflow-hidden rounded-2xl border border-border bg-surface">
          <div className="flex items-center justify-between border-b border-border px-5 py-4">
            <span className="text-[11px] uppercase tracking-[0.14em] text-text-muted">
              Ventas con profit informado
            </span>
            <span className="h-2 w-2 rounded-full bg-yellow-400 shadow-[0_0_10px_rgba(250,204,21,0.5)]" />
          </div>
          <div>
            {topProfitAssets.length === 0 ? (
              <div className="px-5 py-8 text-sm text-text-muted">Sin datos</div>
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
                  className="grid w-full cursor-pointer grid-cols-[minmax(0,1fr)_100px] items-center gap-3 border-b border-border px-5 py-3 text-left transition hover:bg-hover last:border-b-0"
                >
                  <div className="min-w-0">
                    <div className="truncate text-sm text-text">
                      {item.company}
                    </div>
                    <div className="truncate font-mono text-xs text-text-muted">
                      {item.ticker}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-mono text-sm text-yellow-400">
                      +{item.avgProfit.toFixed(1)}%
                    </div>
                    <div className="text-xs text-text-muted">
                      {item.profits.length} ventas
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      </section>

      {/* ── Modal ── */}
      <DashboardModal open={modal.open} title={modalTitle} onClose={closeModal}>
        {modal.mode === "all-ops" && <OperationsTable rows={ops} compact />}
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
            {selectedAssetSummary && (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {[
                  {
                    label: "Ticker",
                    value: selectedAssetSummary.ticker,
                    color: "text-text",
                  },
                  {
                    label: "Compradores únicos",
                    value: selectedAssetSummary.uniqueBuyers,
                    color: "text-emerald-400",
                  },
                  {
                    label: "Compras",
                    value: selectedAssetSummary.buys,
                    color: "text-text",
                  },
                  {
                    label: "Ventas",
                    value: selectedAssetSummary.sells,
                    color: "text-text",
                  },
                ].map(({ label, value, color }) => (
                  <div
                    key={label}
                    className="rounded-xl border border-border bg-surface p-4"
                  >
                    <div className="text-[11px] uppercase tracking-[0.16em] text-text-muted">
                      {label}
                    </div>
                    <div className={`mt-2 font-mono text-xl ${color}`}>
                      {value}
                    </div>
                  </div>
                ))}
              </div>
            )}
            <OperationsTable
              rows={ops.filter((op) => op.ticker === modal.ticker)}
              compact
            />
          </div>
        )}
      </DashboardModal>
    </div>
  );
}
