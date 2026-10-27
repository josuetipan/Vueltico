import { Plus } from "lucide-react";
import { Button, type ButtonProps } from "@/shared/ui/button";
import { cn } from "@/shared/lib/utils";

type PageHeaderActionProps = ButtonProps & {
  /** Muestra icono + junto al texto (por defecto sí; desactívelo si usa `asChild`). */
  showIcon?: boolean;
};

/** CTA principal alineado con `PageHeader` (altura `default`, h-9). */
export function PageHeaderAction({
  showIcon = true,
  children,
  className,
  size = "default",
  asChild,
  ...props
}: PageHeaderActionProps) {
  if (asChild) {
    return (
      <Button asChild size={size} className={cn("gap-2", className)} {...props}>
        {children}
      </Button>
    );
  }

  return (
    <Button size={size} className={cn("gap-2", className)} {...props}>
      {showIcon ? <Plus className="h-4 w-4" aria-hidden /> : null}
      {children}
    </Button>
  );
}
