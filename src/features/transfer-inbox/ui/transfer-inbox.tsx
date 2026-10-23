import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { AlertTriangle, Eye } from "lucide-react";
import { useMemo, useState } from "react";
import { useSession } from "@/features/auth/model/use-session";
import type { TransferPaymentStatus } from "@/entities/transfer-payment/model/transfer-payment";
import { isTransferAccredited } from "@/entities/transfer-payment/model/transfer-payment";
import { transferReconciliationUseCases } from "@/features/transfer-reconciliation/api/transfer-reconciliation-composition";
import { TransferStatusBadge } from "@/entities/transfer-payment/ui/transfer-status-badge";
import { RoleDashboardShell } from "@/widgets/role-dashboard-shell";
import { PageHeader } from "@/shared/ui/layout/page-header";
import { DataTableToolbar } from "@/shared/ui/data/data-table-toolbar";
import { StatePanel } from "@/shared/ui/feedback/state-panel";
import { formatDateTimeEc, formatUsdFromCents } from "@/shared/lib/format";
import { Button } from "@/shared/ui/button";
import { Card, CardContent } from "@/shared/ui/card";
import { SelectField } from "@/shared/ui/select-field";

type InboxMode = "pending" | "history";

const PENDING_STATUSES: TransferPaymentStatus[] = [
  "pending_verification",
  "in_review",
];

const HISTORY_STATUSES: TransferPaymentStatus[] = ["confirmed", "rejected"];

