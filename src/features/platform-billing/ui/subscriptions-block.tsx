import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import type { SubscriptionStatus } from "@/entities/organization/model/organization";
import { OrganizationStatusBadge } from "@/entities/organization/ui/organization-status-badge";
import { listPlansForSelect } from "@/entities/plan";
import { billingCycleLabel, type SubscriptionListItem } from "@/entities/subscription/model/subscription";
import { PAYMENT_METHODS, paymentMethodLabel } from "@/entities/invoice/model/invoice";
import { billingUseCases } from "@/features/platform-billing/api/billing-composition";
import { BillingSubnav } from "@/features/platform-billing/ui/billing-subnav";
import { Button } from "@/shared/ui/button";
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
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/dialog";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { SUBSCRIPTION_STATUSES } from "@/entities/organization/model/organization";

type ActionKind = "pay" | "plan" | "extend" | null;

export function SubscriptionsBlock() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<SubscriptionStatus | "all">("all");
  const [planId, setPlanId] = useState<string | "all">("all");
  const [page, setPage] = useState(1);
  const [actionKind, setActionKind] = useState<ActionKind>(null);
  const [selected, setSelected] = useState<SubscriptionListItem | null>(null);
  const [newPlanId, setNewPlanId] = useState("");
  const [newPeriodEnd, setNewPeriodEnd] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<(typeof PAYMENT_METHODS)[number]>("BANK_TRANSFER");
  const [receiptPreview, setReceiptPreview] = useState<string | null>(null);
  const [paymentNotes, setPaymentNotes] = useState("");

  const planOptions = useMemo(
    () => [{ value: "all", label: "Todos los planes" }, ...listPlansForSelect().map((p) => ({ value: p.id, label: p.name }))],
    [],
  );

  const query = useQuery({
    queryKey: ["billing", "subscriptions", { search, status, planId, page }],
    queryFn: () =>
      billingUseCases.listSubscriptions({
        page,
        pageSize: TABLE_PAGE_SIZE,
        search,
        status,
        planId,
      }),
  });

  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey: ["billing"] });
    void queryClient.invalidateQueries({ queryKey: ["organizations"] });
  };

  const payMutation = useMutation({
    mutationFn: () => {
      if (!selected) throw new Error("NO_SELECTION");
      return billingUseCases.registerManualPayment({
        subscriptionId: selected.id,
        paymentMethod,
        receiptDataUrl: receiptPreview,
        notes: paymentNotes,
      });
    },
    onSuccess: () => {
      toast.success("Pago registrado: suscripción ACTIVE y factura PAID");
      closeAction();
      invalidate();
    },
    onError: () => toast.error("No se pudo registrar el pago."),
  });

  const planMutation = useMutation({
    mutationFn: () => {
      if (!selected) throw new Error("NO_SELECTION");
      return billingUseCases.changeSubscriptionPlan(selected.id, newPlanId);
    },
    onSuccess: () => {
      toast.success("Plan actualizado");
      closeAction();
      invalidate();
    },
    onError: () => toast.error("No se pudo cambiar el plan."),
  });

  const extendMutation = useMutation({
    mutationFn: () => {
      if (!selected) throw new Error("NO_SELECTION");
      return billingUseCases.extendSubscriptionPeriod(selected.id, newPeriodEnd);
    },
    onSuccess: () => {
      toast.success("Fecha de vencimiento actualizada");
      closeAction();
      invalidate();
    },
    onError: () => toast.error("Fecha inválida."),
  });

  const cancelMutation = useMutation({
    mutationFn: (id: string) => billingUseCases.cancelSubscription(id),
    onSuccess: () => {
      toast.success("Suscripción cancelada");
      invalidate();
    },
    onError: () => toast.error("No se pudo cancelar."),
  });

  function openAction(kind: ActionKind, row: SubscriptionListItem) {
    setSelected(row);
    setActionKind(kind);
    setNewPlanId(row.planId);
    setNewPeriodEnd(row.currentPeriodEnd.slice(0, 10));
    setPaymentMethod("BANK_TRANSFER");
    setReceiptPreview(null);
    setPaymentNotes("");
  }

  function closeAction() {
    setActionKind(null);
    setSelected(null);
  }

  function onReceiptFile(file: File | undefined) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") setReceiptPreview(reader.result);
    };
    reader.readAsDataURL(file);
  }

  return (
    <div className="space-y-6">
      <BillingSubnav />
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Suscripciones y facturación</h1>
        <p className="text-sm text-muted-foreground">
          Estado contractual de cada tenant; renovaciones y pagos manuales (sin pasarela).
        </p>
      </div>

      <Card className="overflow-hidden">
        <DataTableToolbar
          searchPlaceholder="Empresa, RUC o plan…"
          searchValue={search}
          onSearchChange={(v) => {
            setSearch(v);
            setPage(1);
          }}
          filters={
            <>
              <SelectField
                id="sub-status"
                variant="toolbar"
                label="Estado"
                value={status}
                onChange={(v) => {
                  setStatus(v as SubscriptionStatus | "all");
                  setPage(1);
                }}
                options={[
                  { value: "all", label: "Todos" },
                  ...SUBSCRIPTION_STATUSES.map((s) => ({
                    value: s,
                    label: s,
                  })),
                ]}
              />
              <SelectField
                id="sub-plan"
                variant="toolbar"
                label="Plan"
                value={planId}
                onChange={(v) => {
                  setPlanId(v);
                  setPage(1);
                }}
                options={planOptions}
              />
            </>
          }
        />
        <CardContent className="p-0">
          {query.isLoading ? (
            <StatePanel variant="loading" title="Cargando suscripciones…" className="border-0" />
          ) : query.isError ? (
            <StatePanel variant="error" title="Error al cargar" className="border-0" />
          ) : (
            <>
              <DataTableShell>
                <table className="w-full min-w-[960px] text-sm">
                  <thead className={dataTableHeadClass}>
                    <tr>
                      <th className={dataTableThClass}>Empresa</th>
                      <th className={dataTableThClass}>Plan</th>
                      <th className={dataTableThClass}>Ciclo</th>
                      <th className={dataTableThClass}>Monto</th>
                      <th className={dataTableThClass}>Estado</th>
                      <th className={dataTableThClass}>Renovación / expira</th>
                      <th className={dataTableThClass}>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(query.data?.data ?? []).map((row) => (
                      <tr key={row.id} className="border-b border-border/60">
                        <td className={dataTableTdClass}>
                          <p className="font-medium">{row.organizationTradeName}</p>
                          <p className="text-xs text-muted-foreground">{row.organizationTaxId}</p>
                        </td>
                        <td className={dataTableTdClass}>{row.planName}</td>
                        <td className={dataTableTdClass}>{billingCycleLabel(row.billingCycle)}</td>
                        <td className={dataTableTdClass}>{formatUsd(row.amountUsd)}</td>
                        <td className={dataTableTdClass}>
                          <OrganizationStatusBadge status={row.status} />
                        </td>
                        <td className={dataTableTdClass}>{formatDateEc(row.currentPeriodEnd)}</td>
                        <td className={dataTableTdClass}>
                          <div className="flex flex-wrap gap-1">
                            <Button type="button" variant="outline" size="sm" asChild>
                              <Link
                                to={`/app/superadmin/facturas?org=${row.organizationId}`}
                              >
                                Ver facturas
                              </Link>
                            </Button>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => openAction("pay", row)}
                            >
                              Registrar pago
                            </Button>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => openAction("plan", row)}
                            >
                              Cambiar plan
                            </Button>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => openAction("extend", row)}
                            >
                              Extender
                            </Button>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="text-destructive"
                              onClick={() => cancelMutation.mutate(row.id)}
                            >
                              Cancelar
                            </Button>
                          </div>
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

      <Dialog open={actionKind !== null} onOpenChange={(o) => !o && closeAction()}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {actionKind === "pay"
                ? "Registrar pago manual"
                : actionKind === "plan"
                  ? "Cambiar plan"
                  : "Extender periodo"}
            </DialogTitle>
          </DialogHeader>
          {selected ? (
            <p className="text-sm text-muted-foreground">{selected.organizationTradeName}</p>
          ) : null}

          {actionKind === "pay" ? (
            <div className="space-y-3">
              <SelectField
                id="pay-method"
                label="Método de pago"
                value={paymentMethod}
                onChange={(v) => setPaymentMethod(v as typeof paymentMethod)}
                options={PAYMENT_METHODS.map((m) => ({ value: m, label: paymentMethodLabel(m) }))}
              />
              <div className="space-y-1.5">
                <Label htmlFor="pay-receipt">Comprobante (opcional)</Label>
                <Input
                  id="pay-receipt"
                  type="file"
                  accept="image/*,application/pdf"
                  onChange={(e) => onReceiptFile(e.target.files?.[0])}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="pay-notes">Notas</Label>
                <Input
                  id="pay-notes"
                  value={paymentNotes}
                  onChange={(e) => setPaymentNotes(e.target.value)}
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Genera factura PAID, pone la suscripción en ACTIVE y extiende el periodo (+30 días o
                +1 año según ciclo).
              </p>
            </div>
          ) : null}

          {actionKind === "plan" ? (
            <SelectField
              id="new-plan"
              label="Nuevo plan"
              value={newPlanId}
              onChange={setNewPlanId}
              options={listPlansForSelect().map((p) => ({ value: p.id, label: p.name }))}
            />
          ) : null}

          {actionKind === "extend" ? (
            <div className="space-y-1.5">
              <Label htmlFor="period-end">Nueva fecha de vencimiento</Label>
              <Input
                id="period-end"
                type="date"
                value={newPeriodEnd}
                onChange={(e) => setNewPeriodEnd(e.target.value)}
              />
            </div>
          ) : null}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={closeAction}>
              Cancelar
            </Button>
            <Button
              type="button"
              onClick={() => {
                if (actionKind === "pay") payMutation.mutate();
                if (actionKind === "plan") planMutation.mutate();
                if (actionKind === "extend") extendMutation.mutate();
              }}
              disabled={payMutation.isPending || planMutation.isPending || extendMutation.isPending}
            >
              Confirmar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
