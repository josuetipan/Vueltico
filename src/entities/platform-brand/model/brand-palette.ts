/** Cuatro colores base del sistema (parametrizables por superadmin). */
export const BRAND_COLOR_KEYS = ["light", "mid", "accent", "surface"] as const;

export type BrandColorKey = (typeof BRAND_COLOR_KEYS)[number];

export type BrandPalette = Record<BrandColorKey, string>;

export const DEFAULT_BRAND_PALETTE: BrandPalette = {
  light: "#BBBFBF",
  mid: "#878787",
  accent: "#05AD98",
  surface: "#FFFFFF",
};

export const BRAND_COLOR_META: Record<
  BrandColorKey,
  { label: string; hint: string }
> = {
  light: {
    label: "Gris claro",
    hint: "Bordes, fondos suaves y elementos secundarios.",
  },
  mid: {
    label: "Gris medio",
    hint: "Fondo del menú lateral y zonas oscuras (el texto ahí va en blanco).",
  },
  accent: {
    label: "Acento marca",
    hint: "Botones primarios, enlaces y elementos activos.",
  },
  surface: {
    label: "Superficie",
    hint: "Fondos claros y texto blanco sobre barra lateral / botones acento.",
  },
};

const HEX_RE = /^#([0-9A-Fa-f]{6})$/;

export function isValidBrandHex(value: string): boolean {
  return HEX_RE.test(value.trim());
}

export function normalizeBrandPalette(input: Partial<BrandPalette>): BrandPalette {
  const next = { ...DEFAULT_BRAND_PALETTE, ...input };
  for (const key of BRAND_COLOR_KEYS) {
    if (!isValidBrandHex(next[key])) {
      next[key] = DEFAULT_BRAND_PALETTE[key];
    } else {
      next[key] = next[key].toUpperCase();
    }
  }
  return next;
}
