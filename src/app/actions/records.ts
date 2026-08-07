"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

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
  const user = await requireRole(["DOCTOR", "ADMIN"]);

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

  const patient = await prisma.patient.findUnique({
    where: { id: parsed.data.patientId },
    select: { id: true },
  });
  if (!patient) return { error: "Patient not found." };

  await prisma.medicalRecord.create({
    data: {
      patientId: parsed.data.patientId,
      doctorId: user.id,
      symptoms: parsed.data.symptoms,
      diagnosis: parsed.data.diagnosis,
      treatmentNotes: parsed.data.treatmentNotes,
      prescriptions: {
        create: parsed.data.prescriptions.map((p) => ({
          drugName: p.drugName,
          dosage: p.dosage,
          duration: p.duration,
        })),
      },
    },
  });

  revalidatePath(`/patients/${parsed.data.patientId}`);
  return { success: true };
}
