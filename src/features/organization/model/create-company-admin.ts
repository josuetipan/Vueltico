import type { CompanyUser } from "@/entities/organization/model/company-user";
import type { CompanyUserRepository } from "@/entities/organization/api/company-user-repository";

export type CreateCompanyAdminInput = {
  organizationId: string;
  fullName: string;
  email: string;
};

export function createCreateCompanyAdminUseCase(companyUsers: CompanyUserRepository) {
  return (input: CreateCompanyAdminInput): Promise<CompanyUser> =>
    companyUsers.create({
      organizationId: input.organizationId,
      fullName: input.fullName,
      email: input.email,
      role: "company_admin",
      status: "invited",
    });
}
