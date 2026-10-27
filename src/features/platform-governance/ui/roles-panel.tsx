import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { GovernanceError, isValidRoleCode, type PlatformRole } from "@/entities/platform-governance";
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
import { cn } from "@/shared/lib/utils";
import {
  DataTableShell,
  dataTableHeadClass,
  dataTableTdClass,
  dataTableThClass,
} from "@/shared/ui/data/data-table-shell";
import { DataTableToolbar } from "@/shared/ui/data/data-table-toolbar";
import { DataTableCard } from "@/shared/ui/data/data-table-card";
import { SelectField } from "@/shared/ui/select-field";

type RoleFormState = {
  code: string;
  name: string;
  description: string;
  permissionIds: string[];
};

const emptyForm = (): RoleFormState => ({
  code: "",
  name: "",
  description: "",
  permissionIds: [],
});

type RolesPanelProps = {
  showCreateForm: boolean;
  onShowCreateFormChange: (open: boolean) => void;
};

export function RolesPanel({ showCreateForm, onShowCreateFormChange }: RolesPanelProps) {
  const queryClient = useQueryClient();
  const [form, setForm] = useState<RoleFormState>(emptyForm());
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [kind, setKind] = useState<"all" | "system" | "custom">("all");

  const permissionsQuery = useQuery({
    queryKey: ["governance", "permissions"],
    queryFn: () => governanceUseCases.listPermissions(),
  });

  const rolesQuery = useQuery({
    queryKey: ["governance", "roles"],
    queryFn: () => governanceUseCases.listRoles(),
  });

  const permissionsByModule = useMemo(() => {
    const list = permissionsQuery.data ?? [];
    return list.reduce<Record<string, typeof list>>((acc, p) => {
      const bucket = acc[p.module] ?? [];
      bucket.push(p);
      acc[p.module] = bucket;
      return acc;
    }, {});
  }, [permissionsQuery.data]);

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (editingId) {
        return governanceUseCases.updateRole(editingId, {
          name: form.name,
          description: form.description,
          permissionIds: form.permissionIds,
        });
      }
      return governanceUseCases.createRole(form);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["governance", "roles"] });
      setForm(emptyForm());
      setEditingId(null);
      onShowCreateFormChange(false);
      toast.success(editingId ? "Rol actualizado." : "Rol creado.");
    },
    onError: (err: unknown) => toast.error(mapRoleError(err)),
  });

  const deleteMutation = useMutation({
    mutationFn: governanceUseCases.deleteRole,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["governance"] });
      setDeleteId(null);
      toast.success("Rol eliminado.");
    },
    onError: (err: unknown) => toast.error(mapRoleError(err)),
  });

  function startEdit(role: PlatformRole) {
    onShowCreateFormChange(false);
    setEditingId(role.id);
    setForm({
      code: role.code,
      name: role.name,
      description: role.description,
      permissionIds: [...role.permissionIds],
    });
  }

  function togglePermission(id: string) {
    setForm((prev) => ({
      ...prev,
      permissionIds: prev.permissionIds.includes(id)
        ? prev.permissionIds.filter((x) => x !== id)
        : [...prev.permissionIds, id],
    }));
  }

  const filteredRoles = useMemo(() => {
    const list = rolesQuery.data ?? [];
    const q = search.trim().toLowerCase();
    return list.filter((role) => {
      if (kind === "system" && !role.isSystem) return false;
      if (kind === "custom" && role.isSystem) return false;
      if (!q) return true;
      return (
        role.name.toLowerCase().includes(q) ||
        role.code.toLowerCase().includes(q) ||
        role.description.toLowerCase().includes(q)
      );
    });
  }, [rolesQuery.data, search, kind]);

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!editingId && !isValidRoleCode(form.code)) {
      toast.error("Código de rol inválido (solo minúsculas y _).");
      return;
    }
    saveMutation.mutate();
  }

  useEffect(() => {
    if (!showCreateForm) return;
    setEditingId(null);
    setForm(emptyForm());
  }, [showCreateForm]);

  const sidePanelOpen = showCreateForm || Boolean(editingId);

  return (
    <div className="space-y-4">
    <div
      className={cn(
        "grid gap-6",
        sidePanelOpen && "xl:grid-cols-[minmax(0,1fr)_360px]",
      )}
    >
      <div className="space-y-4">
        {rolesQuery.isLoading ? (
          <Skeleton className="h-40 w-full" />
        ) : null}
        {rolesQuery.isError ? (
          <StatePanel variant="error" title="No se pudieron cargar los roles." />
        ) : null}
        {rolesQuery.data ? (
          <DataTableCard
            toolbar={
              <DataTableToolbar
                searchPlaceholder="Nombre o código…"
                searchValue={search}
                onSearchChange={setSearch}
                filters={
                  <SelectField
                    id="filter-role-kind"
                    variant="toolbar"
                    label="Tipo"
                    value={kind}
                    onChange={(v) => setKind(v as typeof kind)}
                    options={[
                      { value: "all", label: "Todos" },
                      { value: "system", label: "Sistema" },
                      { value: "custom", label: "Personalizado" },
                    ]}
                  />
                }
              />
            }
          >
            {filteredRoles.length === 0 ? (
              <StatePanel variant="empty" title="Sin resultados" description="Ajuste búsqueda o filtros." />
            ) : (
          <DataTableShell className="rounded-none border-0">
              <thead className={dataTableHeadClass}>
                <tr>
                  <th className={dataTableThClass}>Rol</th>
                  <th className={dataTableThClass}>Permisos</th>
                  <th className={`${dataTableThClass} w-24`} aria-label="Acciones" />
                </tr>
              </thead>
              <tbody>
                {filteredRoles.map((role) => (
                  <tr key={role.id} className="border-b last:border-0">
                    <td className={dataTableTdClass}>
                      <div className="font-semibold">{role.name}</div>
                      <div className="font-mono text-xs font-normal text-foreground/70">
                        {role.code}
                      </div>
                      {role.isSystem ? (
                        <Badge variant="outline" className="mt-1 font-normal">
                          Sistema
                        </Badge>
                      ) : null}
                    </td>
                    <td className={dataTableTdClass}>
                      <PermissionCount role={role} permissions={permissionsQuery.data ?? []} />
                    </td>
                    <td className={`${dataTableTdClass} text-right`}>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        aria-label="Editar rol"
                        onClick={() => startEdit(role)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      {!role.isSystem ? (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          aria-label="Eliminar rol"
                          onClick={() => setDeleteId(role.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      ) : null}
                    </td>
                  </tr>
                ))}
              </tbody>
          </DataTableShell>
            )}
          </DataTableCard>
        ) : null}
      </div>

      {sidePanelOpen ? (
      <form
        onSubmit={onSubmit}
        className="h-fit space-y-4 rounded-lg border border-border p-4 xl:sticky xl:top-4"
      >
        <h3 className="flex items-center gap-2 text-sm font-semibold">
          {editingId ? (
            <>
              <Pencil className="h-4 w-4" aria-hidden />
              Editar rol
            </>
          ) : (
            <>
              <Plus className="h-4 w-4" aria-hidden />
              Nuevo rol
            </>
          )}
        </h3>

        {!editingId ? (
          <div className="space-y-2">
            <Label htmlFor="role-code">Código</Label>
            <Input
              id="role-code"
              value={form.code}
              onChange={(e) => setForm((f) => ({ ...f, code: e.target.value }))}
              className="font-mono text-sm"
              placeholder="finance_ops"
            />
          </div>
        ) : null}

        <div className="space-y-2">
          <Label htmlFor="role-name">Nombre</Label>
          <Input
            id="role-name"
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="role-desc">Descripción</Label>
          <Input
            id="role-desc"
            value={form.description}
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
          />
        </div>

        <div className="space-y-2">
          <Label>Permisos del rol</Label>
          <div className="max-h-64 space-y-3 overflow-y-auto rounded-md border p-3">
            {Object.entries(permissionsByModule).map(([module, perms]) => (
              <div key={module}>
                <p className="mb-1 text-xs font-semibold">{module}</p>
                <ul className="space-y-1">
                  {perms.map((p) => (
                    <li key={p.id}>
                      <label className="flex cursor-pointer items-start gap-2 text-sm font-normal">
                        <input
                          type="checkbox"
                          checked={form.permissionIds.includes(p.id)}
                          onChange={() => togglePermission(p.id)}
                          className="mt-0.5 h-4 w-4 rounded border-input"
                        />
                        <span>
                          {p.name}
                          <span className="block font-mono text-[10px] text-foreground/60">
                            {p.code}
                          </span>
                        </span>
                      </label>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button type="submit" disabled={saveMutation.isPending}>
            {editingId ? "Guardar rol" : "Crear rol"}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              setEditingId(null);
              onShowCreateFormChange(false);
              setForm(emptyForm());
            }}
          >
            Cancelar
          </Button>
        </div>
      </form>
      ) : null}
    </div>

      <AlertDialog open={deleteId !== null} onOpenChange={(o) => !o && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar rol?</AlertDialogTitle>
            <AlertDialogDescription>
              Ningún administrador debe tener este rol asignado.
            </AlertDialogDescription>
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

function PermissionCount({
  role,
  permissions,
}: {
  role: PlatformRole;
  permissions: Awaited<ReturnType<typeof governanceUseCases.listPermissions>>;
}) {
  const count = role.permissionIds.length;
  const labels = permissions
    .filter((p) => role.permissionIds.includes(p.id))
    .slice(0, 3)
    .map((p) => p.name);
  return (
    <div className="space-y-1">
      <span className={cn("text-sm font-normal")}>{count} permiso(s)</span>
      {labels.length > 0 ? (
        <p className="text-xs font-normal text-foreground/70">{labels.join(" · ")}</p>
      ) : null}
    </div>
  );
}

function mapRoleError(err: unknown): string {
  if (err instanceof GovernanceError) {
    switch (err.code) {
      case "role_code_exists":
        return "Ese código de rol ya existe.";
      case "role_in_use":
        return "Hay administradores con este rol.";
      case "system_locked":
        return "No se puede eliminar un rol de sistema.";
      case "empty_fields":
        return "Complete los campos.";
      case "invalid_role_code":
        return "Código de rol inválido.";
      default:
        return "Operación no permitida.";
    }
  }
  return "Error inesperado.";
}
