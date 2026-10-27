import { GovernancePageSection } from "@/features/platform-governance/ui/governance-page-section";
import { RoleDashboardShell } from "@/widgets/role-dashboard-shell";
import { PageContent } from "@/shared/ui/layout/page-content";

export function GovernanceClient() {
  return (
    <RoleDashboardShell
      breadcrumbs={[
        { label: "Plataforma", href: "/app/superadmin" },
        { label: "Gobernanza" },
      ]}
    >
      <PageContent>
        <GovernancePageSection />
      </PageContent>
    </RoleDashboardShell>
  );
}
