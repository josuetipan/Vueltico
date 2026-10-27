import type { ApiListResponse } from "@/shared/api/contracts";
import { resolvePageSize } from "@/shared/lib/table-pagination";
import { getPlanById } from "@/entities/plan";
import { auditSummaryForAction } from "../model/audit";
import type { Organization, OrganizationListItem } from "../model/organization";
import {
  initialSubscriptionStatusForPlan,
  nextStatusAfterReactivate,
  nextStatusAfterSuspend,
} from "../model/organization-rules";
import type {
  CreateOrganizationInput,
  ListOrganizationsFilters,
  OrganizationRepository,
  UpdateOrganizationInput,
} from "./organization-repository";
import { mockAuditLogRepository } from "./mock-audit-log-repository";
import { mockCompanyUserRepository } from "./mock-company-user-repository";
import { findCityIdByName } from "@/entities/geography";

const suspendedPriorStatus = new Map<string, "TRIAL" | "ACTIVE">();

let organizations: Organization[] = [
  seedOrg({
    id: "org-001",
    tradeName: "Andina Retail",
    legalName: "Comercial Andina Cía. Ltda.",
    taxId: "1790123456001",
    email: "contacto@andina.demo",
    phone: "+593 99 123 4567",
    city: "Quito",
    address: "Av. Amazonas N34-451",
    planId: "business",
    subscriptionStatus: "ACTIVE",
    createdAt: "2025-08-12T10:00:00Z",
  }),
  seedOrg({
    id: "org-002",
    tradeName: "Pacífico Trade",
    legalName: "Pacífico Comercial S.A.",
    taxId: "1790987654001",
    email: "info@pacifico.demo",
    phone: "+593 98 765 4321",
    city: "Guayaquil",
    address: "Av. Francisco de Orellana",
    planId: "growth",
    subscriptionStatus: "ACTIVE",
    createdAt: "2025-09-01T14:30:00Z",
  }),
  seedOrg({
    id: "org-003",
    tradeName: "Sierra Logistics",
    legalName: "Sierra Logística Cía. Ltda.",
    taxId: "1790555123001",
    email: "ops@sierra.demo",
    phone: "+593 97 111 2233",
    city: "Cuenca",
    address: "Calle Larga 12-34",
    planId: "trial",
    subscriptionStatus: "TRIAL",
    createdAt: "2026-10-01T09:00:00Z",
  }),
  seedOrg({
    id: "org-004",
    tradeName: "Costa Foods",
    legalName: "Costa Alimentos S.A.",
    taxId: "1790444987001",
    email: "hola@costa.demo",
    phone: "+593 96 444 5566",
    city: "Manta",
    address: "Malecón y Calle 15",
    planId: "business",
    subscriptionStatus: "CANCELED",
    createdAt: "2025-06-20T11:00:00Z",
  }),
  seedOrg({
    id: "org-005",
    tradeName: "Norte Express",
    legalName: "Norte Express Cía. Ltda.",
    taxId: "1790333444001",
    email: "contacto@norte.demo",
    phone: "+593 98 333 4444",
    city: "Ambato",
    address: "Av. Cevallos 120",
    planId: "growth",
    subscriptionStatus: "ACTIVE",
    createdAt: "2025-07-10T08:00:00Z",
  }),
  seedOrg({
    id: "org-006",
    tradeName: "Sur Industrial",
    legalName: "Sur Industrial S.A.",
    taxId: "1790222333001",
    email: "info@sur.demo",
    phone: "+593 97 222 3333",
    city: "Machala",
    address: "Km 5 vía a Pasaje",
    planId: "trial",
    subscriptionStatus: "TRIAL",
    createdAt: "2025-07-15T12:00:00Z",
  }),
  seedOrg({
    id: "org-007",
    tradeName: "Valle Agro",
    legalName: "Valle Agropecuaria Cía. Ltda.",
    taxId: "1790111222001",
    email: "hola@valle.demo",
    phone: "+593 96 111 2222",
    city: "Loja",
    address: "Sector San Sebastián",
    planId: "business",
    subscriptionStatus: "ACTIVE",
    createdAt: "2025-08-01T09:30:00Z",
  }),
  seedOrg({
    id: "org-008",
    tradeName: "Oriente Pharma",
    legalName: "Oriente Pharmaceutical S.A.",
    taxId: "1790000111001",
    email: "ventas@oriente.demo",
    phone: "+593 95 000 1111",
    city: "Portoviejo",
    address: "Calle 10 de Agosto",
    planId: "growth",
    subscriptionStatus: "PAST_DUE",
    createdAt: "2025-08-20T16:00:00Z",
  }),
  seedOrg({
    id: "org-009",
    tradeName: "Centro Tech",
    legalName: "Centro Tecnológico Cía. Ltda.",
    taxId: "1790999888001",
    email: "hello@centro.demo",
    phone: "+593 94 999 8888",
    city: "Riobamba",
    address: "Av. Daniel León Borja",
    planId: "trial",
    subscriptionStatus: "TRIAL",
    createdAt: "2025-09-05T10:15:00Z",
  }),
  seedOrg({
    id: "org-010",
    tradeName: "Capital Finanzas",
    legalName: "Capital Finanzas S.A.",
    taxId: "1790888777001",
    email: "ops@capital.demo",
    phone: "+593 93 888 7777",
    city: "Quito",
    address: "Av. 6 de Diciembre N40",
    planId: "business",
    subscriptionStatus: "ACTIVE",
    createdAt: "2025-09-18T14:45:00Z",
  }),
];

