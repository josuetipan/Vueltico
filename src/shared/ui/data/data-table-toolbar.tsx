import { Search } from "lucide-react";
import { cn } from "@/shared/lib/utils";
import { Input } from "@/shared/ui/input";
import { ToolbarField } from "@/shared/ui/data/toolbar-field";

type DataTableToolbarProps = {
  searchPlaceholder?: string;
  searchLabel?: string;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  filters?: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
};

export function DataTableToolbar({
  searchPlaceholder = "Buscar…",
  searchLabel = "Buscar",
  searchValue = "",
  onSearchChange,
  filters,
  actions,
  className,
}: DataTableToolbarProps) {
  return (
    <div
      className={cn(
        "border-b border-border/80 bg-muted/25 px-4 py-3",
        className,
      )}
    >
      <div className="grid grid-cols-1 items-end gap-3 sm:grid-cols-2 lg:grid-cols-12">
        <ToolbarField label={searchLabel} htmlFor="data-table-search" className="lg:col-span-4">
          <div className="relative">
            <Search
              className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground"
              aria-hidden
            />
            <Input
              id="data-table-search"
              className="h-8 pl-8 text-sm shadow-none"
              placeholder={searchPlaceholder}
              value={searchValue}
              onChange={(event) => onSearchChange?.(event.target.value)}
              aria-label={searchPlaceholder}
            />
          </div>
        </ToolbarField>

        {filters ? (
          <div className="grid grid-cols-2 gap-3 sm:col-span-2 lg:col-span-5 lg:grid-cols-[repeat(auto-fit,minmax(7.5rem,1fr))]">
            {filters}
          </div>
        ) : (
          <div className="hidden lg:col-span-5 lg:block" aria-hidden />
        )}

        {actions ? (
          <div className="flex flex-wrap items-center justify-start gap-2 sm:col-span-2 sm:justify-end lg:col-span-3 lg:justify-end">
            {actions}
          </div>
        ) : null}
      </div>
    </div>
  );
}
