import { CompanyAdminsPageSection } from "@/features/company-admins/ui/company-admins-page-section";
import { RoleDashboardShell } from "@/widgets/role-dashboard-shell";
import { PageContent } from "@/shared/ui/layout/page-content";

export function CompanyAdminsClient() {
  return (
    <RoleDashboardShell
      breadcrumbs={[
        { label: "Plataforma", href: "/app/superadmin" },
        { label: "Admins. empresas" },
      ]}
    >
      <PageContent>
        <CompanyAdminsPageSection />
      </PageContent>
    </RoleDashboardShell>
  );
}
