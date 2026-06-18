import { useEffect, useMemo, useState } from "react";
import { AppLayout } from "../components/AppLayout";
import { Icon } from "../components/Icon";
import { ROUTES } from "../routes";
import { deletePdfFile, getPdfFile, listPdfFiles } from "../services/documents";
import { getStatusConfig, mapFileToDocument } from "../utils/documentStatus";

export function DocumentViewerPage({ documentId, goTo }) {
  const [pdfUrl, setPdfUrl] = useState("");
  const [document, setDocument] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const status = useMemo(
    () => getStatusConfig(document?.status),
    [document?.status],
  );

  useEffect(() => {
    let objectUrl = "";
    let isActive = true;

    async function loadDocument() {
      setIsLoading(true);
      setErrorMessage("");

      try {
        const [blob, files] = await Promise.all([
          getPdfFile(documentId),
          listPdfFiles().catch(() => []),
        ]);
        objectUrl = URL.createObjectURL(blob);

        if (isActive) {
          setPdfUrl(objectUrl);
          const currentDocument = files.find(
            (file) => String(file.id) === String(documentId),
          );
          setDocument(currentDocument ? mapFileToDocument(currentDocument) : null);
        }
      } catch (error) {
        if (isActive) {
          setErrorMessage(
            error instanceof Error ? error.message : "Não foi possível carregar o documento.",
          );
        }
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    }

    loadDocument();

    return () => {
      isActive = false;
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [documentId]);

  const handleDelete = async () => {
    const title = document?.title || `documento #${documentId}`;
    const confirmed = window.confirm(`Excluir "${title}"? Esta ação remove o PDF da biblioteca.`);

    if (!confirmed) {
      return;
    }

    setIsDeleting(true);
    setErrorMessage("");

    try {
      await deletePdfFile(documentId);
      goTo(ROUTES.dashboard, { replace: true });
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Não foi possível excluir o PDF.");
      setIsDeleting(false);
    }
  };

  return (
    <AppLayout activeItem="library" goTo={goTo}>
      <div className="mx-auto flex min-h-[calc(100vh-73px)] max-w-[1180px] flex-col px-5 py-8 md:px-8">
        <section className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="min-w-0">
            <div className="mb-4 flex flex-col items-start gap-3">
              <button
                className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.05] px-3 py-2 text-sm font-bold text-auth-on-surface-variant transition hover:border-[#35A9F6]/30 hover:bg-white/[0.08] hover:text-auth-on-surface"
                type="button"
                onClick={() => goTo(ROUTES.dashboard)}
              >
                <Icon className="text-lg">arrow_back</Icon>
                Biblioteca
              </button>

              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.06] px-3 py-1.5 text-xs font-bold uppercase tracking-[0.2em] text-auth-primary shadow-lg shadow-black/10">
                <Icon className="text-base">picture_as_pdf</Icon>
                Visualizador PDF
              </div>
            </div>

            <h1 className="max-w-3xl truncate font-headline text-3xl font-extrabold tracking-tight text-auth-on-surface md:text-4xl">
              {document?.title || "Documento"}
            </h1>

            <p className="mt-2 max-w-3xl text-sm leading-6 text-auth-on-surface-variant">
              {document?.description || "Abra, revise e gerencie este PDF da biblioteca."}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {document ? (
              <span
                className={`inline-flex min-h-11 items-center gap-2 rounded-xl border px-3 py-2 text-xs font-bold uppercase tracking-[0.14em] ${status.className}`}
              >
                <Icon className={`text-lg ${status.iconClassName}`}>{status.icon}</Icon>
                {status.label}
              </span>
            ) : null}

            <button
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-red-400/20 bg-red-500/10 px-4 text-sm font-bold text-red-100 transition hover:bg-red-500/15 disabled:cursor-not-allowed disabled:opacity-60"
              type="button"
              disabled={isDeleting || isLoading}
              onClick={handleDelete}
            >
              <Icon className="text-lg">{isDeleting ? "hourglass_top" : "delete"}</Icon>
              {isDeleting ? "Excluindo..." : "Excluir PDF"}
            </button>
          </div>
        </section>

        {errorMessage ? (
          <div
            className="mb-4 flex items-start gap-3 rounded-2xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-red-100"
            role="alert"
          >
            <div className="mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-red-500/10">
              <Icon className="text-lg">error</Icon>
            </div>
            <div className="min-w-0">
              <p className="text-sm font-bold">Não foi possível concluir a ação</p>
              <p className="mt-0.5 text-sm opacity-80">{errorMessage}</p>
            </div>
          </div>
        ) : null}

        <section className="auth-glass-panel flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl border border-auth-outline-variant/40 bg-auth-surface-container-low shadow-2xl shadow-black/25">
          <div className="flex items-center justify-between gap-4 border-b border-white/10 px-5 py-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-auth-primary">
                Pré-visualização
              </p>
              <p className="mt-1 text-sm text-auth-on-surface-variant">
                {document?.meta || `Documento ${documentId}`}
              </p>
            </div>
          </div>

          {isLoading ? (
            <div className="flex min-h-[520px] flex-1 items-center justify-center p-8 text-center">
              <div>
                <Icon className="mb-3 text-4xl text-auth-primary">hourglass_top</Icon>
                <p className="text-sm font-bold text-auth-on-surface">Carregando documento...</p>
                <p className="mt-1 text-xs text-auth-on-surface-variant">
                  Preparando o PDF para visualização.
                </p>
              </div>
            </div>
          ) : pdfUrl ? (
            <div className="h-[calc(100vh-300px)] min-h-[520px] bg-black/20">
              <iframe
                className="h-full w-full"
                src={pdfUrl}
                title={document?.title || "Visualizador de PDF"}
              />
            </div>
          ) : (
            <div className="flex min-h-[520px] flex-1 items-center justify-center p-8 text-center">
              <div>
                <Icon className="mb-3 text-4xl text-auth-primary">picture_as_pdf</Icon>
                <p className="text-sm font-bold text-auth-on-surface">PDF indisponível</p>
                <p className="mt-1 text-xs text-auth-on-surface-variant">
                  Volte para a biblioteca e tente abrir o documento novamente.
                </p>
              </div>
            </div>
          )}
        </section>
      </div>
    </AppLayout>
  );
}
