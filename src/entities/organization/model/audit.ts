export const ADMIN_AUDIT_ACTIONS = [
  "organization.created",
  "organization.updated",
  "organization.suspended",
  "organization.reactivated",
  "principal_admin.invited",
] as const;

export type AdminAuditAction = (typeof ADMIN_AUDIT_ACTIONS)[number];

export type AdminAuditEntry = {
  id: string;
  organizationId: string;
  action: AdminAuditAction;
  summary: string;
  actorEmail: string;
  occurredAt: string;
};

export function auditSummaryForAction(
  action: AdminAuditAction,
  tradeName: string,
): string {
  switch (action) {
    case "organization.created":
      return `Organización «${tradeName}» registrada en la plataforma.`;
    case "organization.updated":
      return `Datos de «${tradeName}» actualizados.`;
    case "organization.suspended":
      return `Acceso de «${tradeName}» suspendido (datos conservados).`;
    case "organization.reactivated":
      return `«${tradeName}» reactivada.`;
    case "principal_admin.invited":
      return `Invitación enviada al administrador principal de «${tradeName}».`;
  }
}
