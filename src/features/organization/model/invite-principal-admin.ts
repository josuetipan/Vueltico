import type { OrganizationRepository } from "@/entities/organization/api/organization-repository";

export function createInvitePrincipalAdminUseCase(repo: OrganizationRepository) {
  return repo.invitePrincipalAdmin.bind(repo);
}
