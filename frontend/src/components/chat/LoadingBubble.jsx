import { Icon } from "../Icon";

export function LoadingBubble() {
  return (
    <div className="flex items-start gap-3" role="status" aria-live="polite">
      <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.07] text-auth-primary shadow-lg shadow-black/20">
        <Icon className="text-xl">auto_awesome</Icon>
      </div>

      <div className="rounded-2xl rounded-tl-md border border-white/10 bg-white/[0.06] px-4 py-3 text-sm text-auth-on-surface-variant shadow-lg shadow-black/20">
        <div className="mb-2 text-[10px] font-bold uppercase tracking-[0.22em] text-auth-primary">
          Processando
        </div>
        <p>Analisando o PDF e preparando a resposta...</p>
      </div>
    </div>
  );
}
