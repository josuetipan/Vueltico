import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { organizationsUseCases } from "@/features/organization/api/organizations-composition";
import { organizationToUpdateInput } from "@/features/organization/model/organization-to-update-input";
import { useActorEmail } from "@/features/organization/model/use-actor-email";
import type { SubscriptionStatus } from "@/entities/organization/model/organization";
import { SUBSCRIPTION_PLANS } from "@/entities/plan";
import type { PlanId } from "@/entities/plan";
import { SubscriptionStatusSelect } from "@/entities/organization/ui/subscription-status-select";
import {
  SubscriptionStatusChangeConfirmDialog,
  type PendingSubscriptionStatusChange,
} from "@/features/organization/ui/subscription-status-change-confirm-dialog";
import { DataTableToolbar } from "@/shared/ui/data/data-table-toolbar";
import { TablePagination } from "@/shared/ui/data/table-pagination";
import { StatePanel } from "@/shared/ui/feedback/state-panel";
import { formatDateTimeEc } from "@/shared/lib/format";
import { Card, CardContent } from "@/shared/ui/card";
import { SelectField } from "@/shared/ui/select-field";
import { Skeleton } from "@/shared/ui/skeleton";
import {
  DataTableShell,
  dataTableHeadClass,
  dataTableTdClass,
  dataTableThClass,
} from "@/shared/ui/data/data-table-shell";
import { TABLE_PAGE_SIZE } from "@/shared/lib/table-pagination";

export type OrganizationListBlockProps = {
  pageSize?: number;
  detailPath?: (id: string) => string;
};

const defaultDetailPath = (id: string) => `/app/superadmin/empresas/${id}`;

export function OrganizationListBlock({
  pageSize = TABLE_PAGE_SIZE,
  detailPath = defaultDetailPath,
}: OrganizationListBlockProps) {
  const actorEmail = useActorEmail();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [subscriptionStatus, setSubscriptionStatus] = useState<SubscriptionStatus | "all">("all");
  const [planId, setPlanId] = useState<PlanId | "all">("all");
  const [page, setPage] = useState(1);
  const [statusUpdatingId, setStatusUpdatingId] = useState<string | null>(null);
  const [pendingStatusChange, setPendingStatusChange] =
    useState<(PendingSubscriptionStatusChange & { organizationId: string }) | null>(null);

  const query = useQuery({
    queryKey: ["organizations", { search, subscriptionStatus, planId, page, pageSize }],
    queryFn: () =>
      organizationsUseCases.listOrganizations({
        page,
        pageSize,
        search,
        subscriptionStatus,
        planId,
      }),
  });

  const planOptions = useMemo(
    () => [{ value: "all", label: "Todos los planes" }, ...SUBSCRIPTION_PLANS.map((p) => ({ value: p.id, label: p.name }))],
    [],
  );

  const statusMutation = useMutation({
    mutationFn: async ({
      organizationId,
      subscriptionStatus: nextStatus,
    }: {
      organizationId: string;
      subscriptionStatus: SubscriptionStatus;
    }) => {
      const org = await organizationsUseCases.getOrganization(organizationId);
      if (!org) throw new Error("NOT_FOUND");
      return organizationsUseCases.updateOrganization(
        organizationId,
        { ...organizationToUpdateInput(org), subscriptionStatus: nextStatus },
        actorEmail,
      );
    },
    onMutate: ({ organizationId }) => setStatusUpdatingId(organizationId),
    onSuccess: () => {
      toast.success("Estado de suscripción actualizado");
      void queryClient.invalidateQueries({ queryKey: ["organizations"] });
    },
    onError: () => toast.error("No se pudo actualizar el estado."),
    onSettled: () => setStatusUpdatingId(null),
  });

  function confirmPendingStatusChange() {
    if (!pendingStatusChange) return;
    statusMutation.mutate({
      organizationId: pendingStatusChange.organizationId,
      subscriptionStatus: pendingStatusChange.to,
    });
    setPendingStatusChange(null);
  }

  return (
    <>
    <Card className="overflow-hidden">
      <DataTableToolbar
        searchPlaceholder="Nombre, razón social o RUC…"
        searchValue={search}
        onSearchChange={(v) => {
          setSearch(v);
          setPage(1);
        }}
        filters={
          <>
            <SelectField
              id="filter-org-status"
              variant="toolbar"
              label="Suscripción"
              value={subscriptionStatus}
              onChange={(v) => {
                setSubscriptionStatus(v as SubscriptionStatus | "all");
                setPage(1);
              }}
              options={[
                { value: "all", label: "Todas" },
                { value: "TRIAL", label: "Prueba" },
                { value: "ACTIVE", label: "Activa" },
                { value: "PAST_DUE", label: "Pago pendiente" },
                { value: "CANCELED", label: "Cancelada" },
                { value: "EXPIRED", label: "Expirada" },
              ]}
            />
            <SelectField
              id="filter-org-plan"
              variant="toolbar"
              label="Plan"
              value={planId}
              onChange={(v) => {
                setPlanId(v as PlanId | "all");
                setPage(1);
              }}
              options={planOptions}
            />
          </>
        }
      />
      <CardContent className="space-y-3 p-4 pt-3">
        {query.isLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        ) : null}

        {query.isError ? <StatePanel variant="error" title="Error al cargar empresas" /> : null}

        {query.data && query.data.data.length === 0 ? (
          <StatePanel variant="empty" title="Sin resultados" />
        ) : null}

        {query.data && query.data.data.length > 0 ? (
          <>
            <DataTableShell className="rounded-none border-0" tableClassName="min-w-[720px]">
              <thead className={dataTableHeadClass}>
                <tr>
                  <th className={dataTableThClass}>Empresa</th>
                  <th className={dataTableThClass}>RUC</th>
                  <th className={dataTableThClass}>Plan</th>
                  <th className={dataTableThClass}>Suscripción</th>
                  <th className={dataTableThClass}>Usuarios</th>
                  <th className={dataTableThClass}>Registro</th>
                </tr>
              </thead>
              <tbody>
                {query.data.data.map((row) => (
                  <tr key={row.id} className="border-b last:border-0">
                    <td className={dataTableTdClass}>
                      <Link
                        to={detailPath(row.id)}
                        className="font-semibold hover:underline"
                      >
                        {row.tradeName}
                      </Link>
                      <p className="text-xs font-normal text-foreground/70">{row.legalName}</p>
                    </td>
                    <td className={`${dataTableTdClass} font-mono text-xs`}>{row.taxId}</td>
                    <td className={dataTableTdClass}>{row.planName}</td>
                    <td className={dataTableTdClass}>
                      <SubscriptionStatusSelect
                        id={`org-subscription-${row.id}`}
                        value={row.subscriptionStatus}
                        disabled={statusMutation.isPending && statusUpdatingId === row.id}
                        onChange={(next) => {
                          if (next === row.subscriptionStatus) return;
                          setPendingStatusChange({
                            organizationId: row.id,
                            organizationLabel: row.tradeName,
                            from: row.subscriptionStatus,
                            to: next,
                          });
                        }}
                      />
                    </td>
                    <td className={`${dataTableTdClass} tabular-nums`}>{row.memberCount}</td>
                    <td className={`${dataTableTdClass} whitespace-nowrap tabular-nums`}>
                      {formatDateTimeEc(row.createdAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </DataTableShell>
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
    <SubscriptionStatusChangeConfirmDialog
      pending={pendingStatusChange}
      onDismiss={() => setPendingStatusChange(null)}
      onConfirm={confirmPendingStatusChange}
    />
    </>
  );
}
