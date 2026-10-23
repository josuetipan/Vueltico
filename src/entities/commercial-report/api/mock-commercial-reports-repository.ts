import {
  closureDifferenceRows,
  compareKpiPeriods,
  computeKpiSnapshot,
  dailySalesSeries,
  groupSalesByBranch,
  groupSalesByCashier,
  incomeExpenseSeries,
  paymentMethodBreakdown,
  salesTableRows,
  transferStatusRows,
} from "../model/aggregations";
import { previousPeriod, type ReportQuery } from "@/entities/commercial-report/model/report-filters";
import type { CommercialReportsRepository } from "./commercial-reports-repository";
import { MOCK_COMMERCIAL_DATASET } from "./mock-commercial-dataset";

function filtersFromQuery(query: ReportQuery) {
  return {
    tenantId: query.tenantId,
    dateFrom: query.dateFrom,
    dateTo: query.dateTo,
    branchId: query.branchId,
    registerId: query.registerId,
    cashierId: query.cashierId,
    paymentMethod: query.paymentMethod,
  };
}

function filterOptionsFor(tenantId: string) {
  const ds = MOCK_COMMERCIAL_DATASET;
  if (tenantId !== "ten-ec-001") {
    return { branches: [], registers: [], cashiers: [] };
  }
  return {
    branches: ds.branches.map((b) => ({ value: b.id, label: b.name })),
    registers: ds.registers.map((r) => ({ value: r.id, label: r.name })),
    cashiers: ds.cashiers.map((c) => ({ value: c.id, label: c.name })),
  };
}

export const mockCommercialReportsRepository: CommercialReportsRepository = {
  async getFilterOptions(tenantId) {
    await delay(80);
    return filterOptionsFor(tenantId);
  },

  async getAnalyticalDashboard(query) {
    await delay(220);
    const filters = filtersFromQuery(query);
    const prev =
      query.compare === "previous"
        ? { ...filters, ...previousPeriod(filters.dateFrom, filters.dateTo) }
        : null;
    return {
      comparison: compareKpiPeriods(MOCK_COMMERCIAL_DATASET, filters, prev),
      dailySales: dailySalesSeries(MOCK_COMMERCIAL_DATASET, filters),
      paymentBreakdown: paymentMethodBreakdown(MOCK_COMMERCIAL_DATASET, filters),
      filterOptions: filterOptionsFor(query.tenantId),
    };
  },

  async getDailySales(query) {
    await delay(200);
    const filters = filtersFromQuery(query);
    const prevFilters =
      query.compare === "previous"
        ? { ...filters, ...previousPeriod(filters.dateFrom, filters.dateTo) }
        : null;
    return {
      series: dailySalesSeries(MOCK_COMMERCIAL_DATASET, filters),
      rows: salesTableRows(MOCK_COMMERCIAL_DATASET, filters),
      comparison: compareKpiPeriods(
        MOCK_COMMERCIAL_DATASET,
        filters,
        prevFilters ? { ...prevFilters, tenantId: filters.tenantId, paymentMethod: filters.paymentMethod, branchId: filters.branchId, registerId: filters.registerId, cashierId: filters.cashierId } : null,
      ),
      filterOptions: filterOptionsFor(query.tenantId),
    };
  },

  async getIncomeExpense(query) {
    await delay(200);
    const filters = filtersFromQuery(query);
    return {
      series: incomeExpenseSeries(MOCK_COMMERCIAL_DATASET, filters),
      kpis: computeKpiSnapshot(MOCK_COMMERCIAL_DATASET, filters),
      filterOptions: filterOptionsFor(query.tenantId),
    };
  },

  async getPaymentMethods(query) {
    await delay(200);
    const filters = filtersFromQuery(query);
    return {
      breakdown: paymentMethodBreakdown(MOCK_COMMERCIAL_DATASET, filters),
      rows: salesTableRows(MOCK_COMMERCIAL_DATASET, filters),
      filterOptions: filterOptionsFor(query.tenantId),
    };
  },

  async getByBranch(query) {
    await delay(180);
    const filters = filtersFromQuery(query);
    return {
      rows: groupSalesByBranch(MOCK_COMMERCIAL_DATASET, filters),
      filterOptions: filterOptionsFor(query.tenantId),
    };
  },

  async getByCashier(query) {
    await delay(180);
    const filters = filtersFromQuery(query);
    return {
      rows: groupSalesByCashier(MOCK_COMMERCIAL_DATASET, filters),
      filterOptions: filterOptionsFor(query.tenantId),
    };
  },

  async getClosures(query) {
    await delay(180);
    const filters = filtersFromQuery(query);
    return {
      rows: closureDifferenceRows(MOCK_COMMERCIAL_DATASET, filters),
      filterOptions: filterOptionsFor(query.tenantId),
    };
  },

  async getTransfers(query) {
    await delay(180);
    const filters = filtersFromQuery(query);
    const rows = transferStatusRows(MOCK_COMMERCIAL_DATASET, filters);
    let pendingCents = 0;
    let confirmedCents = 0;
    let rejectedCents = 0;
    for (const r of rows) {
      if (r.status === "confirmed") confirmedCents += r.amountCents;
      else if (r.status === "rejected") rejectedCents += r.amountCents;
      else pendingCents += r.amountCents;
    }
    return {
      rows,
      summary: { pendingCents, confirmedCents, rejectedCents },
      filterOptions: filterOptionsFor(query.tenantId),
    };
  },
};

function delay(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}
