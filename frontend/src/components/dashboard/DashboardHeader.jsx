import { Icon } from "../Icon";

export function DashboardHeader({ isUploading, onUploadClick }) {
  return (
    <section className="mb-7 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
      <div>
        <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.06] px-3 py-1.5 text-xs font-bold uppercase tracking-[0.2em] text-auth-primary shadow-lg shadow-black/10">
          <Icon className="text-base">folder_open</Icon>
          Document Intelligence
        </div>

        <h1 className="font-headline text-3xl font-extrabold tracking-tight text-auth-on-surface md:text-4xl">
          Biblioteca de documentos
        </h1>

        <p className="mt-2 max-w-2xl text-sm leading-6 text-auth-on-surface-variant">
          Envie PDFs com uma breve descrição e acompanhe automaticamente o status de processamento.
        </p>
      </div>

      <button
        className="auth-glow-button inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#35A9F6] via-[#2A76DA] to-[#7D7BF2] px-6 py-3 text-sm font-bold text-white shadow-lg shadow-[#35A9F6]/20 transition hover:-translate-y-0.5 hover:shadow-[#7D7BF2]/25 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
        type="button"
        disabled={isUploading}
        onClick={onUploadClick}
      >
        <Icon className="text-xl">upload_file</Icon>
        {isUploading ? "Enviando..." : "Enviar PDF"}
      </button>
    </section>
  );
}
