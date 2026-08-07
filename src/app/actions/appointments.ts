"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const SCHEDULING_ROLES = ["ADMIN", "DOCTOR", "NURSE", "RECORDS_OFFICER"] as const;

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
  await requireRole([...SCHEDULING_ROLES]);

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

  const date = new Date(parsed.data.date);
  if (Number.isNaN(date.getTime())) {
    return { error: "Enter a valid date." };
  }

  const [patient, doctor] = await Promise.all([
    prisma.patient.findUnique({ where: { id: parsed.data.patientId }, select: { id: true } }),
    prisma.user.findUnique({
      where: { id: parsed.data.doctorId },
      select: { id: true, role: true, status: true },
    }),
  ]);
  if (!patient) return { error: "Patient not found." };
  if (!doctor || doctor.role !== "DOCTOR" || doctor.status !== "ACTIVE") {
    return { error: "Select an active doctor." };
  }

  await prisma.appointment.create({
    data: {
      patientId: parsed.data.patientId,
      doctorId: parsed.data.doctorId,
      date,
      time: parsed.data.time,
      reason: parsed.data.reason,
    },
  });

  revalidatePath("/appointments");
  revalidatePath(`/patients/${parsed.data.patientId}`);
  revalidatePath("/dashboard");
  return { success: true };
}

export async function updateAppointmentStatusAction(
  appointmentId: string,
  status: "COMPLETED" | "CANCELLED" | "PENDING"
) {
  await requireRole([...SCHEDULING_ROLES]);

  const appointment = await prisma.appointment.update({
    where: { id: appointmentId },
    data: { status },
    select: { patientId: true },
  });

  revalidatePath("/appointments");
  revalidatePath(`/patients/${appointment.patientId}`);
  revalidatePath("/dashboard");
}
