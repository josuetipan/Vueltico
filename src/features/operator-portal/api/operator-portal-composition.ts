import { assertPermission } from "@/entities/operator/model/permissions";
import type { CreateMovementInput } from "@/entities/operator/api/operator-portal-repository";
import { mockOperatorPortalRepository } from "@/entities/operator/api/mock-operator-portal-repository";

const repo = mockOperatorPortalRepository;

export const operatorPortalUseCases = {
  getProfile: (userId: string, tenantId: string) => repo.getProfile(userId, tenantId),
  listAvailableTenants: (userId: string) => repo.listAvailableTenants(userId),
  getDashboard: async (userId: string, tenantId: string) => {
    const profile = await repo.getProfile(userId, tenantId);
    if (!profile) throw new Error("PROFILE_NOT_FOUND");
    assertPermission(profile, "dashboard:view");
    return repo.getDashboard(profile);
  },
  listAuthorizedAccounts: async (userId: string, tenantId: string) => {
    const profile = await requireProfile(userId, tenantId, "accounts:view");
    return repo.listAuthorizedAccounts(profile);
  },
  listMyMovements: async (userId: string, tenantId: string) => {
    const profile = await requireProfile(userId, tenantId, "movements:view_own");
    return repo.listMyMovements(profile);
  },
  createMovement: async (userId: string, tenantId: string, input: Omit<CreateMovementInput, "tenantId" | "userId">) => {
    const profile = await requireProfile(userId, tenantId, "movements:create");
    return repo.createMovement(profile, { ...input, tenantId, userId });
  },
  attachReceipt: async (userId: string, tenantId: string, movementId: string, fileName: string) => {
    const profile = await requireProfile(userId, tenantId, "receipts:attach");
    return repo.attachReceipt(profile, movementId, fileName);
  },
  listMySales: async (userId: string, tenantId: string) => {
    const profile = await requireProfile(userId, tenantId, "sales:view_own");
    return repo.listMySales(profile);
  },
  listMyShifts: async (userId: string, tenantId: string) => {
    const profile = await requireProfile(userId, tenantId, "shifts:view_own");
    return repo.listMyShifts(profile);
  },
  listPendingRequests: async (userId: string, tenantId: string) => {
    const profile = await requireProfile(userId, tenantId, "requests:view_own");
    return repo.listPendingRequests(profile);
  },
  listNotifications: async (userId: string, tenantId: string) => {
    const profile = await requireProfile(userId, tenantId, "notifications:view");
    return repo.listNotifications(profile);
  },
  markNotificationRead: async (userId: string, tenantId: string, id: string) => {
    const profile = await requireProfile(userId, tenantId, "notifications:view");
    return repo.markNotificationRead(profile, id);
  },
  getAccountSettings: async (userId: string, tenantId: string) => {
    const profile = await requireProfile(userId, tenantId, "profile:edit");
    return repo.getAccountSettings(profile);
  },
  updateAccountSettings: async (
    userId: string,
    tenantId: string,
    patch: Parameters<typeof repo.updateAccountSettings>[1],
  ) => {
    const profile = await requireProfile(userId, tenantId, "profile:edit");
    return repo.updateAccountSettings(profile, patch);
  },
};

async function requireProfile(
  userId: string,
  tenantId: string,
  permission: Parameters<typeof assertPermission>[1],
) {
  const profile = await repo.getProfile(userId, tenantId);
  if (!profile) throw new Error("PROFILE_NOT_FOUND");
  assertPermission(profile, permission);
  return profile;
}
