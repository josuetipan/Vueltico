import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import type { CompanyUserStatus } from "@/entities/organization/model/company-user";
import { CompanyUserError } from "@/entities/organization/model/company-user-errors";
import { CompanyUserStatusSelect } from "@/entities/organization/ui/company-user-status-select";
import { organizationsUseCases } from "@/features/organization/api/organizations-composition";
import { Button } from "@/shared/ui/button";
import { Card, CardContent } from "@/shared/ui/card";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { SelectField } from "@/shared/ui/select-field";
import { DataTableToolbar } from "@/shared/ui/data/data-table-toolbar";
import {
  DataTableShell,
  dataTableHeadClass,
  dataTableTdClass,
  dataTableThClass,
} from "@/shared/ui/data/data-table-shell";
import { StatePanel } from "@/shared/ui/feedback/state-panel";
import { Skeleton } from "@/shared/ui/skeleton";
import { formatDateTimeEc } from "@/shared/lib/format";
import { cn } from "@/shared/lib/utils";
import { TABLE_PAGE_SIZE } from "@/shared/lib/table-pagination";
import { TablePagination } from "@/shared/ui/data/table-pagination";

type CreateDraft = {
  organizationId: string;
  fullName: string;
  email: string;
};

const emptyDraft = (): CreateDraft => ({
  organizationId: "",
  fullName: "",
  email: "",
});

export type CompanyAdminsBlockProps = {
  showCreateForm: boolean;
  onShowCreateFormChange: (open: boolean) => void;
};

