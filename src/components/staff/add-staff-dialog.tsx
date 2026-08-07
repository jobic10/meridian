"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { UserPlus, AlertCircle } from "lucide-react";
import { createStaffAction, type StaffFormState } from "@/app/actions/staff";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { ROLES, ROLE_LABELS } from "@/lib/rbac";

export function AddStaffDialog() {
  const [open, setOpen] = useState(false);
  const [role, setRole] = useState("DOCTOR");
  const formRef = useRef<HTMLFormElement>(null);
  const toast = useToast();

  const [state, formAction, pending] = useActionState<StaffFormState, FormData>(
    createStaffAction,
    undefined
  );

  useEffect(() => {
    if (state?.success) {
      toast({ variant: "success", title: "Staff account created" });
      formRef.current?.reset();
      setRole("DOCTOR");
      setOpen(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <UserPlus className="size-4" /> New staff account
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogHeading>Create staff account</DialogHeading>
        </DialogHeader>
        <form ref={formRef} action={formAction}>
          <DialogBody className="flex flex-col gap-4">
            <Field label="Full name" htmlFor="name" required>
              <Input id="name" name="name" required />
            </Field>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Username" htmlFor="username" required>
                <Input id="username" name="username" placeholder="e.g. dr.okafor" required />
              </Field>
              <Field label="Role" htmlFor="role" required>
                <Select name="role" value={role} onValueChange={setRole} required>
                  <SelectTrigger id="role">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ROLES.map((r) => (
                      <SelectItem key={r} value={r}>
                        {ROLE_LABELS[r]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
            </div>
            {role === "DOCTOR" && (
              <Field label="Specialisation" htmlFor="specialisation" hint="Optional">
                <Input id="specialisation" name="specialisation" placeholder="e.g. Paediatrics" />
              </Field>
            )}
            <Field label="Work email" htmlFor="email" hint="Optional">
              <Input id="email" name="email" type="email" />
            </Field>
            <Field
              label="Temporary password"
              htmlFor="password"
              required
              hint="Share this with the staff member directly."
            >
              <Input id="password" name="password" type="text" minLength={6} required />
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
              {pending ? "Creating…" : "Create account"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
