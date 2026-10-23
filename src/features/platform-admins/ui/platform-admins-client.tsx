import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import {
  GovernanceError,
  PLATFORM_ADMIN_STATUSES,
  adminInitials,
  type PlatformAdminStatus,
  type PlatformRole,
} from "@/entities/platform-governance";
import { PlatformAdminStatusBadge } from "@/entities/platform-governance/ui/platform-admin-status-badge";
import { governanceUseCases } from "@/features/platform-governance/api/governance-composition";
import { RoleDashboardShell } from "@/widgets/role-dashboard-shell";
import { PageHeader } from "@/shared/ui/layout/page-header";
import { Button } from "@/shared/ui/button";
import { Card, CardContent } from "@/shared/ui/card";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { Avatar, AvatarFallback } from "@/shared/ui/avatar";
import { Badge } from "@/shared/ui/badge";
import { StatePanel } from "@/shared/ui/feedback/state-panel";
import { Skeleton } from "@/shared/ui/skeleton";
import { formatDateEc } from "@/shared/lib/format";

export function PlatformAdminsClient() {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [roleId, setRoleId] = useState("");

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

  const selectedRole = roleId ? rolesById.get(roleId) : undefined;
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
      setEmail("");
      setFullName("");
      setRoleId("");
      setShowForm(false);
      toast.success("Administrador creado. Estado: invitado.");
    },
    onError: (err: unknown) => toast.error(mapAdminError(err)),
  });

  const updateMutation = useMutation({
    mutationFn: ({
      id,
      fullName: name,
      roleId: rid,
      status,
    }: {
      id: string;
      fullName: string;
      roleId: string;
      status: PlatformAdminStatus;
    }) => governanceUseCases.updatePlatformAdmin(id, { fullName: name, roleId: rid, status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["governance", "admins"] });
      toast.success("Administrador actualizado.");
    },
    onError: (err: unknown) => toast.error(mapAdminError(err)),
  });

  function onCreate(e: React.FormEvent) {
    e.preventDefault();
    createMutation.mutate({ email, fullName, roleId });
  }

  return (
    <RoleDashboardShell
      breadcrumbs={[
        { label: "Plataforma", href: "/app/superadmin" },
        { label: "Administradores" },
      ]}
    >
      <div className="mx-auto max-w-7xl space-y-6">
        <PageHeader
          title="Administradores de plataforma"
          description="Cree cuentas con rol de gobernanza. Los permisos vienen del rol asignado."
          actions={
            <Button type="button" onClick={() => setShowForm((v) => !v)}>
              <Plus className="h-4 w-4" aria-hidden />
              Nuevo administrador
            </Button>
          }
        />

        {showForm ? (
          <Card>
            <CardContent className="pt-6">
              <form onSubmit={onCreate} className="grid gap-6 lg:grid-cols-2">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="admin-email">Correo</Label>
                    <Input
                      id="admin-email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      autoComplete="off"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="admin-name">Nombre completo</Label>
                    <Input
                      id="admin-name"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="admin-role">Rol</Label>
                    <select
                      id="admin-role"
                      value={roleId}
                      onChange={(e) => setRoleId(e.target.value)}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                    >
                      <option value="">Seleccione…</option>
                      {(rolesQuery.data ?? []).map((role) => (
                        <option key={role.id} value={role.id}>
                          {role.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <Button type="submit" disabled={createMutation.isPending}>
                    Crear administrador
                  </Button>
                </div>

                <div className="rounded-lg border border-border p-4">
                  <p className="mb-3 text-sm font-semibold">Permisos del rol</p>
                  {selectedPermissions.length === 0 ? (
                    <p className="text-sm font-normal text-foreground/70">
                      Elija un rol para ver permisos.
                    </p>
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
              </form>
            </CardContent>
          </Card>
        ) : null}

        <Card>
          <CardContent className="pt-6">
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

            {adminsQuery.data ? (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[640px] text-sm">
                  <thead className="border-b text-left">
                    <tr>
                      <th className="pb-3 font-semibold">Administrador</th>
                      <th className="pb-3 font-semibold">Rol</th>
                      <th className="pb-3 font-semibold">Estado</th>
                      <th className="pb-3 font-semibold">Alta</th>
                    </tr>
                  </thead>
                  <tbody>
                    {adminsQuery.data.map((admin) => {
                      const role = rolesById.get(admin.roleId);
                      return (
                        <AdminRow
                          key={admin.id}
                          admin={admin}
                          role={role}
                          roles={rolesQuery.data ?? []}
                          onUpdate={(patch) =>
                            updateMutation.mutate({
                              id: admin.id,
                              fullName: patch.fullName,
                              roleId: patch.roleId,
                              status: patch.status,
                            })
                          }
                        />
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : null}
          </CardContent>
        </Card>
      </div>
    </RoleDashboardShell>
  );
}

function AdminRow({
  admin,
  role,
  roles,
  onUpdate,
}: {
  admin: Awaited<ReturnType<typeof governanceUseCases.listPlatformAdmins>>[number];
  role: PlatformRole | undefined;
  roles: PlatformRole[];
  onUpdate: (patch: {
    fullName: string;
    roleId: string;
    status: PlatformAdminStatus;
  }) => void;
}) {
  const [fullName, setFullName] = useState(admin.fullName);
  const [roleId, setRoleId] = useState(admin.roleId);
  const [status, setStatus] = useState<PlatformAdminStatus>(admin.status);

  const dirty =
    fullName !== admin.fullName || roleId !== admin.roleId || status !== admin.status;

  return (
    <tr className="border-b last:border-0">
      <td className="py-3 pr-4">
        <div className="flex items-center gap-3">
          <Avatar className="h-9 w-9">
            <AvatarFallback>{adminInitials(admin.fullName)}</AvatarFallback>
          </Avatar>
          <div>
            <Input
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="h-8 max-w-[200px] text-sm font-normal"
            />
            <p className="mt-1 text-xs font-normal text-foreground/70">{admin.email}</p>
          </div>
        </div>
      </td>
      <td className="py-3 pr-4 align-top">
        <select
          value={roleId}
          onChange={(e) => setRoleId(e.target.value)}
          className="flex h-9 w-full max-w-[220px] rounded-md border border-input bg-background px-2 text-sm"
        >
          {roles.map((r) => (
            <option key={r.id} value={r.id}>
              {r.name}
            </option>
          ))}
        </select>
        {role ? (
          <p className="mt-1 text-xs font-normal text-foreground/70">
            {role.permissionIds.length} permiso(s)
          </p>
        ) : null}
      </td>
      <td className="py-3 pr-4 align-top">
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value as PlatformAdminStatus)}
          className="mb-2 flex h-9 rounded-md border border-input bg-background px-2 text-sm"
        >
          {PLATFORM_ADMIN_STATUSES.map((s) => (
            <option key={s} value={s}>
              {s === "active" ? "Activo" : s === "invited" ? "Invitado" : "Inactivo"}
            </option>
          ))}
        </select>
        <PlatformAdminStatusBadge status={status} />
      </td>
      <td className="py-3 align-top">
        <p className="text-sm font-normal">{formatDateEc(admin.createdAt)}</p>
        {dirty ? (
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="mt-2"
            onClick={() => onUpdate({ fullName, roleId, status })}
          >
            Guardar
          </Button>
        ) : null}
      </td>
    </tr>
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
        return "Complete los campos.";
      default:
        return "No se pudo guardar.";
    }
  }
  return "Error inesperado.";
}
