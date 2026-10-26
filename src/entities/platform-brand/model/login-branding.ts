/** Imágenes del branding de login (parametrizables por superadmin). */
export const LOGIN_BRAND_IMAGE_KEYS = [
  "background",
  "logoSymbol",
  "logoWordmark",
  "logoCollaboration",
  "letters",
] as const;

export type LoginBrandImageKey = (typeof LOGIN_BRAND_IMAGE_KEYS)[number];

/** Zonas de la pantalla (sin la franja del formulario de login a la derecha). */
export const LOGIN_BRAND_PLACEMENTS = [
  "cover",
  "top-start",
  "top-center",
  "center-start",
  "center",
  "bottom-start",
  "bottom-center",
] as const;

export type LoginBrandPlacement = (typeof LOGIN_BRAND_PLACEMENTS)[number];

export const LOGIN_BRAND_SIZE_PRESETS = ["sm", "md", "lg", "watermark"] as const;
export type LoginBrandSizePreset = (typeof LOGIN_BRAND_SIZE_PRESETS)[number];

export type LoginBrandImageSlot = {
  /** URL pública o data URL; vacío usa el default del slot (si existe). */
  src: string;
  placement: LoginBrandPlacement;
  enabled: boolean;
  /** 1–100 */
  opacity: number;
  size: LoginBrandSizePreset;
};

export type LoginBrandingConfig = Record<LoginBrandImageKey, LoginBrandImageSlot>;

export const DEFAULT_LOGIN_BRAND_ASSETS: Record<
  LoginBrandImageKey,
  string
> = {
  background: "",
  logoSymbol: "/brand/logo-symbol.png",
  logoWordmark: "/brand/logo-wordmark.png",
  logoCollaboration: "",
  letters: "",
};

export const LOGIN_BRAND_IMAGE_META: Record<
  LoginBrandImageKey,
  { label: string; placementHint: string }
> = {
  background: {
    label: "Fondo",
    placementHint: "Suele ir a pantalla completa; si está vacío se usa el gradiente de colores.",
  },
  logoSymbol: {
    label: "Logo imagen (login)",
    placementHint: "Isotipo suelto en la pantalla de login (p. ej. marca de agua). Para el menú lateral use «Marca menú».",
  },
  logoWordmark: {
    label: "Logo escrito (login)",
    placementHint: "Wordmark en la composición del login; puede ir junto al logo de colaboración en la misma zona.",
  },
  logoCollaboration: {
    label: "Logo colaboración (login)",
    placementHint: "Opcional en login. Con logo escrito activo, muestra línea vertical y este logo al lado.",
  },
  letters: {
    label: "Letras",
    placementHint: "Gráfico tipográfico o claim (opcional).",
  },
};

export const LOGIN_BRAND_PLACEMENT_LABELS: Record<LoginBrandPlacement, string> = {
  cover: "Pantalla completa",
  "top-start": "Arriba izquierda",
  "top-center": "Arriba centro",
  "center-start": "Centro izquierda",
  "center": "Centro (marca de agua)",
  "bottom-start": "Abajo izquierda",
  "bottom-center": "Abajo centro",
};

function defaultSlot(
  key: LoginBrandImageKey,
  overrides?: Partial<LoginBrandImageSlot>,
): LoginBrandImageSlot {
  const defaults: LoginBrandImageSlot = {
    src: DEFAULT_LOGIN_BRAND_ASSETS[key],
    enabled: key !== "letters",
    opacity: key === "logoSymbol" ? 14 : key === "background" ? 100 : 100,
    size:
      key === "logoSymbol"
        ? "watermark"
        : key === "logoWordmark" || key === "logoCollaboration"
          ? "sm"
          : "md",
    placement:
      key === "background"
        ? "cover"
        : key === "logoSymbol"
          ? "center"
          : key === "logoWordmark" || key === "logoCollaboration"
            ? "top-start"
            : "bottom-start",
  };
  return { ...defaults, ...overrides };
}

export const DEFAULT_LOGIN_BRANDING: LoginBrandingConfig = {
  background: defaultSlot("background"),
  logoSymbol: defaultSlot("logoSymbol"),
  logoWordmark: defaultSlot("logoWordmark"),
  logoCollaboration: defaultSlot("logoCollaboration", { enabled: false }),
  letters: defaultSlot("letters", { enabled: false }),
};

function clampOpacity(value: number): number {
  if (!Number.isFinite(value)) return 100;
  return Math.min(100, Math.max(1, Math.round(value)));
}

function normalizeSlot(
  key: LoginBrandImageKey,
  input: Partial<LoginBrandImageSlot> | undefined,
): LoginBrandImageSlot {
  const base = defaultSlot(key);
  if (!input) return base;
  const placement = LOGIN_BRAND_PLACEMENTS.includes(
    input.placement as LoginBrandPlacement,
  )
    ? (input.placement as LoginBrandPlacement)
    : base.placement;
  const size = LOGIN_BRAND_SIZE_PRESETS.includes(input.size as LoginBrandSizePreset)
    ? (input.size as LoginBrandSizePreset)
    : base.size;
  let resolvedPlacement = placement;
  if (key === "background") {
    resolvedPlacement = "cover";
  } else if (resolvedPlacement === "cover") {
    resolvedPlacement = base.placement;
  }
  return {
    src: typeof input.src === "string" ? input.src : base.src,
    enabled: input.enabled ?? base.enabled,
    opacity: clampOpacity(input.opacity ?? base.opacity),
    size,
    placement: resolvedPlacement,
  };
}

export function normalizeLoginBranding(
  input: Partial<LoginBrandingConfig> | null | undefined,
): LoginBrandingConfig {
  const next = { ...DEFAULT_LOGIN_BRANDING };
  if (!input) return next;
  for (const key of LOGIN_BRAND_IMAGE_KEYS) {
    next[key] = normalizeSlot(key, input[key]);
  }
  return next;
}

export function resolveLoginBrandImageSrc(
  key: LoginBrandImageKey,
  slot: LoginBrandImageSlot,
): string | null {
  if (!slot.enabled) return null;
  const trimmed = slot.src.trim();
  if (trimmed) return trimmed;
  const fallback = DEFAULT_LOGIN_BRAND_ASSETS[key].trim();
  return fallback || null;
}
