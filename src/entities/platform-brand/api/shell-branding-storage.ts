import {
  DEFAULT_SHELL_BRANDING,
  normalizeShellBranding,
  type ShellBrandingConfig,
} from "../model/shell-branding";

const STORAGE_KEY = "vueltico.platform.shell-branding";

export const shellBrandingStorage = {
  read(): ShellBrandingConfig {
    if (typeof window === "undefined") return DEFAULT_SHELL_BRANDING;
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return DEFAULT_SHELL_BRANDING;
      return normalizeShellBranding(JSON.parse(raw) as Partial<ShellBrandingConfig>);
    } catch {
      return DEFAULT_SHELL_BRANDING;
    }
  },

  write(config: ShellBrandingConfig): ShellBrandingConfig {
    const normalized = normalizeShellBranding(config);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(normalized));
    return normalized;
  },

  reset(): ShellBrandingConfig {
    localStorage.removeItem(STORAGE_KEY);
    return DEFAULT_SHELL_BRANDING;
  },
};
