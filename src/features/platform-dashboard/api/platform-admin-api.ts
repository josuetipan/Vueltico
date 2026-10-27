import type { SubscriptionStatus } from "@/entities/organization/model/organization";

export type PeriodDays = 7 | 30 | 90;

export type AggregatedPlatformMetrics = {
  totalOrganizations: number;
  activeOrganizations: number;
  suspendedOrganizations: number;
  trialOrganizations: number;
  activeSubscriptions: number;
  mrrUsd: number;
  newOrganizationsInPeriod: number;
  storageUsedGb: number;
  storageCapacityGb: number;
  activeUsersPlatformWide: number;
  organizationGrowthSeries: { periodLabel: string; total: number }[];
  platformRevenueSeries: { monthLabel: string; mrrUsd: number }[];
  activeUsersByOrganization: { tradeName: string; activeUsers: number }[];
  operationalAlerts: {
    id: string;
    severity: "info" | "warning" | "critical";
    title: string;
    description: string;
  }[];
};

export type RecentOrganizationRecord = {
  id: string;
  tradeName: string;
  taxId: string;
  subscriptionStatus: SubscriptionStatus;
  planName: string;
  memberCount: number;
  createdAt: string;
};

export const platformAdminUseCases = {
  getAggregatedMetrics: async (periodDays: PeriodDays): Promise<AggregatedPlatformMetrics> => {
    await delay(300);
    const mrr = periodDays === 7 ? 46800 : periodDays === 90 ? 45100 : 48250;
    return {
      totalOrganizations: 128,
      activeOrganizations: 102,
      suspendedOrganizations: 8,
      trialOrganizations: 18,
      activeSubscriptions: 98,
      mrrUsd: mrr,
      newOrganizationsInPeriod: periodDays === 7 ? 4 : 14,
      storageUsedGb: 1842,
      storageCapacityGb: 2500,
      activeUsersPlatformWide: 109,
      organizationGrowthSeries: ["S1", "S2", "S3", "S4"].map((periodLabel, i) => ({
        periodLabel,
        total: 118 + i * 3,
      })),
      platformRevenueSeries: ["Jun", "Jul", "Ago", "Sep", "Oct"].map((monthLabel, i) => ({
        monthLabel,
        mrrUsd: Math.round(mrr * (0.92 + i * 0.02)),
      })),
      activeUsersByOrganization: [
        { tradeName: "Andina Retail", activeUsers: 12 },
        { tradeName: "Pacífico Trade", activeUsers: 28 },
      ],
      operationalAlerts: [],
    };
  },
  getRecentOrganizations: async (limit: number): Promise<RecentOrganizationRecord[]> => {
    await delay(200);
    return [
      {
        id: "org-001",
        tradeName: "Andina Retail",
        taxId: "1790123456001",
        subscriptionStatus: "ACTIVE" as const,
        planName: "Business",
        memberCount: 12,
        createdAt: "2026-10-18T14:20:00Z",
      },
    ].slice(0, limit);
  },
};

function delay(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}
