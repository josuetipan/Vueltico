import { RoleDashboardShell } from "@/widgets/role-dashboard-shell";
import { PageContent } from "@/shared/ui/layout/page-content";
import { InvoicesBlock } from "./invoices-block";

export function InvoicesClient() {
  return (
    <RoleDashboardShell
      breadcrumbs={[
        { label: "Plataforma", href: "/app/superadmin" },
        { label: "Facturas" },
      ]}
    >
      <PageContent>
        <InvoicesBlock />
      </PageContent>
    </RoleDashboardShell>
  );
}
