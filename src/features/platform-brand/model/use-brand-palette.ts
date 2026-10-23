import { useCallback, useEffect, useState } from "react";
import {
  DEFAULT_BRAND_PALETTE,
  normalizeBrandPalette,
  type BrandPalette,
} from "@/entities/platform-brand";
import { brandPaletteStorage } from "@/entities/platform-brand/api/brand-palette-storage";
import { applyBrandPaletteToDocument } from "./apply-brand-palette";

export function useBrandPalette() {
  const [palette, setPalette] = useState<BrandPalette>(DEFAULT_BRAND_PALETTE);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const stored = brandPaletteStorage.read();
    setPalette(stored);
    applyBrandPaletteToDocument(stored);
    setReady(true);
  }, []);

  const savePalette = useCallback((next: BrandPalette) => {
    const normalized = brandPaletteStorage.write(next);
    setPalette(normalized);
    applyBrandPaletteToDocument(normalized);
    return normalized;
  }, []);

  const resetPalette = useCallback(() => {
    const defaults = brandPaletteStorage.reset();
    setPalette(defaults);
    applyBrandPaletteToDocument(defaults);
    return defaults;
  }, []);

  const patchPalette = useCallback(
    (patch: Partial<BrandPalette>) => {
      return savePalette(normalizeBrandPalette({ ...palette, ...patch }));
    },
    [palette, savePalette],
  );

  return { palette, ready, savePalette, resetPalette, patchPalette };
}
