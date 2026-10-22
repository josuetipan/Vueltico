import { AppShell } from "./app-shell";
import type { BreadcrumbItem } from "./breadcrumbs";

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
