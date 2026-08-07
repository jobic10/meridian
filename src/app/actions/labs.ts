"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const LAB_ROLES = ["ADMIN", "DOCTOR", "NURSE"] as const;

const labSchema = z.object({
  patientId: z.string().min(1),
  testName: z.string().min(1, "Enter the test name"),
  result: z.string().optional(),
  notes: z.string().optional(),
});

export type LabFormState = { error?: string; success?: boolean } | undefined;

export async function createLabResultAction(
  _prevState: LabFormState,
  formData: FormData
): Promise<LabFormState> {
  const user = await requireRole([...LAB_ROLES]);

  const parsed = labSchema.safeParse({
    patientId: formData.get("patientId"),
    testName: formData.get("testName"),
    result: formData.get("result") || undefined,
    notes: formData.get("notes") || undefined,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Check the form and try again." };
  }

  const patient = await prisma.patient.findUnique({
    where: { id: parsed.data.patientId },
    select: { id: true },
  });
  if (!patient) return { error: "Patient not found." };

  const hasResult = Boolean(parsed.data.result?.trim());

  await prisma.labResult.create({
    data: {
      patientId: parsed.data.patientId,
      testName: parsed.data.testName,
      result: parsed.data.result,
      notes: parsed.data.notes,
      status: hasResult ? "COMPLETED" : "PENDING",
      enteredById: user.id,
      completedAt: hasResult ? new Date() : null,
    },
  });

  revalidatePath(`/patients/${parsed.data.patientId}`);
  revalidatePath("/lab");
  return { success: true };
}

const completeSchema = z.object({
  labResultId: z.string().min(1),
  result: z.string().min(1, "Enter the result"),
  notes: z.string().optional(),
});

export type CompleteLabFormState = { error?: string; success?: boolean } | undefined;

export async function completeLabResultAction(
  _prevState: CompleteLabFormState,
  formData: FormData
): Promise<CompleteLabFormState> {
  await requireRole([...LAB_ROLES]);

  const parsed = completeSchema.safeParse({
    labResultId: formData.get("labResultId"),
    result: formData.get("result"),
    notes: formData.get("notes") || undefined,
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Enter the result." };
  }

  const lab = await prisma.labResult.update({
    where: { id: parsed.data.labResultId },
    data: {
      result: parsed.data.result,
      notes: parsed.data.notes,
      status: "COMPLETED",
      completedAt: new Date(),
    },
    select: { patientId: true },
  });

  revalidatePath(`/patients/${lab.patientId}`);
  revalidatePath("/lab");
  return { success: true };
}
