import type { CompanyUserStatus } from "@/entities/organization/model/company-user";
import type { CompanyUserRepository } from "@/entities/organization/api/company-user-repository";

export function createUpdateCompanyUserStatusUseCase(repo: CompanyUserRepository) {
  return (id: string, status: CompanyUserStatus) => repo.updateStatus(id, status);
}
