import type { SubscriptionStatus } from "@/entities/organization/model/organization";

export const BILLING_CYCLES = ["MONTHLY", "YEARLY"] as const;
export type BillingCycle = (typeof BILLING_CYCLES)[number];

export type TenantSubscription = {
  id: string;
  organizationId: string;
  planId: string;
  billingCycle: BillingCycle;
  status: SubscriptionStatus;
  amountUsd: number;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  canceledAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type SubscriptionListItem = TenantSubscription & {
  organizationTradeName: string;
  organizationTaxId: string;
  planName: string;
};

export function billingCycleLabel(cycle: BillingCycle): string {
  return cycle === "MONTHLY" ? "Mensual" : "Anual";
}
