import { API_ROUTES } from "../config/api";
import { apiFetch } from "./apiClient";

export async function listPdfFiles() {
  return apiFetch(API_ROUTES.files.list, {
    method: "GET",
    errorMessage: "Nao foi possivel concluir a operacao.",
  });
}

export async function uploadPdfFiles(files) {
  const formData = new FormData();
  Array.from(files).forEach((file) => {
    formData.append("files", file);
  });

  return apiFetch(API_ROUTES.files.upload, {
    method: "POST",
    body: formData,
    errorMessage: "Nao foi possivel concluir a operacao.",
  });
}

export async function getPdfFile(documentId) {
  return apiFetch(API_ROUTES.files.byId(documentId), {
    method: "GET",
    responseType: "blob",
    errorMessage: "Nao foi possivel concluir a operacao.",
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
