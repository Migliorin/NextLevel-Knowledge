import { clearChatHistoryCache } from "./chatCache";

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

export function getStoredRefreshToken() {
  return window.localStorage.getItem("refresh_token") || window.sessionStorage.getItem("refresh_token");
}

export function shouldPersistAuthTokens() {
  return Boolean(window.localStorage.getItem("refresh_token"));
}
