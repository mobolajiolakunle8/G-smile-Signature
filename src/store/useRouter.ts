import { useState, useEffect, useCallback } from "react";

export type Route = { path: string; query: Record<string, string> };

function parseHash(): Route {
  const raw = window.location.hash.replace(/^#/, "") || "/";
  const [path, qs] = raw.split("?");
  const query: Record<string, string> = {};
  if (qs) {
    new URLSearchParams(qs).forEach((v, k) => (query[k] = v));
  }
  return { path: path || "/", query };
}

export function navigate(path: string) {
  if (window.location.hash.replace(/^#/, "") === path) {
    window.scrollTo({ top: 0, behavior: "smooth" });
    return;
  }
  window.location.hash = path;
  window.scrollTo({ top: 0, behavior: "auto" });
}

export function useRouter() {
  const [route, setRoute] = useState<Route>(parseHash());

  useEffect(() => {
    const onChange = () => {
      setRoute(parseHash());
      window.scrollTo({ top: 0, behavior: "auto" });
    };
    window.addEventListener("hashchange", onChange);
    return () => window.removeEventListener("hashchange", onChange);
  }, []);

  const go = useCallback((path: string) => navigate(path), []);
  return { route, go };
}
