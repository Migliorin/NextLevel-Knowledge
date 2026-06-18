import { API_ROUTES } from "../config/api";
import { apiFetch } from "./apiClient";

export async function listPdfFiles(params = {}) {
  return apiFetch(API_ROUTES.files.list, {
    method: "GET",
    params,
    errorMessage: "Nao foi possivel concluir a operacao.",
  });
}

export async function uploadPdfFiles(files, metadata = {}) {
  const formData = new FormData();

  files.forEach((file) => {
    formData.append("files", file);
  });

  if (metadata.description) {
    formData.append("description", metadata.description);
  }

  return apiFetch(API_ROUTES.files.upload, {
    method: "POST",
    body: formData,
    errorMessage: "Não foi possível enviar o arquivo.",
  });
}

export async function getPdfFile(documentId) {
  return apiFetch(API_ROUTES.files.byId(documentId), {
    method: "GET",
    responseType: "blob",
    errorMessage: "Nao foi possivel concluir a operacao.",
  });
}

export async function deletePdfFile(documentId) {
  return apiFetch(API_ROUTES.files.byId(documentId), {
    method: "DELETE",
    errorMessage: "Não foi possível excluir o arquivo.",
  });
}

export async function askDocumentQuestion(documentId, query) {
  return apiFetch(API_ROUTES.ai.askDocument(documentId), {
    method: "POST",
    json: { query },
    errorMessage: "Nao foi possivel concluir a operacao.",
  });
}

export async function startDocumentExtraction(documentId) {
  return apiFetch(API_ROUTES.ai.extractDocument(documentId), {
    method: "POST",
    errorMessage: "Nao foi possivel iniciar a extracao do documento.",
  });
}
