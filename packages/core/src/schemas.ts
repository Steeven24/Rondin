import { z } from "zod";
import { STATUSES_REQUIRING_REGISTRATION, VISIT_STATUSES } from "./constants";

const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .transform((value) => (value === "" ? null : value))
    .nullable();

/** One premise as it is stored in the database. */
export const premiseInputSchema = z.object({
  ruc: z.string().regex(/^\d{13}$/, "El RUC debe tener 13 dígitos"),
  trade_name: optionalText(160),
  owner_name: optionalText(160),
  activity: optionalText(160),
  address: optionalText(250),
  phone: optionalText(40),
  sector: optionalText(80),
  value: optionalText(40),
});
export type PremiseInput = z.infer<typeof premiseInputSchema>;

/** Payload sent by the coordinator to create a survey from the Excel file. */
export const surveyImportSchema = z.object({
  name: z.string().trim().min(3).max(120),
  institution: optionalText(160),
  period: optionalText(60),
  groups: z
    .array(
      z.object({
        name: z.string().trim().min(1).max(80),
        source_sheet: z.string().max(80),
        team_code: z.string().regex(/^G\d{1,3}$/).nullable(),
        premises: z.array(premiseInputSchema).max(2000),
      }),
    )
    .min(1)
    .max(50)
    .refine((groups) => {
      const codes = groups.map((g) => g.team_code).filter(Boolean);
      return new Set(codes).size === codes.length;
    }, "Dos hojas tienen el mismo código de grupo"),
});
export type SurveyImport = z.infer<typeof surveyImportSchema>;

/** Visit form sent by a member. */
export const visitInputSchema = z
  .object({
    premise_id: z.uuid(),
    status: z.enum(VISIT_STATUSES),
    registration_number: optionalText(40),
    notes: optionalText(1000),
    latitude: z.number().min(-90).max(90).nullable(),
    longitude: z.number().min(-180).max(180).nullable(),
  })
  .refine((v) => !STATUSES_REQUIRING_REGISTRATION.includes(v.status) || !!v.registration_number, {
    message: "Ingresa el número de registro anual",
    path: ["registration_number"],
  });
export type VisitInput = z.infer<typeof visitInputSchema>;
