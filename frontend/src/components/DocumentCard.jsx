import { Icon } from "./Icon";

export function DocumentCard({ doc, onOpen }) {
  return (
    <article className="group rounded-xl border border-outline-variant/20 bg-surface-container-lowest p-5 transition-all hover:border-primary/30 hover:shadow-sm">
      <div className="mb-4 flex items-start gap-4">
        <div className="flex h-16 w-12 flex-shrink-0 items-center justify-center overflow-hidden rounded border border-outline-variant/10 bg-surface-container-low">
          {doc.thumbnail ? (
            <img alt="" className="h-full w-full object-cover opacity-80" src={doc.thumbnail} />
          ) : (
            <Icon className="text-slate-400">{doc.icon || "picture_as_pdf"}</Icon>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <h4 className="truncate font-bold text-on-surface transition-colors group-hover:text-primary">{doc.title}</h4>
          <p className="mt-1 text-xs text-on-surface-variant">{doc.meta}</p>
          {doc.status ? (
            <div className="mt-2 flex items-center gap-1">
              <Icon className="text-[12px] text-green-600" fill>
                verified
              </Icon>
              <span className="text-[10px] font-bold uppercase text-green-700">{doc.status}</span>
            </div>
          ) : (
            <div className="mt-2 flex gap-1.5">
              {(doc.chips || ["PDF"]).map((chip) => (
                <span
                  className="rounded bg-surface-container-high px-1.5 py-0.5 text-[10px] font-medium text-on-surface-variant"
                  key={chip}
                >
                  {chip}
                </span>
              ))}
            </div>
          )}
        </div>
        <button className="text-on-surface-variant hover:text-on-surface" type="button" aria-label="Mais acoes">
          <Icon className="text-xl">more_vert</Icon>
        </button>
      </div>
      <div className="flex items-center justify-between border-t border-outline-variant/10 pt-3">
        <button className="text-xs font-bold text-primary hover:underline" type="button" onClick={() => onOpen?.(doc)}>
          {doc.action || "Abrir documento"}
        </button>
        <button
          className="text-on-surface-variant transition-colors hover:text-primary"
          type="button"
          aria-label="Abrir"
          onClick={() => onOpen?.(doc)}
        >
          <Icon className="text-lg">chat</Icon>
        </button>
      </div>
    </article>
  );
}
