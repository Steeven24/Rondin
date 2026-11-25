/** User roles. Must match the `user_role` enum in the database. */
export const ROLES = ["coordinator", "leader", "member"] as const;
export type Role = (typeof ROLES)[number];

/** Result of a visit. Must match the `visit_status` enum in the database. */
export const VISIT_STATUSES = [
  "operating_with_permit",
  "operating_without_permit",
  "temporarily_closed",
  "not_found",
  "not_visited",
] as const;
export type VisitStatus = (typeof VISIT_STATUSES)[number];

/** Leader review of a visit. Must match the `review_status` enum in the database. */
export const REVIEW_STATUSES = ["pending", "approved", "returned"] as const;
export type ReviewStatus = (typeof REVIEW_STATUSES)[number];

/** UI labels (the app is used in Spanish by its end users). */
export const VISIT_STATUS_LABELS: Record<VisitStatus, string> = {
  operating_with_permit: "Funciona con permiso",
  operating_without_permit: "Funciona sin permiso",
  temporarily_closed: "Cerrado temporalmente",
  not_found: "No existe o ya no funciona",
  not_visited: "No se pudo visitar",
};

export const REVIEW_STATUS_LABELS: Record<ReviewStatus, string> = {
  pending: "Por revisar",
  approved: "Aprobado",
  returned: "Devuelto",
};

export const ROLE_LABELS: Record<Role, string> = {
  coordinator: "Coordinador",
  leader: "Líder",
  member: "Miembro",
};

/** Statuses that require a registration number. */
export const STATUSES_REQUIRING_REGISTRATION: readonly VisitStatus[] = ["operating_with_permit"];

/** Statuses that require at least one photo as evidence. */
export const STATUSES_REQUIRING_PHOTO: readonly VisitStatus[] = ["temporarily_closed", "not_found"];
