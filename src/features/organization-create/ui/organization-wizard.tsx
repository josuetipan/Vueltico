import { OrganizationWizardBlock } from "@/features/organization-create/ui/organization-wizard-block";
import { RoleDashboardShell } from "@/widgets/role-dashboard-shell";
import { PageHeader } from "@/shared/ui/layout/page-header";
import { PageContent } from "@/shared/ui/layout/page-content";

export function OrganizationWizardClient() {
  return (
    <RoleDashboardShell
      breadcrumbs={[
        { label: "Plataforma", href: "/app/superadmin" },
        { label: "Empresas", href: "/app/superadmin/empresas" },
        { label: "Nueva" },
      ]}
    >
      <PageContent width="form">
        <PageHeader
          title="Registrar organización"
          description="Alta de tenant: empresa + plan_id. Límites heredados del plan; usuarios en company_users."
        />
        <OrganizationWizardBlock />
      </PageContent>
    </RoleDashboardShell>
  );
}
