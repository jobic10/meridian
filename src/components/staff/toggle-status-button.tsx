"use client";

import { useTransition } from "react";
import { toggleStaffStatusAction } from "@/app/actions/staff";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";

export function ToggleStatusButton({
  userId,
  status,
  disabled,
}: {
  userId: number;
  status: "ACTIVE" | "INACTIVE";
  disabled?: boolean;
}) {
  const [isPending, startTransition] = useTransition();
  const toast = useToast();

  return (
    <Button
      size="sm"
      variant={status === "ACTIVE" ? "secondary" : "primary"}
      disabled={disabled || isPending}
      onClick={() =>
        startTransition(async () => {
          await toggleStaffStatusAction(userId);
          toast({
            variant: "info",
            title: status === "ACTIVE" ? "Account deactivated" : "Account reactivated",
          });
        })
      }
    >
      {isPending ? "…" : status === "ACTIVE" ? "Deactivate" : "Reactivate"}
    </Button>
  );
}
