import type { PlanId } from "@/entities/plan";

/**
 * Tabla `companies` / tenant (prototipo alineado a modelo relacional).
 * Campos en camelCase en front; en BD: legal_name, trade_name, tax_id, plan_id, subscription_status, created_at, etc.
 */
export const SUBSCRIPTION_STATUSES = [
  "TRIAL",
  "ACTIVE",
  "PAST_DUE",
  "CANCELED",
  "EXPIRED",
] as const;

export type SubscriptionStatus = (typeof SUBSCRIPTION_STATUSES)[number];

export type Organization = {
  id: string;
  legalName: string;
  tradeName: string;
  /** RUC / identificación tributaria (único) */
  taxId: string;
  phone: string;
  email: string;
  countryId: string | null;
  country: string;
  cityId: string | null;
  city: string;
  address: string;
  planId: PlanId;
  subscriptionStatus: SubscriptionStatus;
  createdAt: string;
};

export type OrganizationListItem = {
  id: string;
  tradeName: string;
  legalName: string;
  taxId: string;
  planName: string;
  subscriptionStatus: SubscriptionStatus;
  /** Conteo desde company_users */
  memberCount: number;
  createdAt: string;
};

export function subscriptionStatusLabel(status: SubscriptionStatus): string {
  switch (status) {
    case "TRIAL":
      return "Prueba";
    case "ACTIVE":
      return "Activa";
    case "PAST_DUE":
      return "Pago pendiente";
    case "CANCELED":
      return "Cancelada";
    case "EXPIRED":
      return "Expirada";
  }
}

/** @deprecated use SubscriptionStatus */
export type OrganizationStatus = SubscriptionStatus;

/** @deprecated use subscriptionStatusLabel */
export function organizationStatusLabel(status: SubscriptionStatus): string {
  return subscriptionStatusLabel(status);
}

export { getPlanById, getPlanLimits, SUBSCRIPTION_PLANS, type PlanId } from "@/entities/plan";
