export {
  BRAND_COLOR_KEYS,
  BRAND_COLOR_META,
  DEFAULT_BRAND_PALETTE,
  isValidBrandHex,
  normalizeBrandPalette,
  type BrandColorKey,
  type BrandPalette,
} from "./model/brand-palette";
export {
  DEFAULT_LOGIN_BRANDING,
  DEFAULT_LOGIN_BRAND_ASSETS,
  LOGIN_BRAND_IMAGE_KEYS,
  LOGIN_BRAND_IMAGE_META,
  LOGIN_BRAND_PLACEMENT_LABELS,
  LOGIN_BRAND_PLACEMENTS,
  normalizeLoginBranding,
  resolveLoginBrandImageSrc,
  type LoginBrandImageKey,
  type LoginBrandingConfig,
  type LoginBrandImageSlot,
  type LoginBrandPlacement,
} from "./model/login-branding";
export { LoginBrandLayer } from "./ui/login-brand-layer";
