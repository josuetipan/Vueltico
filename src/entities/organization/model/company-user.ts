/** Tabla relacional `company_users` — usuarios por tenant (no embebidos en company). */
export const COMPANY_USER_ROLES = ["company_admin", "member"] as const;
export type CompanyUserRole = (typeof COMPANY_USER_ROLES)[number];

export const COMPANY_USER_STATUSES = ["active", "invited", "disabled"] as const;
export type CompanyUserStatus = (typeof COMPANY_USER_STATUSES)[number];

export type CompanyUser = {
  id: string;
  organizationId: string;
  fullName: string;
  email: string;
  role: CompanyUserRole;
  status: CompanyUserStatus;
  createdAt: string;
};
