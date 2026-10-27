import type { CompanyUser } from "../model/company-user";
import { paginateSlice } from "@/shared/lib/table-pagination";
import { CompanyUserError } from "../model/company-user-errors";
import type {
  CompanyUserRepository,
  CreateCompanyUserInput,
  ListCompanyAdminsFilters,
} from "./company-user-repository";

let companyUsers: CompanyUser[] = [
  {
    id: "cu-001",
    organizationId: "org-001",
    fullName: "Carlos Vega",
    email: "admin@andina.demo",
    role: "company_admin",
    status: "active",
    createdAt: "2025-08-12T10:00:00Z",
  },
  {
    id: "cu-002",
    organizationId: "org-002",
    fullName: "Laura Méndez",
    email: "admin@pacifico.demo",
    role: "company_admin",
    status: "active",
    createdAt: "2025-09-01T14:30:00Z",
  },
  {
    id: "cu-003",
    organizationId: "org-003",
    fullName: "Pedro Salgado",
    email: "admin@sierra.demo",
    role: "company_admin",
    status: "invited",
    createdAt: "2026-10-01T09:00:00Z",
  },
  {
    id: "cu-004",
    organizationId: "org-004",
    fullName: "Ana Ruiz",
    email: "admin@costa.demo",
    role: "company_admin",
    status: "active",
    createdAt: "2025-06-20T11:00:00Z",
  },
  {
    id: "cu-005",
    organizationId: "org-005",
    fullName: "María Ortiz",
    email: "admin@norte.demo",
    role: "company_admin",
    status: "active",
    createdAt: "2025-07-10T08:00:00Z",
  },
  {
    id: "cu-006",
    organizationId: "org-006",
    fullName: "Jorge Lima",
    email: "admin@sur.demo",
    role: "company_admin",
    status: "invited",
    createdAt: "2025-07-15T12:00:00Z",
  },
  {
    id: "cu-007",
    organizationId: "org-007",
    fullName: "Elena Castro",
    email: "admin@valle.demo",
    role: "company_admin",
    status: "active",
    createdAt: "2025-08-01T09:30:00Z",
  },
  {
    id: "cu-008",
    organizationId: "org-008",
    fullName: "Ricardo Mora",
    email: "admin@oriente.demo",
    role: "company_admin",
    status: "active",
    createdAt: "2025-08-20T16:00:00Z",
  },
  {
    id: "cu-009",
    organizationId: "org-009",
    fullName: "Sofía Reyes",
    email: "admin@centro.demo",
    role: "company_admin",
    status: "invited",
    createdAt: "2025-09-05T10:15:00Z",
  },
  {
    id: "cu-010",
    organizationId: "org-010",
    fullName: "Diego Paredes",
    email: "admin@capital.demo",
    role: "company_admin",
    status: "active",
    createdAt: "2025-09-18T14:45:00Z",
  },
  {
    id: "cu-011",
    organizationId: "org-001",
    fullName: "Andrea Núñez",
    email: "ops@andina.demo",
    role: "company_admin",
    status: "active",
    createdAt: "2025-10-01T11:00:00Z",
  },
  {
    id: "cu-012",
    organizationId: "org-002",
    fullName: "Hugo Mendieta",
    email: "legacy@pacifico.demo",
    role: "company_admin",
    status: "disabled",
    createdAt: "2024-05-01T08:00:00Z",
  },
];

function newId(): string {
  return `cu-${Date.now()}`;
}

export const mockCompanyUserRepository: CompanyUserRepository = {
  async listByOrganization(organizationId) {
    return companyUsers.filter((u) => u.organizationId === organizationId);
  },

  async listCompanyAdmins(filters: ListCompanyAdminsFilters = {}) {
    const search = filters.search?.trim().toLowerCase() ?? "";
    const orgFilter = filters.organizationId ?? "all";
    const statusFilter = filters.status ?? "all";
    const rows = companyUsers
      .filter((u) => u.role === "company_admin")
      .filter((u) => (orgFilter === "all" ? true : u.organizationId === orgFilter))
      .filter((u) => (statusFilter === "all" ? true : u.status === statusFilter))
      .filter((u) => {
        if (!search) return true;
        return (
          u.fullName.toLowerCase().includes(search) ||
          u.email.toLowerCase().includes(search)
        );
      })
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    return paginateSlice(rows, filters.page ?? 1, filters.pageSize);
  },

  async countByOrganization(organizationId) {
    return companyUsers.filter(
      (u) => u.organizationId === organizationId && u.status !== "disabled",
    ).length;
  },

  async create(input) {
    const fullName = input.fullName.trim();
    const email = input.email.trim().toLowerCase();
    if (!fullName || !email) {
      throw new CompanyUserError("Complete nombre y correo.", "empty_fields");
    }
    const duplicate = companyUsers.some(
      (u) => u.organizationId === input.organizationId && u.email === email,
    );
    if (duplicate) {
      throw new CompanyUserError("Ya existe un usuario con ese correo en la empresa.", "email_exists_in_org");
    }
    const user: CompanyUser = {
      id: newId(),
      organizationId: input.organizationId,
      fullName,
      email,
      role: input.role,
      status: input.status ?? "invited",
      createdAt: new Date().toISOString(),
    };
    companyUsers = [...companyUsers, user];
    return user;
  },

  async updateStatus(id, status) {
    const idx = companyUsers.findIndex((u) => u.id === id);
    if (idx < 0) throw new CompanyUserError("Usuario no encontrado.", "not_found");
    const updated = { ...companyUsers[idx]!, status };
    companyUsers = companyUsers.map((u) => (u.id === id ? updated : u));
    return updated;
  },

  async update(id, input) {
    const idx = companyUsers.findIndex((u) => u.id === id);
    if (idx < 0) throw new CompanyUserError("Usuario no encontrado.", "not_found");
    const current = companyUsers[idx]!;
    const fullName = input.fullName.trim();
    const email = input.email.trim().toLowerCase();
    if (!fullName || !email) {
      throw new CompanyUserError("Complete nombre y correo.", "empty_fields");
    }
    const duplicate = companyUsers.some(
      (u) =>
        u.organizationId === current.organizationId &&
        u.email === email &&
        u.id !== id,
    );
    if (duplicate) {
      throw new CompanyUserError("Ya existe un usuario con ese correo en la empresa.", "email_exists_in_org");
    }
    const updated: CompanyUser = {
      ...current,
      fullName,
      email,
      status: input.status,
    };
    companyUsers = companyUsers.map((u) => (u.id === id ? updated : u));
    return updated;
  },
};
