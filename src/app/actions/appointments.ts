"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/auth";
import { apiPost, apiPatch, ApiError } from "@/lib/api";

const appointmentSchema = z.object({
  patientId: z.string().min(1, "Select a patient"),
  doctorId: z.string().min(1, "Select a doctor"),
  date: z.string().min(1, "Select a date"),
  time: z.string().min(1, "Select a time"),
  reason: z.string().optional(),
});

export type AppointmentFormState = { error?: string; success?: boolean } | undefined;

export async function createAppointmentAction(
  _prevState: AppointmentFormState,
  formData: FormData
): Promise<AppointmentFormState> {
  await requireRole(["ADMIN", "DOCTOR", "NURSE", "RECORDS_OFFICER"]);

  const parsed = appointmentSchema.safeParse({
    patientId: formData.get("patientId"),
    doctorId: formData.get("doctorId"),
    date: formData.get("date"),
    time: formData.get("time"),
    reason: formData.get("reason") || undefined,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Check the form and try again." };
  }

  try {
    await apiPost("/appointments/", {
      patient: Number(parsed.data.patientId),
      doctor: Number(parsed.data.doctorId),
      date: parsed.data.date,
      time: parsed.data.time,
      reason: parsed.data.reason,
    });
  } catch (err) {
    if (err instanceof ApiError) return { error: err.message };
    return { error: "Unable to reach the server. Please try again." };
  }

  revalidatePath("/appointments");
  revalidatePath(`/patients/${parsed.data.patientId}`);
  revalidatePath("/dashboard");
  return { success: true };
}

export async function updateAppointmentStatusAction(
  appointmentId: number,
  status: "COMPLETED" | "CANCELLED" | "PENDING"
) {
  await requireRole(["ADMIN", "DOCTOR", "NURSE", "RECORDS_OFFICER"]);

  const appointment = await apiPatch(`/appointments/${appointmentId}/status/`, { status });

  revalidatePath("/appointments");
  revalidatePath(`/patients/${appointment.patientId}`);
  revalidatePath("/dashboard");
}
