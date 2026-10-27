import type { PlanId } from "@/entities/plan";

export const PLATFORM_ADMIN_STATUSES = ["active", "invited", "disabled"] as const;
export type PlatformAdminStatus = (typeof PLATFORM_ADMIN_STATUSES)[number];

export type PlatformAdministrator = {
  id: string;
  email: string;
  fullName: string;
  identification: string;
  city: string;
  /** Provincia o estado geográfico */
  stateRegion: string;
  phone: string;
  planId: PlanId;
  roleId: string;
  /** Estado de la cuenta (activo, invitado, inactivo) */
  status: PlatformAdminStatus;
  createdAt: string;
  expiresAt: string;
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

export function defaultAdminExpiry(from: Date = new Date()): string {
  const d = new Date(from);
  d.setFullYear(d.getFullYear() + 1);
  return d.toISOString().slice(0, 10);
}

export function normalizePlatformAdministrator(
  input: Partial<PlatformAdministrator> & Pick<PlatformAdministrator, "id" | "email">,
): PlatformAdministrator {
  const createdAt = input.createdAt ?? new Date().toISOString();
  const createdDate = new Date(createdAt);
  return {
    id: input.id,
    email: input.email.trim().toLowerCase(),
    fullName: (input.fullName ?? "").trim(),
    identification: (input.identification ?? "").trim(),
    city: (input.city ?? "").trim(),
    stateRegion: (input.stateRegion ?? "").trim(),
    phone: (input.phone ?? "").trim(),
    planId: input.planId ?? "growth",
    roleId: input.roleId ?? "role-support",
    status: input.status ?? "invited",
    createdAt,
    expiresAt: input.expiresAt ?? defaultAdminExpiry(createdDate),
    lastLoginAt: input.lastLoginAt ?? null,
  };
}
