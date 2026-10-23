import { validateEcuadorRuc } from "@/entities/organization/model/organization-rules";
import type { OrganizationRepository } from "@/entities/organization/api/organization-repository";

export function createCreateOrganizationUseCase(repo: OrganizationRepository) {
  return async (
    input: Parameters<OrganizationRepository["create"]>[0],
    actorEmail: string,
  ) => {
    if (!validateEcuadorRuc(input.ruc)) {
      throw new Error("INVALID_RUC");
    }
    return repo.create(input, actorEmail);
  };
}
