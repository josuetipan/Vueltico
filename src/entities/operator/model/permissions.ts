/** Contrato de autorización (backend validará los mismos códigos). */
export const OPERATOR_PERMISSIONS = [
  "dashboard:view",
  "organization:switch",
  "accounts:view",
  "movements:view_own",
  "movements:create",
  "receipts:attach",
  "sales:view_own",
  "shifts:view_own",
  "requests:view_own",
  "notifications:view",
  "profile:edit",
] as const;

export type OperatorPermission = (typeof OPERATOR_PERMISSIONS)[number];

export type OperatorProfile = {
  userId: string;
  tenantId: string;
  operatorStaffId: string;
  displayName: string;
  email: string;
  branchId: string;
  branchName: string;
  roleLabel: string;
  permissions: OperatorPermission[];
  enabledFeatures: {
    cashier: boolean;
    treasury: boolean;
  };
};

export function hasPermission(profile: OperatorProfile, permission: OperatorPermission): boolean {
  return profile.permissions.includes(permission);
}

export function assertPermission(profile: OperatorProfile, permission: OperatorPermission): void {
  if (!hasPermission(profile, permission)) throw new Error("ACCESS_DENIED");
}
