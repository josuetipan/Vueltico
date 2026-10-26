import {
  resolveShellBrandImageSrc,
  type ShellBrandingConfig,
} from "../model/shell-branding";
import { cn } from "@/shared/lib/utils";

type ShellBrandHeaderProps = {
  config: ShellBrandingConfig;
  className?: string;
  /** sidebar: barra lateral real; preview: miniatura en parametrización */
  variant?: "sidebar" | "preview";
};

export function ShellBrandHeader({
  config,
  className,
  variant = "sidebar",
}: ShellBrandHeaderProps) {
  const symbolSrc = resolveShellBrandImageSrc("logoSymbol", config.logoSymbol);
  const wordmarkSrc = resolveShellBrandImageSrc("logoWordmark", config.logoWordmark);
  const collabSrc = resolveShellBrandImageSrc("logoCollaboration", config.logoCollaboration);
  const showDivider = Boolean(collabSrc);
  const tagline = config.tagline.trim();

  const isPreview = variant === "preview";

  return (
    <div
      className={cn(
        "flex min-w-0 items-center gap-3",
        isPreview ? "px-4 py-3" : "gap-2",
        className,
      )}
    >
      <div className="flex min-w-0 flex-1 items-center gap-2">
        {symbolSrc ? (
          <div
            className={cn(
              "flex shrink-0 items-center justify-center rounded-md bg-white/10",
              isPreview ? "h-8 w-8" : "h-9 w-9",
            )}
          >
            <img
              src={symbolSrc}
              alt=""
              className={cn("object-contain", isPreview ? "h-6 w-6" : "h-7 w-7")}
              draggable={false}
            />
          </div>
        ) : null}

        <div className="min-w-0">
          {wordmarkSrc ? (
            <img
              src={wordmarkSrc}
              alt=""
              className={cn(
                "max-w-full object-contain object-left",
                isPreview ? "max-h-6" : "max-h-7",
              )}
              draggable={false}
            />
          ) : (
            <p
              className={cn(
                "truncate font-semibold tracking-tight text-sidebar-foreground",
                isPreview ? "text-xs" : "text-sm",
              )}
            >
              Vueltico
            </p>
          )}
          {tagline ? (
            <p
              className={cn(
                "truncate text-sidebar-muted",
                isPreview ? "text-[10px]" : "text-xs",
              )}
            >
              {tagline}
            </p>
          ) : null}
        </div>
      </div>

      {showDivider ? (
        <span
          className={cn(
            "w-px shrink-0 self-stretch bg-sidebar-foreground/25",
            isPreview ? "my-0.5" : "my-1",
          )}
          aria-hidden
        />
      ) : null}

      {collabSrc ? (
        <img
          src={collabSrc}
          alt=""
          className={cn(
            "shrink-0 object-contain",
            isPreview ? "max-h-7 max-w-[72px]" : "max-h-8 max-w-[96px]",
          )}
          draggable={false}
        />
      ) : null}
    </div>
  );
}
