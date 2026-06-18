export function buildLoadingEvidenceTrace({ document, question }) {
  return {
    documentName: document?.name,
    query: "Gerando busca semântica...",
    question,
    sources: [],
    status: "loading",
    steps: [
      {
        detail: "A IA está identificando a intenção principal da pergunta.",
        label: "Interpretação da pergunta",
      },
      {
        detail: "O sistema está procurando trechos relacionados no documento.",
        label: "Busca semântica no PDF",
      },
      {
        detail: "Os trechos mais relevantes serão usados como contexto da resposta.",
        label: "Seleção de evidências",
      },
    ],
  };
}

export function buildFallbackEvidenceTrace({ document, question }) {
  return {
    documentName: document?.name,
    query: question,
    question,
    sources: [
      {
        excerpt:
          "Trecho recuperado do documento. Conecte o pipeline RAG para exibir página, score e conteúdo retornado pela API.",
        page: 1,
        score: null,
      },
    ],
    status: "done",
    steps: [
      {
        detail: "A pergunta foi transformada em uma consulta para busca no documento.",
        label: "Interpretação da pergunta",
      },
      {
        detail: "O RAG recuperou trechos semanticamente próximos da pergunta.",
        label: "Busca semântica no PDF",
      },
      {
        detail: "A resposta foi gerada com base nos trechos recuperados.",
        label: "Geração da resposta",
      },
    ],
  };
}

export function normalizeEvidenceTrace(response, fallbackTrace) {
  const trace = response?.evidence || response?.trace || response?.ragTrace;

  if (!trace) {
    return fallbackTrace;
  }

  return {
    documentName: trace.documentName || fallbackTrace.documentName,
    query: trace.query || trace.rewrittenQuery || fallbackTrace.query,
    question: trace.question || fallbackTrace.question,
    sources: trace.sources || trace.chunks || trace.contexts || fallbackTrace.sources,
    status: "done",
    steps: trace.steps?.length ? trace.steps : fallbackTrace.steps,
  };
}
