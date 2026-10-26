import { useCallback, useEffect, useState } from "react";
import {
  DEFAULT_SHELL_BRANDING,
  normalizeShellBranding,
  type ShellBrandingConfig,
} from "@/entities/platform-brand/model/shell-branding";
import { shellBrandingStorage } from "@/entities/platform-brand/api/shell-branding-storage";

export function useShellBranding() {
  const [shellBranding, setShellBranding] = useState<ShellBrandingConfig>(
    DEFAULT_SHELL_BRANDING,
  );
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setShellBranding(shellBrandingStorage.read());
    setReady(true);
  }, []);

  const saveShellBranding = useCallback((next: ShellBrandingConfig) => {
    const normalized = shellBrandingStorage.write(next);
    setShellBranding(normalized);
    return normalized;
  }, []);

  const resetShellBranding = useCallback(() => {
    const defaults = shellBrandingStorage.reset();
    setShellBranding(defaults);
    return defaults;
  }, []);

  return {
    shellBranding,
    shellBrandingReady: ready,
    saveShellBranding,
    resetShellBranding,
  };
}
