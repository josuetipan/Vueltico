import {
  SEED_PERMISSIONS,
  SEED_PLATFORM_ADMINS,
  SEED_ROLES,
} from "../model/seed-data";
import type { PlatformAdministrator } from "../model/platform-admin";
import {
  isValidPermissionCode,
  normalizePermissionCode,
  type PlatformPermission,
} from "../model/permission";
import {
  isValidRoleCode,
  normalizeRoleCode,
  type PlatformRole,
} from "../model/role";
import type {
  CreatePermissionInput,
  CreatePlatformAdminInput,
  CreateRoleInput,
  GovernanceRepository,
  UpdatePlatformAdminInput,
  UpdateRoleInput,
} from "./governance-repository";

const STORAGE_KEY = "vueltico.platform.governance";

type GovernanceStore = {
  permissions: PlatformPermission[];
  roles: PlatformRole[];
  admins: PlatformAdministrator[];
};

function newId(prefix: string): string {
  return `${prefix}-${crypto.randomUUID().slice(0, 8)}`;
}

function readStore(): GovernanceStore {
  if (typeof window === "undefined") {
    return {
      permissions: [...SEED_PERMISSIONS],
      roles: [...SEED_ROLES],
      admins: [...SEED_PLATFORM_ADMINS],
    };
  }
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const seed: GovernanceStore = {
        permissions: [...SEED_PERMISSIONS],
        roles: [...SEED_ROLES],
        admins: [...SEED_PLATFORM_ADMINS],
      };
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(seed));
      return seed;
    }
    const parsed = JSON.parse(raw) as GovernanceStore;
    return {
      permissions: parsed.permissions?.length ? parsed.permissions : [...SEED_PERMISSIONS],
      roles: parsed.roles?.length ? parsed.roles : [...SEED_ROLES],
      admins: parsed.admins ?? [...SEED_PLATFORM_ADMINS],
    };
  } catch {
    return {
      permissions: [...SEED_PERMISSIONS],
      roles: [...SEED_ROLES],
      admins: [...SEED_PLATFORM_ADMINS],
    };
  }
}

function writeStore(store: GovernanceStore): void {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
}

export class GovernanceError extends Error {
  constructor(public code: string) {
    super(code);
  }
}

export const mockGovernanceRepository: GovernanceRepository = {
  async listPermissions() {
    return readStore().permissions;
  },

  async createPermission(input: CreatePermissionInput) {
    const code = normalizePermissionCode(input.code);
    if (!isValidPermissionCode(code)) throw new GovernanceError("invalid_permission_code");
    const name = input.name.trim();
    const moduleName = input.module.trim();
    if (!name || !moduleName) throw new GovernanceError("empty_fields");

    const store = readStore();
    if (store.permissions.some((p) => p.code === code)) {
      throw new GovernanceError("permission_code_exists");
    }
    const permission: PlatformPermission = {
      id: newId("perm"),
      code,
      name,
      module: moduleName,
      isSystem: false,
    };
    store.permissions.push(permission);
    writeStore(store);
    return permission;
  },

  async deletePermission(id: string) {
    const store = readStore();
    const perm = store.permissions.find((p) => p.id === id);
    if (!perm) throw new GovernanceError("not_found");
    if (perm.isSystem) throw new GovernanceError("system_locked");
    if (store.roles.some((r) => r.permissionIds.includes(id))) {
      throw new GovernanceError("permission_in_use");
    }
    store.permissions = store.permissions.filter((p) => p.id !== id);
    writeStore(store);
  },

  async listRoles() {
    return readStore().roles;
  },

  async getRole(id: string) {
    return readStore().roles.find((r) => r.id === id) ?? null;
  },

  async createRole(input: CreateRoleInput) {
    const code = normalizeRoleCode(input.code);
    if (!isValidRoleCode(code)) throw new GovernanceError("invalid_role_code");
    const name = input.name.trim();
    if (!name) throw new GovernanceError("empty_fields");

    const store = readStore();
    if (store.roles.some((r) => r.code === code)) throw new GovernanceError("role_code_exists");

    const validPermIds = new Set(store.permissions.map((p) => p.id));
    const permissionIds = input.permissionIds.filter((id) => validPermIds.has(id));

    const role: PlatformRole = {
      id: newId("role"),
      code,
      name,
      description: input.description.trim(),
      permissionIds,
      isSystem: false,
    };
    store.roles.push(role);
    writeStore(store);
    return role;
  },

  async updateRole(id: string, input: UpdateRoleInput) {
    const store = readStore();
    const index = store.roles.findIndex((r) => r.id === id);
    if (index === -1) throw new GovernanceError("not_found");

    const validPermIds = new Set(store.permissions.map((p) => p.id));
    const permissionIds = input.permissionIds.filter((pid) => validPermIds.has(pid));

    const updated: PlatformRole = {
      ...store.roles[index]!,
      name: input.name.trim(),
      description: input.description.trim(),
      permissionIds,
    };
    store.roles[index] = updated;
    writeStore(store);
    return updated;
  },

  async deleteRole(id: string) {
    const store = readStore();
    const role = store.roles.find((r) => r.id === id);
    if (!role) throw new GovernanceError("not_found");
    if (role.isSystem) throw new GovernanceError("system_locked");
    if (store.admins.some((a) => a.roleId === id)) throw new GovernanceError("role_in_use");
    store.roles = store.roles.filter((r) => r.id !== id);
    writeStore(store);
  },

  async listPlatformAdmins() {
    return readStore().admins;
  },

  async createPlatformAdmin(input: CreatePlatformAdminInput) {
    const email = input.email.trim().toLowerCase();
    const fullName = input.fullName.trim();
    if (!email || !fullName || !input.roleId) throw new GovernanceError("empty_fields");

    const store = readStore();
    if (!store.roles.some((r) => r.id === input.roleId)) throw new GovernanceError("role_not_found");
    if (store.admins.some((a) => a.email.toLowerCase() === email)) {
      throw new GovernanceError("admin_email_exists");
    }

    const admin: PlatformAdministrator = {
      id: newId("padm"),
      email,
      fullName,
      roleId: input.roleId,
      status: "invited",
      createdAt: new Date().toISOString(),
      lastLoginAt: null,
    };
    store.admins.push(admin);
    writeStore(store);
    return admin;
  },

  async updatePlatformAdmin(id: string, input: UpdatePlatformAdminInput) {
    const store = readStore();
    const index = store.admins.findIndex((a) => a.id === id);
    if (index === -1) throw new GovernanceError("not_found");
    if (!store.roles.some((r) => r.id === input.roleId)) throw new GovernanceError("role_not_found");

    const updated: PlatformAdministrator = {
      ...store.admins[index]!,
      fullName: input.fullName.trim(),
      roleId: input.roleId,
      status: input.status,
    };
    store.admins[index] = updated;
    writeStore(store);
    return updated;
  },
};
