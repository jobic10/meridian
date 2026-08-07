"use client";

import { useTransition } from "react";
import { dispensePrescriptionAction } from "@/app/actions/pharmacy";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";

export function DispenseButton({
  prescriptionId,
  drugName,
}: {
  prescriptionId: number;
  drugName: string;
}) {
  const [isPending, startTransition] = useTransition();
  const toast = useToast();

  return (
    <Button
      size="sm"
      variant="secondary"
      disabled={isPending}
      onClick={() =>
        startTransition(async () => {
          await dispensePrescriptionAction(prescriptionId);
          toast({ variant: "success", title: `${drugName} dispensed` });
        })
      }
    >
      {isPending ? "Dispensing…" : "Dispense"}
    </Button>
  );
}
