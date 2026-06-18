import { useEffect, useMemo, useRef, useState } from "react";
import { AppLayout } from "../components/AppLayout";
import { ChatConversation } from "../components/chat/ChatConversation";
import { DocumentPickerModal } from "../components/DocumentPickerModal";
import { EvidencePanel } from "../components/EvidencePanel";
import { Icon } from "../components/Icon";
import { defaultChatMessages, getChatHistory, saveChatHistory } from "../services/chatCache";
import { askDocumentQuestion, listPdfFiles } from "../services/documents";
import {
  buildFallbackEvidenceTrace,
  buildLoadingEvidenceTrace,
  normalizeEvidenceTrace,
} from "../utils/evidenceTrace";

export function ChatPage({ goTo }) {
  const messagesEndRef = useRef(null);

  const [documents, setDocuments] = useState([]);
  const [selectedDocumentId, setSelectedDocumentId] = useState("");
  const [isDocumentPickerOpen, setIsDocumentPickerOpen] = useState(false);

  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState(defaultChatMessages);

  const [isLoadingDocuments, setIsLoadingDocuments] = useState(true);
  const [documentsError, setDocumentsError] = useState("");
  const [isAsking, setIsAsking] = useState(false);
  const [evidenceTrace, setEvidenceTrace] = useState(null);

  const selectedDocument = useMemo(
    () => documents.find((document) => String(document.id) === String(selectedDocumentId)),
    [documents, selectedDocumentId],
  );

  const isChatDisabled = isAsking || !selectedDocument || Boolean(documentsError);
  const canSubmit = Boolean(question.trim()) && !isChatDisabled;

  useEffect(() => {
    requestAnimationFrame(() => {
      messagesEndRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "end",
      });
    });
  }, [messages, isAsking]);

  useEffect(() => {
    if (!selectedDocumentId) {
      setMessages(defaultChatMessages);
      return;
    }

    setMessages(getChatHistory(selectedDocumentId));
  }, [selectedDocumentId]);

  useEffect(() => {
    if (selectedDocumentId) {
      saveChatHistory(selectedDocumentId, messages);
    }
  }, [messages, selectedDocumentId]);

  useEffect(() => {
    let isActive = true;

    async function loadDocuments() {
      setIsLoadingDocuments(true);
      setDocumentsError("");

      try {
        const files = await listPdfFiles();

        if (!isActive) {
          return;
        }

        const preferredDocumentId = window.sessionStorage.getItem("selected_chat_document_id");
        const preferredDocument = files.find(
          (file) => String(file.id) === String(preferredDocumentId),
        );

        setDocuments(files);
        setSelectedDocumentId(preferredDocument ? String(preferredDocument.id) : "");
        window.sessionStorage.removeItem("selected_chat_document_id");
      } catch (error) {
        if (isActive) {
          setDocumentsError(
            error instanceof Error ? error.message : "Não foi possível carregar seus PDFs.",
          );
        }
      } finally {
        if (isActive) {
          setIsLoadingDocuments(false);
        }
      }
    }

    loadDocuments();

    return () => {
      isActive = false;
    };
  }, []);

  const handleSelectDocument = (document) => {
    setSelectedDocumentId(String(document.id));
    setEvidenceTrace(null);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const trimmedQuestion = question.trim();

    if (!trimmedQuestion || !selectedDocument) {
      return;
    }

    const loadingTrace = buildLoadingEvidenceTrace({
      document: selectedDocument,
      question: trimmedQuestion,
    });

    setIsAsking(true);
    setQuestion("");
    setEvidenceTrace(loadingTrace);

    setMessages((current) => [
      ...current,
      {
        content: trimmedQuestion,
        documentName: selectedDocument.name,
        role: "user",
      },
    ]);

    try {
      const response = await askDocumentQuestion(selectedDocument.id, trimmedQuestion);

      const fallbackTrace = buildFallbackEvidenceTrace({
        document: selectedDocument,
        question: trimmedQuestion,
      });

      setEvidenceTrace(normalizeEvidenceTrace(response, fallbackTrace));

      setMessages((current) => [
        ...current,
        {
          content: response.answer || "A IA não retornou uma resposta para esta pergunta.",
          role: "assistant",
        },
      ]);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Não foi possível consultar a IA.";

      setEvidenceTrace({
        ...loadingTrace,
        error: errorMessage,
        query: trimmedQuestion,
        status: "error",
      });

      setMessages((current) => [
        ...current,
        {
          content: errorMessage,
          role: "assistant",
        },
      ]);
    } finally {
      setIsAsking(false);
    }
  };

  return (
    <AppLayout activeItem="chat" goTo={goTo}>
      <div className="mx-auto flex min-h-[calc(100vh-73px)] max-w-[1180px] flex-col px-5 py-8 md:px-8">
        <section className="mb-6">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.06] px-3 py-1.5 text-xs font-bold uppercase tracking-[0.2em] text-auth-primary shadow-lg shadow-black/10">
            <Icon className="text-base">auto_awesome</Icon>
            AI Document Intelligence
          </div>
        </section>

        <div className="grid min-h-0 flex-1 gap-5 lg:grid-cols-[320px_minmax(0,1fr)]">
          <EvidencePanel trace={evidenceTrace} selectedDocument={selectedDocument} />

          <ChatConversation
            canSubmit={canSubmit}
            documentsError={documentsError}
            isAsking={isAsking}
            isChatDisabled={isChatDisabled}
            isLoadingDocuments={isLoadingDocuments}
            messages={messages}
            messagesEndRef={messagesEndRef}
            onOpenDocumentPicker={() => setIsDocumentPickerOpen(true)}
            onQuestionChange={setQuestion}
            onSubmit={handleSubmit}
            question={question}
            selectedDocument={selectedDocument}
          />
        </div>
      </div>

      <DocumentPickerModal
        isOpen={isDocumentPickerOpen}
        onClose={() => setIsDocumentPickerOpen(false)}
        documents={documents}
        selectedDocumentId={selectedDocumentId}
        onSelectDocument={handleSelectDocument}
        isLoading={isLoadingDocuments}
        error={documentsError}
      />
    </AppLayout>
  );
}
