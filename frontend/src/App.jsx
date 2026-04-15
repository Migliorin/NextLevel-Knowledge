import { useEffect } from "react";
import { useAppRoute } from "./hooks/useAppRoute";
import { ChatPage } from "./pages/ChatPage";
import { DashboardPage } from "./pages/DashboardPage";
import { DocumentViewerPage } from "./pages/DocumentViewerPage";
import { LoginPage } from "./pages/LoginPage";
import { RegisterPage } from "./pages/RegisterPage";
import { DEFAULT_ROUTE, getDocumentIdFromRoute, isDocumentViewerRoute, isKnownRoute, ROUTES } from "./routes";

export default function App() {
  const [route, goTo] = useAppRoute();

  useEffect(() => {
    if (!isKnownRoute(route)) {
      goTo(DEFAULT_ROUTE);
    }
  }, [goTo, route]);

  if (route === ROUTES.register) {
    return <RegisterPage goTo={goTo} />;
  }

  if (route === ROUTES.dashboard) {
    return <DashboardPage goTo={goTo} />;
  }

  if (route === ROUTES.chat) {
    return <ChatPage goTo={goTo} />;
  }

  if (isDocumentViewerRoute(route)) {
    return <DocumentViewerPage documentId={getDocumentIdFromRoute(route)} goTo={goTo} />;
  }

  return <LoginPage goTo={goTo} />;
}
