import type { ReportQuery } from "@/entities/commercial-report/model/report-filters";
import { mockCommercialReportsRepository } from "@/entities/commercial-report/api/mock-commercial-reports-repository";

const repo = mockCommercialReportsRepository;

export const commercialReportsUseCases = {
  getFilterOptions: (tenantId: string) => repo.getFilterOptions(tenantId),
  getAnalyticalDashboard: (query: ReportQuery) => repo.getAnalyticalDashboard(query),
  getDailySales: (query: ReportQuery) => repo.getDailySales(query),
  getIncomeExpense: (query: ReportQuery) => repo.getIncomeExpense(query),
  getPaymentMethods: (query: ReportQuery) => repo.getPaymentMethods(query),
  getByBranch: (query: ReportQuery) => repo.getByBranch(query),
  getByCashier: (query: ReportQuery) => repo.getByCashier(query),
  getClosures: (query: ReportQuery) => repo.getClosures(query),
  getTransfers: (query: ReportQuery) => repo.getTransfers(query),
};
