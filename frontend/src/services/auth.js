import { API_ROUTES } from "../config/api";
import { apiFetch } from "./apiClient";
import {
  clearAuthTokens,
  getStoredAccessToken,
  getStoredRefreshToken,
  saveAuthTokens,
  shouldPersistAuthTokens,
} from "./tokenStorage";

export { clearAuthTokens, getStoredAccessToken, getStoredRefreshToken, saveAuthTokens };

export async function login({ email, password }) {
  return apiFetch(API_ROUTES.auth.login, {
    auth: false,
    method: "POST",
    json: { email, password },
    errorMessage: "Nao foi possivel autenticar.",
  });
}

export async function register({ name, email, password }) {
  return apiFetch(API_ROUTES.auth.register, {
    auth: false,
    method: "POST",
    json: { name, email, password },
    errorMessage: "Nao foi possivel autenticar.",
  });
}

export async function refreshAuthTokens() {
  const refreshToken = getStoredRefreshToken();

  if (!refreshToken) {
    throw new Error("Sessao expirada. Faca login novamente.");
  }

  const tokens = await apiFetch(API_ROUTES.auth.refresh, {
    method: "POST",
    json: { refresh_token: refreshToken },
    retryOnUnauthorized: false,
    errorMessage: "Sessao expirada. Faca login novamente.",
  });

  saveAuthTokens(tokens, shouldPersistAuthTokens());
  return tokens;
}

export async function logout() {
  try {
    await apiFetch(API_ROUTES.auth.logout, {
      method: "POST",
      retryOnUnauthorized: false,
      responseType: "empty",
    });
  } catch {
    // A sessao local deve ser encerrada mesmo se o token ja expirou ou a API estiver indisponivel.
  } finally {
    clearAuthTokens();
  }
}

function decodeJwtPayload(token) {
  const [, payload] = token.split(".");
  if (!payload) {
    return null;
  }

  try {
    const normalizedPayload = payload.replace(/-/g, "+").replace(/_/g, "/");
    const json = window.atob(normalizedPayload);
    return JSON.parse(json);
  } catch {
    return null;
  }
}

export function getCurrentUser() {
  const token = getStoredAccessToken();
  if (!token) {
    return null;
  }

  return decodeJwtPayload(token);
}
