import { Link } from "react-router-dom";
import { StatePanel } from "@/shared/ui/feedback/state-panel";
import { Button } from "@/shared/ui/button";

export function OperatorAccessDenied() {
  return (
    <div className="space-y-4">
      <StatePanel
        variant="empty"
        title="Acceso denegado"
        description="No tiene permiso para esta pantalla. No puede ver planes, administración global ni datos de otras organizaciones."
      />
      <Button asChild className="mx-auto flex w-full max-w-xs">
        <Link to="/app/operativo">Volver a mi panel</Link>
      </Button>
    </div>
  );
}
