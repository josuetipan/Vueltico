import type { CompanyUserStatus } from "@/entities/organization/model/company-user";
import type { CompanyUserRepository } from "@/entities/organization/api/company-user-repository";

export type UpdateCompanyAdminInput = {
  fullName: string;
  email: string;
  status: CompanyUserStatus;
};

export function createUpdateCompanyAdminUseCase(repo: CompanyUserRepository) {
  return (id: string, input: UpdateCompanyAdminInput) => repo.update(id, input);
}
