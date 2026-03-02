export default function DashboardModal({ open, title, onClose, children }) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="max-h-[85vh] w-full max-w-5xl overflow-hidden rounded-2xl border border-border bg-surface shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-text">
            {title}
          </h3>

          <button
            onClick={onClose}
            className="rounded-lg border border-border px-3 py-1 text-sm text-text transition hover:bg-hover"
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
