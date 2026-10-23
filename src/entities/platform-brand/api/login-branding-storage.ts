import {
  DEFAULT_LOGIN_BRANDING,
  normalizeLoginBranding,
  type LoginBrandingConfig,
} from "../model/login-branding";

const STORAGE_KEY = "vueltico.platform.login-branding";

export const loginBrandingStorage = {
  read(): LoginBrandingConfig {
    if (typeof window === "undefined") return DEFAULT_LOGIN_BRANDING;
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) return DEFAULT_LOGIN_BRANDING;
      return normalizeLoginBranding(JSON.parse(raw) as Partial<LoginBrandingConfig>);
    } catch {
      return DEFAULT_LOGIN_BRANDING;
    }
  },

  write(config: LoginBrandingConfig): LoginBrandingConfig {
    const normalized = normalizeLoginBranding(config);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(normalized));
    return normalized;
  },

  reset(): LoginBrandingConfig {
    window.localStorage.removeItem(STORAGE_KEY);
    return DEFAULT_LOGIN_BRANDING;
  },
};
