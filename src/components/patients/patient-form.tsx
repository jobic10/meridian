"use client";

import { useActionState } from "react";
import { createPatientAction, type PatientFormState } from "@/app/actions/patients";
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
import { AlertCircle } from "lucide-react";

const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

export function PatientForm() {
  const [state, formAction, pending] = useActionState<PatientFormState, FormData>(
    createPatientAction,
    undefined
  );

  return (
    <form action={formAction} className="flex flex-col gap-6">
      <section>
        <h3 className="mb-3 text-[12px] font-semibold uppercase tracking-wide text-ink-faint">
          Personal details
        </h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="First name" htmlFor="firstName" required>
            <Input id="firstName" name="firstName" required />
          </Field>
          <Field label="Last name" htmlFor="lastName" required>
            <Input id="lastName" name="lastName" required />
          </Field>
          <Field label="Gender" htmlFor="gender" required>
            <Select name="gender" defaultValue="Female" required>
              <SelectTrigger id="gender">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Female">Female</SelectItem>
                <SelectItem value="Male">Male</SelectItem>
              </SelectContent>
            </Select>
          </Field>
          <Field label="Date of birth" htmlFor="dateOfBirth" required>
            <Input
              id="dateOfBirth"
              name="dateOfBirth"
              type="date"
              max={new Date().toISOString().slice(0, 10)}
              required
            />
          </Field>
          <Field label="Blood group" htmlFor="bloodGroup">
            <Select name="bloodGroup">
              <SelectTrigger id="bloodGroup">
                <SelectValue placeholder="Unknown" />
              </SelectTrigger>
              <SelectContent>
                {BLOOD_GROUPS.map((g) => (
                  <SelectItem key={g} value={g}>
                    {g}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <Field label="Phone number" htmlFor="phone">
            <Input id="phone" name="phone" type="tel" placeholder="0801 234 5678" />
          </Field>
        </div>
      </section>

      <section>
        <h3 className="mb-3 text-[12px] font-semibold uppercase tracking-wide text-ink-faint">
          Contact & next of kin
        </h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Residential address" htmlFor="address" className="sm:col-span-2">
            <Input id="address" name="address" />
          </Field>
          <Field label="Next of kin" htmlFor="nextOfKin">
            <Input id="nextOfKin" name="nextOfKin" />
          </Field>
          <Field label="Next of kin phone" htmlFor="nextOfKinPhone">
            <Input id="nextOfKinPhone" name="nextOfKinPhone" type="tel" />
          </Field>
        </div>
      </section>

      <section>
        <h3 className="mb-3 text-[12px] font-semibold uppercase tracking-wide text-ink-faint">
          Clinical notes
        </h3>
        <Field
          label="Known allergies"
          htmlFor="allergies"
          hint="Leave blank if none reported."
        >
          <Textarea id="allergies" name="allergies" rows={3} />
        </Field>
      </section>

      {state?.error && (
        <div className="flex items-start gap-2 rounded-md border border-danger/20 bg-danger-soft px-3 py-2.5 text-[13px] text-danger">
          <AlertCircle className="mt-0.5 size-4 shrink-0" />
          <span>{state.error}</span>
        </div>
      )}

      <div className="flex items-center justify-end gap-2 border-t border-border pt-5">
        <Button type="submit" disabled={pending}>
          {pending ? "Registering…" : "Register patient"}
        </Button>
      </div>
    </form>
  );
}
