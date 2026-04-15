import { API_BASE_URL } from "../config/api";
import { clearChatHistoryCache } from "./chatCache";

async function parseApiError(response) {
  try {
    const body = await response.json();
    if (Array.isArray(body.message)) {
      return body.message.join(" ");
    }
    return body.message || body.error || "Nao foi possivel autenticar.";
  } catch {
    return "Nao foi possivel autenticar.";
  }
}

export async function login({ email, password }) {
  const response = await fetch(`${API_BASE_URL}/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    throw new Error(await parseApiError(response));
  }

  return response.json();
}

export async function register({ name, email, password }) {
  const response = await fetch(`${API_BASE_URL}/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ name, email, password }),
  });

  if (!response.ok) {
    throw new Error(await parseApiError(response));
  }

  return response.json();
}

export function saveAuthTokens(tokens, persist = false) {
  const storage = persist ? window.localStorage : window.sessionStorage;
  const fallbackStorage = persist ? window.sessionStorage : window.localStorage;

  storage.setItem("access_token", tokens.access_token);
  storage.setItem("refresh_token", tokens.refresh_token);
  fallbackStorage.removeItem("access_token");
  fallbackStorage.removeItem("refresh_token");
}

export function clearAuthTokens() {
  window.localStorage.removeItem("access_token");
  window.localStorage.removeItem("refresh_token");
  window.sessionStorage.removeItem("access_token");
  window.sessionStorage.removeItem("refresh_token");
  clearChatHistoryCache();
}

export function getStoredAccessToken() {
  return window.localStorage.getItem("access_token") || window.sessionStorage.getItem("access_token");
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
