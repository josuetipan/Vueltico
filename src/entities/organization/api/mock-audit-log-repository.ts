import type { AdminAuditEntry } from "../model/audit";
import type { AuditLogRepository } from "./audit-log-repository";

const store: AdminAuditEntry[] = [];

export const mockAuditLogRepository: AuditLogRepository = {
  async append(entry) {
    await delay(80);
    const row: AdminAuditEntry = {
      ...entry,
      id: `aud-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    };
    store.unshift(row);
    return row;
  },
  async listByOrganization(organizationId) {
    await delay(120);
    return store.filter((e) => e.organizationId === organizationId);
  },
};

function delay(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}
