"use client";

import { useEffect, useState } from "react";

type Status = "checking" | "waking" | "ready";

const POLL_MS = 5000;

/**
 * Polls our own /api/health route (which in turn pings the Django API)
 * so the login page can tell the user "the server is still waking up"
 * instead of letting them mash Sign in against a cold backend and see
 * nothing happen.
 */
export function BackendStatus() {
  const [status, setStatus] = useState<Status>("checking");

  useEffect(() => {
    // A plain closure variable, not a ref: React 18 Strict Mode runs this
    // effect's mount → cleanup → mount again in dev, and a ref would carry
    // the first (phantom) run's "stopped" flag into the second (real) run,
    // permanently short-circuiting every check. A fresh local per
    // invocation keeps the two runs isolated.
    let stopped = false;
    let timer: ReturnType<typeof setTimeout>;

    async function check() {
      try {
        const res = await fetch("/api/health", { cache: "no-store" });
        const data = await res.json();
        if (stopped) return;
        if (data.ready) {
          setStatus("ready");
          return; // stop polling once confirmed awake
        }
        setStatus("waking");
      } catch {
        if (!stopped) setStatus("waking");
      }
      if (!stopped) timer = setTimeout(check, POLL_MS);
    }

    check();
    return () => {
      stopped = true;
      clearTimeout(timer);
    };
  }, []);

  const config = {
    checking: { dot: "bg-ink-faint", text: "Checking server status…", tone: "text-ink-faint" },
    waking: {
      dot: "bg-warning animate-pulse",
      text: "Server is waking up — sign-in may take up to a minute",
      tone: "text-warning",
    },
    ready: { dot: "bg-success", text: "Server ready", tone: "text-success" },
  }[status];

  return (
    <div className={`flex items-center justify-center gap-1.5 text-[12px] ${config.tone}`}>
      <span className={`size-1.5 shrink-0 rounded-full ${config.dot}`} />
      {config.text}
    </div>
  );
}
