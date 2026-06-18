import { Icon } from "../Icon";

export function ChatBubble({ message }) {
  const isUser = message.role === "user";

  return (
    <div className={`flex items-start gap-3 ${isUser ? "flex-row-reverse" : "flex-row"}`}>
      <div
        className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-2xl border shadow-lg ${
          isUser
            ? "border-white/20 bg-gradient-to-br from-[#35A9F6] to-[#7D7BF2] text-white shadow-[#35A9F6]/20"
            : "border-white/10 bg-white/[0.07] text-auth-primary shadow-black/20"
        }`}
        aria-label={isUser ? "Usuário" : "IA"}
      >
        <Icon className="text-xl">{isUser ? "person" : "smart_toy"}</Icon>
      </div>

      <div
        className={`max-w-[82%] rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-lg ${
          isUser
            ? "rounded-tr-md bg-gradient-to-br from-[#2A76DA] to-[#7D7BF2] text-white shadow-[#2A76DA]/20"
            : "rounded-tl-md border border-white/10 bg-white/[0.06] text-auth-on-surface shadow-black/20"
        }`}
      >
        <div className="mb-2 flex flex-wrap items-center gap-2">
          <span className="text-[10px] font-bold uppercase tracking-[0.22em] opacity-70">
            {isUser ? "Você" : "NextLevel AI"}
          </span>

          {message.documentName ? (
            <span className="max-w-[220px] truncate rounded-full border border-white/10 bg-white/[0.08] px-2 py-0.5 text-[10px] font-semibold text-white/75">
              {message.documentName}
            </span>
          ) : null}
        </div>

        <p className="whitespace-pre-wrap">{message.content}</p>
      </div>
    </div>
  );
}
