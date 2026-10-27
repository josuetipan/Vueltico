import { OrganizationEditBlock } from "@/features/organization-edit/ui/organization-edit-block";
import { RoleDashboardShell } from "@/widgets/role-dashboard-shell";
import { PageHeader } from "@/shared/ui/layout/page-header";
import { PageContent } from "@/shared/ui/layout/page-content";

export function OrganizationEditClient({ organizationId }: { organizationId: string }) {
  return (
    <RoleDashboardShell
      breadcrumbs={[
        { label: "Plataforma", href: "/app/superadmin" },
        { label: "Empresas", href: "/app/superadmin/empresas" },
        { label: "Editar" },
      ]}
    >
      <PageContent width="form" className="max-w-2xl">
        <PageHeader title="Editar empresa" description="Actualiza datos del tenant; límites vía plan_id." />
        <OrganizationEditBlock organizationId={organizationId} />
      </PageContent>
    </RoleDashboardShell>
  );
}
