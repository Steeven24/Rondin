"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import type { FormState } from "@/app/(auth)/actions";
import { createClient } from "@/lib/supabase/server";

const passwordSchema = z
  .string()
  .min(8, "La contraseña debe tener al menos 8 caracteres")
  .regex(/[a-zA-Z]/, "La contraseña debe tener letras")
  .regex(/\d/, "La contraseña debe tener números");

export async function updatePassword(_: FormState, formData: FormData): Promise<FormState> {
  const parsed = passwordSchema.safeParse(formData.get("password"));
  if (!parsed.success) return { error: parsed.error.issues[0]?.message };

  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ password: parsed.data });
  if (error) return { error: "No se pudo cambiar la contraseña. Solicita un nuevo enlace." };
  redirect("/");
}
