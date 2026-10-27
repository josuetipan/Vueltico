import { cn } from "@/shared/lib/utils";

type DataTableShellProps = {
  children: React.ReactNode;
  /** Clases extra en `<table>` (p. ej. `min-w-[720px]`). */
  tableClassName?: string;
  className?: string;
};

export function DataTableShell({
  children,
  tableClassName,
  className,
}: DataTableShellProps) {
  return (
    <div className={cn("overflow-x-auto rounded-lg border", className)}>
      <table className={cn("w-full text-sm", tableClassName)}>{children}</table>
    </div>
  );
}

export const dataTableHeadClass = "border-b bg-muted/50 text-left";
export const dataTableThClass =
  "px-3 py-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground";
export const dataTableTdClass = "px-3 py-2 align-middle text-sm";
