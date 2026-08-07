import * as React from "react";
import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";

function Field({
  label,
  htmlFor,
  hint,
  error,
  required,
  className,
  children,
}: {
  label: string;
  htmlFor?: string;
  hint?: string;
  error?: string;
  required?: boolean;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <Label htmlFor={htmlFor}>
        {label}
        {required && <span className="text-accent ml-0.5">*</span>}
      </Label>
      {children}
      {hint && !error && (
        <p className="text-[12px] text-ink-faint">{hint}</p>
      )}
      {error && <p className="text-[12px] text-danger">{error}</p>}
    </div>
  );
}

export { Field };
