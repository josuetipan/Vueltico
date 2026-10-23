import type { OperatorProfile } from "@/entities/operator/model/permissions";
import type { TenantSummary } from "@/entities/session";

export type OperatorDashboard = {
  salesTodayCents: number;
  openShiftLabel: string | null;
  pendingRequestsCount: number;
  unreadNotifications: number;
  recentActivity: { id: string; at: string; summary: string }[];
};

export type AuthorizedAccount = {
  id: string;
  name: string;
  kind: "cash" | "bank" | "internal";
  maskedNumber: string;
};

export type OperatorMovement = {
  id: string;
  occurredAt: string;
  type: "income" | "expense";
  amountCents: number;
  accountName: string;
  description: string;
  status: "posted" | "pending_approval";
  receiptAttached: boolean;
};

export type CreateMovementInput = {
  tenantId: string;
  userId: string;
  accountId: string;
  type: "income" | "expense";
  amountCents: number;
  description: string;
};

export type OperatorSale = {
  id: string;
  label: string;
  occurredAt: string;
  totalCents: number;
  paymentSummary: string;
};

export type OperatorShift = {
  id: string;
  registerName: string;
  status: "open" | "closed" | "pending_close";
  openedAt: string;
  openingFloatCents: number;
};

export type PendingRequest = {
  id: string;
  kind: "movement" | "receipt" | "approval";
  title: string;
  submittedAt: string;
  status: "pending" | "in_review";
};

export type OperatorNotification = {
  id: string;
  at: string;
  title: string;
  body: string;
  read: boolean;
};

export type OperatorAccountSettings = {
  fullName: string;
  email: string;
  phone: string;
  notifyEmail: boolean;
  notifyPush: boolean;
};

export interface OperatorPortalRepository {
  getProfile(userId: string, tenantId: string): Promise<OperatorProfile | null>;
  listAvailableTenants(userId: string): Promise<TenantSummary[]>;
  getDashboard(profile: OperatorProfile): Promise<OperatorDashboard>;
  listAuthorizedAccounts(profile: OperatorProfile): Promise<AuthorizedAccount[]>;
  listMyMovements(profile: OperatorProfile): Promise<OperatorMovement[]>;
  createMovement(profile: OperatorProfile, input: CreateMovementInput): Promise<OperatorMovement>;
  attachReceipt(profile: OperatorProfile, movementId: string, fileName: string): Promise<void>;
  listMySales(profile: OperatorProfile): Promise<OperatorSale[]>;
  listMyShifts(profile: OperatorProfile): Promise<OperatorShift[]>;
  listPendingRequests(profile: OperatorProfile): Promise<PendingRequest[]>;
  listNotifications(profile: OperatorProfile): Promise<OperatorNotification[]>;
  markNotificationRead(profile: OperatorProfile, id: string): Promise<void>;
  getAccountSettings(profile: OperatorProfile): Promise<OperatorAccountSettings>;
  updateAccountSettings(
    profile: OperatorProfile,
    patch: Partial<OperatorAccountSettings>,
  ): Promise<OperatorAccountSettings>;
}
