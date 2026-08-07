"use server";

import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/auth";
import { apiPatch } from "@/lib/api";

export async function dispensePrescriptionAction(prescriptionId: number) {
  await requireRole(["PHARMACIST", "ADMIN"]);

  const prescription = await apiPatch(`/prescriptions/${prescriptionId}/dispense/`);

  revalidatePath("/pharmacy");
  revalidatePath(`/patients/${prescription.patientId}`);
  revalidatePath("/dashboard");
}
