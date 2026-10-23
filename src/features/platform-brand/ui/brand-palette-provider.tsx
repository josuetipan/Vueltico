import { createContext, useContext, useMemo } from "react";
import { useBrandPalette } from "../model/use-brand-palette";
import { useLoginBranding } from "../model/use-login-branding";
import type { BrandPalette } from "@/entities/platform-brand";

type BrandPaletteContextValue = ReturnType<typeof useBrandPalette> &
  ReturnType<typeof useLoginBranding>;

const BrandPaletteContext = createContext<BrandPaletteContextValue | null>(null);

export function BrandPaletteProvider({ children }: { children: React.ReactNode }) {
  const paletteState = useBrandPalette();
  const loginBrandingState = useLoginBranding();
  const value = useMemo(
    () => ({ ...paletteState, ...loginBrandingState }),
    [paletteState, loginBrandingState],
  );
  return (
    <BrandPaletteContext.Provider value={value}>{children}</BrandPaletteContext.Provider>
  );
}

export function useBrandPaletteContext() {
  const ctx = useContext(BrandPaletteContext);
  if (!ctx) {
    throw new Error("useBrandPaletteContext must be used within BrandPaletteProvider");
  }
  return ctx;
}

export type { BrandPalette };
