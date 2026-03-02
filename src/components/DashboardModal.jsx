export default function DashboardModal({ open, title, onClose, children }) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
      onClick={onClose}
    >
      <div
        className="max-h-[85vh] w-full max-w-5xl overflow-hidden rounded-2xl border border-white/10 bg-slate-900 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
          <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-200">
            {title}
          </h3>

          <button
            onClick={onClose}
            className="rounded-lg border border-white/10 px-3 py-1 text-sm text-slate-300 transition hover:bg-white/5"
          >
            Cerrar
          </button>
        </div>

        <div className="max-h-[calc(85vh-73px)] overflow-auto p-5">
          {children}
        </div>
      </div>
    </div>
  );
}
