import { useCallback, useEffect, useRef, useState } from "react";
import { AppLayout } from "../components/AppLayout";
import { DashboardHeader } from "../components/dashboard/DashboardHeader";
import { DocumentSearch } from "../components/dashboard/DocumentSearch";
import { DocumentsList } from "../components/dashboard/DocumentsList";
import { DocumentUploadPanel } from "../components/dashboard/DocumentUploadPanel";
import { StatusWidget } from "../components/dashboard/StatusWidget";
import { documentViewerRoute, ROUTES } from "../routes";
import {
  deletePdfFile,
  listPdfFiles,
  startDocumentExtraction,
  uploadPdfFiles,
} from "../services/documents";
import {
  getDocumentStatusCounts,
  mapFileToDocument,
} from "../utils/documentStatus";

const DOCUMENTS_PAGE_SIZE = 9;

const emptyPagination = {
  hasNextPage: false,
  hasPreviousPage: false,
  limit: DOCUMENTS_PAGE_SIZE,
  page: 1,
  total: 0,
  totalPages: 1,
};

const statusWidgets = [
  {
    description: "Aguardando início do processamento.",
    icon: "pending_actions",
    label: "Documentos em fila",
    valueKey: "queued",
  },
  {
    description: "Documentos com extração em andamento.",
    icon: "autorenew",
    label: "Processando",
    valueKey: "processing",
  },
  {
    description: "Documentos prontos para consulta com IA.",
    icon: "task_alt",
    label: "Finalizados",
    valueKey: "finished",
  },
];

function getUploadedFileId(uploadedFile) {
  return uploadedFile?.id ?? uploadedFile?.fileId ?? uploadedFile?.documentId;
}

