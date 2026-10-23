import type {
  CommercialSale,
  ShiftClosureFact,
  TenantCommercialDataset,
  TransferSummaryFact,
} from "./commercial-facts";
import { ecDateKey, inDateRange, type ReportFilters } from "./report-filters";

export type KpiSnapshot = {
  registeredSalesCents: number;
  cashCollectedCents: number;
  transferReportedCents: number;
  transferConfirmedCents: number;
  incomeCents: number;
  expenseCents: number;
  closuresWithDifference: number;
  pendingTransfersCents: number;
  confirmedTransfersCents: number;
};

export type SeriesPoint = { key: string; label: string; valueCents: number };

export type ComparisonDelta = {
  current: KpiSnapshot;
  previous: KpiSnapshot | null;
  changePct: Partial<Record<keyof KpiSnapshot, number | null>>;
};

function matchesEntity(sale: CommercialSale, filters: ReportFilters): boolean {
  if (sale.tenantId !== filters.tenantId) return false;
  if (!inDateRange(sale.occurredAt, filters.dateFrom, filters.dateTo)) return false;
  if (filters.branchId && sale.branchId !== filters.branchId) return false;
  if (filters.registerId && sale.registerId !== filters.registerId) return false;
  if (filters.cashierId && sale.cashierId !== filters.cashierId) return false;
  if (filters.paymentMethod === "cash" && sale.allocation.cashCents <= 0) return false;
  if (filters.paymentMethod === "transfer_reported" && sale.allocation.transferReportedCents <= 0) {
    return false;
  }
  if (filters.paymentMethod === "transfer_confirmed" && sale.allocation.transferConfirmedCents <= 0) {
    return false;
  }
  return true;
}

function filterSales(dataset: TenantCommercialDataset, filters: ReportFilters): CommercialSale[] {
  return dataset.sales.filter((s) => matchesEntity(s, filters));
}

export function computeKpiSnapshot(
  dataset: TenantCommercialDataset,
  filters: ReportFilters,
): KpiSnapshot {
  const sales = filterSales(dataset, filters);
  let registeredSalesCents = 0;
  let cashCollectedCents = 0;
  let transferReportedCents = 0;
  let transferConfirmedCents = 0;

  for (const s of sales) {
    registeredSalesCents += s.totalCents;
    cashCollectedCents += s.allocation.cashCents;
    transferReportedCents += s.allocation.transferReportedCents;
    transferConfirmedCents += s.allocation.transferConfirmedCents;
  }

  const movements = dataset.movements.filter(
    (m) =>
      m.tenantId === filters.tenantId &&
      inDateRange(m.occurredAt, filters.dateFrom, filters.dateTo) &&
      (!filters.branchId || m.branchId === filters.branchId),
  );
  let incomeCents = 0;
  let expenseCents = 0;
  for (const m of movements) {
    if (m.type === "income") incomeCents += m.amountCents;
    else expenseCents += m.amountCents;
  }

  const closures = filterClosures(dataset, filters);
  const closuresWithDifference = closures.filter((c) => c.outcome !== "balanced").length;

  const transfers = filterTransfers(dataset, filters);
  let pendingTransfersCents = 0;
  let confirmedTransfersCents = 0;
  for (const t of transfers) {
    if (t.status === "confirmed") confirmedTransfersCents += t.amountCents;
    else if (t.status === "pending_verification" || t.status === "in_review") {
      pendingTransfersCents += t.amountCents;
    }
  }

  return {
    registeredSalesCents,
    cashCollectedCents,
    transferReportedCents,
    transferConfirmedCents,
    incomeCents,
    expenseCents,
    closuresWithDifference,
    pendingTransfersCents,
    confirmedTransfersCents,
  };
}

export function compareKpiPeriods(
  dataset: TenantCommercialDataset,
  current: ReportFilters,
  previous: ReportFilters | null,
): ComparisonDelta {
  const cur = computeKpiSnapshot(dataset, current);
  const prev = previous ? computeKpiSnapshot(dataset, previous) : null;
  const changePct: ComparisonDelta["changePct"] = {};
  if (prev) {
    (Object.keys(cur) as (keyof KpiSnapshot)[]).forEach((key) => {
      const a = cur[key];
      const b = prev[key];
      changePct[key] = b === 0 ? (a === 0 ? 0 : null) : Math.round(((a - b) / b) * 1000) / 10;
    });
  }
  return { current: cur, previous: prev, changePct };
}

export function dailySalesSeries(dataset: TenantCommercialDataset, filters: ReportFilters): SeriesPoint[] {
  const sales = filterSales(dataset, filters);
  const map = new Map<string, number>();
  for (const s of sales) {
    const k = ecDateKey(s.occurredAt);
    map.set(k, (map.get(k) ?? 0) + s.totalCents);
  }
  return [...map.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, valueCents]) => ({ key, label: formatDayLabel(key), valueCents }));
}

export function paymentMethodBreakdown(
  dataset: TenantCommercialDataset,
  filters: ReportFilters,
): { cashCents: number; transferReportedCents: number; transferConfirmedCents: number } {
  const sales = filterSales(dataset, filters);
  let cashCents = 0;
  let transferReportedCents = 0;
  let transferConfirmedCents = 0;
  for (const s of sales) {
    cashCents += s.allocation.cashCents;
    transferReportedCents += s.allocation.transferReportedCents;
    transferConfirmedCents += s.allocation.transferConfirmedCents;
  }
  return { cashCents, transferReportedCents, transferConfirmedCents };
}

