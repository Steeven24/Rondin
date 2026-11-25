"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { getProfile, HOME_BY_ROLE } from "@/lib/auth";
import { env } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";

export interface FormState {
  error?: string;
  message?: string;
}

const loginSchema = z.object({
  email: z.email("Correo no válido"),
  password: z.string().min(1, "Ingresa tu contraseña"),
});

export async function login(_: FormState, formData: FormData): Promise<FormState> {
  const parsed = loginSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.issues[0]?.message };

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);
  // Same message for every failure so we don't reveal which emails exist.
  if (error) return { error: "Correo o contraseña incorrectos." };

  const profile = await getProfile();
  if (!profile) {
    await supabase.auth.signOut();
    return { error: "Tu cuenta no tiene un rol asignado. Contacta a la coordinación." };
  }
  redirect(HOME_BY_ROLE[profile.role]);
}

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}

export async function requestPasswordReset(_: FormState, formData: FormData): Promise<FormState> {
  const email = z.email().safeParse(formData.get("email"));
  if (!email.success) return { error: "Correo no válido" };

  const supabase = await createClient();
  await supabase.auth.resetPasswordForEmail(email.data, {
    redirectTo: `${env.siteUrl}/auth/callback?next=/reset-password`,
  });
  return { message: "Si el correo está registrado, te enviamos un enlace para cambiar la contraseña." };
}
