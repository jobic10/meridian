"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { AlertCircle } from "lucide-react";
import { completeLabResultAction, type CompleteLabFormState } from "@/app/actions/labs";
import { Button } from "@/components/ui/button";
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

export function CompleteLabDialog({
  labResultId,
  testName,
}: {
  labResultId: string;
  testName: string;
}) {
  const [open, setOpen] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const toast = useToast();

  const [state, formAction, pending] = useActionState<CompleteLabFormState, FormData>(
    completeLabResultAction,
    undefined
  );

  useEffect(() => {
    if (state?.success) {
      toast({ variant: "success", title: "Result recorded" });
      formRef.current?.reset();
      setOpen(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="secondary">
          Enter result
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogHeading>{testName}</DialogHeading>
        </DialogHeader>
        <form ref={formRef} action={formAction}>
          <DialogBody className="flex flex-col gap-4">
            <input type="hidden" name="labResultId" value={labResultId} />
            <Field label="Result" htmlFor="result" required>
              <Textarea id="result" name="result" rows={3} required />
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
              {pending ? "Saving…" : "Save result"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
