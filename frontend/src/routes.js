export const ROUTES = {
  login: "/login",
  register: "/register",
  dashboard: "/dashboard",
  chat: "/chat",
  reports: "/reports",
  documents: "/documents",
};

export function documentViewerRoute(documentId) {
  return `${ROUTES.documents}/${documentId}`;
}
