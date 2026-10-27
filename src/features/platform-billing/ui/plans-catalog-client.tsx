import { RoleDashboardShell } from "@/widgets/role-dashboard-shell";
import { PageContent } from "@/shared/ui/layout/page-content";
import { PlansCatalogBlock } from "./plans-catalog-block";

export function PlansCatalogClient() {
  return (
    <RoleDashboardShell
      breadcrumbs={[
        { label: "Plataforma", href: "/app/superadmin" },
        { label: "Planes" },
      ]}
    >
      <PageContent>
        <PlansCatalogBlock />
      </PageContent>
    </RoleDashboardShell>
  );
}
