import { PrototypeFrame } from "@/shared/ui/prototype/prototype-frame";
import { PlannedScreensPanel } from "@/shared/ui/prototype/planned-screens-panel";
import { PageHeader } from "@/shared/ui/layout/page-header";
import { PLATFORM_ADMIN_PLANNED_SCREENS } from "../planned-screens";
import {
  BrandParametrizationWorkspace,
  GovernancePageSection,
  PlatformAdminsPageSection,
} from "@/widgets/prototype-modules";
import { PrototypeShowcaseLayout } from "@/widgets/prototype-showcase";

export function PlatformAdminPrototypeHome() {
  return (
    <PrototypeFrame moduleLabel="platform-admin">
      <div className="space-y-8">
        <PageHeader
          title="Prototipo · Administración de plataforma"
          description="Pestañas alineadas con las rutas de superadmin; tablas y workspaces compartidos."
        />

        <PrototypeShowcaseLayout
          ariaLabel="Secciones administración de plataforma"
          defaultTabId="gobernanza"
          tabs={[
            {
              id: "planificadas",
              label: "Pantallas",
              description: "Roadmap del módulo.",
              content: <PlannedScreensPanel screens={PLATFORM_ADMIN_PLANNED_SCREENS} />,
            },
            {
              id: "gobernanza",
              label: "Gobernanza",
              description: "Roles y permisos en layout tabla + panel lateral.",
              content: <GovernancePageSection />,
            },
            {
              id: "administradores",
              label: "Admins. plataforma",
              description: "Staff Vueltico con roles de gobernanza.",
              content: <PlatformAdminsPageSection />,
            },
            {
              id: "marca",
              label: "Marca",
              description: "Colores, menú y branding de login.",
              content: <BrandParametrizationWorkspace />,
            },
          ]}
        />
      </div>
    </PrototypeFrame>
  );
}
