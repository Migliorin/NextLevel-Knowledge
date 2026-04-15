import { useEffect, useMemo, useState } from "react";
import { resolveRoute } from "../routes";

export function useAppRoute() {
  const [route, setRoute] = useState(() => resolveRoute(window.location.pathname));

  useEffect(() => {
    const initialRoute = resolveRoute(window.location.pathname);
    if (window.location.pathname !== initialRoute) {
      window.history.replaceState({}, "", initialRoute);
    }

    const onPopState = () => setRoute(resolveRoute(window.location.pathname));
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  const goTo = useMemo(
    () => (nextRoute) => {
      const resolvedRoute = resolveRoute(nextRoute);
      window.history.pushState({}, "", resolvedRoute);
      setRoute(resolvedRoute);
    },
    [],
  );

  return [route, goTo];
}
