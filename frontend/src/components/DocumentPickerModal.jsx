import { useEffect, useMemo, useState } from "react";
import { Icon } from "./Icon";
import { Pagination } from "./Pagination";

const DOCUMENT_PICKER_PAGE_SIZE = 5;

function getDocumentDescription(document) {
  return (
    document.description ||
    document.summary ||
    document.excerpt ||
    "PDF disponível para consulta com IA. Selecione este documento para iniciar perguntas contextualizadas."
  );
}

function getDocumentMetadata(document) {
  const pages = document.pages ? `${document.pages} páginas` : "PDF";
  const createdAt = document.createdAt || document.created_at;

  if (!createdAt) {
    return pages;
  }

  const date = new Date(createdAt);

  if (Number.isNaN(date.getTime())) {
    return pages;
  }

  return `${pages} • ${date.toLocaleDateString("pt-BR")}`;
}

export function DocumentPickerModal({
  isOpen,
  onClose,
  documents = [],
  selectedDocumentId = "",
  onSelectDocument,
  isLoading = false,
  error = "",
}) {
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");

  const filteredDocuments = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    if (!normalizedSearch) {
      return documents;
    }

    return documents.filter((document) => {
      const searchableContent = [
        document.name,
        document.description,
        document.summary,
        document.excerpt,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return searchableContent.includes(normalizedSearch);
    });
  }, [documents, searchTerm]);

  const pagination = useMemo(() => {
    const total = filteredDocuments.length;
    const totalPages = Math.max(1, Math.ceil(total / DOCUMENT_PICKER_PAGE_SIZE));
    const normalizedPage = Math.min(page, totalPages);

    return {
      hasNextPage: normalizedPage < totalPages,
      hasPreviousPage: normalizedPage > 1,
      limit: DOCUMENT_PICKER_PAGE_SIZE,
      page: normalizedPage,
      total,
      totalPages,
    };
  }, [filteredDocuments.length, page]);

  const paginatedDocuments = useMemo(() => {
    const start = (pagination.page - 1) * DOCUMENT_PICKER_PAGE_SIZE;
    return filteredDocuments.slice(start, start + DOCUMENT_PICKER_PAGE_SIZE);
  }, [filteredDocuments, pagination.page]);

  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }

    const closeOnEscape = (event) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", closeOnEscape);
    return () => document.removeEventListener("keydown", closeOnEscape);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!isOpen) {
      setSearchTerm("");
      setPage(1);
    }
  }, [isOpen]);

  useEffect(() => {
    setPage(1);
  }, [searchTerm]);

  if (!isOpen) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#011134]/75 px-4 py-6 backdrop-blur-xl"
      role="dialog"
      aria-modal="true"
      aria-label="Selecionar documento PDF"
      onMouseDown={onClose}
    >
      <div
        className="auth-glass-panel relative flex max-h-[82vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-auth-outline-variant/40 bg-auth-surface-container-low text-auth-on-surface shadow-2xl shadow-black/40"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -left-24 -top-24 h-56 w-56 rounded-full bg-[#35A9F6]/15 blur-3xl" />
          <div className="absolute -bottom-24 right-0 h-56 w-56 rounded-full bg-[#7D7BF2]/15 blur-3xl" />
        </div>

        <header className="relative flex items-start justify-between gap-4 border-b border-white/10 p-5">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.06] px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-auth-primary">
              <Icon className="text-base">folder_open</Icon>
              Biblioteca PDF
            </div>

            <h2 className="text-xl font-extrabold tracking-tight text-auth-on-surface">
              Escolha um documento
            </h2>

            <p className="mt-2 max-w-lg text-sm leading-6 text-auth-on-surface-variant">
              Busque seus PDFs e selecione qual arquivo será usado como contexto para a conversa.
            </p>
          </div>

          <button
            className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/[0.06] text-auth-on-surface-variant transition hover:bg-white/[0.1] hover:text-auth-on-surface"
            type="button"
            onClick={onClose}
            aria-label="Fechar seleção de documento"
          >
            <Icon className="text-xl">close</Icon>
          </button>
        </header>

        <div className="relative border-b border-white/10 p-5">
          <div className="relative">
            <Icon className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-xl text-auth-primary">
              search
            </Icon>

            <input
              className="min-h-12 w-full rounded-xl border border-white/10 bg-white/[0.07] px-4 py-3 pl-12 text-sm text-auth-on-surface outline-none transition placeholder:text-auth-on-surface-variant/60 focus:border-[#35A9F6]/60 focus:bg-white/[0.1] focus:ring-2 focus:ring-[#35A9F6]/20"
              placeholder="Buscar por nome ou descrição do PDF..."
              type="text"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              autoFocus
            />
          </div>
        </div>

        <div className="relative flex-1 overflow-y-auto p-5">
          {isLoading ? (
            <div className="flex min-h-48 flex-col items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] text-center">
              <Icon className="mb-3 text-3xl text-auth-primary">hourglass_top</Icon>
              <p className="text-sm font-bold text-auth-on-surface">Carregando PDFs...</p>
              <p className="mt-1 text-xs text-auth-on-surface-variant">
                Aguarde enquanto buscamos sua biblioteca.
              </p>
            </div>
          ) : null}

          {!isLoading && error ? (
            <div className="rounded-2xl border border-red-400/20 bg-red-500/10 p-4 text-sm font-medium text-red-100">
              {error}
            </div>
          ) : null}

          {!isLoading && !error && filteredDocuments.length === 0 ? (
            <div className="flex min-h-48 flex-col items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] text-center">
              <Icon className="mb-3 text-3xl text-auth-primary">search_off</Icon>
              <p className="text-sm font-bold text-auth-on-surface">Nenhum PDF encontrado</p>
              <p className="mt-1 text-xs text-auth-on-surface-variant">
                Tente buscar por outro nome ou descrição.
              </p>
            </div>
          ) : null}

          {!isLoading && !error && filteredDocuments.length > 0 ? (
            <div className="space-y-3">
              {paginatedDocuments.map((document) => {
                const isSelected = String(document.id) === String(selectedDocumentId);

                return (
                  <button
                    className={`group flex w-full items-start gap-4 rounded-2xl border p-4 text-left transition ${
                      isSelected
                        ? "border-[#35A9F6]/50 bg-[#35A9F6]/10 shadow-lg shadow-[#35A9F6]/10"
                        : "border-white/10 bg-white/[0.04] hover:border-white/20 hover:bg-white/[0.07]"
                    }`}
                    type="button"
                    key={document.id}
                    onClick={() => {
                      onSelectDocument(document);
                      onClose();
                    }}
                  >
                    <div
                      className={`flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-2xl border ${
                        isSelected
                          ? "border-[#35A9F6]/40 bg-[#35A9F6]/15 text-auth-primary"
                          : "border-white/10 bg-white/[0.06] text-auth-on-surface-variant group-hover:text-auth-primary"
                      }`}
                    >
                      <Icon className="text-2xl">picture_as_pdf</Icon>
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-3">
                        <h3 className="truncate text-sm font-bold text-auth-on-surface">
                          {document.name}
                        </h3>

                        {isSelected ? (
                          <span className="inline-flex flex-shrink-0 items-center gap-1 rounded-full border border-[#35A9F6]/30 bg-[#35A9F6]/10 px-2 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-auth-primary">
                            <Icon className="text-sm">check</Icon>
                            Selecionado
                          </span>
                        ) : null}
                      </div>

                      <p className="mt-1 line-clamp-2 text-xs leading-5 text-auth-on-surface-variant">
                        {getDocumentDescription(document)}
                      </p>

                      <p className="mt-3 text-[10px] font-bold uppercase tracking-[0.16em] text-auth-on-surface-variant/80">
                        {getDocumentMetadata(document)}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          ) : null}
        </div>

        {!isLoading && !error && filteredDocuments.length > DOCUMENT_PICKER_PAGE_SIZE ? (
          <footer className="relative border-t border-white/10 p-5">
            <Pagination pagination={pagination} onPageChange={setPage} />
          </footer>
        ) : null}
      </div>
    </div>
  );
}
