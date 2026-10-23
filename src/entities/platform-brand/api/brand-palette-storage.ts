import {
  DEFAULT_BRAND_PALETTE,
  normalizeBrandPalette,
  type BrandPalette,
} from "../model/brand-palette";

const STORAGE_KEY = "vueltico.platform.brand-palette";

export const brandPaletteStorage = {
  read(): BrandPalette {
    if (typeof window === "undefined") return DEFAULT_BRAND_PALETTE;
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) return DEFAULT_BRAND_PALETTE;
      return normalizeBrandPalette(JSON.parse(raw) as Partial<BrandPalette>);
    } catch {
      return DEFAULT_BRAND_PALETTE;
    }
  },

  write(palette: BrandPalette): BrandPalette {
    const normalized = normalizeBrandPalette(palette);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(normalized));
    return normalized;
  },

  reset(): BrandPalette {
    window.localStorage.removeItem(STORAGE_KEY);
    return DEFAULT_BRAND_PALETTE;
  },
};
