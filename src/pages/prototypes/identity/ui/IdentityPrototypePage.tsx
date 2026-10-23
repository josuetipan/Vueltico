import { PrototypeFrame } from "@/shared/ui/prototype/prototype-frame";
import { PlannedScreensPanel } from "@/shared/ui/prototype/planned-screens-panel";
import { PageHeader } from "@/shared/ui/layout/page-header";
import { IDENTITY_PLANNED_SCREENS } from "../planned-screens";

export function IdentityPrototypeHome() {
  return (
    <PrototypeFrame moduleLabel="identity">
      <div className="space-y-8">
        <PageHeader
          title="Prototipo · Identidad y acceso"
          description="Carpeta src/prototypes/identity — autenticación mock y perfiles de demostración."
        />
        <PlannedScreensPanel screens={IDENTITY_PLANNED_SCREENS} />
      </div>
    </PrototypeFrame>
  );
}
