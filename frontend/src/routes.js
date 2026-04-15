export const ROUTES = {
  login: "/login",
  register: "/register",
  dashboard: "/dashboard",
  chat: "/chat",
  documents: "/documents",
};

export const DEFAULT_ROUTE = ROUTES.login;

export function documentViewerRoute(documentId) {
  return `${ROUTES.documents}/${documentId}`;
}

export function isDocumentViewerRoute(pathname) {
  return /^\/documents\/[^/]+$/.test(pathname);
}

export function getDocumentIdFromRoute(pathname) {
  if (!isDocumentViewerRoute(pathname)) {
    return null;
  }

  return pathname.split("/").at(-1);
}

export function isKnownRoute(pathname) {
  return Object.values(ROUTES).includes(pathname) || isDocumentViewerRoute(pathname);
}

export function resolveRoute(pathname) {
  if (isDocumentViewerRoute(pathname)) {
    return pathname;
  }

  const route = Object.values(ROUTES).find((path) => path === pathname);
  return route || DEFAULT_ROUTE;
}
