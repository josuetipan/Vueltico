import {
  organizationStatusLabel,
  type OrganizationStatus,
} from "@/entities/organization/model/organization";
import { Badge } from "@/shared/ui/badge";

export function OrganizationStatusBadge({ status }: { status: OrganizationStatus }) {
  const variant =
    status === "active" ? "success" : status === "trial" ? "warning" : "secondary";
  return <Badge variant={variant}>{organizationStatusLabel(status)}</Badge>;
}
