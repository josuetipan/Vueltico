import { Badge } from "@/shared/ui/badge";
import {
  invoicePaymentStatusLabel,
  type InvoicePaymentStatus,
} from "../model/invoice";
import { cn } from "@/shared/lib/utils";

const tone: Record<InvoicePaymentStatus, string> = {
  PAID: "border-emerald-500/40 bg-emerald-500/10 text-emerald-800 dark:text-emerald-200",
  PENDING: "border-amber-500/40 bg-amber-500/10 text-amber-900 dark:text-amber-100",
  FAILED: "border-destructive/40 bg-destructive/10 text-destructive",
};

export function InvoicePaymentStatusBadge({
  status,
  className,
}: {
  status: InvoicePaymentStatus;
  className?: string;
}) {
  return (
    <Badge variant="outline" className={cn("font-normal", tone[status], className)}>
      {invoicePaymentStatusLabel(status)}
    </Badge>
  );
}
