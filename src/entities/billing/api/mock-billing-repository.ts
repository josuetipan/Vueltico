import type { ApiListResponse } from "@/shared/api/contracts";
import { resolvePageSize } from "@/shared/lib/table-pagination";
import type { SubscriptionStatus } from "@/entities/organization/model/organization";
import {
  getOrganizationIndexForBilling,
  syncOrganizationSubscription,
} from "@/entities/organization/api/mock-organization-repository";
import {
  computeAnnualDiscountPercent,
  type PlanFeatures,
  type PlanStatus,
  type SaasPlan,
} from "@/entities/plan/model/plan-types";
import type { BillingCycle, TenantSubscription } from "@/entities/subscription/model/subscription";
import type {
  Invoice,
  InvoicePaymentStatus,
  PaymentMethod,
} from "@/entities/invoice/model/invoice";

const STORAGE_KEY = "vueltico.billing.v1";

type BillingStore = {
  plans: SaasPlan[];
  subscriptions: TenantSubscription[];
  invoices: Invoice[];
  invoiceSeq: number;
};

function nowIso(): string {
  return new Date().toISOString();
}

function delay(ms = 280): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

function defaultFeatures(partial?: Partial<PlanFeatures>): PlanFeatures {
  return {
    basicReports: true,
    exportExcelPdf: false,
    bulkTransfers: false,
    apiWebhooks: false,
    ...partial,
  };
}

function seedPlan(input: {
  id: string;
  name: string;
  description: string;
  priceMonthlyUsd: number;
  priceYearlyUsd: number;
  maxUsers: number;
  maxTransactionsPerMonth: number;
  maxBankAccounts: number;
  maxBranches: number;
  storageGb: number;
  features?: Partial<PlanFeatures>;
  gatewayProductId?: string;
  status?: PlanStatus;
}): SaasPlan {
  const createdAt = "2025-01-01T00:00:00Z";
  const annualDiscountPercent = computeAnnualDiscountPercent(
    input.priceMonthlyUsd,
    input.priceYearlyUsd,
  );
  return {
    id: input.id,
    name: input.name,
    description: input.description,
    priceMonthlyUsd: input.priceMonthlyUsd,
    priceYearlyUsd: input.priceYearlyUsd,
    annualDiscountPercent,
    maxUsers: input.maxUsers,
    maxTransactionsPerMonth: input.maxTransactionsPerMonth,
    maxBankAccounts: input.maxBankAccounts,
    maxBranches: input.maxBranches,
    storageGb: input.storageGb,
    features: defaultFeatures(input.features),
    gatewayProductId: input.gatewayProductId ?? "",
    status: input.status ?? "ACTIVE",
    createdAt,
    updatedAt: createdAt,
  };
}

