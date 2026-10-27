import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { OrganizationCompanyAdminsPanel } from "@/features/company-admins";
import { OrganizationInfoPanel } from "@/features/organization-detail/ui/organization-info-panel";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { organizationsUseCases } from "@/features/organization/api/organizations-composition";
import { suspendErrorMessage } from "@/features/organization/model/suspend-organization";
import { reactivateErrorMessage } from "@/features/organization/model/reactivate-organization";
import { useActorEmail } from "@/features/organization/model/use-actor-email";
import { PageHeader } from "@/shared/ui/layout/page-header";
import { ConfirmDialog } from "@/shared/ui/feedback/confirm-dialog";
import { StatePanel } from "@/shared/ui/feedback/state-panel";
import { formatDateTimeEc } from "@/shared/lib/format";
import { Button } from "@/shared/ui/button";
import {
  DataTableShell,
  dataTableHeadClass,
  dataTableTdClass,
  dataTableThClass,
} from "@/shared/ui/data/data-table-shell";
import { DataTableToolbar } from "@/shared/ui/data/data-table-toolbar";
import { DataTableCard } from "@/shared/ui/data/data-table-card";
import { paginateSlice, TABLE_PAGE_SIZE } from "@/shared/lib/table-pagination";
import { TablePagination } from "@/shared/ui/data/table-pagination";

export type OrganizationDetailBlockProps = {
  organizationId: string;
  basePath?: string;
};

export function OrganizationDetailBlock({
  organizationId,
  basePath = "/app/superadmin/empresas",
}: OrganizationDetailBlockProps) {
  const actorEmail = useActorEmail();
  const queryClient = useQueryClient();
  const [confirmSuspend, setConfirmSuspend] = useState(false);
  const [confirmReactivate, setConfirmReactivate] = useState(false);
  const [auditSearch, setAuditSearch] = useState("");
  const [auditPage, setAuditPage] = useState(1);

  const orgQuery = useQuery({
    queryKey: ["organizations", organizationId],
    queryFn: () => organizationsUseCases.getOrganization(organizationId),
  });

  const auditQuery = useQuery({
    queryKey: ["organizations", organizationId, "audit"],
    queryFn: () => organizationsUseCases.getOrganizationAuditLog(organizationId),
    enabled: Boolean(orgQuery.data),
  });

  const suspendMutation = useMutation({
    mutationFn: () => organizationsUseCases.suspendOrganization(organizationId, actorEmail),
    onSuccess: () => {
      toast.success("Suscripción cancelada");
      void queryClient.invalidateQueries({ queryKey: ["organizations"] });
      setConfirmSuspend(false);
    },
    onError: (e: Error) => toast.error(suspendErrorMessage(e.message)),
  });

  const reactivateMutation = useMutation({
    mutationFn: () => organizationsUseCases.reactivateOrganization(organizationId, actorEmail),
    onSuccess: () => {
      toast.success("Empresa reactivada");
      void queryClient.invalidateQueries({ queryKey: ["organizations"] });
      setConfirmReactivate(false);
    },
    onError: (e: Error) => toast.error(reactivateErrorMessage(e.message)),
  });

  const org = orgQuery.data;

  const filteredAudit = useMemo(() => {
    const list = auditQuery.data ?? [];
    const q = auditSearch.trim().toLowerCase();
    if (!q) return list;
    return list.filter(
      (e) =>
        e.summary.toLowerCase().includes(q) ||
        e.actorEmail.toLowerCase().includes(q),
    );
  }, [auditQuery.data, auditSearch]);

  const auditPageData = useMemo(
    () => paginateSlice(filteredAudit, auditPage, TABLE_PAGE_SIZE),
    [filteredAudit, auditPage],
  );

  return (
    <>
      <div className="space-y-6">
        {orgQuery.isLoading ? (
          <StatePanel variant="loading" title="Cargando organización" />
        ) : null}
        {orgQuery.isError || (!orgQuery.isLoading && !org) ? (
          <StatePanel variant="error" title="Organización no encontrada" />
        ) : null}

        {org ? (
          <>
            <PageHeader
              title={org.tradeName}
              description={org.legalName}
              actions={
                <div className="flex flex-wrap gap-2">
                  {org.subscriptionStatus === "CANCELED" ? (
                    <Button onClick={() => setConfirmReactivate(true)}>Reactivar</Button>
                  ) : (
                    <Button variant="destructive" onClick={() => setConfirmSuspend(true)}>
                      Cancelar suscripción
                    </Button>
                  )}
                </div>
              }
            />

            <OrganizationInfoPanel organizationId={organizationId} org={org} />

            <OrganizationCompanyAdminsPanel organizationId={organizationId} />

            <DataTableCard
              toolbar={
                <DataTableToolbar
                  searchPlaceholder="Evento o actor…"
                  searchValue={auditSearch}
                  onSearchChange={(v) => {
                    setAuditSearch(v);
                    setAuditPage(1);
                  }}
                />
              }
              footer={
                auditPageData.meta.totalItems > 0 ? (
                  <TablePagination
                    page={auditPageData.meta.page}
                    totalPages={auditPageData.meta.totalPages}
                    totalItems={auditPageData.meta.totalItems}
                    pageSize={auditPageData.meta.pageSize}
                    onPageChange={setAuditPage}
                  />
                ) : null
              }
            >
              <p className="text-sm font-semibold text-foreground">Auditoría administrativa</p>
              {auditQuery.isLoading ? (
                <p className="text-sm font-normal text-foreground/70">Cargando…</p>
              ) : null}
              {auditQuery.data?.length === 0 ? (
                <StatePanel variant="empty" title="Sin eventos registrados" />
              ) : null}
              {auditQuery.data && auditQuery.data.length > 0 && filteredAudit.length === 0 ? (
                <StatePanel variant="empty" title="Sin resultados" />
              ) : null}
              {auditPageData.data.length > 0 ? (
                <DataTableShell className="rounded-none border-0" tableClassName="min-w-[520px]">
                  <thead className={dataTableHeadClass}>
                    <tr>
                      <th className={dataTableThClass}>Evento</th>
                      <th className={dataTableThClass}>Fecha</th>
                      <th className={dataTableThClass}>Actor</th>
                    </tr>
                  </thead>
                  <tbody>
                    {auditPageData.data.map((entry) => (
                      <tr key={entry.id} className="border-b last:border-0">
                        <td className={dataTableTdClass}>{entry.summary}</td>
                        <td className={`${dataTableTdClass} whitespace-nowrap`}>
                          {formatDateTimeEc(entry.occurredAt)}
                        </td>
                        <td className={dataTableTdClass}>{entry.actorEmail}</td>
                      </tr>
                    ))}
                  </tbody>
                </DataTableShell>
              ) : null}
            </DataTableCard>
          </>
        ) : null}
      </div>

      <ConfirmDialog
        open={confirmSuspend}
        onOpenChange={setConfirmSuspend}
        title="Cancelar suscripción"
        description="La empresa pasará a estado CANCELED. Los datos del tenant se conservan."
        confirmLabel="Confirmar"
        destructive
        onConfirm={() => suspendMutation.mutate()}
      />
      <ConfirmDialog
        open={confirmReactivate}
        onOpenChange={setConfirmReactivate}
        title="Reactivar empresa"
        description="Restaurará suscripción TRIAL o ACTIVE según el estado anterior."
        confirmLabel="Reactivar"
        onConfirm={() => reactivateMutation.mutate()}
      />
    </>
  );
}

