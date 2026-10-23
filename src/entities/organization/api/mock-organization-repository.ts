import type { ApiListResponse } from "@/shared/api/contracts";
import { auditSummaryForAction } from "../model/audit";
import {
  getPlanById,
  type Organization,
  type OrganizationListItem,
} from "../model/organization";
import {
  nextStatusAfterReactivate,
  nextStatusAfterSuspend,
} from "../model/organization-rules";
import type {
  CreateOrganizationInput,
  InvitePrincipalAdminInput,
  ListOrganizationsFilters,
  OrganizationRepository,
  UpdateOrganizationInput,
} from "./organization-repository";
import { mockAuditLogRepository } from "./mock-audit-log-repository";

const suspendedPriorStatus = new Map<string, "active" | "trial">();

let organizations: Organization[] = [
  seedOrg({
    id: "org-001",
    tradeName: "Andina Retail",
    legalName: "Comercial Andina Cía. Ltda.",
    ruc: "1790123456001",
    email: "contacto@andina.demo",
    phone: "+593 99 123 4567",
    province: "Pichincha",
    city: "Quito",
    planId: "business",
    status: "active",
    registeredAt: "2025-08-12T10:00:00Z",
    admin: { fullName: "Carlos Vega", email: "admin@andina.demo", inviteStatus: "accepted" },
    activeUsersCount: 12,
  }),
  seedOrg({
    id: "org-002",
    tradeName: "Pacífico Trade",
    legalName: "Pacífico Comercial S.A.",
    ruc: "1790987654001",
    email: "info@pacifico.demo",
    phone: "+593 98 765 4321",
    province: "Guayas",
    city: "Guayaquil",
    planId: "growth",
    status: "active",
    registeredAt: "2025-09-01T14:30:00Z",
    admin: { fullName: "Laura Méndez", email: "admin@pacifico.demo", inviteStatus: "accepted" },
    activeUsersCount: 28,
  }),
  seedOrg({
    id: "org-003",
    tradeName: "Sierra Logistics",
    legalName: "Sierra Logística Cía. Ltda.",
    ruc: "1790555123001",
    email: "ops@sierra.demo",
    phone: "+593 97 111 2233",
    province: "Azuay",
    city: "Cuenca",
    planId: "trial",
    status: "trial",
    registeredAt: "2026-10-01T09:00:00Z",
    admin: { fullName: "Pedro Salgado", email: "admin@sierra.demo", inviteStatus: "pending" },
    activeUsersCount: 5,
  }),
  seedOrg({
    id: "org-004",
    tradeName: "Costa Foods",
    legalName: "Costa Alimentos S.A.",
    ruc: "1790444987001",
    email: "hola@costa.demo",
    phone: "+593 96 444 5566",
    province: "Manabí",
    city: "Manta",
    planId: "business",
    status: "suspended",
    registeredAt: "2025-06-20T11:00:00Z",
    admin: { fullName: "Ana Ruiz", email: "admin@costa.demo", inviteStatus: "accepted" },
    activeUsersCount: 0,
  }),
];

function seedOrg(input: {
  id: string;
  tradeName: string;
  legalName: string;
  ruc: string;
  email: string;
  phone: string;
  province: string;
  city: string;
  planId: Organization["planId"];
  status: Organization["status"];
  registeredAt: string;
  admin: Organization["admin"];
  activeUsersCount: number;
}): Organization {
  const plan = getPlanById(input.planId);
  return {
    id: input.id,
    tradeName: input.tradeName,
    legalName: input.legalName,
    ruc: input.ruc,
    email: input.email,
    phone: input.phone,
    country: "Ecuador",
    province: input.province,
    city: input.city,
    planId: input.planId,
    status: input.status,
    registeredAt: input.registeredAt,
    admin: input.admin,
    activeUsersCount: input.activeUsersCount,
    limits: defaultLimitsForPlan(plan.id),
    tenantIsolationKey: `tenant-${input.id}`,
  };
}

function defaultLimitsForPlan(planId: Organization["planId"]): Organization["limits"] {
  const plan = getPlanById(planId);
  const storageByPlan = { trial: 10, growth: 50, business: 150 } as const;
  const branchesByPlan = { trial: 1, growth: 3, business: 10 } as const;
  return {
    maxUsers: plan.maxUsers,
    maxBranches: branchesByPlan[planId],
    storageGb: storageByPlan[planId],
  };
}

function toListItem(org: Organization): OrganizationListItem {
  const plan = getPlanById(org.planId);
  return {
    id: org.id,
    tradeName: org.tradeName,
    legalName: org.legalName,
    ruc: org.ruc,
    planName: plan.name,
    status: org.status,
    registeredAt: org.registeredAt,
    activeUsersCount: org.activeUsersCount,
  };
}

async function audit(
  organizationId: string,
  action: Parameters<typeof auditSummaryForAction>[0],
  tradeName: string,
  actorEmail: string,
) {
  await mockAuditLogRepository.append({
    organizationId,
    action,
    summary: auditSummaryForAction(action, tradeName),
    actorEmail,
    occurredAt: new Date().toISOString(),
  });
}

