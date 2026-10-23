import type { OperatorPermission } from "@/entities/operator/model/permissions";
import { hasPermission } from "@/entities/operator/model/permissions";
import { useOperatorContext } from "@/features/operator-portal/model/use-operator-context";
import { OperatorAccessDenied } from "./operator-access-denied";
import { StatePanel } from "@/shared/ui/feedback/state-panel";

export function OperatorPermissionGate({
  permission,
  children,
}: {
  permission: OperatorPermission;
  children: React.ReactNode;
}) {
  const { profile, isLoading, isError } = useOperatorContext();

  if (isLoading) {
    return <StatePanel variant="loading" title="Verificando permisos" />;
  }

  if (isError || !profile) {
    return (
      <StatePanel
        variant="error"
        title="No se pudo cargar su perfil operativo"
        description="Intente cerrar sesión e ingresar de nuevo."
      />
    );
  }

  if (!hasPermission(profile, permission)) {
    return <OperatorAccessDenied />;
  }

  return children;
}
