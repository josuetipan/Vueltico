import type { Organization, OrganizationStatus } from "./organization";

export type OrganizationRuleError =
  | "ALREADY_SUSPENDED"
  | "NOT_SUSPENDED"
  | "INVALID_RUC";

export function assertCanSuspend(org: Organization): OrganizationRuleError | null {
  if (org.status === "suspended") return "ALREADY_SUSPENDED";
  return null;
}

export function assertCanReactivate(org: Organization): OrganizationRuleError | null {
  if (org.status !== "suspended") return "NOT_SUSPENDED";
  return null;
}

export function nextStatusAfterSuspend(): OrganizationStatus {
  return "suspended";
}

export function nextStatusAfterReactivate(
  previousWasTrial: boolean,
): OrganizationStatus {
  return previousWasTrial ? "trial" : "active";
}

/** Validación básica RUC Ecuador (13 dígitos, prototipo). */
export function validateEcuadorRuc(ruc: string): boolean {
  return /^\d{13}$/.test(ruc.replace(/\D/g, ""));
}

export function ruleErrorMessage(code: OrganizationRuleError): string {
  switch (code) {
    case "ALREADY_SUSPENDED":
      return "La organización ya está suspendida.";
    case "NOT_SUSPENDED":
      return "Solo puede reactivar organizaciones suspendidas.";
    case "INVALID_RUC":
      return "El RUC debe tener 13 dígitos numéricos.";
  }
}
