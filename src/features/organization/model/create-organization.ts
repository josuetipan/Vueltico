import { validateEcuadorTaxId } from "@/entities/organization/model/organization-rules";
import type { OrganizationRepository } from "@/entities/organization/api/organization-repository";

export function createCreateOrganizationUseCase(repo: OrganizationRepository) {
  return async (
    input: Parameters<OrganizationRepository["create"]>[0],
    actorEmail: string,
  ) => {
    if (!validateEcuadorTaxId(input.taxId)) {
      throw new Error("INVALID_TAX_ID");
    }
    return repo.create(input, actorEmail);
  };
}
