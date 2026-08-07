"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/auth";
import { apiPost, ApiError } from "@/lib/api";

const patientSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  gender: z.enum(["Male", "Female"]),
  dateOfBirth: z.string().min(1, "Date of birth is required"),
  address: z.string().optional(),
  phone: z.string().optional(),
  nextOfKin: z.string().optional(),
  nextOfKinPhone: z.string().optional(),
  bloodGroup: z.string().optional(),
  allergies: z.string().optional(),
});

export type PatientFormState = { error?: string } | undefined;

export async function createPatientAction(
  _prevState: PatientFormState,
  formData: FormData
): Promise<PatientFormState> {
  await requireRole(["RECORDS_OFFICER", "ADMIN"]);

  const parsed = patientSchema.safeParse({
    firstName: formData.get("firstName"),
    lastName: formData.get("lastName"),
    gender: formData.get("gender"),
    dateOfBirth: formData.get("dateOfBirth"),
    address: formData.get("address") || undefined,
    phone: formData.get("phone") || undefined,
    nextOfKin: formData.get("nextOfKin") || undefined,
    nextOfKinPhone: formData.get("nextOfKinPhone") || undefined,
    bloodGroup: formData.get("bloodGroup") || undefined,
    allergies: formData.get("allergies") || undefined,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Check the form and try again." };
  }

  let patient: { id: number };
  try {
    patient = await apiPost("/patients/", parsed.data);
  } catch (err) {
    if (err instanceof ApiError) return { error: err.message };
    return { error: "Unable to reach the server. Please try again." };
  }

  revalidatePath("/patients");
  redirect(`/patients/${patient.id}?registered=1`);
}
