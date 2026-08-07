"use client";

import { useTransition } from "react";
import { Check, X } from "lucide-react";
import { updateAppointmentStatusAction } from "@/app/actions/appointments";
import { useToast } from "@/components/ui/toast";

export function AppointmentRowActions({
  appointmentId,
  status,
}: {
  appointmentId: number;
  status: "PENDING" | "COMPLETED" | "CANCELLED";
}) {
  const [isPending, startTransition] = useTransition();
  const toast = useToast();

  if (status !== "PENDING") return null;

  function run(next: "COMPLETED" | "CANCELLED") {
    startTransition(async () => {
      await updateAppointmentStatusAction(appointmentId, next);
      toast({
        variant: next === "COMPLETED" ? "success" : "info",
        title: next === "COMPLETED" ? "Marked as completed" : "Appointment cancelled",
      });
    });
  }

  return (
    <div className="flex items-center gap-1">
      <button
        disabled={isPending}
        onClick={() => run("COMPLETED")}
        title="Mark completed"
        className="flex size-7 items-center justify-center rounded-md text-ink-faint transition-colors hover:bg-success-soft hover:text-success disabled:opacity-50"
      >
        <Check className="size-4" />
      </button>
      <button
        disabled={isPending}
        onClick={() => run("CANCELLED")}
        title="Cancel"
        className="flex size-7 items-center justify-center rounded-md text-ink-faint transition-colors hover:bg-danger-soft hover:text-danger disabled:opacity-50"
      >
        <X className="size-4" />
      </button>
    </div>
  );
}
