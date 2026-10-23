import { useCallback, useEffect, useState } from "react";
import {
  DEFAULT_LOGIN_BRANDING,
  normalizeLoginBranding,
  type LoginBrandingConfig,
} from "@/entities/platform-brand/model/login-branding";
import { loginBrandingStorage } from "@/entities/platform-brand/api/login-branding-storage";

export function useLoginBranding() {
  const [loginBranding, setLoginBranding] = useState<LoginBrandingConfig>(
    DEFAULT_LOGIN_BRANDING,
  );
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setLoginBranding(loginBrandingStorage.read());
    setReady(true);
  }, []);

  const saveLoginBranding = useCallback((next: LoginBrandingConfig) => {
    const normalized = loginBrandingStorage.write(next);
    setLoginBranding(normalized);
    return normalized;
  }, []);

  const resetLoginBranding = useCallback(() => {
    const defaults = loginBrandingStorage.reset();
    setLoginBranding(defaults);
    return defaults;
  }, []);

  const patchLoginBranding = useCallback(
    (patch: Partial<LoginBrandingConfig>) => {
      return saveLoginBranding(normalizeLoginBranding({ ...loginBranding, ...patch }));
    },
    [loginBranding, saveLoginBranding],
  );

  return { loginBranding, loginBrandingReady: ready, saveLoginBranding, resetLoginBranding, patchLoginBranding };
}
