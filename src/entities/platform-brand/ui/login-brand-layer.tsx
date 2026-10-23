import {
  LOGIN_BRAND_IMAGE_KEYS,
  LOGIN_BRAND_PLACEMENT_LABELS,
  resolveLoginBrandImageSrc,
  type LoginBrandImageKey,
  type LoginBrandPlacement,
  type LoginBrandSizePreset,
  type LoginBrandingConfig,
} from "../model/login-branding";
import { cn } from "@/shared/lib/utils";

const PLACEMENT_CLASS: Record<
  Exclude<LoginBrandPlacement, "cover">,
  string
> = {
  "top-start": "left-[6%] top-[8%]",
  "top-center": "left-1/2 top-[8%] -translate-x-1/2",
  "center-start": "left-[6%] top-1/2 -translate-y-1/2",
  center: "left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2",
  "bottom-start": "bottom-[8%] left-[6%]",
  "bottom-center": "bottom-[8%] left-1/2 -translate-x-1/2",
};

const SIZE_CLASS: Record<LoginBrandSizePreset, string> = {
  sm: "max-h-[12%] max-w-[40%]",
  md: "max-h-[18%] max-w-[55%]",
  lg: "max-h-[28%] max-w-[70%]",
  watermark: "max-h-[55%] max-w-[85%]",
};

type LoginBrandLayerProps = {
  config: LoginBrandingConfig;
  /** login: respeta franja del formulario; preview: escala en miniatura */
  variant?: "login" | "preview";
};

function BrandImageSlot({
  slotKey,
  config,
  variant,
}: {
  slotKey: LoginBrandImageKey;
  config: LoginBrandingConfig;
  variant: "login" | "preview";
}) {
  const slot = config[slotKey];
  const src = resolveLoginBrandImageSrc(slotKey, slot);
  if (!src || slot.placement === "cover") return null;

  const placement = slot.placement as Exclude<LoginBrandPlacement, "cover">;
  const placementClass = PLACEMENT_CLASS[placement] ?? PLACEMENT_CLASS.center;

  return (
    <img
      src={src}
      alt=""
      className={cn(
        "pointer-events-none absolute h-auto w-auto object-contain",
        placementClass,
        SIZE_CLASS[slot.size],
        variant === "preview" && "select-none",
      )}
      style={{ opacity: slot.opacity / 100 }}
      draggable={false}
    />
  );
}

export function LoginBrandLayer({ config, variant = "login" }: LoginBrandLayerProps) {
  const bgSrc = resolveLoginBrandImageSrc("background", config.background);
  const bgOpacity = config.background.opacity / 100;

  const overlayKeys = LOGIN_BRAND_IMAGE_KEYS.filter((k) => k !== "background");

  return (
    <>
      <div
        className="absolute inset-0"
        style={{
          background: bgSrc
            ? undefined
            : `linear-gradient(
          145deg,
          var(--brand-accent, #05ad98) 0%,
          color-mix(in srgb, var(--brand-accent, #05ad98) 55%, var(--brand-mid, #878787)) 48%,
          var(--brand-mid, #878787) 100%
        )`,
        }}
      >
        {bgSrc ? (
          <img
            src={bgSrc}
            alt=""
            className="h-full w-full object-cover"
            style={{ opacity: bgOpacity }}
            draggable={false}
          />
        ) : null}
      </div>

      <div
        className={cn(
          "pointer-events-none absolute inset-y-0 left-0",
          variant === "login"
            ? "right-0 lg:right-[min(520px,42vw)]"
            : "right-[28%]",
        )}
        aria-hidden
      >
        {overlayKeys.map((key) => (
          <BrandImageSlot key={key} slotKey={key} config={config} variant={variant} />
        ))}
      </div>

      {variant === "login" ? (
        <span className="sr-only">
          {overlayKeys
            .map((key) => {
              const p = config[key].placement;
              return p !== "cover" ? LOGIN_BRAND_PLACEMENT_LABELS[p] : null;
            })
            .filter(Boolean)
            .join(", ")}
        </span>
      ) : null}
    </>
  );
}
