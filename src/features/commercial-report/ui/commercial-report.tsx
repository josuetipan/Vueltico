import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { useSession } from "@/features/auth/model/use-session";
import { commercialReportsUseCases } from "@/features/commercial-report/api/commercial-reports-composition";
import { defaultReportDateRange, type ReportQuery } from "@/entities/commercial-report/model/report-filters";
import { ReportBarChart, ReportLineChart } from "@/widgets/report-charts";
import { ReportFiltersBar } from "@/widgets/report-filters-bar";
import { ReportToolbarActions } from "@/widgets/report-toolbar-actions";
import { ReportsNav } from "@/widgets/reports-nav";
import { RoleDashboardShell } from "@/widgets/role-dashboard-shell";
import { PageHeader } from "@/shared/ui/layout/page-header";
import { StatePanel } from "@/shared/ui/feedback/state-panel";
import { formatDateTimeEc, formatUsdFromCents } from "@/shared/lib/format";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/ui/card";

export type CommercialReportKind =
  | "analytical_dashboard"
  | "daily_sales"
  | "income_expense"
  | "payment_methods"
  | "by_branch"
  | "by_cashier"
  | "closures"
  | "transfers";

const TITLES: Record<CommercialReportKind, { title: string; description: string }> = {
  analytical_dashboard: {
    title: "Reportes · Dashboard analítico",
    description: "Resumen ejecutivo sin jerga contable. Ventas registradas vs cobros por medio.",
  },
  daily_sales: {
    title: "Reporte diario de ventas",
    description: "Ventas registradas por día en el período seleccionado.",
  },
  income_expense: {
    title: "Ingresos y egresos",
    description: "Movimientos registrados además de ventas (no sustituye contabilidad formal).",
  },
  payment_methods: {
    title: "Reporte por medio de pago",
    description: "Efectivo, transferencias reportadas y confirmadas sin duplicar pagos mixtos.",
  },
  by_branch: { title: "Reporte por sucursal", description: "Desempeño comercial por local." },
  by_cashier: { title: "Reporte por cajero", description: "Ventas registradas por usuario operativo." },
  closures: {
    title: "Cierres y diferencias de caja",
    description: "Arqueos con faltante, sobrante o cuadrado.",
  },
  transfers: {
    title: "Transferencias pendientes y confirmadas",
    description: "Estado de verificación bancaria (reportado ≠ acreditado hasta confirmar).",
  },
};

export function CommercialReportClient({ kind }: { kind: CommercialReportKind }) {
  const { session } = useSession();
  const tenantId = session?.tenant?.id ?? "";
  const defaults = useMemo(() => defaultReportDateRange(), []);
  const [query, setQuery] = useState<ReportQuery>({
    tenantId,
    dateFrom: defaults.dateFrom,
    dateTo: defaults.dateTo,
    branchId: null,
    registerId: null,
    cashierId: null,
    paymentMethod: "all",
    compare: "previous",
  });

  const effectiveQuery = { ...query, tenantId };

  const reportQuery = useQuery({
    queryKey: ["commercial-reports", kind, effectiveQuery],
    queryFn: async () => {
      switch (kind) {
        case "analytical_dashboard":
          return commercialReportsUseCases.getAnalyticalDashboard(effectiveQuery);
        case "daily_sales":
          return commercialReportsUseCases.getDailySales(effectiveQuery);
        case "income_expense":
          return commercialReportsUseCases.getIncomeExpense(effectiveQuery);
        case "payment_methods":
          return commercialReportsUseCases.getPaymentMethods(effectiveQuery);
        case "by_branch":
          return commercialReportsUseCases.getByBranch(effectiveQuery);
        case "by_cashier":
          return commercialReportsUseCases.getByCashier(effectiveQuery);
        case "closures":
          return commercialReportsUseCases.getClosures(effectiveQuery);
        case "transfers":
          return commercialReportsUseCases.getTransfers(effectiveQuery);
      }
    },
    enabled: Boolean(tenantId),
  });

  const meta = TITLES[kind];
  const data = reportQuery.data;
  const filterOptions = data?.filterOptions ?? { branches: [], registers: [], cashiers: [] };

  if (!session?.tenant) {
    return (
      <RoleDashboardShell breadcrumbs={[{ label: "Empresa", href: "/app/empresa" }, { label: "Reportes" }]}>
        <StatePanel variant="empty" title="Sin organización" />
      </RoleDashboardShell>
    );
  }

  return (
    <RoleDashboardShell
      breadcrumbs={[
        { label: "Empresa", href: "/app/empresa" },
        { label: "Reportes", href: "/app/empresa/reportes" },
        { label: meta.title.replace("Reportes · ", "").replace("Reporte ", "") },
      ]}
    >
      <div className="report-print mx-auto max-w-7xl space-y-6">
        <PageHeader title={meta.title} description={meta.description} />
        <ReportsNav />
        <ReportFiltersBar
          query={effectiveQuery}
          options={filterOptions}
          onChange={(patch) => setQuery((q) => ({ ...q, ...patch, tenantId }))}
          showCompare={kind === "analytical_dashboard" || kind === "daily_sales"}
        />

        {reportQuery.isLoading ? <StatePanel variant="loading" title="Generando reporte" /> : null}
        {reportQuery.isError ? (
          <StatePanel variant="error" title="Error" actionLabel="Reintentar" onAction={() => void reportQuery.refetch()} />
        ) : null}

        {data ? <ReportBody kind={kind} data={data} /> : null}
      </div>
    </RoleDashboardShell>
  );
}

