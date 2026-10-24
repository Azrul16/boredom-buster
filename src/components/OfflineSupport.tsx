"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

const OfflineContext = createContext({
  offline: false,
  mode: "checking" as "checking" | "saving" | "ready" | "unavailable",
});
export const useOffline = () => useContext(OfflineContext);

export function OfflineSupport({ children }: { children: ReactNode }) {
  const [offline, setOffline] = useState(false);
  const [mode, setMode] = useState<
    "checking" | "saving" | "ready" | "unavailable"
  >("checking");
  useEffect(() => {
    const sync = () => setOffline(!navigator.onLine);
    sync();
    window.addEventListener("online", sync);
    window.addEventListener("offline", sync);
    let active = true;
    if (
      process.env.NODE_ENV !== "production" ||
      !("serviceWorker" in navigator)
    )
      setMode("unavailable");
    else {
      setMode("saving");
      void navigator.serviceWorker
        .register("/sw.js", { updateViaCache: "none" })
        .then((registration) => {
          if (!active) return;
          if (registration.active) setMode("ready");
          const worker = registration.installing;
          worker?.addEventListener("statechange", () => {
            if (active && worker.state === "redundant" && !registration.active)
              setMode("unavailable");
          });
          void navigator.serviceWorker.ready.then(() => {
            if (active) setMode("ready");
          });
        })
        .catch(() => {
          if (active) setMode("unavailable");
        });
    }
    return () => {
      active = false;
      window.removeEventListener("online", sync);
      window.removeEventListener("offline", sync);
    };
  }, []);
  return (
    <OfflineContext.Provider value={{ offline, mode }}>
      {children}
    </OfflineContext.Provider>
  );
}
