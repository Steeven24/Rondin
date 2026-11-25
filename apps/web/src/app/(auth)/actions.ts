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
  if (error) {
    // Wrong email and wrong password get the same message so we don't reveal which emails exist.
    if (error.code === "invalid_credentials") return { error: "Correo o contraseña incorrectos." };
    // Anything else is a configuration or connection problem: log it (never the email or password).
    console.error("Sign-in failed", { status: error.status, code: error.code, name: error.name, message: error.message });
    return { error: "No se pudo conectar con el servicio de inicio de sesión. Inténtalo más tarde." };
  }

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
