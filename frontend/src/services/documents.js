import { getStoredAccessToken } from "./auth";
import { API_BASE_URL } from "../config/api";

async function parseApiError(response) {
  try {
    const body = await response.json();
    if (Array.isArray(body.message)) {
      return body.message.join(" ");
    }
    return body.message || body.error || "Nao foi possivel concluir a operacao.";
  } catch {
    return "Nao foi possivel concluir a operacao.";
  }
}

function getAuthHeaders() {
  const token = getStoredAccessToken();
  if (!token) {
    throw new Error("Sessao expirada. Faca login novamente.");
  }

  return {
    Authorization: `Bearer ${token}`,
  };
}

export async function listPdfFiles() {
  const response = await fetch(`${API_BASE_URL}/documents`, {
    method: "GET",
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error(await parseApiError(response));
  }

  return response.json();
}

export async function uploadPdfFiles(files) {
  const formData = new FormData();
  Array.from(files).forEach((file) => {
    formData.append("files", file);
  });

  const response = await fetch(`${API_BASE_URL}/documents/upload`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: formData,
  });

  if (!response.ok) {
    throw new Error(await parseApiError(response));
  }

  return response.json();
}

export async function getPdfFile(documentId) {
  const response = await fetch(`${API_BASE_URL}/documents/${documentId}`, {
    method: "GET",
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error(await parseApiError(response));
  }

  return response.blob();
}

export async function askDocumentQuestion(documentId, query) {
  const response = await fetch(`${API_BASE_URL}/documents/${documentId}/search`, {
    method: "POST",
    headers: {
      ...getAuthHeaders(),
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ query }),
  });

  if (!response.ok) {
    throw new Error(await parseApiError(response));
  }

  return response.json();
}
