import type { PlatformAdminStatus } from "../model/platform-admin";
import { Badge } from "@/shared/ui/badge";

const LABELS: Record<PlatformAdminStatus, string> = {
  active: "Activo",
  invited: "Invitado",
  disabled: "Inactivo",
};

const VARIANTS: Record<
  PlatformAdminStatus,
  "success" | "warning" | "secondary"
> = {
  active: "success",
  invited: "warning",
  disabled: "secondary",
};

export function PlatformAdminStatusBadge({ status }: { status: PlatformAdminStatus }) {
  return <Badge variant={VARIANTS[status]}>{LABELS[status]}</Badge>;
}
