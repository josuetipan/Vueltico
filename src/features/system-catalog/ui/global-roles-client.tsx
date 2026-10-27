import { GlobalRolesBlock } from "./global-roles-block";
import { RoleDashboardShell } from "@/widgets/role-dashboard-shell";
import { PageContent } from "@/shared/ui/layout/page-content";
import { PageHeader } from "@/shared/ui/layout/page-header";

export function GlobalRolesClient() {
  return (
    <RoleDashboardShell
      breadcrumbs={[
        { label: "Plataforma", href: "/app/superadmin" },
        { label: "Sistema", href: "/app/superadmin/sistema/pantallas" },
        { label: "Roles globales" },
      ]}
    >
      <PageContent width="wide">
        <PageHeader
          title="Roles globales (plantillas maestro)"
          description="Plantillas por defecto para empresas: matriz módulo → pantalla → acción."
        />
        <GlobalRolesBlock />
      </PageContent>
    </RoleDashboardShell>
  );
}
