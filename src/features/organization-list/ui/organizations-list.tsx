import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { MoreHorizontal, Plus } from "lucide-react";
import { useMemo, useState } from "react";
import { organizationsUseCases } from "@/features/organization/api/organizations-composition";
import type { OrganizationStatus, PlanId } from "@/entities/organization/model/organization";
import { SUBSCRIPTION_PLANS } from "@/entities/organization/model/organization";
import { OrganizationStatusBadge } from "@/entities/organization/ui/organization-status-badge";
import { RoleDashboardShell } from "@/widgets/role-dashboard-shell";
import { PageHeader } from "@/shared/ui/layout/page-header";
import { DataTableToolbar } from "@/shared/ui/data/data-table-toolbar";
import { TablePagination } from "@/shared/ui/data/table-pagination";
import { StatePanel } from "@/shared/ui/feedback/state-panel";
import { formatDateEc } from "@/shared/lib/format";
import { Button } from "@/shared/ui/button";
import { Card, CardContent } from "@/shared/ui/card";
import { SelectField } from "@/shared/ui/select-field";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/shared/ui/dropdown-menu";
import { Skeleton } from "@/shared/ui/skeleton";

export function OrganizationsListClient() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<OrganizationStatus | "all">("all");
  const [planId, setPlanId] = useState<PlanId | "all">("all");
  const [page, setPage] = useState(1);
  const pageSize = 5;

  const filters = useMemo(
    () => ({ page, pageSize, search, status, planId }),
    [page, pageSize, search, status, planId],
  );

  const query = useQuery({
    queryKey: ["organizations", "list", filters],
    queryFn: () => organizationsUseCases.listOrganizations(filters),
  });

  return (
    <RoleDashboardShell
      breadcrumbs={[
        { label: "Plataforma", href: "/app/superadmin" },
        { label: "Empresas" },
      ]}
    >
      <div className="mx-auto max-w-7xl space-y-6">
        <PageHeader
          title="Organizaciones"
          description="Gestión multi-tenant: cada organización mantiene usuarios y datos aislados."
          actions={
            <Button asChild>
              <Link to="/app/superadmin/empresas/nueva">
                <Plus className="h-4 w-4" aria-hidden />
                Nueva organización
              </Link>
            </Button>
          }
        />

        <Card>
          <CardContent className="space-y-4 pt-6">
            <DataTableToolbar
              searchPlaceholder="Buscar por nombre o RUC…"
              searchValue={search}
              onSearchChange={(v) => {
                setSearch(v);
                setPage(1);
              }}
              filters={
                <div className="flex flex-wrap gap-3">
                  <SelectField
                    id="filter-status"
                    label="Estado"
                    value={status}
                    onChange={(v) => {
                      setStatus(v as OrganizationStatus | "all");
                      setPage(1);
                    }}
                    options={[
                      { value: "all", label: "Todos" },
                      { value: "active", label: "Activas" },
                      { value: "trial", label: "En prueba" },
                      { value: "suspended", label: "Suspendidas" },
                    ]}
                    className="min-w-[140px]"
                  />
                  <SelectField
                    id="filter-plan"
                    label="Plan"
                    value={planId}
                    onChange={(v) => {
                      setPlanId(v as PlanId | "all");
                      setPage(1);
                    }}
                    options={[
                      { value: "all", label: "Todos" },
                      ...SUBSCRIPTION_PLANS.map((p) => ({
                        value: p.id,
                        label: p.name,
                      })),
                    ]}
                    className="min-w-[140px]"
                  />
                </div>
              }
            />

            {query.isLoading ? (
              <div className="space-y-2">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : null}

            {query.isError ? (
              <StatePanel
                variant="error"
                title="Error al cargar organizaciones"
                actionLabel="Reintentar"
                onAction={() => void query.refetch()}
              />
            ) : null}

            {query.data && query.data.data.length === 0 ? (
              <StatePanel
                variant="empty"
                title="Sin resultados"
                description="Ajuste los filtros o registre una nueva organización."
              />
            ) : null}

            {query.data && query.data.data.length > 0 ? (
              <>
                <div className="overflow-x-auto rounded-lg border">
                  <table className="w-full min-w-[800px] text-sm">
                    <thead className="bg-muted/40 text-left text-muted-foreground">
                      <tr>
                        <th className="px-4 py-3 font-medium">Organización</th>
                        <th className="px-4 py-3 font-medium">RUC</th>
                        <th className="px-4 py-3 font-medium">Plan</th>
                        <th className="px-4 py-3 font-medium">Estado</th>
                        <th className="px-4 py-3 font-medium">Usuarios</th>
                        <th className="px-4 py-3 font-medium">Registro</th>
                        <th className="px-4 py-3 font-medium sr-only">Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {query.data.data.map((row) => (
                        <tr key={row.id} className="border-t">
                          <td className="px-4 py-3">
                            <Link
                              to={`/app/superadmin/empresas/${row.id}`}
                              className="font-medium text-primary hover:underline"
                            >
                              {row.tradeName}
                            </Link>
                            <p className="text-xs text-muted-foreground">{row.legalName}</p>
                          </td>
                          <td className="px-4 py-3 font-mono text-xs">{row.ruc}</td>
                          <td className="px-4 py-3">{row.planName}</td>
                          <td className="px-4 py-3">
                            <OrganizationStatusBadge status={row.status} />
                          </td>
                          <td className="px-4 py-3 tabular-nums">{row.activeUsersCount}</td>
                          <td className="px-4 py-3 text-muted-foreground">
                            {formatDateEc(row.registeredAt)}
                          </td>
                          <td className="px-4 py-3 text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" aria-label="Acciones">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem asChild>
                                  <Link to={`/app/superadmin/empresas/${row.id}`}>Ver detalle</Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem asChild>
                                  <Link to={`/app/superadmin/empresas/${row.id}/editar`}>
                                    Editar
                                  </Link>
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <TablePagination
                  page={query.data.meta.page}
                  totalPages={query.data.meta.totalPages}
                  totalItems={query.data.meta.totalItems}
                  pageSize={query.data.meta.pageSize}
                  onPageChange={setPage}
                />
              </>
            ) : null}
          </CardContent>
        </Card>
      </div>
    </RoleDashboardShell>
  );
}
