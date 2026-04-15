import { useEffect, useMemo, useRef, useState } from "react";
import { AppHeader } from "../components/AppHeader";
import { Icon } from "../components/Icon";
import { Sidebar } from "../components/Sidebar";
import { defaultChatMessages, getChatHistory, saveChatHistory } from "../services/chatCache";
import { askDocumentQuestion, listPdfFiles } from "../services/documents";

export function ChatPage({ goTo }) {
  const messagesEndRef = useRef(null);
  const [documents, setDocuments] = useState([]);
  const [selectedDocumentId, setSelectedDocumentId] = useState("");
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState(defaultChatMessages);
  const [isLoadingDocuments, setIsLoadingDocuments] = useState(true);
  const [documentsError, setDocumentsError] = useState("");
  const [isAsking, setIsAsking] = useState(false);

  const selectedDocument = useMemo(
    () => documents.find((document) => String(document.id) === selectedDocumentId),
    [documents, selectedDocumentId],
  );

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages]);

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
        if (isActive) {
          setDocuments(files);
          setSelectedDocumentId(files[0]?.id ? String(files[0].id) : "");
        }
      } catch (error) {
        if (isActive) {
          setDocumentsError(error instanceof Error ? error.message : "Nao foi possivel carregar seus PDFs.");
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

  const handleSubmit = async (event) => {
    event.preventDefault();
    const trimmedQuestion = question.trim();

    if (!trimmedQuestion || !selectedDocument) {
      return;
    }

    setIsAsking(true);
    setMessages((current) => [
      ...current,
      {
        role: "user",
        content: trimmedQuestion,
        documentName: selectedDocument.name,
      },
    ]);
    setQuestion("");

    try {
      const response = await askDocumentQuestion(selectedDocument.id, trimmedQuestion);
      setMessages((current) => [
        ...current,
        {
          role: "assistant",
          content: response.answer || "A IA nao retornou uma resposta para esta pergunta.",
        },
      ]);
    } catch (error) {
      setMessages((current) => [
        ...current,
        {
          role: "assistant",
          content: error instanceof Error ? error.message : "Nao foi possivel consultar a IA.",
        },
      ]);
    } finally {
      setIsAsking(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-on-surface">
      <Sidebar activeItem="chat" goTo={goTo} />
      <main className="min-h-screen md:ml-64">
        <AppHeader goTo={goTo} activeSection="documents" />

        <div className="mx-auto flex min-h-[calc(100vh-73px)] max-w-7xl flex-col px-5 py-8 md:px-8">
          <section className="mb-6">
            <h2 className="font-headline text-4xl font-extrabold tracking-tight text-on-surface">AI Chat</h2>
            <p className="mt-2 text-sm text-on-surface-variant">
              Selecione um PDF e envie perguntas sobre o conteudo do documento.
            </p>
          </section>

          <section className="mb-4 rounded-xl border border-outline-variant/20 bg-surface-container-lowest p-4">
            <label className="mb-2 block text-xs font-bold uppercase tracking-widest text-on-surface-variant" htmlFor="chat-document">
              Documento
            </label>
            <div className="relative">
              <Icon className="absolute left-4 top-1/2 -translate-y-1/2 text-xl text-outline">picture_as_pdf</Icon>
              <select
                className="w-full rounded-lg border-none bg-surface-container-low py-3 pl-12 pr-4 text-sm font-medium text-on-surface focus:bg-surface-container-lowest focus:ring-1 focus:ring-primary/40"
                id="chat-document"
                value={selectedDocumentId}
                onChange={(event) => setSelectedDocumentId(event.target.value)}
                disabled={isLoadingDocuments || Boolean(documentsError) || !documents.length}
              >
                {documents.length ? (
                  documents.map((document) => (
                    <option value={document.id} key={document.id}>
                      {document.name}
                    </option>
                  ))
                ) : (
                  <option value="">Nenhum PDF disponivel</option>
                )}
              </select>
            </div>
            {documentsError ? (
              <p className="mt-2 text-sm font-medium text-error">{documentsError}</p>
            ) : null}
          </section>

          <section className="flex min-h-[520px] flex-1 flex-col rounded-xl border border-outline-variant/20 bg-surface-container-lowest">
            <div className="max-h-[calc(100vh-360px)] min-h-[360px] flex-1 space-y-5 overflow-y-auto p-4">
              {messages.map((message, index) => (
                <div
                  className={`flex items-start gap-3 ${message.role === "user" ? "flex-row-reverse" : "flex-row"}`}
                  key={`${message.role}-${index}`}
                >
                  <div
                    className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full ${
                      message.role === "user" ? "bg-primary text-on-primary" : "bg-surface-container-high text-primary"
                    }`}
                    aria-label={message.role === "user" ? "Usuario" : "IA"}
                  >
                    <Icon className="text-lg">{message.role === "user" ? "person" : "smart_toy"}</Icon>
                  </div>
                  <div
                    className={`max-w-[80%] rounded-lg px-4 py-3 text-sm shadow-sm ${
                      message.role === "user"
                        ? "bg-primary text-on-primary"
                        : "border border-outline-variant/20 bg-surface-container-low text-on-surface"
                    }`}
                  >
                    <p className="mb-1 text-[10px] font-bold uppercase opacity-70">
                      {message.role === "user" ? "Voce" : "IA"}
                    </p>
                    {message.documentName ? (
                      <p className="mb-1 text-[10px] font-bold uppercase opacity-70">{message.documentName}</p>
                    ) : null}
                    <p>{message.content}</p>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            <form className="border-t border-outline-variant/10 p-4" onSubmit={handleSubmit}>
              <div className="flex flex-col gap-3 sm:flex-row">
                <input
                  className="min-h-12 flex-1 rounded-lg border-none bg-surface-container-low px-4 py-3 text-sm text-on-surface placeholder:text-on-surface-variant/50 focus:bg-surface-container-lowest focus:ring-1 focus:ring-primary/40"
                  placeholder="Digite sua pergunta sobre o PDF..."
                  type="text"
                  value={question}
                  onChange={(event) => setQuestion(event.target.value)}
                  disabled={isAsking || !selectedDocument || Boolean(documentsError)}
                />
                <button
                  className="signature-gradient rounded-lg px-6 py-3 text-sm font-bold text-white shadow-md transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                  type="submit"
                  disabled={isAsking || !question.trim() || !selectedDocument || Boolean(documentsError)}
                >
                  {isAsking ? "Consultando..." : "Enviar"}
                </button>
              </div>
            </form>
          </section>
        </div>
      </main>
    </div>
  );
}
