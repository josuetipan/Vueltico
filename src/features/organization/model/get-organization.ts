import type { OrganizationRepository } from "@/entities/organization/api/organization-repository";

export function createGetOrganizationUseCase(repo: OrganizationRepository) {
  return repo.getById.bind(repo);
}
