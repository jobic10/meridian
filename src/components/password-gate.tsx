"use client";

import { useEffect, useState, type FormEvent } from "react";
import { Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const STORAGE_KEY = "meridian_docs_unlocked";
const PASSWORD = "alikeju";

/**
 * Client-side-only gate for the marketing/docs pages — deliberately not a
 * real access control (no server round trip, the guarded content still
 * ships in the page payload). It's a speed bump for casual visitors, not a
 * security boundary; the real app has its own server-verified auth.
 */
export function PasswordGate({ children }: { children: React.ReactNode }) {
  const [unlocked, setUnlocked] = useState(false);
  const [checked, setChecked] = useState(false);
  const [value, setValue] = useState("");
  const [error, setError] = useState(false);

  useEffect(() => {
    if (localStorage.getItem(STORAGE_KEY) === "true") {
      setUnlocked(true);
    }
    setChecked(true);
  }, []);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (value.trim().toLowerCase() === PASSWORD) {
      localStorage.setItem(STORAGE_KEY, "true");
      setUnlocked(true);
      setError(false);
    } else {
      setError(true);
    }
  }

  if (!checked) return null;
  if (unlocked) return <>{children}</>;

  return (
    <div className="flex min-h-screen flex-1 items-center justify-center bg-paper px-6">
      <div className="w-full max-w-sm">
        <div className="mb-6 flex flex-col items-center text-center">
          <div className="mb-4 flex size-11 items-center justify-center rounded-full bg-primary-soft text-primary">
            <Lock className="size-5" />
          </div>
          <h1 className="font-display text-[22px] font-medium text-ink">
            This area is restricted
          </h1>
          <p className="mt-1.5 text-[13.5px] text-ink-muted">
            Enter the access password to continue.
          </p>
        </div>
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <Input
            type="password"
            value={value}
            onChange={(e) => {
              setValue(e.target.value);
              if (error) setError(false);
            }}
            placeholder="Password"
            autoFocus
            className={error ? "border-danger focus-visible:border-danger" : ""}
          />
          {error && (
            <p className="text-[12.5px] text-danger">
              That password isn&apos;t right — try again.
            </p>
          )}
          <Button type="submit" size="lg">
            Continue
          </Button>
        </form>
      </div>
    </div>
  );
}
