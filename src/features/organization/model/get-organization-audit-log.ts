import type { AuditLogRepository } from "@/entities/organization/api/audit-log-repository";

export function createGetOrganizationAuditLogUseCase(repo: AuditLogRepository) {
  return repo.listByOrganization.bind(repo);
}
