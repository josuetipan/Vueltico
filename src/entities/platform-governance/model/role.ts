export type PlatformRole = {
  id: string;
  code: string;
  name: string;
  description: string;
  permissionIds: string[];
  isSystem: boolean;
};

export const ROLE_CODE_PATTERN = /^[a-z][a-z0-9_]*$/;

export function isValidRoleCode(code: string): boolean {
  return ROLE_CODE_PATTERN.test(code.trim());
}

export function normalizeRoleCode(code: string): string {
  return code.trim().toLowerCase();
}
