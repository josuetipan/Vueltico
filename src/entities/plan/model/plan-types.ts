export const PLAN_STATUSES = ["ACTIVE", "INACTIVE", "DRAFT"] as const;
export type PlanStatus = (typeof PLAN_STATUSES)[number];

export type PlanFeatures = {
  basicReports: boolean;
  exportExcelPdf: boolean;
  bulkTransfers: boolean;
  apiWebhooks: boolean;
};

export type SaasPlan = {
  id: string;
  name: string;
  description: string;
  priceMonthlyUsd: number;
  priceYearlyUsd: number;
  /** 0–100; puede calcularse desde precios mensual/anual. */
  annualDiscountPercent: number;
  maxUsers: number;
  maxTransactionsPerMonth: number;
  maxBankAccounts: number;
  maxBranches: number;
  storageGb: number;
  features: PlanFeatures;
  gatewayProductId: string;
  status: PlanStatus;
  createdAt: string;
  updatedAt: string;
};

export type PlanId = string;

export type PlanSummary = Pick<
  SaasPlan,
  | "id"
  | "name"
  | "description"
  | "priceMonthlyUsd"
  | "priceYearlyUsd"
  | "maxUsers"
  | "maxTransactionsPerMonth"
  | "maxBankAccounts"
  | "status"
>;

export function planStatusLabel(status: PlanStatus): string {
  switch (status) {
    case "ACTIVE":
      return "Activo";
    case "INACTIVE":
      return "Inactivo";
    case "DRAFT":
      return "Borrador";
  }
}

export function computeAnnualDiscountPercent(
  priceMonthlyUsd: number,
  priceYearlyUsd: number,
): number {
  if (priceMonthlyUsd <= 0) return 0;
  const fullYear = priceMonthlyUsd * 12;
  if (fullYear <= 0) return 0;
  const discount = (1 - priceYearlyUsd / fullYear) * 100;
  return Math.max(0, Math.min(100, Math.round(discount * 10) / 10));
}

export function getPlanLimitsFromSaasPlan(plan: SaasPlan) {
  return {
    maxUsers: plan.maxUsers,
    maxBranches: plan.maxBranches,
    storageGb: plan.storageGb,
    maxTransactionsPerMonth: plan.maxTransactionsPerMonth,
    maxBankAccounts: plan.maxBankAccounts,
  };
}
