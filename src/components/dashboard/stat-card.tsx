import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export function StatCard({
  label,
  value,
  icon: Icon,
  tone = "primary",
  hint,
}: {
  label: string;
  value: string | number;
  icon: LucideIcon;
  tone?: "primary" | "accent" | "warning" | "success";
  hint?: string;
}) {
  const toneClasses: Record<string, string> = {
    primary: "bg-primary-soft text-primary",
    accent: "bg-accent-soft text-accent",
    warning: "bg-warning-soft text-warning",
    success: "bg-success-soft text-success",
  };

  return (
    <div className="rounded-lg border border-border bg-surface p-4.5 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[12px] font-medium uppercase tracking-wide text-ink-faint">
            {label}
          </p>
          <p className="mt-2 font-display text-[26px] leading-none text-ink">
            {value}
          </p>
        </div>
        <div
          className={cn(
            "flex size-9 items-center justify-center rounded-md",
            toneClasses[tone]
          )}
        >
          <Icon className="size-[18px]" />
        </div>
      </div>
      {hint && <p className="mt-2.5 text-[12.5px] text-ink-faint">{hint}</p>}
    </div>
  );
}
