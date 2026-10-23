import type { OrganizationRepository } from "@/entities/organization/api/organization-repository";

export function createListOrganizationsUseCase(repo: OrganizationRepository) {
  return repo.list.bind(repo);
}
