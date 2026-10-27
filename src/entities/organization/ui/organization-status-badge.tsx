import {
  subscriptionStatusLabel,
  type SubscriptionStatus,
} from "@/entities/organization/model/organization";
import { Badge } from "@/shared/ui/badge";

export function OrganizationStatusBadge({ status }: { status: SubscriptionStatus }) {
  const variant =
    status === "ACTIVE"
      ? "success"
      : status === "TRIAL"
        ? "warning"
        : status === "PAST_DUE"
          ? "warning"
          : "secondary";
  return <Badge variant={variant}>{subscriptionStatusLabel(status)}</Badge>;
}
