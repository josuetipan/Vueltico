import { PrototypeFrame } from "@/shared/ui/prototype/prototype-frame";
import { PlannedScreensPanel } from "@/shared/ui/prototype/planned-screens-panel";
import { PageHeader } from "@/shared/ui/layout/page-header";
import { OPERATOR_PORTAL_PLANNED_SCREENS } from "../planned-screens";

export function OperatorPortalPrototypeHome() {
  return (
    <PrototypeFrame moduleLabel="operator-portal">
      <div className="space-y-8">
        <PageHeader
          title="Prototipo · Portal operativo"
          description="Carpeta src/prototypes/operator-portal — experiencia móvil-first del cajero."
        />
        <PlannedScreensPanel screens={OPERATOR_PORTAL_PLANNED_SCREENS} />
      </div>
    </PrototypeFrame>
  );
}
