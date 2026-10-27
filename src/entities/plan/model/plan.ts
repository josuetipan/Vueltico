/** Tabla `plans` — límites heredados por la empresa vía plan_id. */
export const SUBSCRIPTION_PLANS = [
  {
    id: "trial",
    name: "Trial 14d",
    maxUsers: 5,
    maxBranches: 1,
    storageGb: 10,
  },
  {
    id: "growth",
    name: "Growth",
    maxUsers: 30,
    maxBranches: 3,
    storageGb: 50,
  },
  {
    id: "business",
    name: "Business",
    maxUsers: 100,
    maxBranches: 10,
    storageGb: 150,
  },
] as const;

export type PlanId = (typeof SUBSCRIPTION_PLANS)[number]["id"];

export type Plan = (typeof SUBSCRIPTION_PLANS)[number];

export function getPlanById(planId: PlanId): Plan {
  const plan = SUBSCRIPTION_PLANS.find((p) => p.id === planId);
  if (!plan) throw new Error("INVALID_PLAN");
  return plan;
}

export function getPlanLimits(planId: PlanId) {
  const plan = getPlanById(planId);
  return {
    maxUsers: plan.maxUsers,
    maxBranches: plan.maxBranches,
    storageGb: plan.storageGb,
  };
}
