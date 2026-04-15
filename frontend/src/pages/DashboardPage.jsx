import { useEffect, useRef, useState } from "react";
import { AppHeader } from "../components/AppHeader";
import { DocumentCard } from "../components/DocumentCard";
import { Icon } from "../components/Icon";
import { Sidebar } from "../components/Sidebar";
import { documentViewerRoute, ROUTES } from "../routes";
import { listPdfFiles, uploadPdfFiles } from "../services/documents";

const dateFormatter = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

function formatDocumentDate(createdAt) {
  if (!createdAt) {
    return "Data indisponivel";
  }

  const date = new Date(createdAt);
  if (Number.isNaN(date.getTime())) {
    return "Data indisponivel";
  }

  return `Enviado em ${dateFormatter.format(date)}`;
}

function mapFileToDocument(file) {
  return {
    id: file.id,
    title: file.name,
    meta: formatDocumentDate(file.createdAt),
    icon: "picture_as_pdf",
    chips: ["PDF"],
    action: "Visualizar documento",
  };
}

export function DashboardPage({ goTo }) {
  const fileInputRef = useRef(null);
  const [uploadStatus, setUploadStatus] = useState({ type: "", message: "" });
  const [isUploading, setIsUploading] = useState(false);
  const [documents, setDocuments] = useState([]);
  const [isLoadingDocuments, setIsLoadingDocuments] = useState(true);
  const [documentsError, setDocumentsError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const normalizedSearchTerm = searchTerm.trim().toLowerCase();
  const filteredDocuments = normalizedSearchTerm
    ? documents.filter((document) => document.title.toLowerCase().includes(normalizedSearchTerm))
    : documents;

  const handleOpenDocument = (document) => {
    goTo(documentViewerRoute(document.id));
  };

  const loadDocuments = async () => {
    setIsLoadingDocuments(true);
    setDocumentsError("");

    try {
      const files = await listPdfFiles();
      setDocuments(files.map(mapFileToDocument));
    } catch (error) {
      setDocumentsError(error instanceof Error ? error.message : "Nao foi possivel carregar seus PDFs.");
    } finally {
      setIsLoadingDocuments(false);
    }
  };

  useEffect(() => {
    loadDocuments();
  }, []);

  const uploadFiles = async (files) => {
    const selectedFiles = Array.from(files || []);
    if (!selectedFiles.length) {
      return;
    }

    const invalidFile = selectedFiles.find((file) => file.type !== "application/pdf");
    if (invalidFile) {
      setUploadStatus({
        type: "error",
        title: "Upload recusado",
        message: "Envie apenas arquivos PDF.",
      });
      return;
    }

    setIsUploading(true);
    setUploadStatus({ type: "", message: "" });

    try {
      const uploadedFiles = await uploadPdfFiles(selectedFiles);
      const totalFiles = uploadedFiles.length;
      setUploadStatus({
        type: "success",
        title: "Upload concluido",
        message: totalFiles === 1 ? "PDF enviado com sucesso." : `${totalFiles} PDFs enviados com sucesso.`,
      });
      await loadDocuments();
    } catch (error) {
      setUploadStatus({
        type: "error",
        title: "Falha no upload",
        message: error instanceof Error ? error.message : "Nao foi possivel enviar o arquivo.",
      });
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  return (
    <div className="min-h-screen bg-background text-on-surface">
      <Sidebar activeItem="library" goTo={goTo} />
      <main className="min-h-screen md:ml-64">
        <AppHeader goTo={goTo} activeSection="documents" />

        <div className="mx-auto max-w-7xl px-5 py-10 pb-28 md:px-8 md:pb-10">
          <section className="mb-10 text-center">
            <h2 className="mb-2 font-headline text-4xl font-extrabold tracking-tight text-on-surface">My Library</h2>
            <p className="text-base font-light text-on-surface-variant">
              Manage and analyze your scholarly collection.
            </p>
          </section>

          <section className="mb-12">
            <input
              className="sr-only"
              ref={fileInputRef}
              type="file"
              accept="application/pdf"
              multiple
              onChange={(event) => uploadFiles(event.target.files)}
            />
            <button
              className="group flex w-full cursor-pointer flex-col items-center justify-center rounded-2xl border border-outline-variant/30 bg-surface-container-lowest p-8 text-center transition-all hover:border-primary/40 disabled:cursor-not-allowed disabled:opacity-70"
              type="button"
              disabled={isUploading}
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(event) => event.preventDefault()}
              onDrop={(event) => {
                event.preventDefault();
                uploadFiles(event.dataTransfer.files);
              }}
            >
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary-fixed transition-transform group-hover:scale-110">
                <Icon className="text-2xl text-primary">upload</Icon>
              </div>
              <h3 className="mb-1 font-headline text-lg font-bold text-on-surface">
                {isUploading ? "Uploading PDFs..." : "Click to upload or drag and drop"}
              </h3>
              <p className="mb-6 text-sm text-on-surface-variant">PDF files up to 10MB each</p>
              <span className="signature-gradient rounded-lg px-6 py-2.5 text-sm font-bold text-white shadow-md transition-opacity hover:opacity-90">
                {isUploading ? "Sending..." : "Select Files"}
              </span>
            </button>
            {uploadStatus.message ? (
              <div
                className={`mt-4 flex items-start gap-3 rounded-lg border px-4 py-3 shadow-sm ${
                  uploadStatus.type === "success"
                    ? "border-primary/20 bg-primary-fixed/50 text-primary"
                    : "border-error/20 bg-error/10 text-error"
                }`}
                role={uploadStatus.type === "success" ? "status" : "alert"}
              >
                <div
                  className={`mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full ${
                    uploadStatus.type === "success" ? "bg-primary/10" : "bg-error/10"
                  }`}
                >
                  <Icon className="text-lg">{uploadStatus.type === "success" ? "check_circle" : "error"}</Icon>
                </div>
                <div className="min-w-0">
                  <p className="font-headline text-sm font-bold">{uploadStatus.title}</p>
                  <p className="mt-0.5 text-sm text-on-surface-variant">{uploadStatus.message}</p>
                </div>
              </div>
            ) : null}
          </section>

          <section>
            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <h3 className="flex items-center gap-2 font-headline text-xl font-bold text-on-surface">
                Meus PDFs
                <span className="rounded bg-surface-container-high px-2 py-0.5 text-xs font-medium text-on-surface-variant">
                  {filteredDocuments.length} total
                </span>
              </h3>
              <label className="flex items-center gap-2 rounded-lg border border-outline-variant/20 bg-surface-container-low px-3 py-1.5 text-on-surface-variant">
                <Icon className="text-sm">search</Icon>
                <input
                  className="w-40 border-none bg-transparent p-0 text-sm placeholder:text-on-surface-variant/50 focus:ring-0"
                  placeholder="Buscar PDF..."
                  type="text"
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                />
                {searchTerm ? (
                  <button
                    className="text-outline transition-colors hover:text-on-surface"
                    type="button"
                    onClick={() => setSearchTerm("")}
                    aria-label="Limpar busca"
                  >
                    <Icon className="text-sm">close</Icon>
                  </button>
                ) : null}
              </label>
            </div>

            {isLoadingDocuments ? (
              <div className="rounded-xl border border-outline-variant/20 bg-surface-container-lowest p-6 text-center text-sm font-medium text-on-surface-variant">
                Carregando PDFs...
              </div>
            ) : documentsError ? (
              <div className="flex items-start gap-3 rounded-lg border border-error/20 bg-error/10 px-4 py-3 text-error" role="alert">
                <div className="mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-error/10">
                  <Icon className="text-lg">error</Icon>
                </div>
                <div className="min-w-0">
                  <p className="font-headline text-sm font-bold">Nao foi possivel carregar os PDFs</p>
                  <p className="mt-0.5 text-sm text-on-surface-variant">{documentsError}</p>
                </div>
              </div>
            ) : filteredDocuments.length ? (
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
                {filteredDocuments.map((doc) => (
                  <DocumentCard doc={doc} key={doc.id} onOpen={handleOpenDocument} />
                ))}
              </div>
            ) : documents.length ? (
              <div className="rounded-xl border border-dashed border-outline-variant/30 bg-surface-container-lowest p-8 text-center">
                <Icon className="mb-3 text-3xl text-outline">search_off</Icon>
                <h4 className="font-headline text-lg font-bold text-on-surface">Nenhum PDF encontrado</h4>
                <p className="mt-1 text-sm text-on-surface-variant">
                  Tente buscar por outro nome de arquivo.
                </p>
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-outline-variant/30 bg-surface-container-lowest p-8 text-center">
                <Icon className="mb-3 text-3xl text-outline">folder_open</Icon>
                <h4 className="font-headline text-lg font-bold text-on-surface">Nenhum PDF enviado</h4>
                <p className="mt-1 text-sm text-on-surface-variant">
                  Envie seu primeiro PDF para ele aparecer nesta lista.
                </p>
              </div>
            )}
          </section>
        </div>
      </main>

      <nav className="glass-panel fixed bottom-0 left-0 right-0 z-50 flex items-center justify-around border-t border-outline-variant/10 px-4 py-3 md:hidden">
        {[
          ["folder_open", "Library", true],
          ["smart_toy", "Chat"],
          ["auto_awesome", "Insights"],
          ["settings", "Profile"],
        ].map(([icon, label, active]) => (
          <button
            className={`flex flex-col items-center gap-1 ${active ? "text-primary" : "text-on-surface-variant opacity-60"}`}
            type="button"
            key={label}
          >
            <Icon fill={Boolean(active)}>{icon}</Icon>
            <span className="text-[10px] font-bold uppercase tracking-tighter">{label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}