export function DashboardPage({ goTo }) {
  const fileInputRef = useRef(null);

  const [uploadStatus, setUploadStatus] = useState({
    message: "",
    title: "",
    type: "",
  });

  const [uploadDescription, setUploadDescription] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  const [documents, setDocuments] = useState([]);
  const [isLoadingDocuments, setIsLoadingDocuments] = useState(true);
  const [documentsError, setDocumentsError] = useState("");
  const [deletingDocumentId, setDeletingDocumentId] = useState(null);
  const [documentsPage, setDocumentsPage] = useState(1);
  const [documentsPagination, setDocumentsPagination] = useState(emptyPagination);
  const [statusCounts, setStatusCounts] = useState(getDocumentStatusCounts([]));
  const [searchTerm, setSearchTerm] = useState("");

  const documentCounts = statusCounts;
  const shouldPollDocuments =
    documentCounts.queued > 0 || documentCounts.processing > 0;

  const loadDocuments = useCallback(async ({ silent = false } = {}) => {
    if (!silent) {
      setIsLoadingDocuments(true);
    }
    setDocumentsError("");

    try {
      const response = await listPdfFiles({
        limit: DOCUMENTS_PAGE_SIZE,
        page: documentsPage,
        search: searchTerm.trim() || undefined,
      });
      const files = Array.isArray(response) ? response : response.items || [];
      const mappedDocuments = files.map(mapFileToDocument);

      setDocuments(mappedDocuments);

      if (Array.isArray(response)) {
        setDocumentsPagination({
          ...emptyPagination,
          total: mappedDocuments.length,
          totalPages: 1,
        });
        setStatusCounts(getDocumentStatusCounts(mappedDocuments));
      } else {
        setDocumentsPagination(response.pagination || emptyPagination);
        setStatusCounts(response.statusCounts || getDocumentStatusCounts(mappedDocuments));
      }
    } catch (error) {
      setDocumentsError(
        error instanceof Error ? error.message : "Não foi possível carregar seus PDFs.",
      );
    } finally {
      if (!silent) {
        setIsLoadingDocuments(false);
      }
    }
  }, [documentsPage, searchTerm]);

  useEffect(() => {
    loadDocuments();
  }, [loadDocuments]);

  useEffect(() => {
    if (!shouldPollDocuments) {
      return undefined;
    }

    const intervalId = window.setInterval(() => {
      loadDocuments({ silent: true });
    }, 4000);

    return () => window.clearInterval(intervalId);
  }, [loadDocuments, shouldPollDocuments]);

  const clearFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleOpenDocument = (document) => {
    goTo(documentViewerRoute(document.id));
  };

  const handleOpenInChat = (document) => {
    window.sessionStorage.setItem("selected_chat_document_id", String(document.id));
    goTo(ROUTES.chat);
  };

  const handleDeleteDocument = async (document) => {
    const confirmed = window.confirm(
      `Excluir "${document.title}"? Esta ação remove o PDF da biblioteca.`,
    );

    if (!confirmed) {
      return;
    }

    setDeletingDocumentId(document.id);
    setUploadStatus({ message: "", title: "", type: "" });

    try {
      await deletePdfFile(document.id);
      setUploadStatus({
        message: "PDF excluído da biblioteca.",
        title: "Documento excluído",
        type: "success",
      });

      if (documents.length === 1 && documentsPagination.page > 1) {
        setDocumentsPage((current) => Math.max(1, current - 1));
      } else {
        await loadDocuments({ silent: true });
      }
    } catch (error) {
      setUploadStatus({
        message: error instanceof Error ? error.message : "Não foi possível excluir o PDF.",
        title: "Falha ao excluir",
        type: "error",
      });
    } finally {
      setDeletingDocumentId(null);
    }
  };

  const startUploadedFilesExtraction = async (uploadedFiles) => {
    const uploadedFileIds = uploadedFiles.map(getUploadedFileId).filter(Boolean);

    if (!uploadedFileIds.length) {
      return { failed: 0, started: 0 };
    }

    const results = await Promise.allSettled(
      uploadedFileIds.map((documentId) => startDocumentExtraction(documentId)),
    );

    return {
      failed: results.filter((result) => result.status === "rejected").length,
      started: results.filter((result) => result.status === "fulfilled").length,
    };
  };

  const uploadFiles = async (files) => {
    const selectedFiles = Array.from(files || []);
    const trimmedDescription = uploadDescription.trim();

    if (!selectedFiles.length) {
      return;
    }

    if (!trimmedDescription) {
      setUploadStatus({
        message: "Informe uma breve descrição antes de enviar o PDF.",
        title: "Descrição obrigatória",
        type: "error",
      });

      clearFileInput();
      return;
    }

    const invalidFile = selectedFiles.find((file) => file.type !== "application/pdf");

    if (invalidFile) {
      setUploadStatus({
        message: "Envie apenas arquivos PDF.",
        title: "Upload recusado",
        type: "error",
      });

      clearFileInput();
      return;
    }

    setIsUploading(true);
    setUploadStatus({ message: "", title: "", type: "" });

    try {
      const uploadedFiles = await uploadPdfFiles(selectedFiles, {
        description: trimmedDescription,
      });
      const uploadedFileList = Array.isArray(uploadedFiles) ? uploadedFiles : [];
      const extractionResult = await startUploadedFilesExtraction(uploadedFileList);

      const totalFiles = uploadedFileList.length || selectedFiles.length;
      const failedExtractions = extractionResult.failed;

      setUploadStatus({
        message:
          failedExtractions > 0
            ? `${totalFiles} PDF(s) enviado(s), mas ${failedExtractions} não iniciaram a extração. Verifique o status na biblioteca.`
            : totalFiles === 1
              ? "PDF enviado com sucesso. A extração foi iniciada e o status será atualizado automaticamente."
              : `${totalFiles} PDFs enviados com sucesso. A extração foi iniciada e os status serão atualizados automaticamente.`,
        title: "Upload concluído",
        type: failedExtractions > 0 ? "error" : "success",
      });

      setUploadDescription("");

      if (documentsPage !== 1) {
        setDocumentsPage(1);
      } else {
        await loadDocuments();
      }
    } catch (error) {
      setUploadStatus({
        message: error instanceof Error ? error.message : "Não foi possível enviar o arquivo.",
        title: "Falha no upload",
        type: "error",
      });
    } finally {
      setIsUploading(false);
      clearFileInput();
    }
  };

  return (
    <AppLayout activeItem="library" goTo={goTo}>
      <div className="mx-auto flex max-w-[1180px] flex-col px-5 py-8 pb-28 md:px-8 md:pb-12">
        <input
          className="sr-only"
          ref={fileInputRef}
          type="file"
          accept="application/pdf"
          multiple
          onChange={(event) => uploadFiles(event.target.files)}
        />

        <DashboardHeader
          isUploading={isUploading}
          onUploadClick={() => fileInputRef.current?.click()}
        />

        <section className="mb-6 grid gap-4 md:grid-cols-3">
          {statusWidgets.map((widget) => (
            <StatusWidget
              description={widget.description}
              icon={widget.icon}
              key={widget.valueKey}
              label={widget.label}
              value={documentCounts[widget.valueKey]}
            />
          ))}
        </section>

        <DocumentUploadPanel
          description={uploadDescription}
          isUploading={isUploading}
          onDescriptionChange={setUploadDescription}
          onDropFiles={uploadFiles}
          status={uploadStatus}
        />

        <section className="flex flex-col gap-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="font-headline text-2xl font-bold text-auth-on-surface">
                PDFs enviados
              </h2>

              <p className="mt-1 text-sm text-auth-on-surface-variant">
                Cada documento aparece como um card com descrição e status atual.
              </p>
            </div>

            <DocumentSearch
              onClear={() => {
                setSearchTerm("");
                setDocumentsPage(1);
              }}
              onSearchChange={(value) => {
                setSearchTerm(value);
                setDocumentsPage(1);
              }}
              searchTerm={searchTerm}
            />
          </div>

          <DocumentsList
            deletingDocumentId={deletingDocumentId}
            documents={documents}
            error={documentsError}
            filteredDocuments={documents}
            isLoading={isLoadingDocuments}
            isSearching={Boolean(searchTerm.trim())}
            onDeleteDocument={handleDeleteDocument}
            onOpenDocument={handleOpenDocument}
            onOpenInChat={handleOpenInChat}
            onPageChange={setDocumentsPage}
            onUploadFirst={() => fileInputRef.current?.click()}
            pagination={documentsPagination}
          />
        </section>

        <footer className="mt-10 border-t border-white/10 px-4 py-8 text-center">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-auth-on-surface-variant">
            NextLevel Knowledge — Internal Intelligence Suite
          </p>
        </footer>
      </div>
    </AppLayout>
  );
}
