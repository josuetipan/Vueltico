import {
  assertCanReactivate,
  ruleErrorMessage,
} from "@/entities/organization/model/organization-rules";
import type { OrganizationRepository } from "@/entities/organization/api/organization-repository";

export function createReactivateOrganizationUseCase(
  repo: OrganizationRepository,
) {
  return async (id: string, actorEmail: string) => {
    const org = await repo.getById(id);
    if (!org) throw new Error("NOT_FOUND");
    const rule = assertCanReactivate(org);
    if (rule) throw new Error(rule);
    return repo.reactivate(id, actorEmail);
  };
}

export function reactivateErrorMessage(code: string): string {
  if (code === "NOT_FOUND") return "Organización no encontrada.";
  if (code === "NOT_CANCELED") return ruleErrorMessage("NOT_CANCELED");
  return "No se pudo reactivar la organización.";
}
