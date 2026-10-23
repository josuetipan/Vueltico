import { useQuery } from "@tanstack/react-query";
import {
  Building2,
  CreditCard,
  HardDrive,
  TrendingUp,
  Users,
} from "lucide-react";
import { useMemo, useState } from "react";
import {
  platformAdminUseCases,
  type PeriodDays,
} from "@/features/platform-dashboard/api/platform-admin-api";
import { RoleDashboardShell } from "@/widgets/role-dashboard-shell";
import { PageHeader } from "@/shared/ui/layout/page-header";
import { StatePanel } from "@/shared/ui/feedback/state-panel";
import { formatDateEc, formatUsd } from "@/shared/lib/format";
import { cn } from "@/shared/lib/utils";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/ui/card";

const PERIODS: PeriodDays[] = [7, 30, 90];

function orgStatusBadge(status: "active" | "suspended" | "trial") {
  if (status === "active") return <Badge variant="success">Activa</Badge>;
  if (status === "trial") return <Badge variant="warning">Prueba</Badge>;
  return <Badge variant="secondary">Suspendida</Badge>;
}

export function SuperadminDashboardClient() {
  const [period, setPeriod] = useState<PeriodDays>(30);

  const metricsQuery = useQuery({
    queryKey: ["platform-admin", "metrics", period],
    queryFn: () => platformAdminUseCases.getAggregatedMetrics(period),
  });

  const recentQuery = useQuery({
    queryKey: ["platform-admin", "recent-orgs"],
    queryFn: () => platformAdminUseCases.getRecentOrganizations(5),
  });

  const storagePct = useMemo(() => {
    const m = metricsQuery.data;
    if (!m) return 0;
    return Math.min(100, Math.round((m.storageUsedGb / m.storageCapacityGb) * 100));
  }, [metricsQuery.data]);

  const loading = metricsQuery.isLoading || recentQuery.isLoading;
  const error = metricsQuery.isError || recentQuery.isError;

  return (
    <RoleDashboardShell
      breadcrumbs={[
        { label: "Plataforma", href: "/app/superadmin" },
        { label: "Panel general" },
      ]}
    >
      <div className="w-full max-w-7xl space-y-8">
        <PageHeader
          title="Panel de plataforma"
          description="Indicadores agregados del SaaS (suscripciones, usuarios, almacenamiento). No incluye movimientos financieros internos de cada organización."
          actions={
            <div
              className="flex rounded-lg border p-1"
              role="group"
              aria-label="Filtrar por período"
            >
              {PERIODS.map((days) => (
                <Button
                  key={days}
                  type="button"
                  size="sm"
                  variant={period === days ? "default" : "ghost"}
                  onClick={() => setPeriod(days)}
                >
                  {days} días
                </Button>
              ))}
            </div>
          }
        />

        <Card className="border-border bg-card">
          <CardContent className="py-4 text-sm text-muted-foreground">
            Los importes MRR reflejan facturación estimada de planes a la plataforma.
            Los datos de clientes son conteos y estados operativos, no extractos bancarios
            ni contabilidad interna.
          </CardContent>
        </Card>

        {loading ? (
          <StatePanel
            variant="loading"
            title="Cargando dashboard"
            description="Consultando métricas agregadas…"
          />
        ) : null}

        {error ? (
          <StatePanel
            variant="error"
            title="No se pudieron cargar los datos"
            actionLabel="Reintentar"
            onAction={() => {
              void metricsQuery.refetch();
              void recentQuery.refetch();
            }}
          />
        ) : null}

        {!loading && !error && metricsQuery.data ? (
          <>
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <KpiCard
                icon={Building2}
                label="Organizaciones registradas"
                value={String(metricsQuery.data.totalOrganizations)}
                hint={`+${metricsQuery.data.newOrganizationsInPeriod} nuevas (${period}d)`}
              />
              <KpiCard
                icon={Users}
                label="Activas / prueba / suspendidas"
                value={`${metricsQuery.data.activeOrganizations} / ${metricsQuery.data.trialOrganizations} / ${metricsQuery.data.suspendedOrganizations}`}
              />
              <KpiCard
                icon={CreditCard}
                label="Suscripciones activas"
                value={String(metricsQuery.data.activeSubscriptions)}
                hint={`MRR ${formatUsd(metricsQuery.data.mrrUsd)}`}
              />
              <KpiCard
                icon={HardDrive}
                label="Almacenamiento global"
                value={`${storagePct}%`}
                hint={`${metricsQuery.data.storageUsedGb} GB de ${metricsQuery.data.storageCapacityGb} GB`}
              />
            </div>

            <div className="grid gap-4 lg:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <TrendingUp className="h-4 w-4 text-accent" />
                    Crecimiento de organizaciones
                  </CardTitle>
                  <CardDescription>Total acumulado simulado</CardDescription>
                </CardHeader>
                <CardContent>
                  <SimpleBarChart
                    data={metricsQuery.data.organizationGrowthSeries.map((d) => ({
                      label: d.periodLabel,
                      value: d.total,
                    }))}
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Ingresos recurrentes (MRR)</CardTitle>
                  <CardDescription>Facturación agregada a Vueltico</CardDescription>
                </CardHeader>
                <CardContent>
                  <SimpleBarChart
                    data={metricsQuery.data.platformRevenueSeries.map((d) => ({
                      label: d.monthLabel,
                      value: d.mrrUsd,
                      valueLabel: formatUsd(d.mrrUsd),
                    }))}
                    valueFormatter={(v) => formatUsd(v)}
                  />
                </CardContent>
              </Card>
            </div>

            <div className="grid gap-4 lg:grid-cols-3">
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>Últimas organizaciones registradas</CardTitle>
                  <CardDescription>Altas recientes en la plataforma</CardDescription>
                </CardHeader>
                <CardContent className="overflow-x-auto">
                  {recentQuery.data && recentQuery.data.length > 0 ? (
                    <table className="w-full min-w-[640px] text-sm">
                      <thead>
                        <tr className="border-b text-left text-muted-foreground">
                          <th className="pb-2 font-medium">Organización</th>
                          <th className="pb-2 font-medium">RUC</th>
                          <th className="pb-2 font-medium">Estado</th>
                          <th className="pb-2 font-medium">Plan</th>
                          <th className="pb-2 font-medium">Usuarios</th>
                          <th className="pb-2 font-medium">Registro</th>
                        </tr>
                      </thead>
                      <tbody>
                        {recentQuery.data.map((row) => (
                          <tr key={row.id} className="border-b last:border-0">
                            <td className="py-3 font-medium">{row.tradeName}</td>
                            <td className="py-3 font-mono text-xs">{row.ruc}</td>
                            <td className="py-3">{orgStatusBadge(row.status)}</td>
                            <td className="py-3">{row.planName}</td>
                            <td className="py-3 tabular-nums">{row.activeUsers}</td>
                            <td className="py-3 text-muted-foreground">
                              {formatDateEc(row.registeredAt)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <StatePanel variant="empty" title="Sin organizaciones recientes" />
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Usuarios activos</CardTitle>
                  <CardDescription>Por organización (conteo)</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {metricsQuery.data.activeUsersByOrganization.map((row) => (
                    <div
                      key={row.tradeName}
                      className="flex items-center justify-between text-sm"
                    >
                      <span className="truncate pr-2">{row.tradeName}</span>
                      <span className="font-medium tabular-nums">{row.activeUsers}</span>
                    </div>
                  ))}
                  <p className="border-t pt-3 text-xs text-muted-foreground">
                    Total en plataforma: {metricsQuery.data.activeUsersPlatformWide}
                  </p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Alertas operativas</CardTitle>
                <CardDescription>Límites y eventos de gobernanza</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {metricsQuery.data.operationalAlerts.length === 0 ? (
                  <StatePanel variant="empty" title="Sin alertas" />
                ) : (
                  metricsQuery.data.operationalAlerts.map((alert) => (
                    <div
                      key={alert.id}
                      className={cn(
                        "rounded-lg border px-4 py-3",
                        alert.severity === "critical" && "border-destructive/40 bg-destructive/5",
                        alert.severity === "warning" && "border-warning/40 bg-warning/10",
                        alert.severity === "info" && "bg-muted/30",
                      )}
                    >
                      <p className="text-sm font-medium">{alert.title}</p>
                      <p className="mt-1 text-sm text-muted-foreground">{alert.description}</p>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </>
        ) : null}
      </div>
    </RoleDashboardShell>
  );
}

function SimpleBarChart({
  data,
  valueFormatter,
}: {
  data: { label: string; value: number; valueLabel?: string }[];
  valueFormatter?: (v: number) => string;
}) {
  const max = Math.max(...data.map((d) => d.value), 1);
  return (
    <div className="flex h-56 items-end gap-2 border-b pb-2" role="img" aria-label="Gráfico de barras">
      {data.map((point) => (
        <div key={point.label} className="flex flex-1 flex-col items-center gap-2">
          <span className="text-[10px] text-muted-foreground">
            {point.valueLabel ?? valueFormatter?.(point.value) ?? point.value}
          </span>
          <div
            className="w-full rounded-t-md bg-primary/80"
            style={{ height: `${Math.round((point.value / max) * 100)}%`, minHeight: 4 }}
          />
          <span className="text-xs text-muted-foreground">{point.label}</span>
        </div>
      ))}
    </div>
  );
}

function KpiCard({
  icon: Icon,
  label,
  value,
  hint,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
        <CardDescription>{label}</CardDescription>
        <div className="rounded-md bg-primary/10 p-2 text-primary">
          <Icon className="h-4 w-4" aria-hidden />
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-2xl font-semibold tabular-nums tracking-tight">{value}</p>
        {hint ? <p className="mt-1 text-xs text-muted-foreground">{hint}</p> : null}
      </CardContent>
    </Card>
  );
}
