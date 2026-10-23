import { validateEcuadorRuc } from "@/entities/organization/model/organization-rules";
import type { OrganizationRepository } from "@/entities/organization/api/organization-repository";

export function createUpdateOrganizationUseCase(repo: OrganizationRepository) {
  return async (
    id: string,
    input: Parameters<OrganizationRepository["update"]>[1],
    actorEmail: string,
  ) => {
    if (!validateEcuadorRuc(input.ruc)) {
      throw new Error("INVALID_RUC");
    }
    return repo.update(id, input, actorEmail);
  };
}
