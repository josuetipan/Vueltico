import type { ApiListResponse } from "@/shared/api/contracts";
import type { CompanyUser, CompanyUserStatus } from "../model/company-user";

export type CreateCompanyUserInput = {
  organizationId: string;
  fullName: string;
  email: string;
  role: CompanyUser["role"];
  status?: CompanyUser["status"];
};

export type ListCompanyAdminsFilters = {
  organizationId?: string | "all";
  status?: CompanyUserStatus | "all";
  search?: string;
  page?: number;
  pageSize?: number;
};

export type CompanyUserRepository = {
  listByOrganization(organizationId: string): Promise<CompanyUser[]>;
  listCompanyAdmins(
    filters?: ListCompanyAdminsFilters,
  ): Promise<ApiListResponse<CompanyUser>>;
  countByOrganization(organizationId: string): Promise<number>;
  create(input: CreateCompanyUserInput): Promise<CompanyUser>;
  updateStatus(id: string, status: CompanyUserStatus): Promise<CompanyUser>;
  update(
    id: string,
    input: { fullName: string; email: string; status: CompanyUserStatus },
  ): Promise<CompanyUser>;
};
