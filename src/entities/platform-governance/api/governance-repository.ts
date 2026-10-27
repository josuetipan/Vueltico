import type { PlanId } from "@/entities/plan";
import type { PlatformAdministrator, PlatformAdminStatus } from "../model/platform-admin";
import type { PlatformPermission } from "../model/permission";
import type { PlatformRole } from "../model/role";

export type CreatePermissionInput = {
  code: string;
  name: string;
  module: string;
};

export type CreateRoleInput = {
  code: string;
  name: string;
  description: string;
  permissionIds: string[];
};

export type UpdateRoleInput = {
  name: string;
  description: string;
  permissionIds: string[];
};

export type PlatformAdminRegistrationInput = {
  email: string;
  fullName: string;
  identification: string;
  city: string;
  stateRegion: string;
  phone: string;
  planId: PlanId;
  roleId: string;
  status: PlatformAdminStatus;
  expiresAt: string;
};

export type CreatePlatformAdminInput = PlatformAdminRegistrationInput;

export type UpdatePlatformAdminInput = PlatformAdminRegistrationInput;

export type GovernanceRepository = {
  listPermissions(): Promise<PlatformPermission[]>;
  createPermission(input: CreatePermissionInput): Promise<PlatformPermission>;
  deletePermission(id: string): Promise<void>;

  listRoles(): Promise<PlatformRole[]>;
  getRole(id: string): Promise<PlatformRole | null>;
  createRole(input: CreateRoleInput): Promise<PlatformRole>;
  updateRole(id: string, input: UpdateRoleInput): Promise<PlatformRole>;
  deleteRole(id: string): Promise<void>;

  listPlatformAdmins(): Promise<PlatformAdministrator[]>;
  createPlatformAdmin(input: CreatePlatformAdminInput): Promise<PlatformAdministrator>;
  updatePlatformAdmin(id: string, input: UpdatePlatformAdminInput): Promise<PlatformAdministrator>;
};
