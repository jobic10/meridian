"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/auth";
import { apiPost, ApiError } from "@/lib/api";

const prescriptionRowSchema = z.object({
  drugName: z.string().min(1),
  dosage: z.string().min(1),
  duration: z.string().min(1),
});

const recordSchema = z.object({
  patientId: z.string().min(1),
  symptoms: z.string().min(1, "Describe the reported symptoms"),
  diagnosis: z.string().min(1, "Enter a diagnosis"),
  treatmentNotes: z.string().optional(),
  prescriptions: z.array(prescriptionRowSchema).max(12),
});

export type RecordFormState = { error?: string; success?: boolean } | undefined;

export async function createMedicalRecordAction(
  _prevState: RecordFormState,
  formData: FormData
): Promise<RecordFormState> {
  await requireRole(["DOCTOR", "ADMIN"]);

  let prescriptions: unknown = [];
  try {
    const raw = formData.get("prescriptions");
    prescriptions = raw ? JSON.parse(String(raw)) : [];
  } catch {
    return { error: "Prescription details were malformed. Please retry." };
  }

  const parsed = recordSchema.safeParse({
    patientId: formData.get("patientId"),
    symptoms: formData.get("symptoms"),
    diagnosis: formData.get("diagnosis"),
    treatmentNotes: formData.get("treatmentNotes") || undefined,
    prescriptions,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Check the form and try again." };
  }

  try {
    await apiPost("/medical-records/", {
      patient: Number(parsed.data.patientId),
      symptoms: parsed.data.symptoms,
      diagnosis: parsed.data.diagnosis,
      treatmentNotes: parsed.data.treatmentNotes ?? "",
      prescriptions: parsed.data.prescriptions,
    });
  } catch (err) {
    if (err instanceof ApiError) return { error: err.message };
    return { error: "Unable to reach the server. Please try again." };
  }

  revalidatePath(`/patients/${parsed.data.patientId}`);
  return { success: true };
}
