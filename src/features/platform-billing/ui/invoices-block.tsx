import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  INVOICE_PAYMENT_STATUSES,
  paymentMethodLabel,
  type InvoicePaymentStatus,
} from "@/entities/invoice/model/invoice";
import { InvoicePaymentStatusBadge } from "@/entities/invoice/ui/invoice-payment-status-badge";
import { billingUseCases } from "@/features/platform-billing/api/billing-composition";
import { BillingSubnav } from "@/features/platform-billing/ui/billing-subnav";
import { Card, CardContent } from "@/shared/ui/card";
import { DataTableToolbar } from "@/shared/ui/data/data-table-toolbar";
import { TablePagination } from "@/shared/ui/data/table-pagination";
import { StatePanel } from "@/shared/ui/feedback/state-panel";
import { formatDateEc, formatUsd } from "@/shared/lib/format";
import { SelectField } from "@/shared/ui/select-field";
import { TABLE_PAGE_SIZE } from "@/shared/lib/table-pagination";
import {
  DataTableShell,
  dataTableHeadClass,
  dataTableTdClass,
  dataTableThClass,
} from "@/shared/ui/data/data-table-shell";
import { Button } from "@/shared/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/dialog";

export function InvoicesBlock() {
  const [searchParams] = useSearchParams();
  const orgFilter = searchParams.get("org") ?? "";
  const [search, setSearch] = useState("");
  const [paymentStatus, setPaymentStatus] = useState<InvoicePaymentStatus | "all">("all");
  const [page, setPage] = useState(1);
  const [receiptUrl, setReceiptUrl] = useState<string | null>(null);

  const query = useQuery({
    queryKey: ["billing", "invoices", { search, orgFilter, paymentStatus, page }],
    queryFn: () =>
      billingUseCases.listInvoices({
        page,
        pageSize: TABLE_PAGE_SIZE,
        search,
        organizationId: orgFilter || undefined,
        paymentStatus,
      }),
  });

  return (
    <div className="space-y-6">
      <BillingSubnav />
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Historial de facturas</h1>
        <p className="text-sm text-muted-foreground">
          Auditoría de cobros: comprobantes y estado de pago por empresa.
        </p>
      </div>

      <Card className="overflow-hidden">
        <DataTableToolbar
          searchPlaceholder="Nº factura, empresa o RUC…"
          searchValue={search}
          onSearchChange={(v) => {
            setSearch(v);
            setPage(1);
          }}
          filters={
            <SelectField
              id="inv-status"
              variant="toolbar"
              label="Estado pago"
              value={paymentStatus}
              onChange={(v) => {
                setPaymentStatus(v as InvoicePaymentStatus | "all");
                setPage(1);
              }}
              options={[
                { value: "all", label: "Todos" },
                ...INVOICE_PAYMENT_STATUSES.map((s) => ({ value: s, label: s })),
              ]}
            />
          }
        />
        <CardContent className="p-0">
          {query.isLoading ? (
            <StatePanel variant="loading" title="Cargando facturas…" className="border-0" />
          ) : query.isError ? (
            <StatePanel variant="error" title="Error al cargar" className="border-0" />
          ) : (
            <>
              <DataTableShell>
                <table className="w-full min-w-[880px] text-sm">
                  <thead className={dataTableHeadClass}>
                    <tr>
                      <th className={dataTableThClass}>Factura</th>
                      <th className={dataTableThClass}>Empresa</th>
                      <th className={dataTableThClass}>Emisión</th>
                      <th className={dataTableThClass}>Vencimiento</th>
                      <th className={dataTableThClass}>Monto</th>
                      <th className={dataTableThClass}>Estado</th>
                      <th className={dataTableThClass}>Método</th>
                      <th className={dataTableThClass}>Comprobante</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(query.data?.data ?? []).map((row) => (
                      <tr key={row.id} className="border-b border-border/60">
                        <td className={dataTableTdClass}>
                          <span className="font-mono text-xs">{row.number}</span>
                        </td>
                        <td className={dataTableTdClass}>
                          <p className="font-medium">{row.organizationTradeName}</p>
                          <p className="text-xs text-muted-foreground">{row.organizationTaxId}</p>
                        </td>
                        <td className={dataTableTdClass}>{formatDateEc(row.issuedAt)}</td>
                        <td className={dataTableTdClass}>{formatDateEc(row.dueAt)}</td>
                        <td className={dataTableTdClass}>{formatUsd(row.totalUsd)}</td>
                        <td className={dataTableTdClass}>
                          <InvoicePaymentStatusBadge status={row.paymentStatus} />
                        </td>
                        <td className={dataTableTdClass}>
                          {paymentMethodLabel(row.paymentMethod)}
                        </td>
                        <td className={dataTableTdClass}>
                          {row.receiptDataUrl ? (
                            <Button
                              type="button"
                              variant="link"
                              className="h-auto p-0"
                              onClick={() => setReceiptUrl(row.receiptDataUrl)}
                            >
                              Ver
                            </Button>
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </DataTableShell>
              {query.data?.meta ? (
                <TablePagination
                  page={query.data.meta.page}
                  totalPages={query.data.meta.totalPages}
                  totalItems={query.data.meta.totalItems}
                  pageSize={query.data.meta.pageSize}
                  onPageChange={setPage}
                />
              ) : null}
            </>
          )}
        </CardContent>
      </Card>

      <Dialog open={receiptUrl !== null} onOpenChange={(o) => !o && setReceiptUrl(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Comprobante</DialogTitle>
          </DialogHeader>
          {receiptUrl?.startsWith("data:image") ? (
            <img src={receiptUrl} alt="Comprobante de pago" className="max-h-[70vh] w-full object-contain" />
          ) : receiptUrl ? (
            <a href={receiptUrl} target="_blank" rel="noreferrer" className="text-sm text-primary underline">
              Abrir archivo
            </a>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}
