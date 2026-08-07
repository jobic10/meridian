"use server";

import bcrypt from "bcryptjs";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const staffSchema = z.object({
  name: z.string().min(1, "Enter the staff member's full name"),
  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .regex(/^[a-z0-9._-]+$/i, "Use letters, numbers, dots or dashes only"),
  email: z.string().email().optional().or(z.literal("")),
  role: z.enum(["ADMIN", "DOCTOR", "NURSE", "RECORDS_OFFICER", "PHARMACIST"]),
  specialisation: z.string().optional(),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export type StaffFormState = { error?: string; success?: boolean } | undefined;

export async function createStaffAction(
  _prevState: StaffFormState,
  formData: FormData
): Promise<StaffFormState> {
  await requireRole(["ADMIN"]);

  const parsed = staffSchema.safeParse({
    name: formData.get("name"),
    username: formData.get("username"),
    email: formData.get("email") || "",
    role: formData.get("role"),
    specialisation: formData.get("specialisation") || undefined,
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Check the form and try again." };
  }

  const username = parsed.data.username.trim().toLowerCase();
  const existing = await prisma.user.findUnique({ where: { username } });
  if (existing) {
    return { error: "That username is already taken." };
  }

  const passwordHash = await bcrypt.hash(parsed.data.password, 10);

  await prisma.user.create({
    data: {
      name: parsed.data.name,
      username,
      email: parsed.data.email || undefined,
      role: parsed.data.role,
      specialisation:
        parsed.data.role === "DOCTOR" ? parsed.data.specialisation : undefined,
      passwordHash,
    },
  });

  revalidatePath("/admin/staff");
  return { success: true };
}

export async function toggleStaffStatusAction(userId: string) {
  const admin = await requireRole(["ADMIN"]);
  if (admin.id === userId) return;

  const target = await prisma.user.findUnique({
    where: { id: userId },
    select: { status: true },
  });
  if (!target) return;

  await prisma.user.update({
    where: { id: userId },
    data: { status: target.status === "ACTIVE" ? "INACTIVE" : "ACTIVE" },
  });

  revalidatePath("/admin/staff");
}
