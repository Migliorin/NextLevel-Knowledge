const dateFormatter = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

export const FILE_STATUS = {
  PENDING: 0,
  EXTRACTING: 1,
  EXTRACTED: 2,
  ERROR: 3,
};

const statusNameToId = {
  ERROR: FILE_STATUS.ERROR,
  EXTRACTED: FILE_STATUS.EXTRACTED,
  EXTRACTING: FILE_STATUS.EXTRACTING,
  PENDING: FILE_STATUS.PENDING,
};

function normalizeFileStatus(file) {
  const candidates = [
    file.statusId,
    file.status_id,
    file.status?.id,
    file.status?.name,
    file.status,
  ];

  for (const candidate of candidates) {
    if (candidate === undefined || candidate === null) {
      continue;
    }

    if (typeof candidate === "number" && !Number.isNaN(candidate)) {
      return candidate;
    }

    if (typeof candidate === "string") {
      const numericStatus = Number(candidate);

      if (!Number.isNaN(numericStatus)) {
        return numericStatus;
      }

      const namedStatus = statusNameToId[candidate.trim().toUpperCase()];

      if (namedStatus !== undefined) {
        return namedStatus;
      }
    }
  }

  return FILE_STATUS.PENDING;
}

export function formatDocumentDate(createdAt) {
  if (!createdAt) {
    return "Data indisponível";
  }

  const date = new Date(createdAt);

  if (Number.isNaN(date.getTime())) {
    return "Data indisponível";
  }

  return `Enviado em ${dateFormatter.format(date)}`;
}

export function getDocumentDescription(file) {
  return (
    file.description ||
    file.summary ||
    file.excerpt ||
    "Descrição não informada para este documento."
  );
}

export function mapFileToDocument(file) {
  return {
    id: file.id,
    title: file.name,
    description: getDocumentDescription(file),
    meta: formatDocumentDate(file.createdAt || file.created_at),
    status: normalizeFileStatus(file),
  };
}

export function filterDocuments(documents, searchTerm) {
  const normalizedSearchTerm = searchTerm.trim().toLowerCase();

  if (!normalizedSearchTerm) {
    return documents;
  }

  return documents.filter((document) => {
    const searchableContent = `${document.title} ${document.description}`.toLowerCase();
    return searchableContent.includes(normalizedSearchTerm);
  });
}

export function getDocumentStatusCounts(documents) {
  return documents.reduce(
    (counts, document) => {
      if (document.status === FILE_STATUS.PENDING) {
        counts.queued += 1;
      }

      if (document.status === FILE_STATUS.EXTRACTING) {
        counts.processing += 1;
      }

      if (document.status === FILE_STATUS.EXTRACTED) {
        counts.finished += 1;
      }

      return counts;
    },
    { finished: 0, processing: 0, queued: 0 },
  );
}

export function getStatusConfig(status) {
  if (status === FILE_STATUS.EXTRACTED) {
    return {
      className: "border-emerald-400/20 bg-emerald-500/10 text-emerald-200",
      description: "Pronto para consulta com IA",
      icon: "check_circle",
      iconClassName: "text-emerald-300",
      label: "Finalizado",
    };
  }

  if (status === FILE_STATUS.EXTRACTING) {
    return {
      className: "border-[#35A9F6]/30 bg-[#35A9F6]/10 text-auth-primary",
      description: "Extração em andamento",
      icon: "autorenew",
      iconClassName: "text-auth-primary",
      label: "Processando",
    };
  }

  if (status === FILE_STATUS.ERROR) {
    return {
      className: "border-red-400/20 bg-red-500/10 text-red-100",
      description: "Falha no processamento",
      icon: "error",
      iconClassName: "text-red-200",
      label: "Erro",
    };
  }

  return {
    className: "border-white/10 bg-white/[0.05] text-auth-on-surface-variant",
    description: "Aguardando processamento",
    icon: "schedule",
    iconClassName: "text-auth-on-surface-variant",
    label: "Na fila",
  };
}
