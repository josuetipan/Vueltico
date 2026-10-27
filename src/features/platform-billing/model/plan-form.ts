import {
  computeAnnualDiscountPercent,
  type PlanFeatures,
  type PlanStatus,
  type SaasPlan,
} from "@/entities/plan";

export type PlanFormDraft = {
  name: string;
  description: string;
  priceMonthlyUsd: string;
  priceYearlyUsd: string;
  annualDiscountPercent: string;
  maxUsers: string;
  maxTransactionsPerMonth: string;
  maxBankAccounts: string;
  maxBranches: string;
  storageGb: string;
  features: PlanFeatures;
  gatewayProductId: string;
  status: PlanStatus;
};

export function emptyPlanDraft(status: PlanStatus = "DRAFT"): PlanFormDraft {
  return {
    name: "",
    description: "",
    priceMonthlyUsd: "0",
    priceYearlyUsd: "0",
    annualDiscountPercent: "0",
    maxUsers: "5",
    maxTransactionsPerMonth: "1000",
    maxBankAccounts: "5",
    maxBranches: "1",
    storageGb: "10",
    features: {
      basicReports: true,
      exportExcelPdf: false,
      bulkTransfers: false,
      apiWebhooks: false,
    },
    gatewayProductId: "",
    status,
  };
}

export function planToDraft(plan: SaasPlan): PlanFormDraft {
  return {
    name: plan.name,
    description: plan.description,
    priceMonthlyUsd: String(plan.priceMonthlyUsd),
    priceYearlyUsd: String(plan.priceYearlyUsd),
    annualDiscountPercent: String(plan.annualDiscountPercent),
    maxUsers: String(plan.maxUsers),
    maxTransactionsPerMonth: String(plan.maxTransactionsPerMonth),
    maxBankAccounts: String(plan.maxBankAccounts),
    maxBranches: String(plan.maxBranches),
    storageGb: String(plan.storageGb),
    features: { ...plan.features },
    gatewayProductId: plan.gatewayProductId,
    status: plan.status,
  };
}

export function draftToUpsertInput(draft: PlanFormDraft) {
  const priceMonthlyUsd = Number(draft.priceMonthlyUsd);
  const priceYearlyUsd = Number(draft.priceYearlyUsd);
  const computed = computeAnnualDiscountPercent(priceMonthlyUsd, priceYearlyUsd);
  const manual = Number(draft.annualDiscountPercent);
  return {
    name: draft.name,
    description: draft.description,
    priceMonthlyUsd,
    priceYearlyUsd,
    annualDiscountPercent: Number.isFinite(manual) && manual > 0 ? manual : computed,
    maxUsers: Number(draft.maxUsers),
    maxTransactionsPerMonth: Number(draft.maxTransactionsPerMonth),
    maxBankAccounts: Number(draft.maxBankAccounts),
    maxBranches: Number(draft.maxBranches),
    storageGb: Number(draft.storageGb),
    features: draft.features,
    gatewayProductId: draft.gatewayProductId,
    status: draft.status,
  };
}

export function recalcDiscountFromPrices(draft: PlanFormDraft): PlanFormDraft {
  const monthly = Number(draft.priceMonthlyUsd);
  const yearly = Number(draft.priceYearlyUsd);
  return {
    ...draft,
    annualDiscountPercent: String(computeAnnualDiscountPercent(monthly, yearly)),
  };
}
