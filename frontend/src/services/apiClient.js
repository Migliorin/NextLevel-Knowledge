import { API_ROUTES, apiUrl } from "../config/api";
import {
  clearAuthTokens,
  getStoredAccessToken,
  getStoredRefreshToken,
  saveAuthTokens,
  shouldPersistAuthTokens,
} from "./tokenStorage";

export const AUTH_SESSION_EXPIRED_EVENT = "auth:session-expired";

function expireSession() {
  clearAuthTokens();
  window.dispatchEvent(new CustomEvent(AUTH_SESSION_EXPIRED_EVENT));
}

async function parseApiError(response, fallbackMessage = "Nao foi possivel concluir a operacao.") {
  try {
    const body = await response.json();
    if (Array.isArray(body.message)) {
      return body.message.join(" ");
    }
    return body.message || body.error || fallbackMessage;
  } catch {
    return fallbackMessage;
  }
}

function buildHeaders({ auth, headers, body, json }) {
  const requestHeaders = new Headers(headers);

  if (auth) {
    const token = getStoredAccessToken();
    if (!token) {
      expireSession();
      throw new Error("Sessao expirada. Faca login novamente.");
    }
    requestHeaders.set("Authorization", `Bearer ${token}`);
  }

  if (json !== undefined && !requestHeaders.has("Content-Type")) {
    requestHeaders.set("Content-Type", "application/json");
  }

  if (body instanceof FormData) {
    requestHeaders.delete("Content-Type");
  }

  return requestHeaders;
}

async function refreshStoredTokens() {
  const accessToken = getStoredAccessToken();
  const refreshToken = getStoredRefreshToken();

  if (!accessToken || !refreshToken) {
    expireSession();
    throw new Error("Sessao expirada. Faca login novamente.");
  }

  const response = await fetch(apiUrl(API_ROUTES.auth.refresh), {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ refresh_token: refreshToken }),
  });

  if (!response.ok) {
    const message = await parseApiError(response, "Sessao expirada. Faca login novamente.");
    expireSession();
    throw new Error(message);
  }

  const tokens = await response.json();
  saveAuthTokens(tokens, shouldPersistAuthTokens());
  return tokens;
}

async function parseResponse(response, responseType) {
  if (responseType === "response") {
    return response;
  }

  if (responseType === "blob") {
    return response.blob();
  }

  if (responseType === "text") {
    return response.text();
  }

  if (responseType === "empty" || response.status === 204) {
    return undefined;
  }

  return response.json();
}

export async function apiFetch(route, options = {}) {
  const {
    auth = true,
    body,
    errorMessage,
    headers,
    json,
    retryOnUnauthorized = auth,
    responseType = "json",
    ...fetchOptions
  } = options;

  const requestBody = json !== undefined ? JSON.stringify(json) : body;
  const requestHeaders = buildHeaders({ auth, headers, body: requestBody, json });

  const response = await fetch(apiUrl(route), {
    ...fetchOptions,
    headers: requestHeaders,
    body: requestBody,
  });

  if (response.status === 401 && retryOnUnauthorized) {
    try {
      await refreshStoredTokens();
      return apiFetch(route, {
        ...options,
        retryOnUnauthorized: false,
      });
    } catch (error) {
      expireSession();
      throw error;
    }
  }

  if (!response.ok) {
    throw new Error(await parseApiError(response, errorMessage));
  }

  return parseResponse(response, responseType);
}
