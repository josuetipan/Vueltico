import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { PlanStatusBadge, type PlanStatus, type SaasPlan } from "@/entities/plan";
import { billingUseCases } from "@/features/platform-billing/api/billing-composition";
import { PlanFormDialog } from "@/features/platform-billing/ui/plan-form-dialog";
import { BillingSubnav } from "@/features/platform-billing/ui/billing-subnav";
import { Button } from "@/shared/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { StatePanel } from "@/shared/ui/feedback/state-panel";
import { formatUsd } from "@/shared/lib/format";
import {
  DataTableShell,
  dataTableHeadClass,
  dataTableTdClass,
  dataTableThClass,
} from "@/shared/ui/data/data-table-shell";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/shared/ui/alert-dialog";

export function PlansCatalogBlock() {
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<SaasPlan | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const query = useQuery({
    queryKey: ["billing", "plans"],
    queryFn: () => billingUseCases.listPlansWithCounts(),
  });

  const saveMutation = useMutation({
    mutationFn: async (input: Parameters<typeof billingUseCases.createPlan>[0]) => {
      if (editing) return billingUseCases.updatePlan(editing.id, input);
      return billingUseCases.createPlan(input);
    },
    onSuccess: () => {
      toast.success(editing ? "Plan actualizado" : "Plan creado");
      setDialogOpen(false);
      setEditing(null);
      void queryClient.invalidateQueries({ queryKey: ["billing"] });
      void queryClient.invalidateQueries({ queryKey: ["organizations"] });
    },
    onError: () => toast.error("No se pudo guardar el plan."),
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: PlanStatus }) =>
      billingUseCases.setPlanStatus(id, status),
    onSuccess: () => {
      toast.success("Estado del plan actualizado");
      void queryClient.invalidateQueries({ queryKey: ["billing"] });
    },
    onError: (err: Error) => {
      toast.error(err.message === "PLAN_IN_USE" ? "Hay empresas usando este plan." : "Error al cambiar estado.");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => billingUseCases.deletePlan(id),
    onSuccess: () => {
      toast.success("Plan eliminado");
      setDeleteId(null);
      void queryClient.invalidateQueries({ queryKey: ["billing"] });
    },
    onError: () => toast.error("No se puede eliminar: plan en uso."),
  });

  return (
    <div className="space-y-6">
      <BillingSubnav />
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Catálogo de planes</h1>
          <p className="text-sm text-muted-foreground">
            Oferta comercial del SaaS: precios, límites y módulos por plan.
          </p>
        </div>
        <Button
          type="button"
          onClick={() => {
            setEditing(null);
            setDialogOpen(true);
          }}
        >
          Crear plan
        </Button>
      </div>

      <Card className="overflow-hidden">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Planes</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {query.isLoading ? (
            <StatePanel variant="loading" title="Cargando planes…" className="border-0" />
          ) : query.isError ? (
            <StatePanel variant="error" title="Error al cargar planes" className="border-0" />
          ) : (
            <DataTableShell>
              <table className="w-full min-w-[720px] text-sm">
                <thead className={dataTableHeadClass}>
                  <tr>
                    <th className={dataTableThClass}>Plan</th>
                    <th className={dataTableThClass}>Precio</th>
                    <th className={dataTableThClass}>Límites clave</th>
                    <th className={dataTableThClass}>Empresas activas</th>
                    <th className={dataTableThClass}>Estado</th>
                    <th className={dataTableThClass}>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {(query.data ?? []).map((plan) => (
                    <tr key={plan.id} className="border-b border-border/60">
                      <td className={dataTableTdClass}>
                        <p className="font-medium">{plan.name}</p>
                        <p className="text-xs text-muted-foreground line-clamp-2">{plan.description}</p>
                      </td>
                      <td className={dataTableTdClass}>
                        <p>{formatUsd(plan.priceMonthlyUsd)}/mes</p>
                        <p className="text-xs text-muted-foreground">
                          {formatUsd(plan.priceYearlyUsd)}/año
                          {plan.annualDiscountPercent > 0
                            ? ` (−${plan.annualDiscountPercent}%)`
                            : null}
                        </p>
                      </td>
                      <td className={dataTableTdClass}>
                        <p className="text-xs text-muted-foreground">
                          Máx. {plan.maxUsers} usuarios · {plan.maxTransactionsPerMonth.toLocaleString()}{" "}
                          tx/mes · {plan.maxBankAccounts} cuentas
                        </p>
                      </td>
                      <td className={dataTableTdClass}>{plan.activeOrganizations}</td>
                      <td className={dataTableTdClass}>
                        <PlanStatusBadge status={plan.status} />
                      </td>
                      <td className={dataTableTdClass}>
                        <div className="flex flex-wrap gap-1">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setEditing(plan);
                              setDialogOpen(true);
                            }}
                          >
                            Editar
                          </Button>
                          {plan.status === "ACTIVE" ? (
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                statusMutation.mutate({ id: plan.id, status: "INACTIVE" })
                              }
                            >
                              Desactivar
                            </Button>
                          ) : (
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                statusMutation.mutate({ id: plan.id, status: "ACTIVE" })
                              }
                            >
                              Activar
                            </Button>
                          )}
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="text-destructive"
                            onClick={() => setDeleteId(plan.id)}
                          >
                            Eliminar
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </DataTableShell>
          )}
        </CardContent>
      </Card>

      <PlanFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        editingPlan={editing}
        isPending={saveMutation.isPending}
        onSubmit={(input) => saveMutation.mutate(input)}
      />

      <AlertDialog open={deleteId !== null} onOpenChange={(o) => !o && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar plan?</AlertDialogTitle>
            <AlertDialogDescription>
              Solo es posible si ninguna empresa lo tiene asignado.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteId && deleteMutation.mutate(deleteId)}
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
