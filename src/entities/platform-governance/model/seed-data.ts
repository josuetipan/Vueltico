import type { PlatformAdministrator } from "./platform-admin";
import type { PlatformPermission } from "./permission";
import type { PlatformRole } from "./role";

export const SEED_PERMISSIONS: PlatformPermission[] = [
  {
    id: "perm-org-read",
    code: "organizations:read",
    name: "Ver empresas",
    module: "Empresas",
    isSystem: true,
  },
  {
    id: "perm-org-write",
    code: "organizations:write",
    name: "Gestionar empresas",
    module: "Empresas",
    isSystem: true,
  },
  {
    id: "perm-brand-write",
    code: "branding:write",
    name: "Parametrizar marca",
    module: "Plataforma",
    isSystem: true,
  },
  {
    id: "perm-gov-read",
    code: "governance:read",
    name: "Ver permisos y roles",
    module: "Gobernanza",
    isSystem: true,
  },
  {
    id: "perm-gov-write",
    code: "governance:write",
    name: "Editar permisos y roles",
    module: "Gobernanza",
    isSystem: true,
  },
  {
    id: "perm-admins-read",
    code: "platform_admins:read",
    name: "Ver administradores",
    module: "Administradores",
    isSystem: true,
  },
  {
    id: "perm-admins-write",
    code: "platform_admins:write",
    name: "Crear administradores",
    module: "Administradores",
    isSystem: true,
  },
  {
    id: "perm-audit-read",
    code: "audit:read",
    name: "Ver auditoría",
    module: "Gobernanza",
    isSystem: true,
  },
];

export const SEED_ROLES: PlatformRole[] = [
  {
    id: "role-super-full",
    code: "superadmin_full",
    name: "Superadministrador plataforma",
    description: "Acceso total al panel de plataforma.",
    permissionIds: SEED_PERMISSIONS.map((p) => p.id),
    isSystem: true,
  },
  {
    id: "role-onboarding",
    code: "onboarding",
    name: "Onboarding empresas",
    description: "Alta y seguimiento de organizaciones.",
    permissionIds: ["perm-org-read", "perm-org-write", "perm-admins-read"],
    isSystem: true,
  },
  {
    id: "role-support",
    code: "support",
    name: "Soporte plataforma",
    description: "Consulta empresas y auditoría.",
    permissionIds: ["perm-org-read", "perm-audit-read", "perm-admins-read"],
    isSystem: true,
  },
];

export const SEED_PLATFORM_ADMINS: PlatformAdministrator[] = [
  {
    id: "padm-001",
    email: "soporte@vueltico.demo",
    fullName: "Laura Pérez",
    roleId: "role-support",
    status: "active",
    createdAt: "2025-08-01T10:00:00.000Z",
    lastLoginAt: "2026-03-10T14:22:00.000Z",
  },
];
