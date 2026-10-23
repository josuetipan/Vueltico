import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { GovernanceError, isValidPermissionCode } from "@/entities/platform-governance";
import { governanceUseCases } from "@/features/platform-governance/api/governance-composition";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { Badge } from "@/shared/ui/badge";
import { StatePanel } from "@/shared/ui/feedback/state-panel";
import { Skeleton } from "@/shared/ui/skeleton";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/shared/ui/alert-dialog";

export function PermissionsPanel() {
  const queryClient = useQueryClient();
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [moduleName, setModuleName] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const query = useQuery({
    queryKey: ["governance", "permissions"],
    queryFn: () => governanceUseCases.listPermissions(),
  });

  const createMutation = useMutation({
    mutationFn: governanceUseCases.createPermission,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["governance", "permissions"] });
      setCode("");
      setName("");
      setModuleName("");
      toast.success("Permiso creado.");
    },
    onError: (err: unknown) => {
      toast.error(mapError(err));
    },
  });

  const deleteMutation = useMutation({
    mutationFn: governanceUseCases.deletePermission,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["governance"] });
      setDeleteId(null);
      toast.success("Permiso eliminado.");
    },
    onError: (err: unknown) => {
      toast.error(mapError(err));
    },
  });

  function onCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!isValidPermissionCode(code)) {
      toast.error("Código inválido. Use formato modulo:accion (ej. billing:read).");
      return;
    }
    createMutation.mutate({ code, name, module: moduleName });
  }

  const grouped = groupByModule(query.data ?? []);

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
      <div className="space-y-4">
        {query.isLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </div>
        ) : null}

        {query.isError ? (
          <StatePanel variant="error" title="No se pudieron cargar los permisos." />
        ) : null}

        {query.data ? (
          <div className="space-y-6">
            {Object.entries(grouped).map(([module, items]) => (
              <div key={module}>
                <h3 className="mb-2 text-sm font-semibold text-foreground">{module}</h3>
                <div className="overflow-hidden rounded-lg border">
                  <table className="w-full text-sm">
                    <thead className="border-b bg-muted/40 text-left">
                      <tr>
                        <th className="px-4 py-2 font-semibold">Código</th>
                        <th className="px-4 py-2 font-semibold">Nombre</th>
                        <th className="w-12 px-2 py-2" aria-label="Acciones" />
                      </tr>
                    </thead>
                    <tbody>
                      {items.map((perm) => (
                        <tr key={perm.id} className="border-b last:border-0">
                          <td className="px-4 py-2 font-mono text-xs">{perm.code}</td>
                          <td className="px-4 py-2 font-normal">
                            {perm.name}
                            {perm.isSystem ? (
                              <Badge variant="outline" className="ml-2 font-normal">
                                Sistema
                              </Badge>
                            ) : null}
                          </td>
                          <td className="px-2 py-2 text-right">
                            {!perm.isSystem ? (
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                aria-label="Eliminar permiso"
                                onClick={() => setDeleteId(perm.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            ) : null}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </div>
        ) : null}
      </div>

      <form
        onSubmit={onCreate}
        className="h-fit space-y-4 rounded-lg border border-border p-4 xl:sticky xl:top-4"
      >
        <h3 className="flex items-center gap-2 text-sm font-semibold">
          <Plus className="h-4 w-4" aria-hidden />
          Nuevo permiso
        </h3>
        <div className="space-y-2">
          <Label htmlFor="perm-code">Código</Label>
          <Input
            id="perm-code"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="billing:read"
            className="font-mono text-sm"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="perm-name">Nombre</Label>
          <Input id="perm-name" value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="perm-module">Módulo</Label>
          <Input
            id="perm-module"
            value={moduleName}
            onChange={(e) => setModuleName(e.target.value)}
            placeholder="Facturación"
          />
        </div>
        <Button type="submit" className="w-full" disabled={createMutation.isPending}>
          Crear permiso
        </Button>
      </form>

      <AlertDialog open={deleteId !== null} onOpenChange={(o) => !o && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar permiso?</AlertDialogTitle>
            <AlertDialogDescription>
              No debe estar asignado a ningún rol.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteId && deleteMutation.mutate(deleteId)}
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function groupByModule(permissions: Awaited<ReturnType<typeof governanceUseCases.listPermissions>>) {
  return permissions.reduce<Record<string, typeof permissions>>((acc, perm) => {
    const key = perm.module || "General";
    acc[key] ??= [];
    acc[key].push(perm);
    return acc;
  }, {});
}

function mapError(err: unknown): string {
  if (err instanceof GovernanceError) {
    switch (err.code) {
      case "permission_code_exists":
        return "Ese código ya existe.";
      case "permission_in_use":
        return "El permiso está en uso en un rol.";
      case "system_locked":
        return "No se puede modificar un registro de sistema.";
      case "empty_fields":
        return "Complete los campos.";
      case "invalid_permission_code":
        return "Código de permiso inválido.";
      default:
        return "Operación no permitida.";
    }
  }
  return "Error inesperado.";
}
