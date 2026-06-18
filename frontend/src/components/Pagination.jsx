import { Icon } from "./Icon";

export function Pagination({ className = "", onPageChange, pagination }) {
  if (!pagination || pagination.totalPages <= 1) {
    return null;
  }

  const { hasNextPage, hasPreviousPage, page, total, totalPages } = pagination;

  return (
    <div
      className={`flex flex-col gap-3 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 sm:flex-row sm:items-center sm:justify-between ${className}`}
    >
      <p className="text-xs font-bold uppercase tracking-[0.16em] text-auth-on-surface-variant">
        Página {page} de {totalPages} · {total} documentos
      </p>

      <div className="flex items-center gap-2">
        <button
          className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.05] px-3 text-sm font-bold text-auth-on-surface-variant transition hover:border-white/20 hover:bg-white/[0.08] hover:text-auth-on-surface disabled:cursor-not-allowed disabled:opacity-50"
          type="button"
          disabled={!hasPreviousPage}
          onClick={() => onPageChange(page - 1)}
        >
          <Icon className="text-lg">chevron_left</Icon>
          Anterior
        </button>

        <button
          className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-[#35A9F6]/30 bg-[#35A9F6]/10 px-3 text-sm font-bold text-auth-primary transition hover:bg-[#35A9F6]/15 disabled:cursor-not-allowed disabled:opacity-50"
          type="button"
          disabled={!hasNextPage}
          onClick={() => onPageChange(page + 1)}
        >
          Próxima
          <Icon className="text-lg">chevron_right</Icon>
        </button>
      </div>
    </div>
  );
}