export function groupSalesByBranch(
  dataset: TenantCommercialDataset,
  filters: ReportFilters,
): { branchId: string; branchName: string; salesCents: number; cashCents: number }[] {
  const branchMap = new Map(dataset.branches.map((b) => [b.id, b.name]));
  const sales = filterSales(dataset, filters);
  const acc = new Map<string, { salesCents: number; cashCents: number }>();
  for (const s of sales) {
    const row = acc.get(s.branchId) ?? { salesCents: 0, cashCents: 0 };
    row.salesCents += s.totalCents;
    row.cashCents += s.allocation.cashCents;
    acc.set(s.branchId, row);
  }
  return [...acc.entries()].map(([branchId, v]) => ({
    branchId,
    branchName: branchMap.get(branchId) ?? branchId,
    salesCents: v.salesCents,
    cashCents: v.cashCents,
  }));
}

export function groupSalesByCashier(
  dataset: TenantCommercialDataset,
  filters: ReportFilters,
): { cashierId: string; cashierName: string; salesCents: number; ticketCount: number }[] {
  const cashierMap = new Map(dataset.cashiers.map((c) => [c.id, c.name]));
  const sales = filterSales(dataset, filters);
  const acc = new Map<string, { salesCents: number; ticketCount: number }>();
  for (const s of sales) {
    const row = acc.get(s.cashierId) ?? { salesCents: 0, ticketCount: 0 };
    row.salesCents += s.totalCents;
    row.ticketCount += 1;
    acc.set(s.cashierId, row);
  }
  return [...acc.entries()].map(([cashierId, v]) => ({
    cashierId,
    cashierName: cashierMap.get(cashierId) ?? cashierId,
    salesCents: v.salesCents,
    ticketCount: v.ticketCount,
  }));
}

function filterClosures(dataset: TenantCommercialDataset, filters: ReportFilters): ShiftClosureFact[] {
  return dataset.closures.filter(
    (c) =>
      c.tenantId === filters.tenantId &&
      inDateRange(c.closedAt, filters.dateFrom, filters.dateTo) &&
      (!filters.branchId || c.branchId === filters.branchId) &&
      (!filters.registerId || c.registerId === filters.registerId) &&
      (!filters.cashierId || c.cashierId === filters.cashierId),
  );
}

export function closureDifferenceRows(dataset: TenantCommercialDataset, filters: ReportFilters) {
  const branchMap = new Map(dataset.branches.map((b) => [b.id, b.name]));
  const registerMap = new Map(dataset.registers.map((r) => [r.id, r.name]));
  const cashierMap = new Map(dataset.cashiers.map((c) => [c.id, c.name]));
  return filterClosures(dataset, filters).map((c) => ({
    id: c.id,
    closedAt: c.closedAt,
    branchName: branchMap.get(c.branchId) ?? "—",
    registerName: registerMap.get(c.registerId) ?? "—",
    cashierName: cashierMap.get(c.cashierId) ?? "—",
    expectedCashCents: c.expectedCashCents,
    countedCashCents: c.countedCashCents,
    differenceCents: c.countedCashCents - c.expectedCashCents,
    outcome: c.outcome,
  }));
}

function filterTransfers(dataset: TenantCommercialDataset, filters: ReportFilters): TransferSummaryFact[] {
  return dataset.transfers.filter(
    (t) =>
      t.tenantId === filters.tenantId &&
      inDateRange(t.reportedAt, filters.dateFrom, filters.dateTo),
  );
}

export function transferStatusRows(dataset: TenantCommercialDataset, filters: ReportFilters) {
  return filterTransfers(dataset, filters).map((t) => ({
    id: t.id,
    saleId: t.saleId,
    reportedAt: t.reportedAt,
    amountCents: t.amountCents,
    status: t.status,
  }));
}

export function incomeExpenseSeries(dataset: TenantCommercialDataset, filters: ReportFilters): SeriesPoint[] {
  const map = new Map<string, { income: number; expense: number }>();
  for (const m of dataset.movements) {
    if (m.tenantId !== filters.tenantId) continue;
    if (!inDateRange(m.occurredAt, filters.dateFrom, filters.dateTo)) continue;
    if (filters.branchId && m.branchId !== filters.branchId) continue;
    const k = ecDateKey(m.occurredAt);
    const row = map.get(k) ?? { income: 0, expense: 0 };
    if (m.type === "income") row.income += m.amountCents;
    else row.expense += m.amountCents;
    map.set(k, row);
  }
  return [...map.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, v]) => ({
      key,
      label: formatDayLabel(key),
      valueCents: v.income - v.expense,
    }));
}

export function salesTableRows(dataset: TenantCommercialDataset, filters: ReportFilters) {
  const branchMap = new Map(dataset.branches.map((b) => [b.id, b.name]));
  const registerMap = new Map(dataset.registers.map((r) => [r.id, r.name]));
  const cashierMap = new Map(dataset.cashiers.map((c) => [c.id, c.name]));
  return filterSales(dataset, filters)
    .sort((a, b) => b.occurredAt.localeCompare(a.occurredAt))
    .map((s) => ({
      id: s.id,
      occurredAt: s.occurredAt,
      label: s.label,
      branchName: branchMap.get(s.branchId) ?? "—",
      registerName: registerMap.get(s.registerId) ?? "—",
      cashierName: cashierMap.get(s.cashierId) ?? "—",
      totalCents: s.totalCents,
      cashCents: s.allocation.cashCents,
      transferReportedCents: s.allocation.transferReportedCents,
      transferConfirmedCents: s.allocation.transferConfirmedCents,
    }));
}

function formatDayLabel(isoDate: string): string {
  const [yStr, mStr, dStr] = isoDate.split("-");
  const date = new Date(Date.UTC(Number(yStr), Number(mStr) - 1, Number(dStr), 12, 0, 0));
  return new Intl.DateTimeFormat("es-EC", {
    day: "numeric",
    month: "short",
    timeZone: "America/Guayaquil",
  }).format(date);
}
