import { Link } from "react-router-dom";
import { Plus } from "lucide-react";
import { OrganizationListBlock } from "@/features/organization-list/ui/organization-list-block";
import { RoleDashboardShell } from "@/widgets/role-dashboard-shell";
import { PageHeader } from "@/shared/ui/layout/page-header";
import { PageContent } from "@/shared/ui/layout/page-content";
import { PageHeaderAction } from "@/shared/ui/layout/page-header-action";

export function OrganizationsListClient() {
  return (
    <RoleDashboardShell
      breadcrumbs={[
        { label: "Plataforma", href: "/app/superadmin" },
        { label: "Empresas" },
      ]}
    >
      <PageContent>
        <PageHeader
          title="Organizaciones"
          description="Datos de empresa, plan y usuarios en tablas relacionales."
          actions={
            <PageHeaderAction asChild>
              <Link to="/app/superadmin/empresas/nueva">
                <Plus className="h-4 w-4" aria-hidden />
                Nueva organización
              </Link>
            </PageHeaderAction>
          }
        />
        <OrganizationListBlock />
      </PageContent>
    </RoleDashboardShell>
  );
}
