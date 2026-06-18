import { Icon } from "./Icon";

function formatScore(score) {
  if (score === undefined || score === null) {
    return null;
  }

  return `${Math.round(Number(score) * 100)}%`;
}

function getTraceStatus(trace) {
  if (trace?.status === "loading") {
    return {
      className: "border-[#35A9F6]/30 bg-[#35A9F6]/10 text-auth-primary",
      icon: "hourglass_top",
      label: "Buscando",
    };
  }

  if (trace?.status === "error") {
    return {
      className: "border-red-400/20 bg-red-500/10 text-red-100",
      icon: "error",
      label: "Erro",
    };
  }

  return {
    className: "border-emerald-400/20 bg-emerald-500/10 text-emerald-100",
    icon: "check_circle",
    label: "Concluído",
  };
}

export function EvidencePanel({ trace, selectedDocument }) {
  const hasDocument = Boolean(selectedDocument);
  const hasTrace = Boolean(trace);
  const traceStatus = getTraceStatus(trace);

  return (
    <aside className="auth-glass-panel flex h-[calc(100vh-220px)] min-h-[620px] flex-col overflow-hidden rounded-2xl border border-auth-outline-variant/40 bg-auth-surface-container-low shadow-2xl shadow-black/25">
      <header className="border-b border-white/10 px-5 py-4">
        <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-[#35A9F6]/10 text-auth-primary">
          <Icon className="text-xl">travel_explore</Icon>
        </div>

        <p className="text-xs font-bold uppercase tracking-[0.22em] text-auth-primary">
          Evidências
        </p>

        <h3 className="mt-1 text-lg font-bold text-auth-on-surface">
          Busca no documento
        </h3>

        <p className="mt-2 text-xs leading-5 text-auth-on-surface-variant">
          Acompanhe os trechos usados para gerar a resposta.
        </p>
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto p-5 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-white/10">
        {!hasDocument ? (
          <div className="flex min-h-72 flex-col items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] p-5 text-center">
            <Icon className="mb-3 text-3xl text-auth-primary">picture_as_pdf</Icon>

            <p className="text-sm font-bold text-auth-on-surface">
              Nenhum PDF selecionado
            </p>

            <p className="mt-2 text-xs leading-5 text-auth-on-surface-variant">
              Escolha um documento para visualizar as evidências.
            </p>
          </div>
        ) : null}

        {hasDocument && !hasTrace ? (
          <div className="flex min-h-72 flex-col items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] p-5 text-center">
            <Icon className="mb-3 text-3xl text-auth-primary">manage_search</Icon>

            <p className="text-sm font-bold text-auth-on-surface">
              Aguardando pergunta
            </p>

            <p className="mt-2 text-xs leading-5 text-auth-on-surface-variant">
              Envie uma pergunta para ver os trechos recuperados.
            </p>
          </div>
        ) : null}

        {hasDocument && hasTrace ? (
          <div className="mb-4 space-y-3">
            <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
              <div className="mb-3 flex items-center justify-between gap-3">
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-auth-on-surface-variant">
                  Consulta
                </p>

                <span
                  className={`inline-flex items-center gap-1 rounded-full border px-2 py-1 text-[10px] font-bold uppercase tracking-[0.14em] ${traceStatus.className}`}
                >
                  <Icon className="text-sm">{traceStatus.icon}</Icon>
                  {traceStatus.label}
                </span>
              </div>

              <p className="text-sm font-semibold leading-5 text-auth-on-surface">
                {trace.question}
              </p>

              {trace.query ? (
                <p className="mt-3 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-xs leading-5 text-auth-on-surface-variant">
                  {trace.query}
                </p>
              ) : null}
            </div>

            {trace.steps?.length ? (
              <div className="space-y-2">
                <p className="px-1 text-[10px] font-bold uppercase tracking-[0.18em] text-auth-on-surface-variant">
                  Pipeline
                </p>

                {trace.steps.map((step, index) => (
                  <div
                    className="flex gap-3 rounded-2xl border border-white/10 bg-white/[0.04] p-3"
                    key={`${step.label}-${index}`}
                  >
                    <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full border border-[#35A9F6]/25 bg-[#35A9F6]/10 text-[11px] font-bold text-auth-primary">
                      {index + 1}
                    </div>

                    <div className="min-w-0">
                      <p className="text-xs font-bold text-auth-on-surface">{step.label}</p>
                      <p className="mt-1 text-xs leading-5 text-auth-on-surface-variant">
                        {step.detail}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : null}
          </div>
        ) : null}

        {trace?.status === "loading" && !trace.sources?.length ? (
          <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 text-sm text-auth-on-surface-variant">
            Recuperando trechos do documento...
          </div>
        ) : null}

        {trace?.sources?.length ? (
          <div className="space-y-3">
            <p className="px-1 text-[10px] font-bold uppercase tracking-[0.18em] text-auth-on-surface-variant">
              Trechos recuperados
            </p>

            {trace.sources.map((source, index) => {
              const score = formatScore(source.score);

              return (
                <article
                  className="rounded-2xl border border-white/10 bg-white/[0.04] p-4"
                  key={`${source.page}-${index}`}
                >
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <span className="rounded-full border border-white/10 bg-white/[0.06] px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-auth-primary">
                      Página {source.page || "—"}
                    </span>

                    {score ? (
                      <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-auth-on-surface-variant">
                        {score}
                      </span>
                    ) : null}
                  </div>

                  <p className="line-clamp-4 text-xs leading-5 text-auth-on-surface-variant">
                    {source.excerpt}
                  </p>
                </article>
              );
            })}
          </div>
        ) : null}

        {trace?.error ? (
          <div className="rounded-2xl border border-red-400/20 bg-red-500/10 p-4 text-sm font-medium text-red-100">
            {trace.error}
          </div>
        ) : null}
      </div>
    </aside>
  );
}
