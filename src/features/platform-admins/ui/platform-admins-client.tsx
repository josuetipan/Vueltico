import { PlatformAdminsPageSection } from "@/features/platform-admins/ui/platform-admins-page-section";
import { RoleDashboardShell } from "@/widgets/role-dashboard-shell";
import { PageContent } from "@/shared/ui/layout/page-content";

export function PlatformAdminsClient() {
  return (
    <RoleDashboardShell
      breadcrumbs={[
        { label: "Plataforma", href: "/app/superadmin" },
        { label: "Administradores" },
      ]}
    >
      <PageContent>
        <PlatformAdminsPageSection />
      </PageContent>
    </RoleDashboardShell>
  );
}
