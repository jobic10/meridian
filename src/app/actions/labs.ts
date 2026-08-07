"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/auth";
import { apiPost, apiPatch, ApiError } from "@/lib/api";

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
  await requireRole(["ADMIN", "DOCTOR", "NURSE"]);

  const parsed = labSchema.safeParse({
    patientId: formData.get("patientId"),
    testName: formData.get("testName"),
    result: formData.get("result") || undefined,
    notes: formData.get("notes") || undefined,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Check the form and try again." };
  }

  try {
    await apiPost("/lab-results/create/", {
      patient: Number(parsed.data.patientId),
      test_name: parsed.data.testName,
      result: parsed.data.result,
      notes: parsed.data.notes,
    });
  } catch (err) {
    if (err instanceof ApiError) return { error: err.message };
    return { error: "Unable to reach the server. Please try again." };
  }

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
  await requireRole(["ADMIN", "DOCTOR", "NURSE"]);

  const parsed = completeSchema.safeParse({
    labResultId: formData.get("labResultId"),
    result: formData.get("result"),
    notes: formData.get("notes") || undefined,
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Enter the result." };
  }

  let lab: { patientId: number };
  try {
    lab = await apiPatch(`/lab-results/${parsed.data.labResultId}/complete/`, {
      result: parsed.data.result,
      notes: parsed.data.notes,
    });
  } catch (err) {
    if (err instanceof ApiError) return { error: err.message };
    return { error: "Unable to reach the server. Please try again." };
  }

  revalidatePath(`/patients/${lab.patientId}`);
  revalidatePath("/lab");
  return { success: true };
}
