import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Pencil } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import type {
  CompanyUser,
  CompanyUserStatus,
} from "@/entities/organization/model/company-user";
import { CompanyUserError } from "@/entities/organization/model/company-user-errors";
import { CompanyUserStatusBadge } from "@/entities/organization/ui/company-user-status-badge";
import { organizationsUseCases } from "@/features/organization/api/organizations-composition";
import { Button } from "@/shared/ui/button";
import { Card, CardContent } from "@/shared/ui/card";
import {
  DataTableShell,
  dataTableHeadClass,
  dataTableTdClass,
  dataTableThClass,
} from "@/shared/ui/data/data-table-shell";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { SelectField } from "@/shared/ui/select-field";
import { DataTableToolbar } from "@/shared/ui/data/data-table-toolbar";
import { StatePanel } from "@/shared/ui/feedback/state-panel";
import { PageHeaderAction } from "@/shared/ui/layout/page-header-action";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/dialog";
import { formatDateTimeEc } from "@/shared/lib/format";

type AdminDraft = {
  fullName: string;
  email: string;
  status: CompanyUserStatus;
};

const emptyDraft = (): AdminDraft => ({
  fullName: "",
  email: "",
  status: "invited",
});

function adminToDraft(user: CompanyUser): AdminDraft {
  return {
    fullName: user.fullName,
    email: user.email,
    status: user.status,
  };
}

type OrganizationCompanyAdminsPanelProps = {
  organizationId: string;
};