export function TransferInboxClient({ mode }: { mode: InboxMode }) {
  const { session } = useSession();
  const tenantId = session?.tenant?.id ?? "";
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<TransferPaymentStatus | "all">("all");

  const policyQuery = useQuery({
    queryKey: ["transfer-reconciliation", "policy"],
    queryFn: () => transferReconciliationUseCases.getReceiptPolicy(),
  });

  const listQuery = useQuery({
    queryKey: ["transfer-reconciliation", "list", tenantId, search],
    queryFn: () =>
      transferReconciliationUseCases.listTransferPayments({
        tenantId,
        search,
        status: "all",
      }),
    enabled: Boolean(tenantId),
  });

  const rows = useMemo(() => {
    const all = listQuery.data ?? [];
    const byMode = all.filter((r) =>
      mode === "pending"
        ? PENDING_STATUSES.includes(r.status)
        : HISTORY_STATUSES.includes(r.status),
    );
    if (statusFilter === "all") return byMode;
    return byMode.filter((r) => r.status === statusFilter);
  }, [listQuery.data, mode, statusFilter]);

  const breadcrumbs =
    mode === "pending"
      ? [
          { label: "Empresa", href: "/app/empresa" },
          { label: "Transferencias", href: "/app/empresa/transferencias" },
          { label: "Pendientes" },
        ]
      : [
          { label: "Empresa", href: "/app/empresa" },
          { label: "Transferencias", href: "/app/empresa/transferencias" },
          { label: "Historial" },
        ];

  if (!session?.tenant) {
    return (
      <RoleDashboardShell breadcrumbs={breadcrumbs}>
        <StatePanel variant="empty" title="Sin organización" description="Sesión sin tenant asignado." />
      </RoleDashboardShell>
    );
  }

  return (
    <RoleDashboardShell breadcrumbs={breadcrumbs}>
      <div className="mx-auto max-w-7xl space-y-6">
        <PageHeader
          title={mode === "pending" ? "Transferencias pendientes" : "Historial de transferencias"}
          description={
            mode === "pending"
              ? "Revise comprobantes reportados. Una transferencia pendiente no se considera acreditada."
              : "Pagos confirmados y rechazados con motivo y responsable registrados."
          }
          actions={
            <div className="flex flex-wrap gap-2">
              <Button asChild variant={mode === "pending" ? "default" : "outline"} size="sm">
                <Link to="/app/empresa/transferencias">Pendientes</Link>
              </Button>
              <Button asChild variant={mode === "history" ? "default" : "outline"} size="sm">
                <Link to="/app/empresa/transferencias/historial">Historial</Link>
              </Button>
            </div>
          }
        />

        {policyQuery.data ? (
          <Card className="border-accent/30 bg-accent/5">
            <CardContent className="py-4 text-sm text-muted-foreground">
              <p className="font-medium text-foreground">Conservación de comprobantes ({policyQuery.data.retentionDays} días)</p>
              <p className="mt-1">{policyQuery.data.summary}</p>
              <p className="mt-1">{policyQuery.data.temporaryStorageNote}</p>
            </CardContent>
          </Card>
        ) : null}

        <DataTableToolbar
          searchValue={search}
          onSearchChange={setSearch}
          searchPlaceholder="Referencia, venta o cajero…"
          filters={
            <SelectField
              id="status-filter"
              label="Estado"
              value={statusFilter}
              onChange={(v) => setStatusFilter(v as TransferPaymentStatus | "all")}
              options={[
                { value: "all", label: "Todos" },
                ...(mode === "pending"
                  ? [
                      { value: "pending_verification", label: "Pendiente de verificación" },
                      { value: "in_review", label: "En revisión" },
                    ]
                  : [
                      { value: "confirmed", label: "Confirmada" },
                      { value: "rejected", label: "Rechazada" },
                    ]),
              ]}
              className="min-w-[200px]"
            />
          }
        />

        {listQuery.isLoading ? (
          <StatePanel variant="loading" title="Cargando bandeja" />
        ) : null}
        {listQuery.isError ? (
          <StatePanel variant="error" title="Error" actionLabel="Reintentar" onAction={() => void listQuery.refetch()} />
        ) : null}

        {listQuery.data && rows.length === 0 ? (
          <StatePanel variant="empty" title="Sin registros" description="No hay transferencias en este filtro." />
        ) : null}

        {rows.length > 0 ? (
          <Card>
            <CardContent className="overflow-x-auto p-0">
              <table className="w-full min-w-[960px] text-sm">
                <thead>
                  <tr className="border-b bg-muted/40 text-left text-muted-foreground">
                    <th className="px-4 py-3 font-medium">Fecha</th>
                    <th className="px-4 py-3 font-medium">Venta</th>
                    <th className="px-4 py-3 font-medium">Cajero</th>
                    <th className="px-4 py-3 font-medium">Cuenta destino</th>
                    <th className="px-4 py-3 font-medium">Importe</th>
                    <th className="px-4 py-3 font-medium">Referencia</th>
                    <th className="px-4 py-3 font-medium">Estado</th>
                    <th className="px-4 py-3 font-medium text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row) => (
                    <tr key={row.id} className="border-b last:border-0">
                      <td className="px-4 py-3 text-muted-foreground">{formatDateTimeEc(row.reportedAt)}</td>
                      <td className="px-4 py-3 font-medium">{row.saleLabel}</td>
                      <td className="px-4 py-3">{row.cashierName}</td>
                      <td className="px-4 py-3">{row.destinationAccountName}</td>
                      <td className="px-4 py-3 tabular-nums">
                        {formatUsdFromCents(row.amountCents)}
                        {!isTransferAccredited(row.status) ? (
                          <span className="ml-1 text-xs text-muted-foreground">(no acreditado)</span>
                        ) : null}
                      </td>
                      <td className="px-4 py-3 font-mono text-xs">
                        <span className="inline-flex items-center gap-1">
                          {row.reference}
                          {row.duplicateReferenceWarningIds.length > 0 ? (
                            <AlertTriangle className="h-3.5 w-3.5 text-warning" aria-label="Posible duplicado" />
                          ) : null}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <TransferStatusBadge status={row.status} />
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Button asChild variant="ghost" size="sm">
                          <Link to={`/app/empresa/transferencias/${row.id}`}>
                            <Eye className="mr-1 h-4 w-4" />
                            Ver
                          </Link>
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        ) : null}
      </div>
    </RoleDashboardShell>
  );
}
