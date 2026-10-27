import { cn } from "@/shared/lib/utils";
import { Label } from "@/shared/ui/label";

type ToolbarFieldProps = {
  label: string;
  htmlFor?: string;
  className?: string;
  children: React.ReactNode;
};

/** Etiqueta + control alineados para barras de filtro de tablas. */
export function ToolbarField({ label, htmlFor, className, children }: ToolbarFieldProps) {
  return (
    <div className={cn("min-w-0 space-y-1", className)}>
      <Label
        htmlFor={htmlFor}
        className="text-xs font-medium text-muted-foreground"
      >
        {label}
      </Label>
      {children}
    </div>
  );
}