export const mockOrganizationRepository: OrganizationRepository = {
  async list(filters: ListOrganizationsFilters): Promise<ApiListResponse<OrganizationListItem>> {
    await delay(350);
    let rows = [...organizations];
    const q = filters.search?.trim().toLowerCase();
    if (q) {
      rows = rows.filter(
        (o) =>
          o.tradeName.toLowerCase().includes(q) ||
          o.legalName.toLowerCase().includes(q) ||
          o.ruc.includes(q),
      );
    }
    if (filters.status && filters.status !== "all") {
      rows = rows.filter((o) => o.status === filters.status);
    }
    if (filters.planId && filters.planId !== "all") {
      rows = rows.filter((o) => o.planId === filters.planId);
    }
    rows.sort(
      (a, b) =>
        new Date(b.registeredAt).getTime() - new Date(a.registeredAt).getTime(),
    );
    const totalItems = rows.length;
    const totalPages = Math.max(1, Math.ceil(totalItems / filters.pageSize));
    const page = Math.min(filters.page, totalPages);
    const start = (page - 1) * filters.pageSize;
    const data = rows.slice(start, start + filters.pageSize).map(toListItem);
    return {
      data,
      meta: { page, pageSize: filters.pageSize, totalItems, totalPages },
    };
  },

  async getById(id) {
    await delay(200);
    return organizations.find((o) => o.id === id) ?? null;
  },

  async create(input: CreateOrganizationInput, actorEmail: string) {
    await delay(450);
    const plan = getPlanById(input.planId)!;
    const id = `org-${Date.now()}`;
    const org: Organization = {
      id,
      tradeName: input.tradeName,
      legalName: input.legalName,
      ruc: input.ruc.replace(/\D/g, ""),
      email: input.email,
      phone: input.phone,
      country: input.country,
      province: input.province,
      city: input.city,
      planId: input.planId,
      status: input.planId === "trial" ? "trial" : "active",
      registeredAt: new Date().toISOString(),
      admin: {
        fullName: input.principalAdmin.fullName,
        email: input.principalAdmin.email,
        inviteStatus: "pending",
      },
      activeUsersCount: 0,
      limits: input.limits,
      tenantIsolationKey: `tenant-${id}`,
    };
    organizations = [org, ...organizations];
    await audit(id, "organization.created", org.tradeName, actorEmail);
    await audit(id, "principal_admin.invited", org.tradeName, actorEmail);
    return org;
  },

  async update(id, input: UpdateOrganizationInput, actorEmail: string) {
    await delay(400);
    const idx = organizations.findIndex((o) => o.id === id);
    if (idx < 0) throw new Error("NOT_FOUND");
    const current = organizations[idx]!;
    const updated: Organization = {
      ...current,
      tradeName: input.tradeName,
      legalName: input.legalName,
      ruc: input.ruc.replace(/\D/g, ""),
      email: input.email,
      phone: input.phone,
      country: input.country,
      province: input.province,
      city: input.city,
      planId: input.planId,
      limits: input.limits,
    };
    organizations[idx] = updated;
    await audit(id, "organization.updated", updated.tradeName, actorEmail);
    return updated;
  },

  async suspend(id, actorEmail) {
    await delay(350);
    const idx = organizations.findIndex((o) => o.id === id);
    if (idx < 0) throw new Error("NOT_FOUND");
    const org = organizations[idx]!;
    if (org.status !== "suspended") {
      suspendedPriorStatus.set(id, org.status === "trial" ? "trial" : "active");
    }
    organizations[idx] = {
      ...org,
      status: nextStatusAfterSuspend(),
      activeUsersCount: 0,
    };
    await audit(id, "organization.suspended", org.tradeName, actorEmail);
    return organizations[idx]!;
  },

  async reactivate(id, actorEmail) {
    await delay(350);
    const idx = organizations.findIndex((o) => o.id === id);
    if (idx < 0) throw new Error("NOT_FOUND");
    const org = organizations[idx]!;
    const wasTrial = suspendedPriorStatus.get(id) === "trial";
    organizations[idx] = {
      ...org,
      status: nextStatusAfterReactivate(wasTrial),
    };
    suspendedPriorStatus.delete(id);
    await audit(id, "organization.reactivated", org.tradeName, actorEmail);
    return organizations[idx]!;
  },

  async invitePrincipalAdmin(input: InvitePrincipalAdminInput, actorEmail: string) {
    await delay(400);
    const idx = organizations.findIndex((o) => o.id === input.organizationId);
    if (idx < 0) throw new Error("NOT_FOUND");
    const org = organizations[idx]!;
    organizations[idx] = {
      ...org,
      admin: {
        fullName: input.fullName,
        email: input.email,
        inviteStatus: "pending",
      },
    };
    await audit(
      input.organizationId,
      "principal_admin.invited",
      org.tradeName,
      actorEmail,
    );
    return organizations[idx]!;
  },
};

function delay(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}
