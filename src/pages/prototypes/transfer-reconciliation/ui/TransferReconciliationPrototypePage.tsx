import { PrototypeFrame } from "@/shared/ui/prototype/prototype-frame";
import { PlannedScreensPanel } from "@/shared/ui/prototype/planned-screens-panel";
import { PageHeader } from "@/shared/ui/layout/page-header";
import { TRANSFER_RECONCILIATION_PLANNED_SCREENS } from "../planned-screens";

export function TransferReconciliationPrototypeHome() {
  return (
    <PrototypeFrame moduleLabel="transfer-reconciliation">
      <div className="space-y-8">
        <PageHeader
          title="Prototipo · Conciliación de transferencias"
          description="Carpeta src/prototypes/transfer-reconciliation — verificación manual de pagos."
        />
        <PlannedScreensPanel screens={TRANSFER_RECONCILIATION_PLANNED_SCREENS} />
      </div>
    </PrototypeFrame>
  );
}
