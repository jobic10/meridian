"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { Plus, Trash2, Stethoscope, AlertCircle } from "lucide-react";
import { createMedicalRecordAction, type RecordFormState } from "@/app/actions/records";
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

type PrescriptionRow = { drugName: string; dosage: string; duration: string };

const emptyRow = (): PrescriptionRow => ({ drugName: "", dosage: "", duration: "" });

export function AddRecordDialog({ patientId }: { patientId: string }) {
  const [open, setOpen] = useState(false);
  const [rows, setRows] = useState<PrescriptionRow[]>([]);
  const formRef = useRef<HTMLFormElement>(null);
  const toast = useToast();

  const [state, formAction, pending] = useActionState<RecordFormState, FormData>(
    createMedicalRecordAction,
    undefined
  );

  useEffect(() => {
    if (state?.success) {
      toast({
        variant: "success",
        title: "Medical record saved",
        description: rows.length
          ? `${rows.length} prescription${rows.length > 1 ? "s" : ""} issued.`
          : undefined,
      });
      formRef.current?.reset();
      setRows([]);
      setOpen(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  function updateRow(i: number, patch: Partial<PrescriptionRow>) {
    setRows((prev) => prev.map((r, idx) => (idx === i ? { ...r, ...patch } : r)));
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Stethoscope className="size-4" /> Add medical record
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogHeading>Add medical record</DialogHeading>
        </DialogHeader>
        <form ref={formRef} action={formAction}>
          <DialogBody className="flex max-h-[65vh] flex-col gap-4 overflow-y-auto">
            <input type="hidden" name="patientId" value={patientId} />
            <Field label="Symptoms" htmlFor="symptoms" required>
              <Textarea
                id="symptoms"
                name="symptoms"
                rows={2}
                placeholder="What the patient reported…"
                required
              />
            </Field>
            <Field label="Diagnosis" htmlFor="diagnosis" required>
              <Textarea id="diagnosis" name="diagnosis" rows={2} required />
            </Field>
            <Field label="Treatment notes" htmlFor="treatmentNotes">
              <Textarea id="treatmentNotes" name="treatmentNotes" rows={2} />
            </Field>

            <div>
              <div className="mb-2 flex items-center justify-between">
                <p className="text-[12px] font-medium uppercase tracking-wide text-ink-muted">
                  Prescriptions
                </p>
                <button
                  type="button"
                  onClick={() => setRows((r) => [...r, emptyRow()])}
                  className="flex items-center gap-1 text-[12.5px] font-medium text-primary hover:underline"
                >
                  <Plus className="size-3.5" /> Add drug
                </button>
              </div>
              {rows.length === 0 ? (
                <p className="rounded-md border border-dashed border-border-strong px-3 py-3 text-[12.5px] text-ink-faint">
                  No prescriptions added for this visit.
                </p>
              ) : (
                <div className="flex flex-col gap-2">
                  {rows.map((row, i) => (
                    <div
                      key={i}
                      className="grid grid-cols-[1fr_1fr_1fr_auto] items-start gap-2 rounded-md border border-border p-2"
                    >
                      <Input
                        placeholder="Drug name"
                        value={row.drugName}
                        onChange={(e) => updateRow(i, { drugName: e.target.value })}
                      />
                      <Input
                        placeholder="Dosage"
                        value={row.dosage}
                        onChange={(e) => updateRow(i, { dosage: e.target.value })}
                      />
                      <Input
                        placeholder="Duration"
                        value={row.duration}
                        onChange={(e) => updateRow(i, { duration: e.target.value })}
                      />
                      <button
                        type="button"
                        onClick={() => setRows((r) => r.filter((_, idx) => idx !== i))}
                        className="flex size-9 items-center justify-center rounded-md text-ink-faint transition-colors hover:bg-danger-soft hover:text-danger"
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
              <input type="hidden" name="prescriptions" value={JSON.stringify(rows)} />
            </div>

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
              {pending ? "Saving…" : "Save record"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
