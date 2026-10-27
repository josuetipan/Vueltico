import { RoleDashboardShell } from "@/widgets/role-dashboard-shell";
import { PageContent } from "@/shared/ui/layout/page-content";
import { SubscriptionsBlock } from "./subscriptions-block";

export function SubscriptionsClient() {
  return (
    <RoleDashboardShell
      breadcrumbs={[
        { label: "Plataforma", href: "/app/superadmin" },
        { label: "Suscripciones" },
      ]}
    >
      <PageContent>
        <SubscriptionsBlock />
      </PageContent>
    </RoleDashboardShell>
  );
}
