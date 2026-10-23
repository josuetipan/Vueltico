import { cn } from "@/shared/lib/utils";

const SYMBOL_SRC = "/brand/logo-symbol.png";
const WORDMARK_SRC = "/brand/logo-wordmark.png";

type VuelticoLogoProps = {
  variant: "symbol" | "wordmark";
  className?: string;
  alt?: string;
};

export function VuelticoLogo({ variant, className, alt = "Vueltico" }: VuelticoLogoProps) {
  const src = variant === "symbol" ? SYMBOL_SRC : WORDMARK_SRC;
  return (
    <img
      src={src}
      alt={alt}
      className={cn(
        "h-auto w-auto max-w-full object-contain",
        variant === "symbol" ? "max-h-40" : "max-h-16",
        className,
      )}
    />
  );
}
