import { PrototypeFrame } from "@/shared/ui/prototype/prototype-frame";
import { PlannedScreensPanel } from "@/shared/ui/prototype/planned-screens-panel";
import { PageHeader } from "@/shared/ui/layout/page-header";
import { PLATFORM_ADMIN_PLANNED_SCREENS } from "../planned-screens";

export function PlatformAdminPrototypeHome() {
  return (
    <PrototypeFrame moduleLabel="platform-admin">
      <div className="space-y-8">
        <PageHeader
          title="Prototipo · Administración de plataforma"
          description="Carpeta src/prototypes/platform-admin — vista superadmin del SaaS."
        />
        <PlannedScreensPanel screens={PLATFORM_ADMIN_PLANNED_SCREENS} />
      </div>
    </PrototypeFrame>
  );
}
