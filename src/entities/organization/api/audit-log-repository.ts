import type { AdminAuditEntry } from "@/entities/organization/model/audit";

export type AuditLogRepository = {
  append(entry: Omit<AdminAuditEntry, "id">): Promise<AdminAuditEntry>;
  listByOrganization(organizationId: string): Promise<AdminAuditEntry[]>;
};
