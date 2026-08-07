"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { FlaskConical, AlertCircle } from "lucide-react";
import { createLabResultAction, type LabFormState } from "@/app/actions/labs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Field } from "@/components/ui/field";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogHeading,
  DialogBody,
  DialogFooter,
} from "@/components/ui/dialog";
import { useToast } from "@/components/ui/toast";

export function AddLabDialog({ patientId }: { patientId: string }) {
  const [open, setOpen] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const toast = useToast();

  const [state, formAction, pending] = useActionState<LabFormState, FormData>(
    createLabResultAction,
    undefined
  );

  useEffect(() => {
    if (state?.success) {
      toast({ variant: "success", title: "Lab entry saved" });
      formRef.current?.reset();
      setOpen(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="secondary">
          <FlaskConical className="size-4" /> Order / enter lab test
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogHeading>Order or enter lab test</DialogHeading>
        </DialogHeader>
        <form ref={formRef} action={formAction}>
          <DialogBody className="flex flex-col gap-4">
            <input type="hidden" name="patientId" value={patientId} />
            <Field label="Test name" htmlFor="testName" required>
              <Input id="testName" name="testName" placeholder="e.g. Full Blood Count" required />
            </Field>
            <Field
              label="Result"
              htmlFor="result"
              hint="Leave blank to record this as pending — you can complete it later from the Laboratory page."
            >
              <Textarea id="result" name="result" rows={2} />
            </Field>
            <Field label="Notes" htmlFor="notes" hint="Optional">
              <Textarea id="notes" name="notes" rows={2} />
            </Field>

            {state?.error && (
              <div className="flex items-start gap-2 rounded-md border border-danger/20 bg-danger-soft px-3 py-2.5 text-[13px] text-danger">
                <AlertCircle className="mt-0.5 size-4 shrink-0" />
                <span>{state.error}</span>
              </div>
            )}
          </DialogBody>
          <DialogFooter>
            <Button type="button" variant="secondary" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={pending}>
              {pending ? "Saving…" : "Save"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
