import { PrototypeFrame } from "@/shared/ui/prototype/prototype-frame";
import { PlannedScreensPanel } from "@/shared/ui/prototype/planned-screens-panel";
import { PageHeader } from "@/shared/ui/layout/page-header";
import { COMMERCIAL_REPORTS_PLANNED_SCREENS } from "../planned-screens";

export function CommercialReportsPrototypeHome() {
  return (
    <PrototypeFrame moduleLabel="commercial-reports">
      <div className="space-y-8">
        <PageHeader
          title="Prototipo · Reportes comerciales"
          description="Carpeta src/prototypes/commercial-reports — analítica para admin de empresa."
        />
        <PlannedScreensPanel screens={COMMERCIAL_REPORTS_PLANNED_SCREENS} />
      </div>
    </PrototypeFrame>
  );
}
