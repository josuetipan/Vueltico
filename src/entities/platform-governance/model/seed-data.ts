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

const seedPlatformAdmin = (
  id: string,
  email: string,
  fullName: string,
  roleId: string,
  createdAt: string,
  identification: string,
): PlatformAdministrator => ({
  id,
  email,
  fullName,
  identification,
  city: "Quito",
  stateRegion: "Pichincha",
  phone: "+593 99 100 0000",
  planId: "business",
  roleId,
  status: "active",
  createdAt,
  expiresAt: "2026-12-31",
  lastLoginAt: null,
});

export const SEED_PLATFORM_ADMINS: PlatformAdministrator[] = [
  seedPlatformAdmin("padm-001", "soporte@vueltico.demo", "Laura Pérez", "role-support", "2025-08-01T10:00:00.000Z", "1712345678"),
  seedPlatformAdmin("padm-002", "onboarding@vueltico.demo", "Marco Silva", "role-onboarding", "2025-08-05T10:00:00.000Z", "1722345678"),
  seedPlatformAdmin("padm-003", "admin1@vueltico.demo", "Patricia Gómez", "role-super-full", "2025-08-10T10:00:00.000Z", "1732345678"),
  seedPlatformAdmin("padm-004", "admin2@vueltico.demo", "Felipe Torres", "role-support", "2025-08-15T10:00:00.000Z", "1742345678"),
  seedPlatformAdmin("padm-005", "admin3@vueltico.demo", "Camila Ríos", "role-onboarding", "2025-09-01T10:00:00.000Z", "1752345678"),
  seedPlatformAdmin("padm-006", "admin4@vueltico.demo", "Andrés Vargas", "role-support", "2025-09-10T10:00:00.000Z", "1762345678"),
  seedPlatformAdmin("padm-007", "admin5@vueltico.demo", "Valentina Cruz", "role-super-full", "2025-09-20T10:00:00.000Z", "1772345678"),
  seedPlatformAdmin("padm-008", "admin6@vueltico.demo", "Tomás Herrera", "role-onboarding", "2025-10-01T10:00:00.000Z", "1782345678"),
  seedPlatformAdmin("padm-009", "admin7@vueltico.demo", "Isabel Morales", "role-support", "2025-10-10T10:00:00.000Z", "1792345678"),
  seedPlatformAdmin("padm-010", "admin8@vueltico.demo", "Gabriel Peña", "role-onboarding", "2025-10-15T10:00:00.000Z", "1702345678"),
  seedPlatformAdmin("padm-011", "admin9@vueltico.demo", "Renata Solís", "role-super-full", "2025-10-20T10:00:00.000Z", "1713345678"),
];
