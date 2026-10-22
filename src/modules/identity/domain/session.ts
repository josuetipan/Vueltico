export const USER_ROLES = [
  "superadmin",
  "company_admin",
  "operator",
] as const;

export type UserRole = (typeof USER_ROLES)[number];

export type TenantSummary = {
  id: string;
  legalName: string;
  tradeName: string;
  ruc: string;
};

export type UserSession = {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  tenant: TenantSummary | null;
  avatarInitials: string;
  mfaVerified?: boolean;
};

export function buildSession(input: UserSession): UserSession {
  return { ...input, mfaVerified: input.mfaVerified ?? false };
}

export function getRoleHomePath(role: UserRole): string {
  switch (role) {
    case "superadmin":
      return "/app/superadmin";
    case "company_admin":
      return "/app/empresa";
    case "operator":
      return "/app/operativo";
  }
}

export function canAccessPath(role: UserRole, pathname: string): boolean {
  const prefix =
    role === "superadmin"
      ? "/app/superadmin"
      : role === "company_admin"
        ? "/app/empresa"
        : "/app/operativo";
  return pathname.startsWith(prefix) || pathname === "/app";
}
