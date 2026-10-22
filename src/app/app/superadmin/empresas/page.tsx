import { PageHeader } from "@/shared/presentation/components/layout/page-header";
import { RoleDashboardShell } from "@/shared/presentation/components/layout/role-dashboard-shell";
import { StatePanel } from "@/shared/presentation/components/feedback/state-panel";

export default function SuperadminCompaniesPlaceholderPage() {
  return (
    <RoleDashboardShell
      breadcrumbs={[
        { label: "Plataforma", href: "/app/superadmin" },
        { label: "Empresas" },
      ]}
    >
      <div className="mx-auto max-w-7xl space-y-8">
        <PageHeader
          title="Empresas"
          description="Listado multiempresa con filtros, búsqueda y acciones contextuales — pendiente de implementación en el siguiente prompt."
        />
        <StatePanel
          variant="empty"
          title="Módulo en preparación"
          description="La estructura de navegación y el layout ya están listos. Solicite la pantalla de empresas para conectar tablas y casos de uso mock."
        />
      </div>
    </RoleDashboardShell>
  );
}
