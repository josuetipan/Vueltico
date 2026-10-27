import { PrototypeFrame } from "@/shared/ui/prototype/prototype-frame";
import { PlannedScreensPanel } from "@/shared/ui/prototype/planned-screens-panel";
import { PageHeader } from "@/shared/ui/layout/page-header";
import { ORGANIZATIONS_PLANNED_SCREENS } from "../planned-screens";
import {
  OrganizationListBlock,
  OrganizationTenantModelOverview,
  OrganizationWizardBlock,
} from "@/widgets/prototype-modules";
import { PrototypeShowcaseLayout } from "@/widgets/prototype-showcase";

export function OrganizationsPrototypeHome() {
  return (
    <PrototypeFrame moduleLabel="organizations">
      <div className="space-y-8">
        <PageHeader
          title="Prototipo · Empresa (tenant)"
          description="Un bloque por pestaña; mismos componentes que /app/superadmin/empresas."
        />

        <PrototypeShowcaseLayout
          ariaLabel="Secciones del módulo empresas"
          defaultTabId="listado"
          tabs={[
            {
              id: "modelo",
              label: "Modelo",
              description: "Esquema relacional companies · plans · company_users.",
              content: <OrganizationTenantModelOverview />,
            },
            {
              id: "planificadas",
              label: "Pantallas",
              description: "Roadmap de pantallas del dominio.",
              content: <PlannedScreensPanel screens={ORGANIZATIONS_PLANNED_SCREENS} />,
            },
            {
              id: "listado",
              label: "Listado",
              description: "OrganizationListBlock — tabla con filtros y paginación.",
              content: (
                <OrganizationListBlock detailPath={(id) => `/app/superadmin/empresas/${id}`} />
              ),
            },
            {
              id: "nueva-empresa",
              label: "Nueva empresa",
              description: "OrganizationWizardBlock — asistente de registro.",
              content: (
                <OrganizationWizardBlock cancelPath="/prototipos/organizations" />
              ),
            },
          ]}
        />
      </div>
    </PrototypeFrame>
  );
}
