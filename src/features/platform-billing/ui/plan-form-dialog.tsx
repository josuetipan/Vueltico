import { useEffect, useState } from "react";
import { PLAN_STATUSES, type SaasPlan } from "@/entities/plan";
import {
  draftToUpsertInput,
  emptyPlanDraft,
  planToDraft,
  recalcDiscountFromPrices,
  type PlanFormDraft,
} from "@/features/platform-billing/model/plan-form";
import { Button } from "@/shared/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/dialog";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { SelectField } from "@/shared/ui/select-field";

type PlanFormDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingPlan: SaasPlan | null;
  onSubmit: (draft: ReturnType<typeof draftToUpsertInput>) => void;
  isPending: boolean;
};

export function PlanFormDialog({
  open,
  onOpenChange,
  editingPlan,
  onSubmit,
  isPending,
}: PlanFormDialogProps) {
  const [draft, setDraft] = useState<PlanFormDraft>(() => emptyPlanDraft());

  useEffect(() => {
    if (!open) return;
    setDraft(editingPlan ? planToDraft(editingPlan) : emptyPlanDraft("DRAFT"));
  }, [open, editingPlan]);

  function patch(partial: Partial<PlanFormDraft>) {
    setDraft((prev) => {
      const next = { ...prev, ...partial };
      if ("priceMonthlyUsd" in partial || "priceYearlyUsd" in partial) {
        return recalcDiscountFromPrices(next);
      }
      return next;
    });
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!draft.name.trim()) return;
    onSubmit(draftToUpsertInput(draft));
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-lg overflow-y-auto">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{editingPlan ? "Editar plan" : "Crear plan"}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="plan-name">Nombre del plan</Label>
              <Input
                id="plan-name"
                value={draft.name}
                onChange={(e) => patch({ name: e.target.value })}
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="plan-desc">Descripción corta</Label>
              <Input
                id="plan-desc"
                value={draft.description}
                onChange={(e) => patch({ description: e.target.value })}
              />
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="plan-monthly">Precio mensual (USD)</Label>
                <Input
                  id="plan-monthly"
                  type="number"
                  min={0}
                  step="0.01"
                  value={draft.priceMonthlyUsd}
                  onChange={(e) => patch({ priceMonthlyUsd: e.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="plan-yearly">Precio anual (USD)</Label>
                <Input
                  id="plan-yearly"
                  type="number"
                  min={0}
                  step="0.01"
                  value={draft.priceYearlyUsd}
                  onChange={(e) => patch({ priceYearlyUsd: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="plan-discount">Descuento anual (%)</Label>
              <Input
                id="plan-discount"
                type="number"
                min={0}
                max={100}
                step="0.1"
                value={draft.annualDiscountPercent}
                onChange={(e) => patch({ annualDiscountPercent: e.target.value })}
              />
              <p className="text-xs text-muted-foreground">
                Se recalcula al cambiar precios; puede ajustarse manualmente.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="plan-users">Límite usuarios</Label>
                <Input
                  id="plan-users"
                  type="number"
                  min={1}
                  value={draft.maxUsers}
                  onChange={(e) => patch({ maxUsers: e.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="plan-tx">Transacciones / mes</Label>
                <Input
                  id="plan-tx"
                  type="number"
                  min={0}
                  value={draft.maxTransactionsPerMonth}
                  onChange={(e) => patch({ maxTransactionsPerMonth: e.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="plan-accounts">Cuentas bancarias / cajas</Label>
                <Input
                  id="plan-accounts"
                  type="number"
                  min={0}
                  value={draft.maxBankAccounts}
                  onChange={(e) => patch({ maxBankAccounts: e.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="plan-branches">Sucursales</Label>
                <Input
                  id="plan-branches"
                  type="number"
                  min={0}
                  value={draft.maxBranches}
                  onChange={(e) => patch({ maxBranches: e.target.value })}
                />
              </div>
            </div>

            <fieldset className="space-y-2 rounded-md border border-border p-3">
              <legend className="px-1 text-sm font-medium">Módulos habilitados</legend>
              {(
                [
                  ["basicReports", "Reportes básicos"],
                  ["exportExcelPdf", "Exportación Excel/PDF"],
                  ["bulkTransfers", "Transferencias masivas (bulk)"],
                  ["apiWebhooks", "Acceso API / Webhooks"],
                ] as const
              ).map(([key, label]) => (
                <label key={key} className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={draft.features[key]}
                    onChange={(e) =>
                      patch({
                        features: { ...draft.features, [key]: e.target.checked },
                      })
                    }
                    className="h-4 w-4 rounded border-input"
                  />
                  {label}
                </label>
              ))}
            </fieldset>

            <div className="space-y-1.5">
              <Label htmlFor="plan-gateway">ID producto pasarela (opcional)</Label>
              <Input
                id="plan-gateway"
                value={draft.gatewayProductId}
                onChange={(e) => patch({ gatewayProductId: e.target.value })}
                placeholder="price_… / prod_…"
              />
            </div>

            <SelectField
              id="plan-status"
              label="Estado"
              value={draft.status}
              onChange={(v) => patch({ status: v as PlanFormDraft["status"] })}
              options={PLAN_STATUSES.map((s) => ({
                value: s,
                label: s === "ACTIVE" ? "Activo" : s === "INACTIVE" ? "Inactivo" : "Borrador",
              }))}
            />
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isPending}>
              {editingPlan ? "Guardar cambios" : "Crear plan"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
