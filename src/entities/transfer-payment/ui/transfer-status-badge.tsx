import {
  transferStatusLabel,
  type TransferPaymentStatus,
} from "@/entities/transfer-payment/model/transfer-payment";
import { Badge } from "@/shared/ui/badge";

export function TransferStatusBadge({ status }: { status: TransferPaymentStatus }) {
  const variant =
    status === "confirmed"
      ? "success"
      : status === "rejected"
        ? "destructive"
        : status === "in_review"
          ? "warning"
          : "secondary";
  return <Badge variant={variant}>{transferStatusLabel(status)}</Badge>;
}
