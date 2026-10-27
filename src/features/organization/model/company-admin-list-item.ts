import type { CompanyUser } from "@/entities/organization/model/company-user";

export type CompanyAdminListItem = CompanyUser & {
  organizationTradeName: string;
};
