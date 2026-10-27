import { ScreenActionsBlock } from "./screen-actions-block";
import { RoleDashboardShell } from "@/widgets/role-dashboard-shell";
import { PageContent } from "@/shared/ui/layout/page-content";
import { PageHeader } from "@/shared/ui/layout/page-header";

export function ScreenActionsClient() {
  return (
    <RoleDashboardShell
      breadcrumbs={[
        { label: "Plataforma", href: "/app/superadmin" },
        { label: "Sistema", href: "/app/superadmin/sistema/pantallas" },
        { label: "Acciones" },
      ]}
    >
      <PageContent width="wide">
        <PageHeader
          title="Acciones y permisos granulares"
          description="Defina botones, permission_key y endpoints API por pantalla."
        />
        <ScreenActionsBlock />
      </PageContent>
    </RoleDashboardShell>
  );
}
