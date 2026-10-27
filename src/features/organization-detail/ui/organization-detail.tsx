import { OrganizationDetailBlock } from "@/features/organization-detail/ui/organization-detail-block";
import { RoleDashboardShell } from "@/widgets/role-dashboard-shell";
import { PageContent } from "@/shared/ui/layout/page-content";

export function OrganizationDetailClient({ organizationId }: { organizationId: string }) {
  return (
    <RoleDashboardShell
      breadcrumbs={[
        { label: "Plataforma", href: "/app/superadmin" },
        { label: "Empresas", href: "/app/superadmin/empresas" },
        { label: "Detalle" },
      ]}
    >
      <PageContent width="detail">
        <OrganizationDetailBlock organizationId={organizationId} />
      </PageContent>
    </RoleDashboardShell>
  );
}
