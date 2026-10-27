import type { CompanyUserStatus } from "../model/company-user";
import { Badge } from "@/shared/ui/badge";

const LABELS: Record<CompanyUserStatus, string> = {
  active: "Activo",
  invited: "Invitado",
  disabled: "Inactivo",
};

const VARIANTS: Record<CompanyUserStatus, "success" | "warning" | "secondary"> = {
  active: "success",
  invited: "warning",
  disabled: "secondary",
};

export function CompanyUserStatusBadge({ status }: { status: CompanyUserStatus }) {
  return <Badge variant={VARIANTS[status]}>{LABELS[status]}</Badge>;
}
