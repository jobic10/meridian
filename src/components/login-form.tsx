"use client";

import { useActionState, useState } from "react";
import { loginAction, type LoginState } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field } from "@/components/ui/field";
import { AlertCircle } from "lucide-react";

const DEMO_ACCOUNTS = [
  { role: "Administrator", username: "admin" },
  { role: "Doctor", username: "dr.adeyemi" },
  { role: "Nurse", username: "n.okafor" },
  { role: "Records officer", username: "records" },
  { role: "Pharmacist", username: "pharm.bello" },
];

export function LoginForm() {
  const [state, formAction, pending] = useActionState<LoginState, FormData>(
    loginAction,
    undefined
  );
  const [username, setUsername] = useState("");

  return (
    <div className="w-full max-w-sm">
      <form action={formAction} className="flex flex-col gap-4">
        <Field label="Username" htmlFor="username" required>
          <Input
            id="username"
            name="username"
            autoComplete="username"
            placeholder="e.g. dr.adeyemi"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </Field>
        <Field label="Password" htmlFor="password" required>
          <Input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            placeholder="••••••••"
            required
          />
        </Field>

        {state?.error && (
          <div className="flex items-start gap-2 rounded-md border border-danger/20 bg-danger-soft px-3 py-2.5 text-[13px] text-danger">
            <AlertCircle className="mt-0.5 size-4 shrink-0" />
            <span>{state.error}</span>
          </div>
        )}

        <Button type="submit" size="lg" disabled={pending} className="mt-1">
          {pending ? "Signing in…" : "Sign in"}
        </Button>
      </form>

      <div className="mt-8">
        <p className="text-[11px] font-medium uppercase tracking-wide text-ink-faint">
          Demo staff accounts
        </p>
        <p className="mt-1 text-[12.5px] text-ink-faint">
          Password for every seeded account is{" "}
          <code className="rounded bg-surface-sunken px-1 py-0.5 font-mono text-[11.5px] text-ink-muted">
            meridian123
          </code>
        </p>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {DEMO_ACCOUNTS.map((a) => (
            <button
              type="button"
              key={a.username}
              onClick={() => setUsername(a.username)}
              className="rounded-full border border-border-strong bg-surface px-2.5 py-1 text-[12px] text-ink-muted transition-colors hover:border-primary hover:text-primary"
            >
              {a.role}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
