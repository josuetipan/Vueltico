/** Logos de la barra lateral (isotipo + wordmark + colaboración opcional). */
export const SHELL_BRAND_IMAGE_KEYS = [
  "logoSymbol",
  "logoWordmark",
  "logoCollaboration",
] as const;

export type ShellBrandImageKey = (typeof SHELL_BRAND_IMAGE_KEYS)[number];

export type ShellBrandImageSlot = {
  /** URL pública o data URL; vacío usa default del slot si existe. */
  src: string;
  enabled: boolean;
};

export type ShellBrandingConfig = Record<ShellBrandImageKey, ShellBrandImageSlot>;

export const DEFAULT_SHELL_BRAND_ASSETS: Record<ShellBrandImageKey, string> = {
  logoSymbol: "/brand/logo-symbol.png",
  logoWordmark: "",
  logoCollaboration: "",
};

export const SHELL_BRAND_IMAGE_META: Record<
  ShellBrandImageKey,
  { label: string; hint: string }
> = {
  logoSymbol: {
    label: "Logo imagen",
    hint: "Isotipo en el recuadro del menú lateral.",
  },
  logoWordmark: {
    label: "Logo escrito",
    hint: "Wordmark o nombre de marca junto al isotipo. Si está vacío se muestra el texto «Vueltico».",
  },
  logoCollaboration: {
    label: "Logo colaboración",
    hint: "Opcional. Al subir imagen aparece una línea vertical y el logo aliado a la derecha.",
  },
};

export const DEFAULT_SHELL_BRANDING: ShellBrandingConfig = {
  logoSymbol: { src: DEFAULT_SHELL_BRAND_ASSETS.logoSymbol, enabled: true },
  logoWordmark: { src: DEFAULT_SHELL_BRAND_ASSETS.logoWordmark, enabled: true },
  logoCollaboration: { src: DEFAULT_SHELL_BRAND_ASSETS.logoCollaboration, enabled: false },
};

function normalizeImageSlot(
  key: ShellBrandImageKey,
  input: Partial<ShellBrandImageSlot> | undefined,
): ShellBrandImageSlot {
  const base = DEFAULT_SHELL_BRANDING[key];
  if (!input) return base;
  return {
    src: typeof input.src === "string" ? input.src : base.src,
    enabled: input.enabled ?? base.enabled,
  };
}

export function normalizeShellBranding(
  input: Partial<ShellBrandingConfig> | null | undefined,
): ShellBrandingConfig {
  const next = { ...DEFAULT_SHELL_BRANDING };
  if (!input) return next;
  for (const key of SHELL_BRAND_IMAGE_KEYS) {
    next[key] = normalizeImageSlot(key, input[key]);
  }
  return next;
}

export function resolveShellBrandImageSrc(
  key: ShellBrandImageKey,
  slot: ShellBrandImageSlot,
): string | null {
  if (!slot.enabled) return null;
  const trimmed = slot.src.trim();
  if (trimmed) return trimmed;
  const fallback = DEFAULT_SHELL_BRAND_ASSETS[key].trim();
  return fallback || null;
}
