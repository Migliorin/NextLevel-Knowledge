import { Icon } from "../Icon";

export function ChatDocumentSelectorButton({ isLoading, onClick, selectedDocument }) {
  return (
    <button
      className={`inline-flex max-w-full items-center gap-3 rounded-2xl border px-4 py-2.5 text-left text-sm font-bold transition ${
        selectedDocument
          ? "border-[#35A9F6]/40 bg-[#35A9F6]/10 text-auth-on-surface shadow-lg shadow-[#35A9F6]/10"
          : "border-white/10 bg-white/[0.06] text-auth-on-surface-variant hover:border-[#35A9F6]/30 hover:bg-white/[0.09] hover:text-auth-on-surface"
      }`}
      type="button"
      onClick={onClick}
    >
      <span
        className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl border ${
          selectedDocument
            ? "border-[#35A9F6]/40 bg-[#35A9F6]/15 text-auth-primary"
            : "border-white/10 bg-white/[0.06] text-auth-on-surface-variant"
        }`}
      >
        <Icon className="text-xl">{selectedDocument ? "picture_as_pdf" : "folder_open"}</Icon>
      </span>

      <span className="min-w-0">
        <span className="block text-[10px] uppercase tracking-[0.18em] text-auth-on-surface-variant">
          {selectedDocument ? "PDF selecionado" : "Selecionar PDF"}
        </span>

        <span className="block max-w-[240px] truncate">
          {isLoading ? "Carregando documentos..." : selectedDocument?.name || "Escolha um documento"}
        </span>
      </span>

      <Icon className="text-xl text-auth-primary">expand_more</Icon>
    </button>
  );
}
