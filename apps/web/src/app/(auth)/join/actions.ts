"use server";

import { isValidNationalId } from "@rondin/core";
import { redirect } from "next/navigation";
import { z } from "zod";
import type { FormState } from "@/app/(auth)/actions";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

const joinSchema = z.object({
  code: z
    .string()
    .trim()
    .toUpperCase()
    .regex(/^[A-Z0-9]{8}$/, "El código tiene 8 caracteres"),
  full_name: z.string().trim().min(3, "Ingresa tu nombre completo").max(120),
  national_id: z.string().trim().refine(isValidNationalId, "Cédula no válida"),
  email: z.email("Correo no válido"),
  password: z
    .string()
    .min(8, "La contraseña debe tener al menos 8 caracteres")
    .regex(/[a-zA-Z]/, "La contraseña debe tener letras")
    .regex(/\d/, "La contraseña debe tener números"),
  privacy: z.literal("on", { error: "Debes aceptar el aviso de privacidad" }),
});

/** Creates a member account and joins it to the team of the invitation code, in one step. */
export async function joinWithCode(_: FormState, formData: FormData): Promise<FormState> {
  const parsed = joinSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.issues[0]?.message };
  const { code, full_name, national_id, email, password } = parsed.data;

  const admin = createAdminClient();
  const { data: team } = await admin.from("teams").select("id").eq("invite_code", code).maybeSingle();
  if (!team) return { error: "El código de invitación no es válido." };

  const { data: created, error: createError } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });
  if (createError || !created.user) {
    return { error: "No se pudo crear la cuenta. Puede que el correo ya esté registrado." };
  }

  const { error: profileError } = await admin.from("profiles").insert({
    id: created.user.id,
    full_name,
    national_id,
    email,
    role: "member",
    team_id: team.id,
    privacy_accepted_at: new Date().toISOString(),
  });
  if (profileError) {
    // Roll back so we don't leave an account without a profile.
    await admin.auth.admin.deleteUser(created.user.id);
    return { error: "No se pudo completar el registro. Inténtalo de nuevo." };
  }

  const supabase = await createClient();
  await supabase.auth.signInWithPassword({ email, password });
  redirect("/member");
}
