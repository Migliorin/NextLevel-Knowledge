import { FILE_STATUS, getStatusConfig } from "../../utils/documentStatus";
import { Icon } from "../Icon";

export function DashboardDocumentCard({
  deletingDocumentId = null,
  document,
  onDeleteDocument,
  onOpenDocument,
  onOpenInChat,
}) {
  const status = getStatusConfig(document.status);
  const canOpenInChat = document.status === FILE_STATUS.EXTRACTED;
  const isDeleting = String(deletingDocumentId) === String(document.id);

  return (
    <article className="auth-glass-panel group flex min-h-[260px] flex-col rounded-2xl border border-auth-outline-variant/40 bg-auth-surface-container-low p-5 shadow-xl shadow-black/20 transition hover:-translate-y-0.5 hover:border-[#35A9F6]/30 hover:shadow-[#35A9F6]/10">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-gradient-to-br from-[#35A9F6]/15 to-[#7D7BF2]/15 text-auth-primary">
          <Icon className="text-2xl">picture_as_pdf</Icon>
        </div>

        <span
          className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.14em] ${status.className}`}
        >
          <Icon className={`text-sm ${status.iconClassName}`}>{status.icon}</Icon>
          {status.label}
        </span>
      </div>

      <div className="min-w-0 flex-1">
        <h3 className="line-clamp-2 text-base font-extrabold leading-snug text-auth-on-surface">
          {document.title}
        </h3>

        <p className="mt-3 line-clamp-3 text-sm leading-6 text-auth-on-surface-variant">
          {document.description}
        </p>

        <div className="mt-4 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2">
          <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-auth-on-surface-variant">
            {status.description}
          </p>

          <p className="mt-1 text-xs text-auth-on-surface-variant">{document.meta}</p>
        </div>
      </div>

      {document.status === FILE_STATUS.EXTRACTING ? (
        <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-white/10">
          <div className="h-full w-2/5 rounded-full bg-[#35A9F6]" />
        </div>
      ) : null}

      <div className="mt-5 grid grid-cols-3 gap-3">
        <button
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.05] px-3 text-sm font-bold text-auth-on-surface-variant transition hover:border-white/20 hover:bg-white/[0.08] hover:text-auth-on-surface"
          type="button"
          onClick={() => onOpenDocument(document)}
        >
          <Icon className="text-lg">visibility</Icon>
          <span className="hidden sm:inline">Ver</span>
        </button>

        <button
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-[#35A9F6]/30 bg-[#35A9F6]/10 px-3 text-sm font-bold text-auth-primary transition hover:bg-[#35A9F6]/15 disabled:cursor-not-allowed disabled:border-white/10 disabled:bg-white/[0.04] disabled:text-auth-on-surface-variant disabled:opacity-60"
          type="button"
          disabled={!canOpenInChat}
          onClick={() => onOpenInChat(document)}
        >
          <Icon className="text-lg">smart_toy</Icon>
          <span className="hidden sm:inline">Chat</span>
        </button>

        <button
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-red-400/20 bg-red-500/10 px-3 text-sm font-bold text-red-100 transition hover:bg-red-500/15 disabled:cursor-not-allowed disabled:opacity-60"
          type="button"
          disabled={isDeleting}
          onClick={() => onDeleteDocument(document)}
        >
          <Icon className="text-lg">{isDeleting ? "hourglass_top" : "delete"}</Icon>
          <span className="hidden sm:inline">{isDeleting ? "..." : "Excluir"}</span>
        </button>
      </div>
    </article>
  );
}
