export type { PlatformPermission } from "./model/permission";
export {
  isValidPermissionCode,
  normalizePermissionCode,
  PERMISSION_CODE_PATTERN,
} from "./model/permission";
export type { PlatformRole } from "./model/role";
export { isValidRoleCode, normalizeRoleCode, ROLE_CODE_PATTERN } from "./model/role";
export type { PlatformAdministrator, PlatformAdminStatus } from "./model/platform-admin";
export {
  PLATFORM_ADMIN_STATUSES,
  adminInitials,
  defaultAdminExpiry,
  normalizePlatformAdministrator,
} from "./model/platform-admin";
export type {
  CreatePermissionInput,
  CreatePlatformAdminInput,
  CreateRoleInput,
  GovernanceRepository,
  UpdatePlatformAdminInput,
  UpdateRoleInput,
} from "./api/governance-repository";
export { mockGovernanceRepository, GovernanceError } from "./api/mock-governance-repository";
