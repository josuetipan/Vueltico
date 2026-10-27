import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Pencil } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import {
  GovernanceError,
  PLATFORM_ADMIN_STATUSES,
  adminInitials,
  type PlatformAdminStatus,
  type PlatformRole,
} from "@/entities/platform-governance";
import { getPlanById } from "@/entities/plan";
import { governanceUseCases } from "@/features/platform-governance/api/governance-composition";
import {
  AdminRegistrationFields,
  adminToDraft,
  emptyAdminDraft,
  type AdminRegistrationDraft,
} from "@/features/platform-admins/ui/admin-registration-fields";
import { Button } from "@/shared/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { Avatar, AvatarFallback } from "@/shared/ui/avatar";
import { Badge } from "@/shared/ui/badge";
import { StatePanel } from "@/shared/ui/feedback/state-panel";
import { Skeleton } from "@/shared/ui/skeleton";
import { formatDateEc, formatDateTimeEc } from "@/shared/lib/format";
import { cn } from "@/shared/lib/utils";
import {
  DataTableShell,
  dataTableHeadClass,
  dataTableTdClass,
  dataTableThClass,
} from "@/shared/ui/data/data-table-shell";
import { paginateSlice, TABLE_PAGE_SIZE } from "@/shared/lib/table-pagination";
import { TablePagination } from "@/shared/ui/data/table-pagination";
import { DataTableToolbar } from "@/shared/ui/data/data-table-toolbar";
import { SelectField } from "@/shared/ui/select-field";

export type PlatformAdminsBlockProps = {
  showCreateForm: boolean;
  onShowCreateFormChange: (open: boolean) => void;
};