function ReportBody({ kind, data }: { kind: CommercialReportKind; data: unknown }) {
  switch (kind) {
    case "analytical_dashboard":
      return (
        <div className="space-y-6">
          <AnalyticalView
            data={data as Awaited<ReturnType<typeof commercialReportsUseCases.getAnalyticalDashboard>>}
          />
        </div>
      );
    case "daily_sales":
      return (
        <div className="space-y-6">
          <DailySalesView data={data as Awaited<ReturnType<typeof commercialReportsUseCases.getDailySales>>} />
        </div>
      );
    case "income_expense":
      return (
        <div className="space-y-6">
          <IncomeExpenseView
            data={data as Awaited<ReturnType<typeof commercialReportsUseCases.getIncomeExpense>>}
          />
        </div>
      );
    case "payment_methods":
      return (
        <div className="space-y-6">
          <PaymentMethodsView
            data={data as Awaited<ReturnType<typeof commercialReportsUseCases.getPaymentMethods>>}
          />
        </div>
      );
    case "by_branch":
      return (
        <div className="space-y-6">
          <BranchView data={data as Awaited<ReturnType<typeof commercialReportsUseCases.getByBranch>>} />
        </div>
      );
    case "by_cashier":
      return (
        <div className="space-y-6">
          <CashierView data={data as Awaited<ReturnType<typeof commercialReportsUseCases.getByCashier>>} />
        </div>
      );
    case "closures":
      return (
        <div className="space-y-6">
          <ClosuresView data={data as Awaited<ReturnType<typeof commercialReportsUseCases.getClosures>>} />
        </div>
      );
    case "transfers":
      return (
        <div className="space-y-6">
          <TransfersView data={data as Awaited<ReturnType<typeof commercialReportsUseCases.getTransfers>>} />
        </div>
      );
  }
}

