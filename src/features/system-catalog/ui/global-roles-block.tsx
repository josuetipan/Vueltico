import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Pencil, Trash2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { type GlobalRoleTemplate } from "@/entities/system-catalog";
import { systemCatalogUseCases } from "@/features/system-catalog/api/system-catalog-composition";
import { RolePermissionMatrix } from "@/features/system-catalog/ui/role-permission-matrix";
import { SystemCatalogSubnav } from "@/features/system-catalog/ui/system-catalog-subnav";
import { Button } from "@/shared/ui/button";
import { Badge } from "@/shared/ui/badge";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { StatePanel } from "@/shared/ui/feedback/state-panel";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
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

type RoleDraft = {
  code: string;
  name: string;
  description: string;
  permissionKeys: Set<string>;
};

const emptyRole = (): RoleDraft => ({
  code: "",
  name: "",
  description: "",
  permissionKeys: new Set(),
});

export function GlobalRolesBlock() {
  const queryClient = useQueryClient();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState<RoleDraft>(emptyRole);
  const [showForm, setShowForm] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const rolesQuery = useQuery({
    queryKey: ["system-catalog", "global-roles"],
    queryFn: () => systemCatalogUseCases.listGlobalRoles(),
  });

  const treeQuery = useQuery({
    queryKey: ["system-catalog", "permission-tree"],
    queryFn: () => systemCatalogUseCases.getPermissionTree(),
  });

  const tree = useMemo(() => treeQuery.data ?? [], [treeQuery.data]);

  useEffect(() => {
    if (!showForm || editingId) return;
    setDraft(emptyRole());
  }, [showForm, editingId]);

  const saveMutation = useMutation({
    mutationFn: () => {
      const payload = {
        code: draft.code,
        name: draft.name,
        description: draft.description,
        permissionKeys: [...draft.permissionKeys],
      };
      if (editingId) return systemCatalogUseCases.updateGlobalRole(editingId, payload);
      return systemCatalogUseCases.createGlobalRole(payload);
    },
    onSuccess: () => {
      toast.success(editingId ? "Rol actualizado" : "Rol creado");
      setShowForm(false);
      setEditingId(null);
      void queryClient.invalidateQueries({ queryKey: ["system-catalog"] });
    },
    onError: () => toast.error("Código ROLE_* inválido o duplicado."),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => systemCatalogUseCases.deleteGlobalRole(id),
    onSuccess: () => {
      toast.success("Rol eliminado");
      setDeleteId(null);
      void queryClient.invalidateQueries({ queryKey: ["system-catalog"] });
    },
    onError: () => toast.error("No se puede eliminar un rol de sistema."),
  });

  function startEdit(role: GlobalRoleTemplate) {
    setEditingId(role.id);
    setDraft({
      code: role.code,
      name: role.name,
      description: role.description,
      permissionKeys: new Set(role.permissionKeys),
    });
    setShowForm(true);
  }

  function toggleKey(key: string, checked: boolean) {
    setDraft((prev) => {
      const next = new Set(prev.permissionKeys);
      if (checked) next.add(key);
      else next.delete(key);
      return { ...prev, permissionKeys: next };
    });
  }

  function toggleScreen(keys: string[], checked: boolean) {
    setDraft((prev) => {
      const next = new Set(prev.permissionKeys);
      for (const k of keys) {
        if (checked) next.add(k);
        else next.delete(k);
      }
      return { ...prev, permissionKeys: next };
    });
  }

  return (
    <div className="space-y-6">
      <SystemCatalogSubnav />

      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_min(100%,360px)]">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-base">Roles globales (plantillas)</CardTitle>
            <Button
              type="button"
              size="sm"
              onClick={() => {
                setEditingId(null);
                setDraft(emptyRole());
                setShowForm(true);
              }}
            >
              Nuevo rol
            </Button>
          </CardHeader>
          <CardContent className="space-y-2">
            {rolesQuery.isLoading ? (
              <StatePanel variant="loading" title="Cargando roles…" className="border-0" />
            ) : (
              (rolesQuery.data ?? []).map((role) => (
                <div
                  key={role.id}
                  className="flex flex-wrap items-start justify-between gap-2 rounded-lg border border-border p-3"
                >
                  <div>
                    <p className="font-medium">{role.name}</p>
                    <p className="font-mono text-xs text-muted-foreground">{role.code}</p>
                    <p className="mt-1 text-xs text-muted-foreground">{role.description}</p>
                    <p className="mt-2 text-xs">{role.permissionKeys.length} permisos</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {role.isSystem ? <Badge variant="secondary">Sistema</Badge> : null}
                    <Button type="button" variant="outline" size="sm" onClick={() => startEdit(role)}>
                      <Pencil className="h-3.5 w-3.5" aria-hidden />
                    </Button>
                    {!role.isSystem ? (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="text-destructive"
                        onClick={() => setDeleteId(role.id)}
                      >
                        <Trash2 className="h-3.5 w-3.5" aria-hidden />
                      </Button>
                    ) : null}
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {showForm ? (
          <Card className="lg:sticky lg:top-4">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">
                {editingId ? "Editar rol global" : "Crear rol global"}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <Label>Nombre del rol</Label>
                <Input
                  value={draft.name}
                  onChange={(e) => setDraft((p) => ({ ...p, name: e.target.value }))}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Código técnico (ROLE_…)</Label>
                <Input
                  value={draft.code}
                  onChange={(e) => setDraft((p) => ({ ...p, code: e.target.value.toUpperCase() }))}
                  placeholder="ROLE_ACCOUNTANT"
                />
              </div>
              <div className="space-y-1.5">
                <Label>Descripción</Label>
                <Input
                  value={draft.description}
                  onChange={(e) => setDraft((p) => ({ ...p, description: e.target.value }))}
                />
              </div>

              {treeQuery.isLoading ? (
                <StatePanel variant="loading" title="Cargando matriz…" className="border-0" />
              ) : (
                <RolePermissionMatrix
                  tree={tree}
                  selectedKeys={draft.permissionKeys}
                  onToggle={toggleKey}
                  onToggleScreen={toggleScreen}
                />
              )}

              <div className="flex flex-wrap gap-2">
                <Button type="button" onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending}>
                  Guardar rol
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowForm(false);
                    setEditingId(null);
                  }}
                >
                  Cancelar
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="border-dashed">
            <CardContent className="py-10 text-center text-sm text-muted-foreground">
              Seleccione un rol para editar o cree uno nuevo para configurar la matriz de permisos.
            </CardContent>
          </Card>
        )}
      </div>

      <AlertDialog open={deleteId !== null} onOpenChange={(o) => !o && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar rol?</AlertDialogTitle>
            <AlertDialogDescription>Solo roles personalizados pueden eliminarse.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={() => deleteId && deleteMutation.mutate(deleteId)}>
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
