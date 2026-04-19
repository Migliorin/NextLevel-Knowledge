export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "";

export const API_ROUTES = {
  auth: {
    login: "/auth/login",
    register: "/auth/register",
    refresh: "/auth/refresh",
    logout: "/auth/logout",
  },
  files: {
    list: "/files",
    upload: "/files",
    byId: (documentId) => `/files/${documentId}`,
  },
  ai: {
    askDocument: (documentId) => `/ai/${documentId}/ask`,
    extractDocument: (documentId) => `/ai/${documentId}/extract`,
  },
};

export function apiUrl(route) {
  return `${API_BASE_URL.replace(/\/$/, "")}${route}`;
}
