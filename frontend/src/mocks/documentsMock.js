const wait = (ms = 600) => new Promise((resolve) => setTimeout(resolve, ms));

export const mockPdfFiles = [
  {
    id: "pdf-001",
    name: "Relatório Financeiro Q2 2026.pdf",
    description:
      "Análise de receita, custos operacionais, margem bruta e projeções financeiras para o segundo trimestre.",
    summary:
      "Documento financeiro com indicadores de crescimento, despesas e oportunidades de otimização.",
    excerpt:
      "A receita recorrente apresentou crescimento consistente, com destaque para contratos enterprise.",
    pages: 42,
    createdAt: "2026-06-12T10:30:00.000Z",
  },
  {
    id: "pdf-002",
    name: "Análise de Performance Comercial.pdf",
    description:
      "Relatório sobre funil de vendas, conversão por etapa, ticket médio e desempenho dos canais comerciais.",
    summary:
      "Material focado em métricas comerciais e oportunidades para melhorar conversão.",
    excerpt:
      "O canal inbound apresentou maior eficiência no custo por aquisição em comparação ao outbound.",
    pages: 28,
    createdAt: "2026-06-10T14:20:00.000Z",
  },
  {
    id: "pdf-003",
    name: "Dashboard Executivo - Automação.pdf",
    description:
      "Visão executiva sobre automações implantadas, economia de tempo e impacto operacional.",
    summary:
      "Relatório estratégico sobre ganhos de produtividade gerados por automação.",
    excerpt:
      "As automações reduziram tarefas manuais repetitivas e melhoraram a previsibilidade operacional.",
    pages: 35,
    createdAt: "2026-06-08T09:45:00.000Z",
  },
  {
    id: "pdf-004",
    name: "Diagnóstico de Processos Internos.pdf",
    description:
      "Mapeamento de gargalos internos, fluxos manuais, retrabalho e sugestões de melhoria.",
    summary:
      "Documento de diagnóstico operacional com recomendações para otimização de processos.",
    excerpt:
      "Foram identificados pontos críticos em aprovações, comunicação entre setores e controle documental.",
    pages: 51,
    createdAt: "2026-06-03T16:10:00.000Z",
  },
];

export async function mockListPdfFiles() {
  await wait();
  return mockPdfFiles;
}

export async function mockAskDocumentQuestion(documentId, question) {
  await wait(900);

  const document = mockPdfFiles.find((file) => String(file.id) === String(documentId));

  return {
    answer: `Resposta simulada com base no documento "${document?.name || "PDF selecionado"}".

Pergunta recebida:
"${question}"

Resumo mockado:
Este documento indica pontos relevantes para análise, como métricas principais, oportunidades de melhoria e informações úteis para geração automatizada de relatórios.

Observação:
Esta resposta é apenas um mock para teste visual da interface.`,

    evidence: {
      question,
      documentName: document?.name,
      query: `${question} contexto relatório indicadores principais evidências`,
      steps: [
        {
          label: "Interpretação da pergunta",
          detail: "A pergunta foi convertida em uma consulta semântica para o documento.",
        },
        {
          label: "Busca vetorial",
          detail: "Foram buscados chunks próximos à pergunta usando embeddings.",
        },
        {
          label: "Reordenação",
          detail: "Os trechos recuperados foram ordenados por relevância.",
        },
        {
          label: "Resposta final",
          detail: "A resposta foi gerada usando os trechos mais relevantes como contexto.",
        },
      ],
      sources: [
        {
          page: 4,
          score: 0.91,
          excerpt:
            "A receita recorrente apresentou crescimento consistente, com destaque para contratos enterprise e maior retenção da base ativa.",
        },
        {
          page: 9,
          score: 0.86,
          excerpt:
            "Os principais indicadores demonstram ganho operacional após a automação de etapas repetitivas do processo.",
        },
        {
          page: 13,
          score: 0.79,
          excerpt:
            "As recomendações priorizam redução de retrabalho, melhoria na rastreabilidade e consolidação automática dos relatórios.",
        },
      ],
    },
  };
}