function defaultStore(): BillingStore {
  const plans = [
    seedPlan({
      id: "trial",
      name: "Trial 14d",
      description: "Prueba gratuita con funciones esenciales.",
      priceMonthlyUsd: 0,
      priceYearlyUsd: 0,
      maxUsers: 5,
      maxTransactionsPerMonth: 100,
      maxBankAccounts: 2,
      maxBranches: 1,
      storageGb: 10,
      features: { basicReports: true, exportExcelPdf: false },
      status: "ACTIVE",
    }),
    seedPlan({
      id: "growth",
      name: "Growth",
      description: "Para equipos en crecimiento con reportes y exportación.",
      priceMonthlyUsd: 19.99,
      priceYearlyUsd: 199.9,
      maxUsers: 30,
      maxTransactionsPerMonth: 5000,
      maxBankAccounts: 10,
      maxBranches: 3,
      storageGb: 50,
      features: { basicReports: true, exportExcelPdf: true },
      gatewayProductId: "price_growth_demo",
    }),
    seedPlan({
      id: "business",
      name: "Business",
      description: "Operación avanzada, bulk y límites ampliados.",
      priceMonthlyUsd: 49.99,
      priceYearlyUsd: 479.9,
      maxUsers: 100,
      maxTransactionsPerMonth: 50000,
      maxBankAccounts: 40,
      maxBranches: 10,
      storageGb: 150,
      features: {
        basicReports: true,
        exportExcelPdf: true,
        bulkTransfers: true,
        apiWebhooks: true,
      },
      gatewayProductId: "price_business_demo",
    }),
    seedPlan({
      id: "enterprise",
      name: "Enterprise",
      description: "Plan corporativo personalizado (borrador).",
      priceMonthlyUsd: 199,
      priceYearlyUsd: 1990,
      maxUsers: 500,
      maxTransactionsPerMonth: 500000,
      maxBankAccounts: 200,
      maxBranches: 50,
      storageGb: 500,
      features: {
        basicReports: true,
        exportExcelPdf: true,
        bulkTransfers: true,
        apiWebhooks: true,
      },
      status: "DRAFT",
    }),
  ];

  const subscriptions: TenantSubscription[] = [
    subSeed("sub-001", "org-001", "business", "YEARLY", "ACTIVE", 479.9, 30),
    subSeed("sub-002", "org-002", "growth", "MONTHLY", "ACTIVE", 19.99, 18),
    subSeed("sub-003", "org-003", "trial", "MONTHLY", "TRIAL", 0, 14),
    subSeed("sub-004", "org-004", "business", "MONTHLY", "CANCELED", 49.99, -10),
    subSeed("sub-005", "org-005", "growth", "MONTHLY", "PAST_DUE", 19.99, -3),
    subSeed("sub-006", "org-006", "trial", "MONTHLY", "TRIAL", 0, 10),
  ];

  const invoices: Invoice[] = [
    invoiceSeed("inv-001", 11, "org-001", "sub-001", 479.9, "PAID", "BANK_TRANSFER", -60),
    invoiceSeed("inv-002", 12, "org-002", "sub-002", 19.99, "PAID", "BANK_TRANSFER", -5),
    invoiceSeed("inv-003", 13, "org-005", "sub-005", 19.99, "PENDING", "BANK_TRANSFER", 7),
  ];

  return { plans, subscriptions, invoices, invoiceSeq: 13 };
}

function subSeed(
  id: string,
  organizationId: string,
  planId: string,
  billingCycle: BillingCycle,
  status: SubscriptionStatus,
  amountUsd: number,
  periodEndOffsetDays: number,
): TenantSubscription {
  const end = new Date();
  end.setDate(end.getDate() + periodEndOffsetDays);
  const start = new Date(end);
  start.setDate(start.getDate() - (billingCycle === "YEARLY" ? 365 : 30));
  const createdAt = start.toISOString();
  return {
    id,
    organizationId,
    planId,
    billingCycle,
    status,
    amountUsd,
    currentPeriodStart: start.toISOString(),
    currentPeriodEnd: end.toISOString(),
    canceledAt: status === "CANCELED" ? nowIso() : null,
    createdAt,
    updatedAt: nowIso(),
  };
}

function invoiceSeed(
  id: string,
  seq: number,
  organizationId: string,
  subscriptionId: string,
  totalUsd: number,
  paymentStatus: InvoicePaymentStatus,
  paymentMethod: PaymentMethod,
  dueOffsetDays: number,
): Invoice {
  const issued = new Date();
  issued.setDate(issued.getDate() - 2);
  const due = new Date();
  due.setDate(due.getDate() + dueOffsetDays);
  return {
    id,
    number: formatInvoiceNumber(seq, issued),
    organizationId,
    subscriptionId,
    issuedAt: issued.toISOString(),
    dueAt: due.toISOString(),
    totalUsd,
    paymentStatus,
    paymentMethod,
    receiptDataUrl: null,
    notes: "",
  };
}

function formatInvoiceNumber(seq: number, date: Date): string {
  return `INV-${date.getFullYear()}-${String(seq).padStart(4, "0")}`;
}

function loadStore(): BillingStore {
  if (typeof window === "undefined") return defaultStore();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultStore();
    const parsed = JSON.parse(raw) as BillingStore;
    if (!parsed.plans?.length) return defaultStore();
    return parsed;
  } catch {
    return defaultStore();
  }
}

let store: BillingStore = loadStore();

function persist() {
  if (typeof window !== "undefined") {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
  }
}

