import axios from "axios";
import { API_BASE_URL, API_ROUTES } from "../config/api";
import {
  clearAuthTokens,
  getStoredAccessToken,
  getStoredRefreshToken,
  saveAuthTokens,
  shouldPersistAuthTokens,
} from "./tokenStorage";

export const AUTH_SESSION_EXPIRED_EVENT = "auth:session-expired";

const baseURL = API_BASE_URL.replace(/\/$/, "");

export const apiClient = axios.create({
  baseURL: baseURL || undefined,
});

function expireSession() {
  clearAuthTokens();
  window.dispatchEvent(new CustomEvent(AUTH_SESSION_EXPIRED_EVENT));
}

function getApiErrorMessage(error, fallbackMessage = "Nao foi possivel concluir a operacao.") {
  if (!axios.isAxiosError(error)) {
    return error instanceof Error ? error.message : fallbackMessage;
  }

  const body = error.response?.data;

  if (!body) {
    return error.message || fallbackMessage;
  }

  if (typeof body === "string") {
    return body || fallbackMessage;
  }

  if (Array.isArray(body.message)) {
    return body.message.join(" ");
  }

  return body.message || body.error || fallbackMessage;
}

function getAxiosResponseType(responseType) {
  if (responseType === "blob" || responseType === "text") {
    return responseType;
  }

  return "json";
}

function buildRequestConfig({
  auth,
  body,
  headers,
  json,
  responseType,
  ...axiosOptions
}) {
  const requestHeaders = { ...(headers || {}) };

  if (auth) {
    const token = getStoredAccessToken();

    if (!token) {
      expireSession();
      throw new Error("Sessao expirada. Faca login novamente.");
    }

    requestHeaders.Authorization = `Bearer ${token}`;
  }

  if (json !== undefined && !requestHeaders["Content-Type"]) {
    requestHeaders["Content-Type"] = "application/json";
  }

  return {
    ...axiosOptions,
    data: json !== undefined ? json : body,
    headers: requestHeaders,
    responseType: getAxiosResponseType(responseType),
  };
}

async function refreshStoredTokens() {
  const accessToken = getStoredAccessToken();
  const refreshToken = getStoredRefreshToken();

  if (!accessToken || !refreshToken) {
    expireSession();
    throw new Error("Sessao expirada. Faca login novamente.");
  }

  try {
    const response = await apiClient.request({
      method: "POST",
      url: API_ROUTES.auth.refresh,
      data: { refresh_token: refreshToken },
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    });

    saveAuthTokens(response.data, shouldPersistAuthTokens());
    return response.data;
  } catch (error) {
    const message = getApiErrorMessage(error, "Sessao expirada. Faca login novamente.");
    expireSession();
    throw new Error(message);
  }
}

function parseResponse(response, responseType) {
  if (responseType === "response") {
    return response;
  }

  if (responseType === "empty" || response.status === 204) {
    return undefined;
  }

  return response.data;
}

export async function apiFetch(route, options = {}) {
  const {
    auth = true,
    errorMessage,
    retryOnUnauthorized = auth,
    responseType = "json",
    ...requestOptions
  } = options;

  const requestConfig = buildRequestConfig({
    ...requestOptions,
    auth,
    responseType,
    url: route,
  });

  try {
    const response = await apiClient.request(requestConfig);
    return parseResponse(response, responseType);
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 401 && retryOnUnauthorized) {
      try {
        await refreshStoredTokens();
        return apiFetch(route, {
          ...options,
          retryOnUnauthorized: false,
        });
      } catch (refreshError) {
        expireSession();
        throw refreshError;
      }
    }

    throw new Error(getApiErrorMessage(error, errorMessage));
  }
}
