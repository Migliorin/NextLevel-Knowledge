import { useEffect, useRef, useState } from "react";
import { AppHeader } from "../components/AppHeader";
import { Icon } from "../components/Icon";
import { Sidebar } from "../components/Sidebar";
import { documentViewerRoute, ROUTES } from "../routes";
import { listPdfFiles, startDocumentExtraction, uploadPdfFiles } from "../services/documents";

const dateFormatter = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

const FILE_STATUS = {
  PENDING: 0,
  EXTRACTING: 1,
  EXTRACTED: 2,
  ERROR: 3,
};

const fileStatusLabels = {
  [FILE_STATUS.PENDING]: "Pendente",
  [FILE_STATUS.EXTRACTING]: "Extraindo",
  [FILE_STATUS.EXTRACTED]: "Ready",
  [FILE_STATUS.ERROR]: "Erro",
};

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
    status: Number(file.status ?? 0),
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
  const [selectedDocumentIds, setSelectedDocumentIds] = useState([]);
  const [openActionMenuId, setOpenActionMenuId] = useState(null);
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractionStatus, setExtractionStatus] = useState({ type: "", title: "", message: "" });
  const normalizedSearchTerm = searchTerm.trim().toLowerCase();
  const filteredDocuments = normalizedSearchTerm
    ? documents.filter((document) => document.title.toLowerCase().includes(normalizedSearchTerm))
    : documents;
  const extractedDocumentsCount = documents.filter((document) => document.status === FILE_STATUS.EXTRACTED).length;
  const activeTasksCount = documents.filter((document) => document.status === FILE_STATUS.EXTRACTING).length;
  const selectedDocumentsCount = selectedDocumentIds.length;
  const progressPercent = documents.length ? Math.round((extractedDocumentsCount / documents.length) * 100) : 0;

  const handleOpenDocument = (document) => {
    setOpenActionMenuId(null);
    goTo(documentViewerRoute(document.id));
  };

  const handleOpenSelectedInChat = () => {
    const [firstSelectedDocumentId] = selectedDocumentIds;
    if (firstSelectedDocumentId) {
      window.sessionStorage.setItem("selected_chat_document_id", String(firstSelectedDocumentId));
    }
    goTo(ROUTES.chat);
  };

  const handleToggleDocument = (documentId) => {
    setSelectedDocumentIds((current) =>
      current.includes(documentId) ? current.filter((id) => id !== documentId) : [...current, documentId],
    );
  };

  const handleStartExtraction = async () => {
    const documentsToExtract = selectedDocumentIds
      .map((documentId) => documents.find((document) => document.id === documentId))
      .filter((document) =>
        document && [FILE_STATUS.PENDING, FILE_STATUS.ERROR].includes(document.status),
      );

    if (!documentsToExtract.length) {
      setExtractionStatus({
        type: "error",
        title: "Nenhum PDF pendente",
        message: "Selecione pelo menos um PDF pendente ou com erro para iniciar a extracao.",
      });
      return;
    }

    const confirmed = window.confirm(
      documentsToExtract.length === 1
        ? `Iniciar extracao de "${documentsToExtract[0].title}"?`
        : `Iniciar extracao de ${documentsToExtract.length} PDFs selecionados?`,
    );

    if (!confirmed) {
      return;
    }

    setIsExtracting(true);
    setExtractionStatus({ type: "", title: "", message: "" });

    try {
      setDocuments((current) =>
        current.map((document) =>
          documentsToExtract.some((selectedDocument) => selectedDocument.id === document.id)
            ? { ...document, status: FILE_STATUS.EXTRACTING }
            : document,
        ),
      );
      await Promise.all(documentsToExtract.map((document) => startDocumentExtraction(document.id)));
      setExtractionStatus({
        type: "success",
        title: "Extracao iniciada",
        message:
          documentsToExtract.length === 1
            ? "O PDF selecionado foi enviado para extracao."
            : `${documentsToExtract.length} PDFs selecionados foram enviados para extracao.`,
      });
      await loadDocuments();
    } catch (error) {
      setDocuments((current) =>
        current.map((document) =>
          documentsToExtract.some((selectedDocument) => selectedDocument.id === document.id)
            ? { ...document, status: FILE_STATUS.ERROR }
            : document,
        ),
      );
      setExtractionStatus({
        type: "error",
        title: "Falha na extracao",
        message: error instanceof Error ? error.message : "Nao foi possivel iniciar a extracao.",
      });
    } finally {
      setIsExtracting(false);
    }
  };

  const loadDocuments = async () => {
    setIsLoadingDocuments(true);
    setDocumentsError("");

    try {
      const files = await listPdfFiles();
      const mappedDocuments = files.map(mapFileToDocument);
      setDocuments(mappedDocuments);
      setSelectedDocumentIds((current) =>
        current.filter((documentId) => mappedDocuments.some((document) => document.id === documentId)),
      );
    } catch (error) {
      setDocumentsError(error instanceof Error ? error.message : "Nao foi possivel carregar seus PDFs.");
    } finally {
      setIsLoadingDocuments(false);
    }
  };

  useEffect(() => {
    loadDocuments();
  }, []);

  useEffect(() => {
    if (!openActionMenuId) {
      return undefined;
    }

    const closeActionMenu = () => setOpenActionMenuId(null);
    document.addEventListener("click", closeActionMenu);
    return () => document.removeEventListener("click", closeActionMenu);
  }, [openActionMenuId]);

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

        <div className="mx-auto flex max-w-5xl flex-col px-5 py-6 pb-28 md:px-8 md:pb-12">
          <input
            className="sr-only"
            ref={fileInputRef}
            type="file"
            accept="application/pdf"
            multiple
            onChange={(event) => uploadFiles(event.target.files)}
          />

          <section className="flex flex-wrap items-end justify-between gap-4 py-6">
            <div className="flex min-w-72 flex-col gap-3">
              <p className="font-headline text-4xl font-black leading-tight text-on-surface">
                Document Processing
              </p>
              <p className="max-w-2xl text-base leading-normal text-secondary">
                Selecione documentos da sua biblioteca ou envie novos PDFs para consultar com IA.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <button
                className="flex h-12 items-center justify-center gap-2 rounded-xl bg-surface-container-high px-6 font-headline text-sm font-bold text-on-surface transition-colors hover:bg-surface-container-highest disabled:cursor-not-allowed disabled:opacity-70"
                type="button"
                disabled={isUploading}
                onClick={() => fileInputRef.current?.click()}
              >
                <Icon className="text-lg">add</Icon>
                {isUploading ? "Enviando..." : "Add New PDF"}
              </button>
              <button
                className="flex h-12 items-center justify-center gap-2 rounded-xl bg-surface-container-high px-6 font-headline text-sm font-bold text-on-surface transition-colors hover:bg-surface-container-highest disabled:cursor-not-allowed disabled:opacity-70"
                type="button"
                disabled={!selectedDocumentsCount || isExtracting}
                onClick={handleStartExtraction}
              >
                <Icon className="text-lg" fill>
                  play_arrow
                </Icon>
                {isExtracting ? "Extraindo..." : "Iniciar extracao"}
              </button>
              <button
                className="signature-gradient flex h-12 items-center justify-center gap-2 rounded-xl px-6 font-headline text-sm font-bold text-white shadow-lg transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                type="button"
                disabled={!selectedDocumentsCount}
                onClick={handleOpenSelectedInChat}
              >
                <Icon className="text-lg" fill>
                  smart_toy
                </Icon>
                Abrir selecionados no chat
              </button>
            </div>
          </section>

          <section className="grid gap-4 py-4 sm:grid-cols-3">
            <div className="flex min-w-[158px] flex-col gap-2 rounded-xl bg-surface-container-low p-6">
              <p className="text-sm font-medium leading-normal text-secondary">Total Documents</p>
              <p className="font-headline text-2xl font-bold leading-tight text-on-surface">
                {documents.length}
              </p>
            </div>
            <div className="flex min-w-[158px] flex-col gap-2 rounded-xl border border-primary/10 bg-primary-fixed p-6">
              <p className="text-sm font-medium leading-normal text-on-primary-fixed-variant">Selected</p>
              <p className="font-headline text-2xl font-bold leading-tight text-primary">
                {selectedDocumentsCount}
              </p>
            </div>
            <div className="flex min-w-[158px] flex-col gap-2 rounded-xl bg-surface-container-low p-6">
              <p className="text-sm font-medium leading-normal text-secondary">Active Tasks</p>
              <p className="font-headline text-2xl font-bold leading-tight text-on-surface">
                {activeTasksCount}
              </p>
            </div>
          </section>

          <section
            className="my-4 rounded-xl bg-surface-container-low p-6"
            onDragOver={(event) => event.preventDefault()}
            onDrop={(event) => {
              event.preventDefault();
              uploadFiles(event.dataTransfer.files);
            }}
          >
            <div className="mb-3 flex items-center justify-between gap-6">
              <div className="flex items-center gap-2">
                <Icon className="text-xl text-primary">pending_actions</Icon>
                <p className="font-headline text-base font-bold text-on-surface">Overall Extraction Status</p>
              </div>
              <p className="text-sm font-bold text-on-surface">{progressPercent}%</p>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-outline-variant/30">
              <div className="h-full rounded-full bg-primary" style={{ width: `${progressPercent}%` }} />
            </div>
            <div className="mt-3 flex justify-between gap-4">
              <p className="text-xs font-medium text-secondary">
                {extractedDocumentsCount} de {documents.length} documentos extraidos
              </p>
              <p className="text-xs font-bold uppercase text-primary">Live Monitoring</p>
            </div>
            {uploadStatus.message ? (
              <div
                className={`mt-4 flex items-start gap-3 rounded-lg border px-4 py-3 ${
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
            {extractionStatus.message ? (
              <div
                className={`mt-4 flex items-start gap-3 rounded-lg border px-4 py-3 ${
                  extractionStatus.type === "success"
                    ? "border-primary/20 bg-primary-fixed/50 text-primary"
                    : "border-error/20 bg-error/10 text-error"
                }`}
                role={extractionStatus.type === "success" ? "status" : "alert"}
              >
                <div
                  className={`mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full ${
                    extractionStatus.type === "success" ? "bg-primary/10" : "bg-error/10"
                  }`}
                >
                  <Icon className="text-lg">{extractionStatus.type === "success" ? "check_circle" : "error"}</Icon>
                </div>
                <div className="min-w-0">
                  <p className="font-headline text-sm font-bold">{extractionStatus.title}</p>
                  <p className="mt-0.5 text-sm text-on-surface-variant">{extractionStatus.message}</p>
                </div>
              </div>
            ) : null}
          </section>

          <section className="flex flex-col gap-4 py-4">
            <div className="flex flex-col gap-4 px-2 sm:flex-row sm:items-center sm:justify-between">
              <h2 className="font-headline text-[22px] font-bold leading-tight text-on-surface">
                Document Library
              </h2>
              <label className="flex h-10 w-full max-w-sm items-center gap-2 rounded-xl bg-surface-container-high px-4 text-secondary">
                <Icon className="text-lg">search</Icon>
                <input
                  className="min-w-0 flex-1 border-none bg-transparent p-0 text-sm text-on-surface placeholder:text-outline focus:ring-0"
                  placeholder="Search library..."
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
              <div className="rounded-xl bg-surface-container-lowest p-6 text-center text-sm font-medium text-on-surface-variant">
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
              <div className="space-y-3">
                {filteredDocuments.map((document) => (
                  <article
                    className={`relative flex items-center gap-4 overflow-visible rounded-xl bg-surface-container-lowest p-4 transition-all hover:shadow-sm ${
                      selectedDocumentIds.includes(document.id)
                        ? "border border-primary/10"
                        : "border border-transparent opacity-90 hover:opacity-100"
                    }`}
                    key={document.id}
                  >
                    {document.status === FILE_STATUS.EXTRACTING ? (
                      <div className="absolute bottom-0 left-0 h-1 w-full bg-primary/20">
                        <div className="h-full w-2/5 bg-primary" />
                      </div>
                    ) : null}
                    <div className="flex items-center justify-center">
                      <input
                        className="h-5 w-5 rounded border-outline bg-surface text-primary focus:ring-primary/20"
                        type="checkbox"
                        checked={selectedDocumentIds.includes(document.id)}
                        onChange={() => handleToggleDocument(document.id)}
                        aria-label={`Selecionar ${document.title}`}
                      />
                    </div>
                    <div
                      className={`flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl ${
                        document.status === FILE_STATUS.EXTRACTED
                          ? "bg-primary-fixed text-primary"
                          : document.status === FILE_STATUS.ERROR
                            ? "bg-error-container text-error"
                            : "bg-tertiary-fixed text-tertiary"
                      }`}
                    >
                      <Icon fill={document.status === FILE_STATUS.EXTRACTED}>
                        {document.status === FILE_STATUS.ERROR
                          ? "report"
                          : document.status === FILE_STATUS.EXTRACTED
                            ? "picture_as_pdf"
                            : "description"}
                      </Icon>
                    </div>
                    <button
                      className="min-w-0 flex-1 text-left"
                      type="button"
                      onClick={() => handleOpenDocument(document)}
                    >
                      <p className="truncate text-sm font-bold text-on-surface">{document.title}</p>
                      <p
                        className={`text-xs ${
                          document.status === FILE_STATUS.ERROR
                            ? "text-error"
                            : document.status === FILE_STATUS.EXTRACTED
                              ? "text-secondary"
                              : "text-primary"
                        }`}
                      >
                        {document.status === FILE_STATUS.EXTRACTED
                          ? document.meta
                          : document.status === FILE_STATUS.EXTRACTING
                            ? "Extracao em andamento"
                            : document.status === FILE_STATUS.ERROR
                              ? "Falha na extracao"
                              : "Aguardando inicio da extracao"}
                      </p>
                    </button>
                    <div className="hidden flex-col items-end gap-1 sm:flex">
                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${
                          document.status === FILE_STATUS.EXTRACTED
                            ? "bg-surface-container text-on-surface-variant"
                            : document.status === FILE_STATUS.ERROR
                              ? "bg-error-container text-on-error-container"
                              : "bg-primary-fixed text-primary"
                        }`}
                      >
                        {fileStatusLabels[document.status] ?? "Pendente"}
                      </span>
                    </div>
                    <div className="relative">
                      <button
                        className="flex h-9 w-9 items-center justify-center rounded-lg text-outline transition-colors hover:bg-surface-container-low hover:text-on-surface"
                        type="button"
                        aria-label={`Abrir menu de acoes de ${document.title}`}
                        aria-expanded={openActionMenuId === document.id}
                        onClick={(event) => {
                          event.stopPropagation();
                          setOpenActionMenuId((current) => (current === document.id ? null : document.id));
                        }}
                      >
                        <Icon>more_vert</Icon>
                      </button>
                      {openActionMenuId === document.id ? (
                        <div
                          className="absolute right-0 top-11 z-20 w-48 rounded-lg border border-outline-variant/20 bg-surface-container-lowest p-1 shadow-xl shadow-on-surface/10"
                          onClick={(event) => event.stopPropagation()}
                          onMouseLeave={() => setOpenActionMenuId(null)}
                        >
                          <button
                            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm font-semibold text-on-surface transition-colors hover:bg-surface-container-low"
                            type="button"
                            onClick={() => handleOpenDocument(document)}
                          >
                            <Icon className="text-lg">visibility</Icon>
                            Visualizar PDF
                          </button>
                        </div>
                      ) : null}
                    </div>
                  </article>
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
              <div className="rounded-xl border border-outline-variant/10 bg-surface-container-lowest p-8 text-center">
                <div className="mb-4 flex justify-center">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary-fixed text-primary">
                    <Icon className="text-4xl">upload_file</Icon>
                  </div>
                </div>
                <h4 className="mb-2 font-headline text-xl font-bold text-on-surface">Nenhum PDF enviado</h4>
                <p className="mx-auto mb-6 max-w-md text-sm text-secondary">
                  Envie seu primeiro PDF para ele aparecer na biblioteca.
                </p>
                <button
                  className="font-bold text-primary underline underline-offset-4"
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                >
                  Add New PDF
                </button>
              </div>
            )}
          </section>

          <footer className="mt-8 border-t border-outline-variant/10 px-4 py-10 text-center">
            <p className="text-xs font-bold uppercase text-outline">
              NextLevel Knowledge - Internal Intelligence Suite
            </p>
          </footer>
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
            <span className="text-[10px] font-bold uppercase">{label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}
