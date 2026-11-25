"use server";

import { isValidNationalId } from "@rondin/core";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import type { FormState } from "@/app/(auth)/actions";
import { requireRole } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

const leaderSchema = z.object({
  team_id: z.uuid(),
  full_name: z.string().trim().min(3, "Ingresa el nombre completo").max(120),
  national_id: z.string().trim().refine(isValidNationalId, "Cédula no válida"),
  email: z.email("Correo no válido"),
  password: z
    .string()
    .min(8, "La contraseña temporal debe tener al menos 8 caracteres")
    .regex(/[a-zA-Z]/, "La contraseña debe tener letras")
    .regex(/\d/, "La contraseña debe tener números"),
});

/**
 * Creates the leader account of a team. The leader stays with the team in later surveys.
 * The coordinator shares the temporary password.
 */
export async function createLeader(_: FormState, formData: FormData): Promise<FormState> {
  await requireRole("coordinator");
  const parsed = leaderSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.issues[0]?.message };
  const { team_id, full_name, national_id, email, password } = parsed.data;

  // Checked with the user's own client, so RLS confirms the coordinator can see the team.
  const supabase = await createClient();
  const { data: team } = await supabase.from("teams").select("id, leader_id").eq("id", team_id).single();
  if (!team) return { error: "Equipo no encontrado." };
  if (team.leader_id) return { error: "Este equipo ya tiene un líder." };

  const admin = createAdminClient();
  const { data: created, error } = await admin.auth.admin.createUser({ email, password, email_confirm: true });
  if (error || !created.user) return { error: "No se pudo crear la cuenta. Puede que el correo ya esté registrado." };

  const { error: profileError } = await admin
    .from("profiles")
    .insert({ id: created.user.id, full_name, national_id, email, role: "leader", team_id });
  const { error: teamError } = profileError
    ? { error: profileError }
    : await admin.from("teams").update({ leader_id: created.user.id }).eq("id", team_id);

  if (profileError || teamError) {
    await admin.auth.admin.deleteUser(created.user.id);
    return { error: "No se pudo asignar el líder. Inténtalo de nuevo." };
  }

  revalidatePath("/coordinator/groups");
  return { message: `Líder asignado. Comparte el correo y la contraseña temporal con ${full_name}.` };
}