function getPlanOrThrow(planId: string): SaasPlan {
  const plan = store.plans.find((p) => p.id === planId);
  if (!plan) throw new Error("PLAN_NOT_FOUND");
  return plan;
}

function orgNames(): Map<string, { tradeName: string; taxId: string }> {
  return getOrganizationIndexForBilling();
}

export type UpsertPlanInput = {
  id?: string;
  name: string;
  description: string;
  priceMonthlyUsd: number;
  priceYearlyUsd: number;
  annualDiscountPercent?: number;
  maxUsers: number;
  maxTransactionsPerMonth: number;
  maxBankAccounts: number;
  maxBranches: number;
  storageGb: number;
  features: PlanFeatures;
  gatewayProductId: string;
  status: PlanStatus;
};

export const mockBillingRepository = {
  resetToSeed() {
    store = defaultStore();
    persist();
  },

  listPlans(): SaasPlan[] {
    return [...store.plans].sort((a, b) => a.name.localeCompare(b.name));
  },

  getPlanById(planId: string): SaasPlan | null {
    return store.plans.find((p) => p.id === planId) ?? null;
  },

  countActiveOrganizationsByPlan(planId: string): number {
    return store.subscriptions.filter(
      (s) => s.planId === planId && (s.status === "ACTIVE" || s.status === "TRIAL"),
    ).length;
  },

  async listPlansWithCounts(): Promise<(SaasPlan & { activeOrganizations: number })[]> {
    await delay();
    return mockBillingRepository.listPlans().map((plan) => ({
      ...plan,
      activeOrganizations: mockBillingRepository.countActiveOrganizationsByPlan(plan.id),
    }));
  },

  async createPlan(input: UpsertPlanInput): Promise<SaasPlan> {
    await delay(400);
    const id =
      input.id?.trim() ||
      `plan-${input.name
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/[^a-z0-9-]/g, "")}-${Date.now()}`;
    if (store.plans.some((p) => p.id === id)) throw new Error("DUPLICATE_PLAN_ID");
    const ts = nowIso();
    const plan: SaasPlan = {
      id,
      name: input.name.trim(),
      description: input.description.trim(),
      priceMonthlyUsd: input.priceMonthlyUsd,
      priceYearlyUsd: input.priceYearlyUsd,
      annualDiscountPercent:
        input.annualDiscountPercent ??
        computeAnnualDiscountPercent(input.priceMonthlyUsd, input.priceYearlyUsd),
      maxUsers: input.maxUsers,
      maxTransactionsPerMonth: input.maxTransactionsPerMonth,
      maxBankAccounts: input.maxBankAccounts,
      maxBranches: input.maxBranches,
      storageGb: input.storageGb,
      features: input.features,
      gatewayProductId: input.gatewayProductId.trim(),
      status: input.status,
      createdAt: ts,
      updatedAt: ts,
    };
    store.plans.push(plan);
    persist();
    return plan;
  },

  async updatePlan(planId: string, input: UpsertPlanInput): Promise<SaasPlan> {
    await delay(400);
    const idx = store.plans.findIndex((p) => p.id === planId);
    if (idx < 0) throw new Error("PLAN_NOT_FOUND");
    const prev = store.plans[idx]!;
    const plan: SaasPlan = {
      ...prev,
      name: input.name.trim(),
      description: input.description.trim(),
      priceMonthlyUsd: input.priceMonthlyUsd,
      priceYearlyUsd: input.priceYearlyUsd,
      annualDiscountPercent:
        input.annualDiscountPercent ??
        computeAnnualDiscountPercent(input.priceMonthlyUsd, input.priceYearlyUsd),
      maxUsers: input.maxUsers,
      maxTransactionsPerMonth: input.maxTransactionsPerMonth,
      maxBankAccounts: input.maxBankAccounts,
      maxBranches: input.maxBranches,
      storageGb: input.storageGb,
      features: input.features,
      gatewayProductId: input.gatewayProductId.trim(),
      status: input.status,
      updatedAt: nowIso(),
    };
    store.plans[idx] = plan;
    persist();
    return plan;
  },

  async setPlanStatus(planId: string, status: PlanStatus): Promise<SaasPlan> {
    await delay(300);
    const plan = getPlanOrThrow(planId);
    if (status === "INACTIVE" || status === "DRAFT") {
      const inUse = store.subscriptions.some(
        (s) => s.planId === planId && (s.status === "ACTIVE" || s.status === "TRIAL"),
      );
      if (inUse) throw new Error("PLAN_IN_USE");
    }
    plan.status = status;
    plan.updatedAt = nowIso();
    persist();
    return plan;
  },

  async deletePlan(planId: string): Promise<void> {
    await delay(300);
    const inUse = store.subscriptions.some((s) => s.planId === planId);
    if (inUse) throw new Error("PLAN_IN_USE");
    const idx = store.plans.findIndex((p) => p.id === planId);
    if (idx < 0) throw new Error("PLAN_NOT_FOUND");
    store.plans.splice(idx, 1);
    persist();
  },

  async listSubscriptions(filters: {
    page: number;
    pageSize?: number;
    search?: string;
    status?: SubscriptionStatus | "all";
    planId?: string | "all";
  }): Promise<ApiListResponse<import("@/entities/subscription/model/subscription").SubscriptionListItem>> {
    await delay();
    const orgIndex = orgNames();
    let rows = store.subscriptions.map((s) => {
      const org = orgIndex.get(s.organizationId);
      const plan = getPlanOrThrow(s.planId);
      return {
        ...s,
        organizationTradeName: org?.tradeName ?? "—",
        organizationTaxId: org?.taxId ?? "—",
        planName: plan.name,
      };
    });
    const q = filters.search?.trim().toLowerCase();
    if (q) {
      rows = rows.filter(
        (r) =>
          r.organizationTradeName.toLowerCase().includes(q) ||
          r.organizationTaxId.includes(q) ||
          r.planName.toLowerCase().includes(q),
      );
    }
    if (filters.status && filters.status !== "all") {
      rows = rows.filter((r) => r.status === filters.status);
    }
    if (filters.planId && filters.planId !== "all") {
      rows = rows.filter((r) => r.planId === filters.planId);
    }
    rows.sort(
      (a, b) =>
        new Date(a.currentPeriodEnd).getTime() - new Date(b.currentPeriodEnd).getTime(),
    );
    const pageSize = resolvePageSize(filters.pageSize);
    const totalItems = rows.length;
    const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
    const page = Math.min(Math.max(1, filters.page), totalPages);
    const start = (page - 1) * pageSize;
    return {
      data: rows.slice(start, start + pageSize),
      meta: { page, pageSize, totalItems, totalPages },
    };
  },

  async getSubscription(id: string): Promise<TenantSubscription | null> {
    await delay(150);
    return store.subscriptions.find((s) => s.id === id) ?? null;
  },

  async changeSubscriptionPlan(subscriptionId: string, planId: string): Promise<TenantSubscription> {
    await delay(400);
    const sub = store.subscriptions.find((s) => s.id === subscriptionId);
    if (!sub) throw new Error("SUBSCRIPTION_NOT_FOUND");
    const plan = getPlanOrThrow(planId);
    sub.planId = planId;
    sub.amountUsd =
      sub.billingCycle === "YEARLY" ? plan.priceYearlyUsd : plan.priceMonthlyUsd;
    sub.updatedAt = nowIso();
    syncOrganizationSubscription(sub.organizationId, {
      planId,
      subscriptionStatus: sub.status,
    });
    persist();
    return sub;
  },

  async extendSubscriptionPeriod(
    subscriptionId: string,
    newPeriodEndIso: string,
  ): Promise<TenantSubscription> {
    await delay(350);
    const sub = store.subscriptions.find((s) => s.id === subscriptionId);
    if (!sub) throw new Error("SUBSCRIPTION_NOT_FOUND");
    sub.currentPeriodEnd = new Date(newPeriodEndIso).toISOString();
    sub.updatedAt = nowIso();
    persist();
    return sub;
  },

  async cancelSubscription(subscriptionId: string): Promise<TenantSubscription> {
    await delay(350);
    const sub = store.subscriptions.find((s) => s.id === subscriptionId);
    if (!sub) throw new Error("SUBSCRIPTION_NOT_FOUND");
    sub.status = "CANCELED";
    sub.canceledAt = nowIso();
    sub.updatedAt = nowIso();
    syncOrganizationSubscription(sub.organizationId, { subscriptionStatus: "CANCELED" });
    persist();
    return sub;
  },

  async registerManualPayment(input: {
    subscriptionId: string;
    paymentMethod: PaymentMethod;
    receiptDataUrl?: string | null;
    notes?: string;
  }): Promise<{ subscription: TenantSubscription; invoice: Invoice }> {
    await delay(500);
    const sub = store.subscriptions.find((s) => s.id === input.subscriptionId);
    if (!sub) throw new Error("SUBSCRIPTION_NOT_FOUND");
    const plan = getPlanOrThrow(sub.planId);
    const amount =
      sub.billingCycle === "YEARLY" ? plan.priceYearlyUsd : plan.priceMonthlyUsd;

    const now = new Date();
    const periodDays = sub.billingCycle === "YEARLY" ? 365 : 30;
    const end = new Date(now);
    end.setDate(end.getDate() + periodDays);

    sub.status = "ACTIVE";
    sub.amountUsd = amount;
    sub.currentPeriodStart = now.toISOString();
    sub.currentPeriodEnd = end.toISOString();
    sub.canceledAt = null;
    sub.updatedAt = nowIso();

    store.invoiceSeq += 1;
    const invoice: Invoice = {
      id: `inv-${Date.now()}`,
      number: formatInvoiceNumber(store.invoiceSeq, now),
      organizationId: sub.organizationId,
      subscriptionId: sub.id,
      issuedAt: now.toISOString(),
      dueAt: now.toISOString(),
      totalUsd: amount,
      paymentStatus: "PAID",
      paymentMethod: input.paymentMethod,
      receiptDataUrl: input.receiptDataUrl ?? null,
      notes: input.notes?.trim() ?? "",
    };
    store.invoices.unshift(invoice);

    syncOrganizationSubscription(sub.organizationId, {
      planId: sub.planId,
      subscriptionStatus: "ACTIVE",
    });

    persist();
    return { subscription: sub, invoice };
  },

  async listInvoices(filters: {
    page: number;
    pageSize?: number;
    search?: string;
    organizationId?: string;
    paymentStatus?: InvoicePaymentStatus | "all";
  }): Promise<ApiListResponse<import("@/entities/invoice/model/invoice").InvoiceListItem>> {
    await delay();
    const orgIndex = orgNames();
    let rows = store.invoices.map((inv) => {
      const org = orgIndex.get(inv.organizationId);
      return {
        ...inv,
        organizationTradeName: org?.tradeName ?? "—",
        organizationTaxId: org?.taxId ?? "—",
      };
    });
    if (filters.organizationId) {
      rows = rows.filter((r) => r.organizationId === filters.organizationId);
    }
    const q = filters.search?.trim().toLowerCase();
    if (q) {
      rows = rows.filter(
        (r) =>
          r.number.toLowerCase().includes(q) ||
          r.organizationTradeName.toLowerCase().includes(q) ||
          r.organizationTaxId.includes(q) ||
          r.organizationId.toLowerCase().includes(q),
      );
    }
    if (filters.paymentStatus && filters.paymentStatus !== "all") {
      rows = rows.filter((r) => r.paymentStatus === filters.paymentStatus);
    }
    rows.sort((a, b) => new Date(b.issuedAt).getTime() - new Date(a.issuedAt).getTime());
    const pageSize = resolvePageSize(filters.pageSize);
    const totalItems = rows.length;
    const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
    const page = Math.min(Math.max(1, filters.page), totalPages);
    const start = (page - 1) * pageSize;
    return {
      data: rows.slice(start, start + pageSize),
      meta: { page, pageSize, totalItems, totalPages },
    };
  },

  listInvoicesByOrganization(organizationId: string): Invoice[] {
    return store.invoices.filter((i) => i.organizationId === organizationId);
  },
};
