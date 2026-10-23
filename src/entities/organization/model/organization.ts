export const SUBSCRIPTION_PLANS = [
  { id: "trial", name: "Trial 14d", maxUsers: 5 },
  { id: "growth", name: "Growth", maxUsers: 30 },
  { id: "business", name: "Business", maxUsers: 100 },
] as const;

export type PlanId = (typeof SUBSCRIPTION_PLANS)[number]["id"];

export type OrganizationStatus = "active" | "suspended" | "trial";

export type OrganizationLimits = {
  maxUsers: number;
  maxBranches: number;
  storageGb: number;
};

export type PrincipalAdmin = {
  fullName: string;
  email: string;
  inviteStatus: "pending" | "accepted";
};

export type Organization = {
  id: string;
  tradeName: string;
  legalName: string;
  ruc: string;
  email: string;
  phone: string;
  country: string;
  province: string;
  city: string;
  planId: PlanId;
  status: OrganizationStatus;
  registeredAt: string;
  limits: OrganizationLimits;
  admin: PrincipalAdmin;
  activeUsersCount: number;
  tenantIsolationKey: string;
};

export type OrganizationListItem = {
  id: string;
  tradeName: string;
  legalName: string;
  ruc: string;
  planName: string;
  status: OrganizationStatus;
  activeUsersCount: number;
  registeredAt: string;
};

export function getPlanById(planId: PlanId) {
  const plan = SUBSCRIPTION_PLANS.find((p) => p.id === planId);
  if (!plan) throw new Error("INVALID_PLAN");
  return plan;
}

export function organizationStatusLabel(status: OrganizationStatus): string {
  switch (status) {
    case "active":
      return "Activa";
    case "trial":
      return "Prueba";
    case "suspended":
      return "Suspendida";
  }
}
