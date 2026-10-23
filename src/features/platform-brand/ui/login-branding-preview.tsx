import {
  LOGIN_BRAND_IMAGE_KEYS,
  resolveLoginBrandImageSrc,
  type LoginBrandingConfig,
} from "@/entities/platform-brand/model/login-branding";
import { LoginBrandLayer } from "@/entities/platform-brand/ui/login-brand-layer";

type LoginBrandingPreviewProps = {
  config: LoginBrandingConfig;
  className?: string;
};

export function LoginBrandingPreview({ config, className }: LoginBrandingPreviewProps) {
  const hasBg = Boolean(resolveLoginBrandImageSrc("background", config.background));
  const hasOverlay = LOGIN_BRAND_IMAGE_KEYS.some(
    (key) => key !== "background" && resolveLoginBrandImageSrc(key, config[key]),
  );

  return (
    <div
      className={`relative aspect-[16/10] overflow-hidden rounded-lg border ${className ?? ""}`}
    >
      <LoginBrandLayer config={config} variant="preview" />
      {!hasBg && !hasOverlay ? (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center text-xs font-normal text-foreground/50">
          Sin imágenes
        </div>
      ) : null}
      <div
        className="pointer-events-none absolute inset-y-0 right-0 w-[28%] rounded-l-md border-l border-border/40 bg-background/90 shadow-sm"
        aria-hidden
      />
    </div>
  );
}
