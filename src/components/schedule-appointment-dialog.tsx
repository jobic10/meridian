"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { CalendarPlus, AlertCircle } from "lucide-react";
import { createAppointmentAction, type AppointmentFormState } from "@/app/actions/appointments";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Field } from "@/components/ui/field";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
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

type Doctor = { id: number; name: string; specialisation: string | null };
type PatientOption = { id: number; label: string };

export function ScheduleAppointmentDialog({
  doctors,
  patientId,
  patients,
  trigger,
}: {
  doctors: Doctor[];
  patientId?: string;
  patients?: PatientOption[];
  trigger?: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const toast = useToast();

  const [state, formAction, pending] = useActionState<AppointmentFormState, FormData>(
    createAppointmentAction,
    undefined
  );

  useEffect(() => {
    if (state?.success) {
      toast({ variant: "success", title: "Appointment scheduled" });
      formRef.current?.reset();
      setOpen(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  const today = new Date().toISOString().slice(0, 10);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button>
            <CalendarPlus className="size-4" /> Schedule appointment
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogHeading>Schedule appointment</DialogHeading>
        </DialogHeader>
        <form ref={formRef} action={formAction}>
          <DialogBody className="flex flex-col gap-4">
            {patientId ? (
              <input type="hidden" name="patientId" value={patientId} />
            ) : (
              <Field label="Patient" htmlFor="patientId" required>
                <Select name="patientId" required>
                  <SelectTrigger id="patientId">
                    <SelectValue placeholder="Select patient" />
                  </SelectTrigger>
                  <SelectContent>
                    {(patients ?? []).map((p) => (
                      <SelectItem key={p.id} value={String(p.id)}>
                        {p.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
            )}
            <Field label="Doctor" htmlFor="doctorId" required>
              <Select name="doctorId" required>
                <SelectTrigger id="doctorId">
                  <SelectValue placeholder="Select doctor" />
                </SelectTrigger>
                <SelectContent>
                  {doctors.map((d) => (
                    <SelectItem key={d.id} value={String(d.id)}>
                      {d.name}
                      {d.specialisation ? ` — ${d.specialisation}` : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Date" htmlFor="date" required>
                <Input id="date" name="date" type="date" min={today} required />
              </Field>
              <Field label="Time" htmlFor="time" required>
                <Input id="time" name="time" type="time" required />
              </Field>
            </div>
            <Field label="Reason" htmlFor="reason" hint="Optional">
              <Textarea id="reason" name="reason" rows={2} />
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
              {pending ? "Scheduling…" : "Schedule"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
