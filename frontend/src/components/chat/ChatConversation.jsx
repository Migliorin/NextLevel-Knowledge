import { ChatBubble } from "./ChatBubble";
import { ChatComposer } from "./ChatComposer";
import { ChatDocumentSelectorButton } from "./ChatDocumentSelectorButton";
import { LoadingBubble } from "./LoadingBubble";

export function ChatConversation({
  canSubmit,
  documentsError,
  isAsking,
  isChatDisabled,
  isLoadingDocuments,
  messages,
  messagesEndRef,
  onOpenDocumentPicker,
  onQuestionChange,
  onSubmit,
  question,
  selectedDocument,
}) {
  return (
    <section className="auth-glass-panel flex h-[calc(100vh-220px)] min-h-[620px] flex-1 flex-col overflow-hidden rounded-2xl border border-auth-outline-variant/40 bg-auth-surface-container-low shadow-2xl shadow-black/25">
      <header className="flex flex-col gap-4 border-b border-white/10 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-auth-primary">
            Conversa inteligente
          </p>

          <h3 className="mt-1 text-lg font-bold text-auth-on-surface">
            Pergunte ao relatório
          </h3>
        </div>

        <ChatDocumentSelectorButton
          isLoading={isLoadingDocuments}
          onClick={onOpenDocumentPicker}
          selectedDocument={selectedDocument}
        />
      </header>

      <div className="min-h-0 flex-1 space-y-5 overflow-y-auto px-5 py-5 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-white/10">
        {messages.map((message, index) => (
          <ChatBubble
            message={message}
            key={`${message.role}-${index}-${message.content.slice(0, 16)}`}
          />
        ))}

        {isAsking ? <LoadingBubble /> : null}

        <div ref={messagesEndRef} />
      </div>

      <ChatComposer
        canSubmit={canSubmit}
        documentsError={documentsError}
        isAsking={isAsking}
        isChatDisabled={isChatDisabled}
        onQuestionChange={onQuestionChange}
        onSubmit={onSubmit}
        question={question}
        selectedDocument={selectedDocument}
      />
    </section>
  );
}
