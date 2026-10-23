/** API del panel de empresa; KPIs mock viven en pages/company-dashboard por ahora. */
export type CompanyDashboardKpi = { label: string; value: string };

export async function getCompanyDashboardKpis(): Promise<CompanyDashboardKpi[]> {
  return [];
}
