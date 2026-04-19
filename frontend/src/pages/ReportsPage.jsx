import { useEffect, useMemo, useState } from "react";
import { AppHeader } from "../components/AppHeader";
import { Icon } from "../components/Icon";
import { Sidebar } from "../components/Sidebar";
import { listPdfFiles } from "../services/documents";

const reportTypes = [
  ["executive", "Resumo executivo"],
  ["comparative", "Comparativo entre documentos"],
  ["technical", "Relatório técnico"],
  ["insights", "Principais insights"],
];

export function ReportsPage({ goTo }) {
  const [documents, setDocuments] = useState([]);
  const [selectedDocumentIds, setSelectedDocumentIds] = useState([]);
  const [reportType, setReportType] = useState("executive");
  const [objective, setObjective] = useState("");
  const [isLoadingDocuments, setIsLoadingDocuments] = useState(true);
  const [documentsError, setDocumentsError] = useState("");

  const selectedDocuments = useMemo(
    () => documents.filter((document) => selectedDocumentIds.includes(String(document.id))),
    [documents, selectedDocumentIds],
  );

  useEffect(() => {
    let isActive = true;

    async function loadDocuments() {
      setIsLoadingDocuments(true);
      setDocumentsError("");

      try {
        const files = await listPdfFiles();
        if (isActive) {
          setDocuments(files);
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

  const toggleDocument = (documentId) => {
    setSelectedDocumentIds((current) =>
      current.includes(String(documentId))
        ? current.filter((id) => id !== String(documentId))
        : [...current, String(documentId)],
    );
  };

  return (
    <div className="min-h-screen bg-background text-on-surface">
      <Sidebar activeItem="reports" goTo={goTo} />
      <main className="min-h-screen md:ml-64">
        <AppHeader goTo={goTo} activeSection="documents" />

        <div className="mx-auto max-w-7xl px-5 py-8 md:px-8">
          <section className="mb-8">
            <h2 className="font-headline text-4xl font-extrabold tracking-tight text-on-surface">Relatórios</h2>
            <p className="mt-2 text-sm text-on-surface-variant">
              Escolha documentos enviados e prepare um relatório com objetivo, tipo e escopo definidos.
            </p>
          </section>

          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_380px]">
            <section className="space-y-6">
              <div className="rounded-xl border border-outline-variant/20 bg-surface-container-lowest p-5">
                <div className="mb-4 flex items-center justify-between gap-4">
                  <div>
                    <h3 className="font-headline text-xl font-bold text-on-surface">Documentos</h3>
                    <p className="mt-1 text-sm text-on-surface-variant">
                      Selecione um ou mais PDFs para compor o relatório.
                    </p>
                  </div>
                  <span className="rounded bg-surface-container-high px-2 py-0.5 text-xs font-medium text-on-surface-variant">
                    {selectedDocumentIds.length} selecionado(s)
                  </span>
                </div>

                {isLoadingDocuments ? (
                  <div className="rounded-lg border border-outline-variant/20 bg-surface-container-low p-4 text-center text-sm text-on-surface-variant">
                    Carregando PDFs...
                  </div>
                ) : documentsError ? (
                  <div className="rounded-lg border border-error/20 bg-error/10 p-4 text-sm font-medium text-error">
                    {documentsError}
                  </div>
                ) : documents.length ? (
                  <div className="grid gap-3 md:grid-cols-2">
                    {documents.map((document) => {
                      const checked = selectedDocumentIds.includes(String(document.id));
                      return (
                        <label
                          className={`flex cursor-pointer items-start gap-3 rounded-lg border p-4 transition-colors ${
                            checked
                              ? "border-primary/30 bg-primary-fixed/30"
                              : "border-outline-variant/20 bg-surface-container-low hover:border-primary/30"
                          }`}
                          key={document.id}
                        >
                          <input
                            className="mt-1 h-4 w-4 rounded border-outline-variant bg-surface-container-low text-primary focus:ring-primary"
                            type="checkbox"
                            checked={checked}
                            onChange={() => toggleDocument(document.id)}
                          />
                          <div className="min-w-0">
                            <p className="truncate text-sm font-bold text-on-surface">{document.name}</p>
                            <p className="mt-1 text-xs text-on-surface-variant">PDF enviado para a biblioteca</p>
                          </div>
                        </label>
                      );
                    })}
                  </div>
                ) : (
                  <div className="rounded-lg border border-dashed border-outline-variant/30 bg-surface-container-low p-6 text-center">
                    <Icon className="mb-2 text-3xl text-outline">folder_open</Icon>
                    <p className="text-sm font-semibold text-on-surface">Nenhum PDF disponivel</p>
                    <p className="mt-1 text-sm text-on-surface-variant">
                      Envie PDFs na Library para criar relatórios.
                    </p>
                  </div>
                )}
              </div>

              <div className="rounded-xl border border-outline-variant/20 bg-surface-container-lowest p-5">
                <h3 className="mb-4 font-headline text-xl font-bold text-on-surface">Configuração</h3>
                <div className="grid gap-4 md:grid-cols-2">
                  <label className="space-y-2">
                    <span className="block text-xs font-bold uppercase tracking-widest text-on-surface-variant">
                      Tipo de relatório
                    </span>
                    <select
                      className="w-full rounded-lg border-none bg-surface-container-low px-4 py-3 text-sm text-on-surface focus:bg-surface-container-lowest focus:ring-1 focus:ring-primary/40"
                      value={reportType}
                      onChange={(event) => setReportType(event.target.value)}
                    >
                      {reportTypes.map(([value, label]) => (
                        <option value={value} key={value}>
                          {label}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label className="space-y-2 md:col-span-2">
                    <span className="block text-xs font-bold uppercase tracking-widest text-on-surface-variant">
                      Objetivo
                    </span>
                    <textarea
                      className="min-h-28 w-full resize-none rounded-lg border-none bg-surface-container-low px-4 py-3 text-sm text-on-surface placeholder:text-on-surface-variant/50 focus:bg-surface-container-lowest focus:ring-1 focus:ring-primary/40"
                      placeholder="Ex: gerar um resumo para tomada de decisao, comparar pontos principais ou destacar riscos."
                      value={objective}
                      onChange={(event) => setObjective(event.target.value)}
                    />
                  </label>
                </div>
              </div>
            </section>

            <aside className="rounded-xl border border-outline-variant/20 bg-surface-container-lowest p-5">
              <h3 className="font-headline text-xl font-bold text-on-surface">Prévia do relatório</h3>
              <div className="mt-5 space-y-4">
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">Tipo</p>
                  <p className="mt-1 text-sm font-semibold text-on-surface">
                    {reportTypes.find(([value]) => value === reportType)?.[1]}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">Documentos</p>
                  {selectedDocuments.length ? (
                    <ul className="mt-2 space-y-2">
                      {selectedDocuments.map((document) => (
                        <li className="truncate rounded bg-surface-container-low px-3 py-2 text-sm text-on-surface" key={document.id}>
                          {document.name}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="mt-1 text-sm text-on-surface-variant">Nenhum documento selecionado.</p>
                  )}
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">Objetivo</p>
                  <p className="mt-1 text-sm text-on-surface-variant">
                    {objective.trim() || "Defina o objetivo para orientar a geração."}
                  </p>
                </div>
              </div>

              <button
                className="signature-gradient mt-6 w-full rounded-lg px-6 py-3 text-sm font-bold text-white shadow-md transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                type="button"
                disabled={!selectedDocuments.length || !objective.trim()}
              >
                Gerar relatório
              </button>
              <p className="mt-3 text-xs leading-relaxed text-on-surface-variant">
                Esqueleto pronto. A geração real depende de uma rota no backend para processar os documentos selecionados.
              </p>
            </aside>
          </div>
        </div>
      </main>
    </div>
  );
}
