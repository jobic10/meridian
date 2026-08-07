"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { apiPost, ApiError } from "@/lib/api";
import { createSession, deleteSession } from "@/lib/session";

const loginSchema = z.object({
  username: z.string().min(1, "Enter your username"),
  password: z.string().min(1, "Enter your password"),
});

export type LoginState = { error?: string } | undefined;

export async function loginAction(
  _prevState: LoginState,
  formData: FormData
): Promise<LoginState> {
  const parsed = loginSchema.safeParse({
    username: formData.get("username"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { error: "Enter both your username and password." };
  }

  try {
    const data = await apiPost("/auth/login/", {
      username: parsed.data.username.trim().toLowerCase(),
      password: parsed.data.password,
    });
    await createSession(data.access);
  } catch (err) {
    if (err instanceof ApiError) {
      return { error: err.message };
    }
    return { error: "Unable to reach the server. Please try again." };
  }

  redirect("/dashboard");
}

export async function logoutAction() {
  await deleteSession();
  redirect("/login");
}
