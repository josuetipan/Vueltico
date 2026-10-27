import type { Organization, SubscriptionStatus } from "./organization";

export type OrganizationRuleError =
  | "ALREADY_CANCELED"
  | "NOT_CANCELED"
  | "INVALID_TAX_ID"
  | "DUPLICATE_TAX_ID";

export function assertCanSuspend(org: Organization): OrganizationRuleError | null {
  if (org.subscriptionStatus === "CANCELED") return "ALREADY_CANCELED";
  return null;
}

export function assertCanReactivate(org: Organization): OrganizationRuleError | null {
  if (org.subscriptionStatus !== "CANCELED") return "NOT_CANCELED";
  return null;
}

export function nextStatusAfterSuspend(): SubscriptionStatus {
  return "CANCELED";
}

export function nextStatusAfterReactivate(previousWasTrial: boolean): SubscriptionStatus {
  return previousWasTrial ? "TRIAL" : "ACTIVE";
}

export function initialSubscriptionStatusForPlan(planId: Organization["planId"]): SubscriptionStatus {
  return planId === "trial" ? "TRIAL" : "ACTIVE";
}

/** Validación básica RUC Ecuador (13 dígitos, prototipo). */
export function validateEcuadorTaxId(taxId: string): boolean {
  return /^\d{13}$/.test(taxId.replace(/\D/g, ""));
}

/** @deprecated */
export const validateEcuadorRuc = validateEcuadorTaxId;

export function ruleErrorMessage(code: OrganizationRuleError): string {
  switch (code) {
    case "ALREADY_CANCELED":
      return "La empresa ya está cancelada.";
    case "NOT_CANCELED":
      return "Solo puede reactivar empresas canceladas.";
    case "INVALID_TAX_ID":
      return "El RUC debe tener 13 dígitos numéricos.";
    case "DUPLICATE_TAX_ID":
      return "Ya existe una empresa con ese RUC.";
  }
}