function seedOrg(input: {
  id: string;
  tradeName: string;
  legalName: string;
  taxId: string;
  email: string;
  phone: string;
  city: string;
  address: string;
  planId: Organization["planId"];
  subscriptionStatus: Organization["subscriptionStatus"];
  createdAt: string;
}): Organization {
  const countryId = "ec";
  const cityId = findCityIdByName(countryId, input.city);
  return {
    id: input.id,
    tradeName: input.tradeName,
    legalName: input.legalName,
    taxId: input.taxId,
    email: input.email,
    phone: input.phone,
    countryId,
    country: "Ecuador",
    cityId,
    city: input.city,
    address: input.address,
    planId: input.planId,
    subscriptionStatus: input.subscriptionStatus,
    createdAt: input.createdAt,
  };
}

async function toListItem(org: Organization): Promise<OrganizationListItem> {
  const plan = getPlanById(org.planId);
  const memberCount = await mockCompanyUserRepository.countByOrganization(org.id);
  return {
    id: org.id,
    tradeName: org.tradeName,
    legalName: org.legalName,
    taxId: org.taxId,
    planName: plan.name,
    subscriptionStatus: org.subscriptionStatus,
    memberCount,
    createdAt: org.createdAt,
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

function normalizeTaxId(taxId: string): string {
  return taxId.replace(/\D/g, "");
}

function assertUniqueTaxId(taxId: string, excludeId?: string) {
  const normalized = normalizeTaxId(taxId);
  if (organizations.some((o) => o.taxId === normalized && o.id !== excludeId)) {
    throw new Error("DUPLICATE_TAX_ID");
  }
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
          o.taxId.includes(q),
      );
    }
    if (filters.subscriptionStatus && filters.subscriptionStatus !== "all") {
      rows = rows.filter((o) => o.subscriptionStatus === filters.subscriptionStatus);
    }
    if (filters.planId && filters.planId !== "all") {
      rows = rows.filter((o) => o.planId === filters.planId);
    }
    rows.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
    const pageSize = resolvePageSize(filters.pageSize);
    const totalItems = rows.length;
    const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
    const page = Math.min(Math.max(1, filters.page), totalPages);
    const start = (page - 1) * pageSize;
    const data = await Promise.all(
      rows.slice(start, start + pageSize).map((org) => toListItem(org)),
    );
    return {
      data,
      meta: { page, pageSize, totalItems, totalPages },
    };
  },

  async getById(id) {
    await delay(200);
    return organizations.find((o) => o.id === id) ?? null;
  },

  async create(input: CreateOrganizationInput, actorEmail: string) {
    await delay(450);
    getPlanById(input.planId);
    const taxId = normalizeTaxId(input.taxId);
    assertUniqueTaxId(taxId);
    const id = `org-${Date.now()}`;
    const org: Organization = {
      id,
      tradeName: input.tradeName.trim(),
      legalName: input.legalName.trim(),
      taxId,
      email: input.email.trim(),
      phone: input.phone.trim(),
      countryId: input.countryId ?? null,
      country: input.country.trim(),
      cityId: input.cityId ?? null,
      city: input.city.trim(),
      address: input.address.trim(),
      planId: input.planId,
      subscriptionStatus: initialSubscriptionStatusForPlan(input.planId),
      createdAt: new Date().toISOString(),
    };
    organizations = [org, ...organizations];
    await mockCompanyUserRepository.create({
      organizationId: id,
      fullName: input.principalAdmin.fullName,
      email: input.principalAdmin.email,
      role: "company_admin",
      status: "invited",
    });
    await audit(id, "organization.created", org.tradeName, actorEmail);
    await audit(id, "principal_admin.invited", org.tradeName, actorEmail);
    return org;
  },

  async update(id, input: UpdateOrganizationInput, actorEmail: string) {
    await delay(400);
    const idx = organizations.findIndex((o) => o.id === id);
    if (idx < 0) throw new Error("NOT_FOUND");
    const taxId = normalizeTaxId(input.taxId);
    assertUniqueTaxId(taxId, id);
    const current = organizations[idx]!;
    const updated: Organization = {
      ...current,
      tradeName: input.tradeName.trim(),
      legalName: input.legalName.trim(),
      taxId,
      email: input.email.trim(),
      phone: input.phone.trim(),
      countryId: input.countryId ?? current.countryId,
      country: input.country.trim(),
      cityId: input.cityId ?? current.cityId,
      city: input.city.trim(),
      address: input.address.trim(),
      planId: input.planId,
      subscriptionStatus: input.subscriptionStatus,
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
    if (org.subscriptionStatus !== "CANCELED") {
      suspendedPriorStatus.set(
        id,
        org.subscriptionStatus === "TRIAL" ? "TRIAL" : "ACTIVE",
      );
    }
    organizations[idx] = {
      ...org,
      subscriptionStatus: nextStatusAfterSuspend(),
    };
    await audit(id, "organization.suspended", org.tradeName, actorEmail);
    return organizations[idx]!;
  },

  async reactivate(id, actorEmail) {
    await delay(350);
    const idx = organizations.findIndex((o) => o.id === id);
    if (idx < 0) throw new Error("NOT_FOUND");
    const org = organizations[idx]!;
    const wasTrial = suspendedPriorStatus.get(id) === "TRIAL";
    organizations[idx] = {
      ...org,
      subscriptionStatus: nextStatusAfterReactivate(wasTrial),
    };
    suspendedPriorStatus.delete(id);
    await audit(id, "organization.reactivated", org.tradeName, actorEmail);
    return organizations[idx]!;
  },

};

function delay(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}
