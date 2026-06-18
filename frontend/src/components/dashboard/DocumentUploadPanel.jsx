import { Icon } from "../Icon";

function UploadStatusMessage({ status }) {
  if (!status.message) {
    return null;
  }

  const isSuccess = status.type === "success";

  return (
    <div
      className={`mt-4 flex items-start gap-3 rounded-2xl border px-4 py-3 ${
        isSuccess
          ? "border-emerald-400/20 bg-emerald-500/10 text-emerald-100"
          : "border-red-400/20 bg-red-500/10 text-red-100"
      }`}
      role={isSuccess ? "status" : "alert"}
    >
      <div className="mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-white/[0.06]">
        <Icon className="text-lg">{isSuccess ? "check_circle" : "error"}</Icon>
      </div>

      <div className="min-w-0">
        <p className="text-sm font-bold">{status.title}</p>
        <p className="mt-0.5 text-sm opacity-80">{status.message}</p>
      </div>
    </div>
  );
}

export function DocumentUploadPanel({
  description,
  isUploading,
  onDescriptionChange,
  onDropFiles,
  status,
}) {
  return (
    <section
      className="auth-glass-panel mb-7 rounded-2xl border border-auth-outline-variant/40 bg-auth-surface-container-low p-5 shadow-2xl shadow-black/20"
      onDragOver={(event) => event.preventDefault()}
      onDrop={(event) => {
        event.preventDefault();
        onDropFiles(event.dataTransfer.files);
      }}
    >
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_260px] lg:items-end">
        <label className="block">
          <span className="mb-2 block text-xs font-bold uppercase tracking-[0.2em] text-auth-on-surface-variant">
            Descrição do documento
          </span>

          <textarea
            className="min-h-24 w-full resize-none rounded-2xl border border-white/10 bg-white/[0.07] px-4 py-3 text-sm leading-6 text-auth-on-surface outline-none transition placeholder:text-auth-on-surface-variant/60 focus:border-[#35A9F6]/60 focus:bg-white/[0.1] focus:ring-2 focus:ring-[#35A9F6]/20"
            placeholder="Exemplo: Relatório financeiro do Q2 com receita, custos, margem e projeções."
            value={description}
            onChange={(event) => onDescriptionChange(event.target.value)}
            disabled={isUploading}
          />
        </label>

        <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
          <div className="mb-2 flex items-center gap-2 text-auth-primary">
            <Icon className="text-xl">info</Icon>
            <p className="text-sm font-bold">Como funciona</p>
          </div>

          <p className="text-xs leading-5 text-auth-on-surface-variant">
            A descrição será exibida no card do PDF e ajuda o usuário a identificar o conteúdo antes de abrir o chat.
          </p>
        </div>
      </div>

      <UploadStatusMessage status={status} />
    </section>
  );
}
