import { Icon } from "../Icon";

export function ChatComposer({
  canSubmit,
  documentsError,
  isAsking,
  isChatDisabled,
  onQuestionChange,
  onSubmit,
  question,
  selectedDocument,
}) {
  return (
    <form className="border-t border-white/10 bg-black/10 p-4" onSubmit={onSubmit}>
      {!selectedDocument ? (
        <div className="mb-3 flex items-center gap-2 rounded-xl border border-[#35A9F6]/20 bg-[#35A9F6]/10 px-4 py-3 text-sm text-auth-on-surface-variant">
          <Icon className="text-xl text-auth-primary">info</Icon>
          <span>Selecione um PDF antes de enviar perguntas.</span>
        </div>
      ) : null}

      {documentsError ? (
        <div className="mb-3 rounded-xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm font-medium text-red-100">
          {documentsError}
        </div>
      ) : null}

      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Icon className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-xl text-auth-primary">
            chat_bubble
          </Icon>

          <input
            className="min-h-12 w-full rounded-xl border border-white/10 bg-white/[0.07] px-4 py-3 pl-12 text-sm text-auth-on-surface outline-none transition placeholder:text-auth-on-surface-variant/60 focus:border-[#35A9F6]/60 focus:bg-white/[0.1] focus:ring-2 focus:ring-[#35A9F6]/20 disabled:cursor-not-allowed disabled:opacity-60"
            placeholder={
              selectedDocument
                ? "Digite sua pergunta sobre o PDF..."
                : "Selecione um PDF para começar..."
            }
            type="text"
            value={question}
            onChange={(event) => onQuestionChange(event.target.value)}
            disabled={isChatDisabled}
          />
        </div>

        <button
          className="auth-glow-button inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#35A9F6] via-[#2A76DA] to-[#7D7BF2] px-6 py-3 text-sm font-bold text-white shadow-lg shadow-[#35A9F6]/20 transition hover:-translate-y-0.5 hover:shadow-[#7D7BF2]/25 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
          type="submit"
          disabled={!canSubmit}
        >
          <span>{isAsking ? "Consultando..." : "Enviar"}</span>
          <Icon className="text-xl">{isAsking ? "hourglass_top" : "send"}</Icon>
        </button>
      </div>
    </form>
  );
}
