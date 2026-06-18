import { useCallback, useEffect } from "react";
import { Navigate, Route, Routes, useNavigate, useParams } from "react-router-dom";
import { ChatPage } from "./pages/ChatPage";
import { DashboardPage } from "./pages/DashboardPage";
import { DocumentViewerPage } from "./pages/DocumentViewerPage";
import { LoginPage } from "./pages/LoginPage";
import { RegisterPage } from "./pages/RegisterPage";
import { ROUTES } from "./routes";
import { AUTH_SESSION_EXPIRED_EVENT } from "./services/apiClient";
import { getStoredAccessToken } from "./services/auth";

function ProtectedRoute({ children }) {
  if (!getStoredAccessToken()) {
    return <Navigate to={ROUTES.login} replace />;
  }

  return children;
}

function DocumentViewerRoute({ goTo }) {
  const { documentId } = useParams();
  return <DocumentViewerPage documentId={documentId} goTo={goTo} />;
}

export default function App() {
  const navigate = useNavigate();
  const goTo = useCallback((route, options) => navigate(route, options), [navigate]);

  useEffect(() => {
    const redirectToLogin = () => {
      navigate(ROUTES.login, { replace: true });
    };

    window.addEventListener(AUTH_SESSION_EXPIRED_EVENT, redirectToLogin);
    return () => window.removeEventListener(AUTH_SESSION_EXPIRED_EVENT, redirectToLogin);
  }, [navigate]);

  return (
    <Routes>
      <Route path="/" element={<Navigate to={ROUTES.login} replace />} />
      <Route path={ROUTES.login} element={<LoginPage goTo={goTo} />} />
      <Route path={ROUTES.register} element={<RegisterPage goTo={goTo} />} />
      <Route
        path={ROUTES.dashboard}
        element={
          <ProtectedRoute>
            <DashboardPage goTo={goTo} />
          </ProtectedRoute>
        }
      />
      <Route
        path={ROUTES.chat}
        element={
          <ProtectedRoute>
            <ChatPage goTo={goTo} />
          </ProtectedRoute>
        }
      />
      <Route
        path={`${ROUTES.documents}/:documentId`}
        element={
          <ProtectedRoute>
            <DocumentViewerRoute goTo={goTo} />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to={ROUTES.login} replace />} />
    </Routes>
  );
}
