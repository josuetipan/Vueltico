import { ScreensCatalogBlock } from "./screens-catalog-block";
import { RoleDashboardShell } from "@/widgets/role-dashboard-shell";
import { PageContent } from "@/shared/ui/layout/page-content";
import { PageHeader } from "@/shared/ui/layout/page-header";

export function ScreensCatalogClient() {
  return (
    <RoleDashboardShell
      breadcrumbs={[
        { label: "Plataforma", href: "/app/superadmin" },
        { label: "Sistema", href: "/app/superadmin/sistema/pantallas" },
        { label: "Pantallas" },
      ]}
    >
      <PageContent width="wide">
        <PageHeader
          title="Catálogo de pantallas y módulos"
          description="Registre cada vista del producto con screen_key y ruta para control de acceso."
        />
        <ScreensCatalogBlock />
      </PageContent>
    </RoleDashboardShell>
  );
}
