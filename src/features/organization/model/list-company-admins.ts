import type { ApiListResponse } from "@/shared/api/contracts";
import type { ListCompanyAdminsFilters } from "@/entities/organization/api/company-user-repository";
import type { OrganizationRepository } from "@/entities/organization/api/organization-repository";
import type { CompanyUserRepository } from "@/entities/organization/api/company-user-repository";
import type { CompanyAdminListItem } from "./company-admin-list-item";

export function createListCompanyAdminsUseCase(
  companyUsers: CompanyUserRepository,
  organizations: OrganizationRepository,
) {
  return async (
    filters: ListCompanyAdminsFilters = {},
  ): Promise<ApiListResponse<CompanyAdminListItem>> => {
    const result = await companyUsers.listCompanyAdmins(filters);
    const orgList = await organizations.list({
      page: 1,
      pageSize: 200,
      subscriptionStatus: "all",
      planId: "all",
    });
    const tradeNameById = new Map(orgList.data.map((o) => [o.id, o.tradeName]));
    return {
      data: result.data.map((admin) => ({
        ...admin,
        organizationTradeName: tradeNameById.get(admin.organizationId) ?? admin.organizationId,
      })),
      meta: result.meta,
    };
  };
}