export function PlatformAdminsBlock({
  showCreateForm: showForm,
  onShowCreateFormChange: setShowForm,
}: PlatformAdminsBlockProps) {
  const queryClient = useQueryClient();
  const [createDraft, setCreateDraft] = useState<AdminRegistrationDraft>(() => emptyAdminDraft());
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState<AdminRegistrationDraft>(() => emptyAdminDraft());
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<PlatformAdminStatus | "all">("all");
  const [roleId, setRoleId] = useState<string | "all">("all");
  const [statusUpdatingId, setStatusUpdatingId] = useState<string | null>(null);

  const adminsQuery = useQuery({
    queryKey: ["governance", "admins"],
    queryFn: () => governanceUseCases.listPlatformAdmins(),
  });

  const rolesQuery = useQuery({
    queryKey: ["governance", "roles"],
    queryFn: () => governanceUseCases.listRoles(),
  });

  const permissionsQuery = useQuery({
    queryKey: ["governance", "permissions"],
    queryFn: () => governanceUseCases.listPermissions(),
  });

  const rolesById = useMemo(() => {
    const map = new Map<string, PlatformRole>();
    for (const r of rolesQuery.data ?? []) map.set(r.id, r);
    return map;
  }, [rolesQuery.data]);

  const selectedRole = createDraft.roleId ? rolesById.get(createDraft.roleId) : undefined;
  const selectedPermissions = useMemo(() => {
    if (!selectedRole) return [];
    const permMap = new Map((permissionsQuery.data ?? []).map((p) => [p.id, p]));
    return selectedRole.permissionIds
      .map((id) => permMap.get(id))
      .filter((p) => p !== undefined);
  }, [selectedRole, permissionsQuery.data]);

  const createMutation = useMutation({
    mutationFn: governanceUseCases.createPlatformAdmin,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["governance", "admins"] });
      setCreateDraft(emptyAdminDraft());
      setShowForm(false);
      toast.success("Administrador registrado.");
    },
    onError: (err: unknown) => toast.error(mapAdminError(err)),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, draft }: { id: string; draft: AdminRegistrationDraft }) =>
      governanceUseCases.updatePlatformAdmin(id, draft),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["governance", "admins"] });
      setEditingId(null);
      toast.success("Registro actualizado.");
    },
    onError: (err: unknown) => toast.error(mapAdminError(err)),
  });

  const inlineStatusMutation = useMutation({
    mutationFn: ({
      admin,
      status,
    }: {
      admin: NonNullable<typeof adminsQuery.data>[number];
      status: PlatformAdminStatus;
    }) => governanceUseCases.updatePlatformAdmin(admin.id, { ...adminToDraft(admin), status }),
    onMutate: ({ admin }) => setStatusUpdatingId(admin.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["governance", "admins"] });
      toast.success("Estado actualizado.");
    },
    onError: (err: unknown) => toast.error(mapAdminError(err)),
    onSettled: () => setStatusUpdatingId(null),
  });

  function onCreate(e: React.FormEvent) {
    e.preventDefault();
    createMutation.mutate(createDraft);
  }

  function startEdit(admin: NonNullable<typeof adminsQuery.data>[number]) {
    setShowForm(false);
    setEditingId(admin.id);
    setEditDraft(adminToDraft(admin));
  }

  useEffect(() => {
    if (showForm) setEditingId(null);
  }, [showForm]);

  const sidePanelOpen = showForm || Boolean(editingId);

  const roleFilterOptions = useMemo(
    () =>
      (rolesQuery.data ?? []).map((r) => ({
        value: r.id,
        label: r.name,
      })),
    [rolesQuery.data],
  );

  const filteredAdmins = useMemo(() => {
    const list = adminsQuery.data ?? [];
    const q = search.trim().toLowerCase();
    return list.filter((admin) => {
      if (status !== "all" && admin.status !== status) return false;
      if (roleId !== "all" && admin.roleId !== roleId) return false;
      if (!q) return true;
      return (
        admin.fullName.toLowerCase().includes(q) ||
        admin.email.toLowerCase().includes(q) ||
        admin.identification.toLowerCase().includes(q)
      );
    });
  }, [adminsQuery.data, search, status, roleId]);

  const adminsPage = useMemo(
    () => paginateSlice(filteredAdmins, page, TABLE_PAGE_SIZE),
    [filteredAdmins, page],
  );

  function resetFiltersPage() {
    setPage(1);
  }

  return (
    <div
      className={cn(
        "grid gap-6",
        sidePanelOpen && "xl:grid-cols-[minmax(0,1fr)_min(100%,380px)] xl:items-start",
      )}
    >
      <div className="min-w-0 space-y-4">
        <Card className="overflow-hidden">
          <DataTableToolbar
            searchPlaceholder="Nombre, correo o ID…"
            searchValue={search}
            onSearchChange={(v) => {
              setSearch(v);
              resetFiltersPage();
            }}
            filters={
              <>
                <SelectField
                  id="filter-platform-admin-status"
                  variant="toolbar"
                  label="Estado"
                  value={status}
                  onChange={(v) => {
                    setStatus(v as PlatformAdminStatus | "all");
                    resetFiltersPage();
                  }}
                  options={[
                    { value: "all", label: "Todos" },
                    { value: "active", label: "Activo" },
                    { value: "invited", label: "Invitado" },
                    { value: "disabled", label: "Inactivo" },
                  ]}
                />
                <SelectField
                  id="filter-platform-admin-role"
                  variant="toolbar"
                  label="Rol"
                  value={roleId}
                  onChange={(v) => {
                    setRoleId(v);
                    resetFiltersPage();
                  }}
                  options={[{ value: "all", label: "Todos" }, ...roleFilterOptions]}
                />
              </>
            }
          />
          <CardContent className="space-y-3 p-4 pt-3">
            {adminsQuery.isLoading ? (
              <div className="space-y-2">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-14 w-full" />
                ))}
              </div>
            ) : null}

            {adminsQuery.isError ? (
              <StatePanel variant="error" title="No se pudo cargar el listado." />
            ) : null}

            {adminsQuery.data && filteredAdmins.length === 0 ? (
              <StatePanel variant="empty" title="Sin resultados" description="Ajuste búsqueda o filtros." />
            ) : null}

            {adminsQuery.data && adminsPage.data.length > 0 ? (
              <>
              <DataTableShell className="rounded-none border-0" tableClassName="min-w-[1100px]">
                <thead className={dataTableHeadClass}>
                  <tr>
                    <th className={dataTableThClass}>Nombre</th>
                    <th className={dataTableThClass}>Identificación</th>
                    <th className={dataTableThClass}>Ciudad</th>
                    <th className={dataTableThClass}>Estado</th>
                    <th className={dataTableThClass}>Teléfono</th>
                    <th className={dataTableThClass}>Plan</th>
                    <th className={dataTableThClass}>Registro</th>
                    <th className={dataTableThClass}>Caducidad</th>
                    <th className={dataTableThClass}>Cuenta</th>
                    <th className={`${dataTableThClass} w-12`} aria-label="Acciones" />
                  </tr>
                </thead>
                <tbody>
                  {adminsPage.data.map((admin) => {
                    const role = rolesById.get(admin.roleId);
                    const plan = getPlanById(admin.planId);
                    return (
                      <tr key={admin.id} className="border-b last:border-0">
                        <td className={dataTableTdClass}>
                          <div className="flex items-center gap-2">
                            <Avatar className="h-8 w-8">
                              <AvatarFallback className="text-xs">
                                {adminInitials(admin.fullName)}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-semibold">{admin.fullName}</p>
                              <p className="text-xs font-normal text-foreground/70">
                                {admin.email}
                              </p>
                              {role ? (
                                <p className="text-xs font-normal text-foreground/70">
                                  {role.name}
                                </p>
                              ) : null}
                            </div>
                          </div>
                        </td>
                        <td className={dataTableTdClass}>{admin.identification}</td>
                        <td className={dataTableTdClass}>{admin.city}</td>
                        <td className={dataTableTdClass}>{admin.stateRegion}</td>
                        <td className={`${dataTableTdClass} whitespace-nowrap`}>{admin.phone}</td>
                        <td className={dataTableTdClass}>{plan?.name ?? admin.planId}</td>
                        <td className={`${dataTableTdClass} whitespace-nowrap`}>
                          {formatDateTimeEc(admin.createdAt)}
                        </td>
                        <td className={`${dataTableTdClass} whitespace-nowrap`}>
                          {formatDateEc(admin.expiresAt)}
                        </td>
                        <td className={dataTableTdClass}>
                          <SelectField
                            id={`platform-admin-status-${admin.id}`}
                            label="Estado de cuenta"
                            hideLabel
                            value={admin.status}
                            disabled={
                              inlineStatusMutation.isPending && statusUpdatingId === admin.id
                            }
                            onChange={(v) =>
                              inlineStatusMutation.mutate({
                                admin,
                                status: v as PlatformAdminStatus,
                              })
                            }
                            options={PLATFORM_ADMIN_STATUSES.map((s) => ({
                              value: s,
                              label:
                                s === "active"
                                  ? "Activo"
                                  : s === "invited"
                                    ? "Invitado"
                                    : "Inactivo",
                            }))}
                            className="min-w-[8.5rem]"
                          />
                        </td>
                        <td className={dataTableTdClass}>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            aria-label="Editar"
                            onClick={() => startEdit(admin)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </DataTableShell>
              {adminsPage.meta.totalItems > 0 ? (
                <TablePagination
                  page={adminsPage.meta.page}
                  totalPages={adminsPage.meta.totalPages}
                  totalItems={adminsPage.meta.totalItems}
                  pageSize={adminsPage.meta.pageSize}
                  onPageChange={setPage}
                />
              ) : null}
              </>
            ) : null}
          </CardContent>
        </Card>
      </div>

      {sidePanelOpen ? (
        <div className="space-y-4 xl:sticky xl:top-4">
      {showForm ? (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Registro de administrador</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={onCreate} className="space-y-4">
                <AdminRegistrationFields
                  draft={createDraft}
                  onChange={(patch) => setCreateDraft((d) => ({ ...d, ...patch }))}
                  roles={rolesQuery.data ?? []}
                  showAccountStatus={false}
                />
                <div className="space-y-4">
                  <div className="rounded-lg border border-border p-4">
                    <p className="mb-3 text-sm font-semibold">Permisos del rol</p>
                    {selectedPermissions.length === 0 ? (
                      <p className="text-sm font-normal text-foreground/70">Seleccione un rol.</p>
                    ) : (
                      <ul className="flex flex-wrap gap-2">
                        {selectedPermissions.map((p) => (
                          <li key={p.id}>
                            <Badge variant="secondary" className="font-normal">
                              {p.name}
                            </Badge>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                  <p className="text-xs font-normal text-foreground">
                    La fecha de creación se asigna al guardar. Estado inicial: invitado.
                  </p>
                  <Button type="submit" disabled={createMutation.isPending} className="w-full">
                    Registrar administrador
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        ) : null}

        {editingId ? (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">Editar registro</CardTitle>
              <Button type="button" variant="ghost" size="sm" onClick={() => setEditingId(null)}>
                Cerrar
              </Button>
            </CardHeader>
            <CardContent>
              <AdminRegistrationFields
                draft={editDraft}
                onChange={(patch) => setEditDraft((d) => ({ ...d, ...patch }))}
                roles={rolesQuery.data ?? []}
                idPrefix="edit"
                showAccountStatus
              />
              <Button
                type="button"
                className="mt-4"
                onClick={() => editingId && updateMutation.mutate({ id: editingId, draft: editDraft })}
                disabled={updateMutation.isPending}
              >
                Guardar cambios
              </Button>
            </CardContent>
          </Card>
        ) : null}
        </div>
      ) : null}
    </div>
  );
}

function mapAdminError(err: unknown): string {
  if (err instanceof GovernanceError) {
    switch (err.code) {
      case "admin_email_exists":
        return "Ya existe un administrador con ese correo.";
      case "role_not_found":
        return "Rol no válido.";
      case "empty_fields":
        return "Complete nombre, identificación, correo y rol.";
      default:
        return "No se pudo guardar.";
    }
  }
  return "Error inesperado.";
}
