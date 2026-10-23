import { AppShell } from "@/widgets/app-shell";
import type { BreadcrumbItem } from "@/shared/ui/layout/breadcrumbs";

type RoleDashboardShellProps = {
  breadcrumbs: BreadcrumbItem[];
  children: React.ReactNode;
};

export function RoleDashboardShell({
  breadcrumbs,
  children,
}: RoleDashboardShellProps) {
  return <AppShell breadcrumbs={breadcrumbs}>{children}</AppShell>;
}
