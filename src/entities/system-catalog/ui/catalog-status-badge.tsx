import { Badge } from "@/shared/ui/badge";
import { catalogStatusLabel, type CatalogStatus } from "../model/catalog";
import { cn } from "@/shared/lib/utils";

const tone: Record<CatalogStatus, string> = {
  ACTIVE: "border-emerald-500/40 bg-emerald-500/10 text-emerald-800 dark:text-emerald-200",
  INACTIVE: "border-border bg-muted text-muted-foreground",
};

export function CatalogStatusBadge({
  status,
  className,
}: {
  status: CatalogStatus;
  className?: string;
}) {
  return (
    <Badge variant="outline" className={cn("font-normal", tone[status], className)}>
      {catalogStatusLabel(status)}
    </Badge>
  );
}
