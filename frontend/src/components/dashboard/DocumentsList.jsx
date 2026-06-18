import { DashboardDocumentCard } from "./DashboardDocumentCard";
import { Icon } from "../Icon";
import { Pagination } from "../Pagination";

export function DocumentsList({
  documents,
  error,
  filteredDocuments,
  deletingDocumentId,
  onDeleteDocument,
  isLoading,
  isSearching = false,
  onOpenDocument,
  onOpenInChat,
  onPageChange,
  onUploadFirst,
  pagination,
}) {
  if (isLoading) {
    return (
      <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-8 text-center text-sm font-medium text-auth-on-surface-variant">
        Carregando PDFs...
      </div>
    );
  }

  if (error) {
    return (
      <div
        className="flex items-start gap-3 rounded-2xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-red-100"
        role="alert"
      >
        <div className="mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-red-500/10">
          <Icon className="text-lg">error</Icon>
        </div>

        <div className="min-w-0">
          <p className="text-sm font-bold">Não foi possível carregar os PDFs</p>
          <p className="mt-0.5 text-sm opacity-80">{error}</p>
        </div>
      </div>
    );
  }

  if (filteredDocuments.length) {
    return (
      <>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filteredDocuments.map((document) => (
            <DashboardDocumentCard
              deletingDocumentId={deletingDocumentId}
              document={document}
              key={document.id}
              onDeleteDocument={onDeleteDocument}
              onOpenDocument={onOpenDocument}
              onOpenInChat={onOpenInChat}
            />
          ))}
        </div>

        <Pagination pagination={pagination} onPageChange={onPageChange} />
      </>
    );
  }

  if (documents.length || isSearching) {
    return (
      <div className="rounded-2xl border border-dashed border-white/15 bg-white/[0.04] p-8 text-center">
        <Icon className="mb-3 text-3xl text-auth-primary">search_off</Icon>

        <h4 className="text-lg font-bold text-auth-on-surface">Nenhum PDF encontrado</h4>

        <p className="mt-1 text-sm text-auth-on-surface-variant">
          Tente buscar por outro nome ou descrição.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-8 text-center">
      <div className="mb-4 flex justify-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-white/10 bg-[#35A9F6]/10 text-auth-primary">
          <Icon className="text-4xl">upload_file</Icon>
        </div>
      </div>

      <h4 className="mb-2 text-xl font-bold text-auth-on-surface">Nenhum PDF enviado</h4>

      <p className="mx-auto mb-6 max-w-md text-sm leading-6 text-auth-on-surface-variant">
        Escreva uma descrição, envie seu primeiro PDF e acompanhe o processamento por aqui.
      </p>

      <button
        className="font-bold text-auth-primary underline underline-offset-4"
        type="button"
        onClick={onUploadFirst}
      >
        Enviar primeiro PDF
      </button>
    </div>
  );
}