function KpiGrid({
  items,
}: {
  items: { label: string; value: string; hint?: string; delta?: number | null }[];
}) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {items.map((k) => (
        <Card key={k.label}>
          <CardHeader className="pb-2">
            <CardDescription>{k.label}</CardDescription>
            <CardTitle className="text-2xl tabular-nums">{k.value}</CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-muted-foreground">
            {k.delta != null ? (
              <span className={k.delta >= 0 ? "text-success" : "text-destructive"}>
                {k.delta >= 0 ? "+" : ""}
                {k.delta}% vs período anterior
              </span>
            ) : null}
            {k.hint ? <p className="mt-1">{k.hint}</p> : null}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function AnalyticalView({
  data,
}: {
  data: Awaited<ReturnType<typeof commercialReportsUseCases.getAnalyticalDashboard>>;
}) {
  const k = data.comparison.current;
  const d = data.comparison.changePct;
  return (
    <>
      <KpiGrid
        items={[
          {
            label: "Ventas registradas",
            value: formatUsdFromCents(k.registeredSalesCents),
            delta: d.registeredSalesCents ?? null,
          },
          {
            label: "Cobro en efectivo",
            value: formatUsdFromCents(k.cashCollectedCents),
            delta: d.cashCollectedCents ?? null,
          },
          {
            label: "Transfer. reportadas",
            value: formatUsdFromCents(k.transferReportedCents),
            hint: "Aún no acreditadas en banco",
            delta: d.transferReportedCents ?? null,
          },
          {
            label: "Transfer. confirmadas",
            value: formatUsdFromCents(k.transferConfirmedCents),
            delta: d.transferConfirmedCents ?? null,
          },
        ]}
      />
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Ventas por día</CardTitle>
          </CardHeader>
          <CardContent>
            <ReportBarChart data={data.dailySales.map((p) => ({ label: p.label, valueCents: p.valueCents }))} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Medios de pago</CardTitle>
            <CardDescription>Suma de desgloses (mixtos contados una vez)</CardDescription>
          </CardHeader>
          <CardContent>
            <ReportBarChart
              data={[
                { label: "Efectivo", valueCents: data.paymentBreakdown.cashCents },
                { label: "Trans. report.", valueCents: data.paymentBreakdown.transferReportedCents },
                { label: "Trans. conf.", valueCents: data.paymentBreakdown.transferConfirmedCents },
              ]}
            />
          </CardContent>
        </Card>
      </div>
    </>
  );
}

function DailySalesView({
  data,
}: {
  data: Awaited<ReturnType<typeof commercialReportsUseCases.getDailySales>>;
}) {
  const csvRows = data.rows.map((r) => [
    formatDateTimeEc(r.occurredAt),
    r.label,
    r.branchName,
    (r.totalCents / 100).toFixed(2),
  ]);
  return (
    <>
      <ReportToolbarActions
        filename="ventas-diarias.csv"
        headers={["Fecha", "Venta", "Sucursal", "Total USD"]}
        rows={csvRows}
      />
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Tendencia</CardTitle>
        </CardHeader>
        <CardContent>
          <ReportLineChart data={data.series.map((p) => ({ label: p.label, valueCents: p.valueCents }))} />
        </CardContent>
      </Card>
      <SalesTable rows={data.rows} />
    </>
  );
}

function IncomeExpenseView({
  data,
}: {
  data: Awaited<ReturnType<typeof commercialReportsUseCases.getIncomeExpense>>;
}) {
  return (
    <>
      <KpiGrid
        items={[
          { label: "Ingresos registrados", value: formatUsdFromCents(data.kpis.incomeCents) },
          { label: "Egresos registrados", value: formatUsdFromCents(data.kpis.expenseCents) },
          {
            label: "Resultado simple",
            value: formatUsdFromCents(data.kpis.incomeCents - data.kpis.expenseCents),
            hint: "Ingresos − egresos (operativo)",
          },
        ]}
      />
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Resultado neto diario</CardTitle>
        </CardHeader>
        <CardContent>
          <ReportLineChart data={data.series.map((p) => ({ label: p.label, valueCents: p.valueCents }))} />
        </CardContent>
      </Card>
    </>
  );
}

function PaymentMethodsView({
  data,
}: {
  data: Awaited<ReturnType<typeof commercialReportsUseCases.getPaymentMethods>>;
}) {
  return (
    <>
      <ReportBarChart
        data={[
          { label: "Efectivo", valueCents: data.breakdown.cashCents },
          { label: "Reportada", valueCents: data.breakdown.transferReportedCents },
          { label: "Confirmada", valueCents: data.breakdown.transferConfirmedCents },
        ]}
      />
      <SalesTable rows={data.rows} />
    </>
  );
}

function BranchView({ data }: { data: Awaited<ReturnType<typeof commercialReportsUseCases.getByBranch>> }) {
  return (
    <Card>
      <CardContent className="overflow-x-auto pt-6">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b text-left text-muted-foreground">
              <th className="pb-2">Sucursal</th>
              <th className="pb-2">Ventas</th>
              <th className="pb-2">Efectivo</th>
            </tr>
          </thead>
          <tbody>
            {data.rows.map((r) => (
              <tr key={r.branchName} className="border-b">
                <td className="py-2">{r.branchName}</td>
                <td className="py-2 tabular-nums">{formatUsdFromCents(r.salesCents)}</td>
                <td className="py-2 tabular-nums">{formatUsdFromCents(r.cashCents)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </CardContent>
    </Card>
  );
}

function CashierView({ data }: { data: Awaited<ReturnType<typeof commercialReportsUseCases.getByCashier>> }) {
  return (
    <Card>
      <CardContent className="overflow-x-auto pt-6">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b text-left text-muted-foreground">
              <th className="pb-2">Cajero</th>
              <th className="pb-2">Tickets</th>
              <th className="pb-2">Ventas</th>
            </tr>
          </thead>
          <tbody>
            {data.rows.map((r) => (
              <tr key={r.cashierName} className="border-b">
                <td className="py-2">{r.cashierName}</td>
                <td className="py-2 tabular-nums">{r.ticketCount}</td>
                <td className="py-2 tabular-nums">{formatUsdFromCents(r.salesCents)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </CardContent>
    </Card>
  );
}

function ClosuresView({
  data,
}: {
  data: Awaited<ReturnType<typeof commercialReportsUseCases.getClosures>>;
}) {
  return (
    <Card>
      <CardContent className="overflow-x-auto pt-6">
        <table className="w-full min-w-[720px] text-sm">
          <thead>
            <tr className="border-b text-left text-muted-foreground">
              <th className="pb-2">Cierre</th>
              <th className="pb-2">Sucursal</th>
              <th className="pb-2">Caja</th>
              <th className="pb-2">Esperado</th>
              <th className="pb-2">Contado</th>
              <th className="pb-2">Diferencia</th>
            </tr>
          </thead>
          <tbody>
            {data.rows.map((r) => (
              <tr key={r.id} className="border-b">
                <td className="py-2">{formatDateTimeEc(r.closedAt)}</td>
                <td className="py-2">{r.branchName}</td>
                <td className="py-2">{r.registerName}</td>
                <td className="py-2 tabular-nums">{formatUsdFromCents(r.expectedCashCents)}</td>
                <td className="py-2 tabular-nums">{formatUsdFromCents(r.countedCashCents)}</td>
                <td className="py-2 tabular-nums">{formatUsdFromCents(r.differenceCents)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </CardContent>
    </Card>
  );
}

function TransfersView({
  data,
}: {
  data: Awaited<ReturnType<typeof commercialReportsUseCases.getTransfers>>;
}) {
  return (
    <>
      <KpiGrid
        items={[
          { label: "Pendientes / en revisión", value: formatUsdFromCents(data.summary.pendingCents) },
          { label: "Confirmadas", value: formatUsdFromCents(data.summary.confirmedCents) },
          { label: "Rechazadas", value: formatUsdFromCents(data.summary.rejectedCents) },
        ]}
      />
      <Card>
        <CardContent className="overflow-x-auto pt-6">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-muted-foreground">
                <th className="pb-2">Fecha</th>
                <th className="pb-2">Venta</th>
                <th className="pb-2">Importe</th>
                <th className="pb-2">Estado</th>
              </tr>
            </thead>
            <tbody>
              {data.rows.map((r) => (
                <tr key={r.id} className="border-b">
                  <td className="py-2">{formatDateTimeEc(r.reportedAt)}</td>
                  <td className="py-2">{r.saleId}</td>
                  <td className="py-2 tabular-nums">{formatUsdFromCents(r.amountCents)}</td>
                  <td className="py-2">{r.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </>
  );
}

function SalesTable({
  rows,
}: {
  rows: {
    occurredAt: string;
    label: string;
    branchName: string;
    registerName: string;
    cashierName: string;
    totalCents: number;
    cashCents: number;
    transferReportedCents: number;
    transferConfirmedCents: number;
  }[];
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Detalle</CardTitle>
      </CardHeader>
      <CardContent className="overflow-x-auto">
        <table className="w-full min-w-[900px] text-sm">
          <thead>
            <tr className="border-b text-left text-muted-foreground">
              <th className="pb-2">Fecha</th>
              <th className="pb-2">Venta</th>
              <th className="pb-2">Sucursal</th>
              <th className="pb-2">Total</th>
              <th className="pb-2">Efectivo</th>
              <th className="pb-2">Trans. rep.</th>
              <th className="pb-2">Trans. conf.</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.label + r.occurredAt} className="border-b">
                <td className="py-2">{formatDateTimeEc(r.occurredAt)}</td>
                <td className="py-2">{r.label}</td>
                <td className="py-2">{r.branchName}</td>
                <td className="py-2 tabular-nums">{formatUsdFromCents(r.totalCents)}</td>
                <td className="py-2 tabular-nums">{formatUsdFromCents(r.cashCents)}</td>
                <td className="py-2 tabular-nums">{formatUsdFromCents(r.transferReportedCents)}</td>
                <td className="py-2 tabular-nums">{formatUsdFromCents(r.transferConfirmedCents)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </CardContent>
    </Card>
  );
}