export function CompanyAdminsBlock({
  showCreateForm: showForm,
  onShowCreateFormChange: setShowForm,
}: CompanyAdminsBlockProps) {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [organizationId, setOrganizationId] = useState<string | "all">("all");
  const [status, setStatus] = useState<CompanyUserStatus | "all">("all");
  const [page, setPage] = useState(1);
  const [draft, setDraft] = useState<CreateDraft>(() => emptyDraft());
  const [statusUpdatingId, setStatusUpdatingId] = useState<string | null>(null);

  const orgOptionsQuery = useQuery({
    queryKey: ["organizations", "all-for-select"],
    queryFn: () =>
      organizationsUseCases.listOrganizations({
        page: 1,
        pageSize: 200,
        subscriptionStatus: "all",
        planId: "all",
      }),
  });

  const adminsQuery = useQuery({
    queryKey: ["company-admins", { search, organizationId, status, page }],
    queryFn: () =>
      organizationsUseCases.listCompanyAdmins({
        search,
        organizationId,
        status,
        page,
        pageSize: TABLE_PAGE_SIZE,
      }),
  });

  const orgSelectOptions = useMemo(
    () =>
      (orgOptionsQuery.data?.data ?? []).map((o) => ({
        value: o.id,
        label: o.tradeName,
      })),
    [orgOptionsQuery.data],
  );

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: CompanyUserStatus }) =>
      organizationsUseCases.updateCompanyUserStatus(id, status),
    onMutate: ({ id }) => setStatusUpdatingId(id),
    onSuccess: () => {
      toast.success("Estado actualizado");
      void queryClient.invalidateQueries({ queryKey: ["company-admins"] });
      void queryClient.invalidateQueries({ queryKey: ["organizations"] });
    },
    onError: () => toast.error("No se pudo actualizar el estado."),
    onSettled: () => setStatusUpdatingId(null),
  });

  const createMutation = useMutation({
    mutationFn: () => organizationsUseCases.createCompanyAdmin(draft),
    onSuccess: () => {
      toast.success("Administrador de empresa registrado (invitado).");
      void queryClient.invalidateQueries({ queryKey: ["company-admins"] });
      void queryClient.invalidateQueries({ queryKey: ["organizations"] });
      setDraft(emptyDraft());
      setShowForm(false);
    },
    onError: (err: unknown) => toast.error(mapError(err)),
  });

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!draft.organizationId) {
      toast.error("Seleccione la empresa.");
      return;
    }
    createMutation.mutate();
  }

  useEffect(() => {
    if (!showForm || organizationId === "all") return;
    setDraft((d) => (d.organizationId ? d : { ...d, organizationId }));
  }, [showForm, organizationId]);

  return (
    <div
      className={cn(
        "grid gap-6",
        showForm && "xl:grid-cols-[minmax(0,1fr)_min(100%,360px)] xl:items-start",
      )}
    >
      <div className="min-w-0 space-y-4">
        <Card className="overflow-hidden">
            <DataTableToolbar
              searchPlaceholder="Nombre o correo…"
              searchValue={search}
              onSearchChange={(v) => {
                setSearch(v);
                setPage(1);
              }}
              filters={
                <>
                  <SelectField
                    id="filter-org-admin"
                    variant="toolbar"
                    label="Empresa"
                    value={organizationId}
                    onChange={(v) => {
                      setOrganizationId(v as string | "all");
                      setPage(1);
                    }}
                    options={[
                      { value: "all", label: "Todas" },
                      ...orgSelectOptions,
                    ]}
                  />
                  <SelectField
                    id="filter-status-admin"
                    variant="toolbar"
                    label="Estado"
                    value={status}
                    onChange={(v) => {
                      setStatus(v as CompanyUserStatus | "all");
                      setPage(1);
                    }}
                    options={[
                      { value: "all", label: "Todos" },
                      { value: "active", label: "Activo" },
                      { value: "invited", label: "Invitado" },
                      { value: "disabled", label: "Inactivo" },
                    ]}
                  />
                </>
              }
            />
          <CardContent className="space-y-3 p-4 pt-3">

            {adminsQuery.isLoading ? (
              <div className="space-y-2">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : null}

            {adminsQuery.isError ? (
              <StatePanel variant="error" title="No se pudo cargar el listado." />
            ) : null}

            {adminsQuery.data && adminsQuery.data.data.length === 0 ? (
              <StatePanel
                variant="empty"
                title="Sin administradores de empresa"
                description="Créelos al registrar una organización o con «Nuevo admin. empresa»."
              />
            ) : null}

            {adminsQuery.data && adminsQuery.data.data.length > 0 ? (
              <>
              <DataTableShell className="rounded-none border-0" tableClassName="min-w-[720px]">
                <thead className={dataTableHeadClass}>
                  <tr>
                    <th className={dataTableThClass}>Empresa</th>
                    <th className={dataTableThClass}>Nombre</th>
                    <th className={dataTableThClass}>Correo</th>
                    <th className={dataTableThClass}>Estado</th>
                    <th className={dataTableThClass}>Registro</th>
                  </tr>
                </thead>
                <tbody>
                  {adminsQuery.data.data.map((row) => (
                    <tr key={row.id} className="border-b last:border-0">
                      <td className={dataTableTdClass}>
                        <Link
                          to={`/app/superadmin/empresas/${row.organizationId}`}
                          className="font-semibold hover:underline"
                        >
                          {row.organizationTradeName}
                        </Link>
                      </td>
                      <td className={dataTableTdClass}>{row.fullName}</td>
                      <td className={dataTableTdClass}>{row.email}</td>
                      <td className={dataTableTdClass}>
                        <CompanyUserStatusSelect
                          id={`company-admin-status-${row.id}`}
                          value={row.status}
                          disabled={statusMutation.isPending && statusUpdatingId === row.id}
                          onChange={(next) => statusMutation.mutate({ id: row.id, status: next })}
                        />
                      </td>
                      <td className={`${dataTableTdClass} whitespace-nowrap tabular-nums`}>
                        {formatDateTimeEc(row.createdAt)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </DataTableShell>
              <TablePagination
                page={adminsQuery.data.meta.page}
                totalPages={adminsQuery.data.meta.totalPages}
                totalItems={adminsQuery.data.meta.totalItems}
                pageSize={adminsQuery.data.meta.pageSize}
                onPageChange={setPage}
              />
              </>
            ) : null}
          </CardContent>
        </Card>
      </div>

      {showForm ? (
        <Card className="h-fit xl:sticky xl:top-4">
          <CardContent className="space-y-4 pt-6">
            <div>
              <h3 className="text-base font-semibold">Administrador de empresa</h3>
              <p className="text-sm font-normal text-foreground/70">
                Acceso al portal del cliente (`/app/empresa`), no al panel de superadmin.
              </p>
            </div>
            <form className="space-y-4" onSubmit={onSubmit}>
              <SelectField
                id="create-org"
                label="Empresa"
                value={draft.organizationId}
                onChange={(v) => setDraft((d) => ({ ...d, organizationId: v }))}
                options={[{ value: "", label: "Seleccione…" }, ...orgSelectOptions]}
              />
              <div className="space-y-2">
                <Label htmlFor="admin-fullName">Nombre completo</Label>
                <Input
                  id="admin-fullName"
                  value={draft.fullName}
                  onChange={(e) => setDraft((d) => ({ ...d, fullName: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="admin-email">Correo</Label>
                <Input
                  id="admin-email"
                  type="email"
                  value={draft.email}
                  onChange={(e) => setDraft((d) => ({ ...d, email: e.target.value }))}
                />
              </div>
              <p className="text-xs font-normal text-foreground/70">
                Se envía invitación por correo (mock). También puede definirse en el alta de organización.
              </p>
              <div className="flex flex-wrap gap-2">
                <Button type="submit" disabled={createMutation.isPending}>
                  Registrar
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowForm(false);
                    setDraft(emptyDraft());
                  }}
                >
                  Cancelar
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}

function mapError(err: unknown): string {
  if (err instanceof CompanyUserError) {
    if (err.code === "email_exists_in_org") return err.message;
    if (err.code === "empty_fields") return err.message;
  }
  return "No se pudo registrar.";
}
