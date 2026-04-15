import { useEffect, useState } from "react";
import { AppHeader } from "../components/AppHeader";
import { Icon } from "../components/Icon";
import { Sidebar } from "../components/Sidebar";
import { ROUTES } from "../routes";
import { getPdfFile } from "../services/documents";

export function DocumentViewerPage({ documentId, goTo }) {
  const [pdfUrl, setPdfUrl] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    let objectUrl = "";
    let isActive = true;

    async function loadDocument() {
      setIsLoading(true);
      setErrorMessage("");

      try {
        const blob = await getPdfFile(documentId);
        objectUrl = URL.createObjectURL(blob);
        if (isActive) {
          setPdfUrl(objectUrl);
        }
      } catch (error) {
        if (isActive) {
          setErrorMessage(error instanceof Error ? error.message : "Nao foi possivel carregar o documento.");
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

  return (
    <div className="min-h-screen bg-background text-on-surface">
      <Sidebar activeItem="library" goTo={goTo} />
      <main className="min-h-screen md:ml-64">
        <AppHeader goTo={goTo} activeSection="documents" />

        <div className="mx-auto max-w-7xl px-5 py-6 md:px-8">
          <button
            className="mb-4 flex items-center gap-2 text-sm font-semibold text-primary transition-colors hover:text-on-primary-fixed-variant"
            type="button"
            onClick={() => goTo(ROUTES.dashboard)}
          >
            <Icon className="text-lg">arrow_back</Icon>
            Voltar para meus PDFs
          </button>

          {isLoading ? (
            <div className="rounded-xl border border-outline-variant/20 bg-surface-container-lowest p-8 text-center text-sm font-medium text-on-surface-variant">
              Carregando documento...
            </div>
          ) : errorMessage ? (
            <div className="flex items-start gap-3 rounded-lg border border-error/20 bg-error/10 px-4 py-3 text-error" role="alert">
              <div className="mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-error/10">
                <Icon className="text-lg">error</Icon>
              </div>
              <div className="min-w-0">
                <p className="font-headline text-sm font-bold">Nao foi possivel abrir o documento</p>
                <p className="mt-0.5 text-sm text-on-surface-variant">{errorMessage}</p>
              </div>
            </div>
          ) : (
            <div className="h-[calc(100vh-170px)] overflow-hidden rounded-lg border border-outline-variant/20 bg-surface-container-lowest">
              <iframe className="h-full w-full" src={pdfUrl} title="Visualizador de PDF" />
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
