"use server";

import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function dispensePrescriptionAction(prescriptionId: string) {
  const user = await requireRole(["PHARMACIST", "ADMIN"]);

  const prescription = await prisma.prescription.update({
    where: { id: prescriptionId },
    data: {
      dispensed: true,
      dispensedById: user.id,
      dispensedAt: new Date(),
    },
    include: { medicalRecord: { select: { patientId: true } } },
  });

  revalidatePath("/pharmacy");
  revalidatePath(`/patients/${prescription.medicalRecord.patientId}`);
  revalidatePath("/dashboard");
}
