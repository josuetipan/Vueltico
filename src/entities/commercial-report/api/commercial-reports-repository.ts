import type {
  ComparisonDelta,
  KpiSnapshot,
  SeriesPoint,
} from "@/entities/commercial-report/model/aggregations";
import type { ReportQuery } from "@/entities/commercial-report/model/report-filters";

export type FilterOptions = {
  branches: { value: string; label: string }[];
  registers: { value: string; label: string }[];
  cashiers: { value: string; label: string }[];
};

export type SalesTableRow = {
  id: string;
  occurredAt: string;
  label: string;
  branchName: string;
  registerName: string;
  cashierName: string;
  totalCents: number;
  cashCents: number;
  transferReportedCents: number;
  transferConfirmedCents: number;
};

export type BranchSalesRow = {
  branchId: string;
  branchName: string;
  salesCents: number;
  cashCents: number;
};

export type CashierSalesRow = {
  cashierId: string;
  cashierName: string;
  salesCents: number;
  ticketCount: number;
};

export type ClosureReportRow = {
  id: string;
  closedAt: string;
  branchName: string;
  registerName: string;
  cashierName: string;
  expectedCashCents: number;
  countedCashCents: number;
  differenceCents: number;
  outcome: string;
};

export type TransferReportRow = {
  id: string;
  saleId: string;
  reportedAt: string;
  amountCents: number;
  status: string;
};

export interface CommercialReportsRepository {
  getFilterOptions(tenantId: string): Promise<FilterOptions>;
  getAnalyticalDashboard(query: ReportQuery): Promise<{
    comparison: ComparisonDelta;
    dailySales: SeriesPoint[];
    paymentBreakdown: {
      cashCents: number;
      transferReportedCents: number;
      transferConfirmedCents: number;
    };
    filterOptions: FilterOptions;
  }>;
  getDailySales(query: ReportQuery): Promise<{
    series: SeriesPoint[];
    rows: SalesTableRow[];
    comparison: ComparisonDelta;
    filterOptions: FilterOptions;
  }>;
  getIncomeExpense(query: ReportQuery): Promise<{
    series: SeriesPoint[];
    kpis: KpiSnapshot;
    filterOptions: FilterOptions;
  }>;
  getPaymentMethods(query: ReportQuery): Promise<{
    breakdown: {
      cashCents: number;
      transferReportedCents: number;
      transferConfirmedCents: number;
    };
    rows: SalesTableRow[];
    filterOptions: FilterOptions;
  }>;
  getByBranch(query: ReportQuery): Promise<{
    rows: BranchSalesRow[];
    filterOptions: FilterOptions;
  }>;
  getByCashier(query: ReportQuery): Promise<{
    rows: CashierSalesRow[];
    filterOptions: FilterOptions;
  }>;
  getClosures(query: ReportQuery): Promise<{
    rows: ClosureReportRow[];
    filterOptions: FilterOptions;
  }>;
  getTransfers(query: ReportQuery): Promise<{
    rows: TransferReportRow[];
    summary: { pendingCents: number; confirmedCents: number; rejectedCents: number };
    filterOptions: FilterOptions;
  }>;
}
