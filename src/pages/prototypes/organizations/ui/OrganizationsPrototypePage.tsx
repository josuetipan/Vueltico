import { PrototypeFrame } from "@/shared/ui/prototype/prototype-frame";
import { PlannedScreensPanel } from "@/shared/ui/prototype/planned-screens-panel";
import { PageHeader } from "@/shared/ui/layout/page-header";
import { ORGANIZATIONS_PLANNED_SCREENS } from "../planned-screens";

export function OrganizationsPrototypeHome() {
  return (
    <PrototypeFrame moduleLabel="organizations">
      <div className="space-y-8">
        <PageHeader
          title="Prototipo · Organizaciones"
          description="Carpeta src/prototypes/organizations — ciclo de vida de tenants B2B."
        />
        <PlannedScreensPanel screens={ORGANIZATIONS_PLANNED_SCREENS} />
      </div>
    </PrototypeFrame>
  );
}
