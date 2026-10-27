import { mockBillingRepository } from "@/entities/billing/api/mock-billing-repository";
import {
  getPlanLimitsFromSaasPlan,
  type PlanId,
  type SaasPlan,
} from "./plan-types";

export type Plan = SaasPlan;
export type { PlanId } from "./plan-types";

export function getPlanById(planId: PlanId): SaasPlan {
  const plan = mockBillingRepository.getPlanById(planId);
  if (!plan) throw new Error("INVALID_PLAN");
  return plan;
}

export function listPlansForSelect(): { id: string; name: string }[] {
  return mockBillingRepository
    .listPlans()
    .filter((p) => p.status === "ACTIVE")
    .map((p) => ({ id: p.id, name: p.name }));
}

/** @deprecated use listPlansForSelect() */
export const SUBSCRIPTION_PLANS = listPlansForSelect().map((p) => {
  const plan = getPlanById(p.id);
  return {
    id: plan.id,
    name: plan.name,
    maxUsers: plan.maxUsers,
    maxBranches: plan.maxBranches,
    storageGb: plan.storageGb,
  };
});

export function getPlanLimits(planId: PlanId) {
  return getPlanLimitsFromSaasPlan(getPlanById(planId));
}

export {
  PLAN_STATUSES,
  computeAnnualDiscountPercent,
  getPlanLimitsFromSaasPlan,
  planStatusLabel,
  type PlanFeatures,
  type PlanStatus,
  type PlanSummary,
  type SaasPlan,
} from "./plan-types";
