import { Badge } from "@/shared/ui/badge";
import { planStatusLabel, type PlanStatus } from "../model/plan-types";
import { cn } from "@/shared/lib/utils";

const tone: Record<PlanStatus, string> = {
  ACTIVE: "border-emerald-500/40 bg-emerald-500/10 text-emerald-800 dark:text-emerald-200",
  INACTIVE: "border-border bg-muted text-muted-foreground",
  DRAFT: "border-amber-500/40 bg-amber-500/10 text-amber-900 dark:text-amber-100",
};

export function PlanStatusBadge({
  status,
  className,
}: {
  status: PlanStatus;
  className?: string;
}) {
  return (
    <Badge variant="outline" className={cn("font-normal", tone[status], className)}>
      {planStatusLabel(status)}
    </Badge>
  );
}
