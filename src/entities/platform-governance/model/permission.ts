export type PlatformPermission = {
  id: string;
  code: string;
  name: string;
  module: string;
  isSystem: boolean;
};

export const PERMISSION_CODE_PATTERN = /^[a-z][a-z0-9_]*:[a-z][a-z0-9_]*$/;

export function isValidPermissionCode(code: string): boolean {
  return PERMISSION_CODE_PATTERN.test(code.trim());
}

export function normalizePermissionCode(code: string): string {
  return code.trim().toLowerCase();
}
