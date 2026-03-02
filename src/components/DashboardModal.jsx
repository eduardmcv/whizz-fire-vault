export default function DashboardModal({ open, title, onClose, children }) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 backdrop-blur-sm sm:items-center sm:p-4"
      onClick={onClose}
    >
      <div
        className="flex max-h-[92dvh] w-full flex-col overflow-hidden rounded-t-2xl border border-border bg-surface shadow-2xl sm:max-h-[85vh] sm:max-w-5xl sm:rounded-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex flex-shrink-0 items-center justify-between border-b border-border px-4 py-4 sm:px-5">
          <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-text">
            {title}
          </h3>
          <button
            onClick={onClose}
            className="rounded-lg border border-border px-3 py-1.5 text-sm text-text transition hover:bg-hover active:scale-95"
          >
            Cerrar
          </button>
        </div>

        {/* Scrollable body */}
        <div className="min-h-0 flex-1 overflow-y-auto p-4 sm:p-5">
          {children}
        </div>
      </div>
    </div>
  );
}
