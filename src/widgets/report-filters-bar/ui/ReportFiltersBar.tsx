import type { FilterOptions } from "@/entities/commercial-report/api/commercial-reports-repository";
import type { ReportQuery } from "@/entities/commercial-report/model/report-filters";
import { SelectField } from "@/shared/ui/select-field";
import { Label } from "@/shared/ui/label";

type ReportFiltersBarProps = {
  query: ReportQuery;
  options: FilterOptions;
  onChange: (patch: Partial<ReportQuery>) => void;
  showCompare?: boolean;
};

export function ReportFiltersBar({ query, options, onChange, showCompare = true }: ReportFiltersBarProps) {
  return (
    <div className="grid gap-4 rounded-lg border bg-card p-4 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6">
      <div className="space-y-2">
        <Label htmlFor="dateFrom">Desde</Label>
        <input
          id="dateFrom"
          type="date"
          value={query.dateFrom}
          onChange={(e) => onChange({ dateFrom: e.target.value })}
          className="flex h-9 w-full rounded-md border px-2 text-sm"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="dateTo">Hasta</Label>
        <input
          id="dateTo"
          type="date"
          value={query.dateTo}
          onChange={(e) => onChange({ dateTo: e.target.value })}
          className="flex h-9 w-full rounded-md border px-2 text-sm"
        />
      </div>
      <SelectField
        id="branch"
        label="Sucursal"
        value={query.branchId ?? ""}
        onChange={(v) => onChange({ branchId: v || null })}
        options={[{ value: "", label: "Todas" }, ...options.branches]}
      />
      <SelectField
        id="register"
        label="Caja"
        value={query.registerId ?? ""}
        onChange={(v) => onChange({ registerId: v || null })}
        options={[{ value: "", label: "Todas" }, ...options.registers]}
      />
      <SelectField
        id="cashier"
        label="Usuario / cajero"
        value={query.cashierId ?? ""}
        onChange={(v) => onChange({ cashierId: v || null })}
        options={[{ value: "", label: "Todos" }, ...options.cashiers]}
      />
      <SelectField
        id="payment"
        label="Medio de pago"
        value={query.paymentMethod}
        onChange={(v) =>
          onChange({
            paymentMethod: v as ReportQuery["paymentMethod"],
          })
        }
        options={[
          { value: "all", label: "Todos" },
          { value: "cash", label: "Efectivo" },
          { value: "transfer_reported", label: "Transfer. reportada" },
          { value: "transfer_confirmed", label: "Transfer. confirmada" },
        ]}
      />
      {showCompare ? (
        <SelectField
          id="compare"
          label="Comparar"
          value={query.compare}
          onChange={(v) => onChange({ compare: v as ReportQuery["compare"] })}
          options={[
            { value: "none", label: "Sin comparación" },
            { value: "previous", label: "Período anterior" },
          ]}
        />
      ) : null}
    </div>
  );
}
