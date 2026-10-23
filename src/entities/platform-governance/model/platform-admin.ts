export const PLATFORM_ADMIN_STATUSES = ["active", "invited", "disabled"] as const;
export type PlatformAdminStatus = (typeof PLATFORM_ADMIN_STATUSES)[number];

export type PlatformAdministrator = {
  id: string;
  email: string;
  fullName: string;
  roleId: string;
  status: PlatformAdminStatus;
  createdAt: string;
  lastLoginAt: string | null;
};

export function adminInitials(fullName: string): string {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return (parts[0] ?? "?").slice(0, 2).toUpperCase();
  const first = parts[0]?.[0] ?? "";
  const last = parts[parts.length - 1]?.[0] ?? "";
  return `${first}${last}`.toUpperCase();
}
