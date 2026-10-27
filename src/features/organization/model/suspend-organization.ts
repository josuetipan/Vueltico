import {
  assertCanSuspend,
  ruleErrorMessage,
} from "@/entities/organization/model/organization-rules";
import type { OrganizationRepository } from "@/entities/organization/api/organization-repository";

export function createSuspendOrganizationUseCase(repo: OrganizationRepository) {
  return async (id: string, actorEmail: string) => {
    const org = await repo.getById(id);
    if (!org) throw new Error("NOT_FOUND");
    const rule = assertCanSuspend(org);
    if (rule) throw new Error(rule);
    return repo.suspend(id, actorEmail);
  };
}

export function suspendErrorMessage(code: string): string {
  if (code === "NOT_FOUND") return "Organización no encontrada.";
  if (code === "ALREADY_CANCELED") return ruleErrorMessage("ALREADY_CANCELED");
  return "No se pudo suspender la organización.";
}