export function OrganizationCompanyAdminsPanel({
  organizationId,
}: OrganizationCompanyAdminsPanelProps) {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<CompanyUserStatus | "all">(
    "all",
  );
  const [modalMode, setModalMode] = useState<"create" | "edit" | null>(null);
  const [editingUser, setEditingUser] = useState<CompanyUser | null>(null);
  const [draft, setDraft] = useState<AdminDraft>(() => emptyDraft());

  const usersQuery = useQuery({
    queryKey: ["organizations", organizationId, "company-users"],
    queryFn: () => organizationsUseCases.listCompanyUsers(organizationId),
  });

  const admins = useMemo(() => {
    const list = (usersQuery.data ?? []).filter(
      (u) => u.role === "company_admin",
    );
    const q = search.trim().toLowerCase();
    return list.filter((u) => {
      if (statusFilter !== "all" && u.status !== statusFilter) return false;
      if (!q) return true;
      return (
        u.fullName.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q)
      );
    });
  }, [usersQuery.data, search, statusFilter]);

  const createMutation = useMutation({
    mutationFn: () =>
      organizationsUseCases.createCompanyAdmin({
        organizationId,
        fullName: draft.fullName,
        email: draft.email,
      }),
    onSuccess: () => {
      toast.success("Administrador registrado (invitado).");
      void queryClient.invalidateQueries({
        queryKey: ["organizations", organizationId, "company-users"],
      });
      void queryClient.invalidateQueries({ queryKey: ["organizations"] });
      closeModal();
    },
    onError: (err: unknown) => toast.error(mapError(err)),
  });

  const updateMutation = useMutation({
    mutationFn: () => {
      if (!editingUser) throw new Error("missing_user");
      return organizationsUseCases.updateCompanyAdmin(editingUser.id, draft);
    },
    onSuccess: () => {
      toast.success("Administrador actualizado.");
      void queryClient.invalidateQueries({
        queryKey: ["organizations", organizationId, "company-users"],
      });
      closeModal();
    },
    onError: (err: unknown) => toast.error(mapError(err)),
  });

  function openCreate() {
    setEditingUser(null);
    setDraft(emptyDraft());
    setModalMode("create");
  }

  function openEdit(user: CompanyUser) {
    setEditingUser(user);
    setDraft(adminToDraft(user));
    setModalMode("edit");
  }

  function closeModal() {
    setModalMode(null);
    setEditingUser(null);
    setDraft(emptyDraft());
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (modalMode === "create") createMutation.mutate();
    else if (modalMode === "edit") updateMutation.mutate();
  }

  const modalOpen = modalMode !== null;
  const saving = createMutation.isPending || updateMutation.isPending;

  return (
    <section className="space-y-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h2 className="text-lg font-semibold tracking-tight">
            Administradores
          </h2>
        </div>
        <PageHeaderAction type="button" onClick={openCreate}>
          Nuevo administrador
        </PageHeaderAction>
      </div>

      <Card className="overflow-hidden">
        <DataTableToolbar
          searchPlaceholder="Nombre o correo…"
          searchValue={search}
          onSearchChange={setSearch}
          filters={
            <SelectField
              id="filter-org-admin-status"
              variant="toolbar"
              label="Estado"
              value={statusFilter}
              onChange={(v) => setStatusFilter(v as CompanyUserStatus | "all")}
              options={[
                { value: "all", label: "Todos" },
                { value: "active", label: "Activo" },
                { value: "invited", label: "Invitado" },
                { value: "disabled", label: "Inactivo" },
              ]}
            />
          }
        />
        <CardContent className="space-y-3 p-4 pt-3">
          {usersQuery.isLoading ? (
            <p className="text-sm font-normal text-foreground/70">Cargando…</p>
          ) : null}
          {usersQuery.isError ? (
            <StatePanel
              variant="error"
              title="No se pudieron cargar los administradores."
            />
          ) : null}
          {!usersQuery.isLoading && admins.length === 0 ? (
            <StatePanel
              variant="empty"
              title="Sin administradores"
              description="Registre el primero con «Nuevo administrador»."
            />
          ) : null}
          {admins.length > 0 ? (
            <DataTableShell
              className="rounded-none border-0"
              tableClassName="min-w-[720px]"
            >
              <thead className={dataTableHeadClass}>
                <tr>
                  <th className={dataTableThClass}>Nombre</th>
                  <th className={dataTableThClass}>Correo</th>
                  <th className={dataTableThClass}>Estado</th>
                  <th className={dataTableThClass}>Rol</th>
                  <th className={dataTableThClass}>Registro</th>
                  <th className={`${dataTableThClass} w-28`}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {admins.map((user) => (
                  <tr key={user.id} className="border-b last:border-0">
                    <td className={`${dataTableTdClass} font-semibold`}>
                      {user.fullName}
                    </td>
                    <td className={dataTableTdClass}>{user.email}</td>
                    <td className={dataTableTdClass}>
                      <CompanyUserStatusBadge status={user.status} />
                    </td>
                    <td className={`${dataTableTdClass} font-mono text-xs`}>
                      {user.role}
                    </td>
                    <td
                      className={`${dataTableTdClass} whitespace-nowrap tabular-nums`}
                    >
                      {formatDateTimeEc(user.createdAt)}
                    </td>
                    <td className={dataTableTdClass}>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="gap-1.5"
                        onClick={() => openEdit(user)}
                      >
                        <Pencil className="h-3.5 w-3.5" aria-hidden />
                        Editar
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </DataTableShell>
          ) : null}
        </CardContent>
      </Card>

      <Dialog open={modalOpen} onOpenChange={(open) => !open && closeModal()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {modalMode === "create"
                ? "Nuevo administrador"
                : "Editar administrador"}
            </DialogTitle>
            <DialogDescription>
              {modalMode === "create"
                ? "Se enviará una invitación por correo (mock)."
                : "Actualice datos y estado de cuenta."}
            </DialogDescription>
          </DialogHeader>
          <form className="space-y-4" onSubmit={onSubmit}>
            <div className="space-y-2">
              <Label htmlFor="admin-modal-name">Nombre completo</Label>
              <Input
                id="admin-modal-name"
                value={draft.fullName}
                onChange={(e) =>
                  setDraft((d) => ({ ...d, fullName: e.target.value }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="admin-modal-email">Correo</Label>
              <Input
                id="admin-modal-email"
                type="email"
                value={draft.email}
                onChange={(e) =>
                  setDraft((d) => ({ ...d, email: e.target.value }))
                }
              />
            </div>
            {modalMode === "edit" ? (
              <SelectField
                id="admin-modal-status"
                label="Estado"
                value={draft.status}
                onChange={(v) =>
                  setDraft((d) => ({ ...d, status: v as CompanyUserStatus }))
                }
                options={[
                  { value: "active", label: "Activo" },
                  { value: "invited", label: "Invitado" },
                  { value: "disabled", label: "Inactivo" },
                ]}
              />
            ) : null}
            <DialogFooter>
              <Button type="button" variant="outline" onClick={closeModal}>
                Cancelar
              </Button>
              <Button type="submit" disabled={saving}>
                {modalMode === "create" ? "Registrar" : "Guardar"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </section>
  );
}

function mapError(err: unknown): string {
  if (err instanceof CompanyUserError) {
    if (err.code === "email_exists_in_org") return err.message;
    if (err.code === "empty_fields") return err.message;
    if (err.code === "not_found") return err.message;
  }
  return "No se pudo guardar.";
}
