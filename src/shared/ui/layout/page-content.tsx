import { cn } from "@/shared/lib/utils";

export type PageContentWidth = "wide" | "detail" | "form";

const widthClass: Record<PageContentWidth, string> = {
  wide: "max-w-7xl",
  detail: "max-w-5xl",
  form: "max-w-3xl",
};

type PageContentProps = {
  width?: PageContentWidth;
  className?: string;
  children: React.ReactNode;
};

/** Ancho y espaciado vertical estándar en clients (`/app`), no en bloques reutilizables. */
export function PageContent({
  width = "wide",
  className,
  children,
}: PageContentProps) {
  return (
    <div className={cn("mx-auto w-full space-y-6", widthClass[width], className)}>
      {children}
    </div>
  );
}
