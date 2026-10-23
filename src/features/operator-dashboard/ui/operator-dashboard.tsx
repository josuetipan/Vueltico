import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { Bell, ClipboardList, Receipt, Wallet } from "lucide-react";
import { operatorPortalUseCases } from "@/features/operator-portal/api/operator-portal-composition";
import { useOperatorContext } from "@/features/operator-portal/model/use-operator-context";
import { OperatorPermissionGate } from "@/features/operator-portal/ui/operator-permission-gate";
import { RoleDashboardShell } from "@/widgets/role-dashboard-shell";
import { PageHeader } from "@/shared/ui/layout/page-header";
import { StatePanel } from "@/shared/ui/feedback/state-panel";
import { formatUsdFromCents, formatDateTimeEc } from "@/shared/lib/format";
import { Button } from "@/shared/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";

export function OperatorDashboardClient() {
  const { session, profile } = useOperatorContext();
  const userId = session?.id ?? "";
  const tenantId = session?.tenant?.id ?? "";

  const dashboardQuery = useQuery({
    queryKey: ["operator-portal", "dashboard", userId, tenantId],
    queryFn: () => operatorPortalUseCases.getDashboard(userId, tenantId),
    enabled: Boolean(userId && tenantId && profile),
  });

  return (
    <OperatorPermissionGate permission="dashboard:view">
      <RoleDashboardShell
        breadcrumbs={[
          { label: "Operaciones", href: "/app/operativo" },
          { label: "Mi panel" },
        ]}
      >
        <div className="mx-auto max-w-3xl space-y-6 lg:max-w-5xl">
          <PageHeader
            title={`Hola, ${profile?.displayName ?? "operador"}`}
            description={`${profile?.branchName ?? ""} · ${profile?.roleLabel ?? ""}. Solo verá datos de su organización y alcance asignado.`}
          />

          {dashboardQuery.isLoading ? <StatePanel variant="loading" title="Cargando panel" /> : null}
          {dashboardQuery.isError ? (
            <StatePanel variant="error" title="Error al cargar" actionLabel="Reintentar" onAction={() => void dashboardQuery.refetch()} />
          ) : null}

          {dashboardQuery.data ? (
            <>
              <div className="grid gap-3 sm:grid-cols-2">
                <KpiCard
                  label="Ventas hoy (registradas)"
                  value={formatUsdFromCents(dashboardQuery.data.salesTodayCents)}
                />
                <KpiCard
                  label="Solicitudes pendientes"
                  value={String(dashboardQuery.data.pendingRequestsCount)}
                />
                <KpiCard
                  label="Notificaciones sin leer"
                  value={String(dashboardQuery.data.unreadNotifications)}
                />
                <KpiCard
                  label="Turno"
                  value={dashboardQuery.data.openShiftLabel ?? "Sin caja abierta"}
                />
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Accesos rápidos</CardTitle>
                </CardHeader>
                <CardContent className="grid gap-2 sm:grid-cols-2">
                  <QuickLink href="/app/operativo/movimientos/nuevo" icon={Wallet} label="Registrar movimiento" />
                  <QuickLink href="/app/operativo/movimientos" icon={ClipboardList} label="Mis movimientos" />
                  {profile?.enabledFeatures.cashier ? (
                    <QuickLink href="/app/operativo/ventas" icon={Receipt} label="Mis ventas" />
                  ) : null}
                  <QuickLink href="/app/operativo/notificaciones" icon={Bell} label="Notificaciones" />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Actividad reciente</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  {dashboardQuery.data.recentActivity.map((a) => (
                    <p key={a.id} className="text-muted-foreground">
                      {formatDateTimeEc(a.at)} — {a.summary}
                    </p>
                  ))}
                </CardContent>
              </Card>
            </>
          ) : null}
        </div>
      </RoleDashboardShell>
    </OperatorPermissionGate>
  );
}

function KpiCard({ label, value }: { label: string; value: string }) {
  return (
    <Card>
      <CardContent className="pt-4">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-xl font-semibold tabular-nums">{value}</p>
      </CardContent>
    </Card>
  );
}

function QuickLink({
  href,
  icon: Icon,
  label,
}: {
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
}) {
  return (
    <Button asChild variant="outline" className="h-12 justify-start text-base">
      <Link to={href}>
        <Icon className="mr-2 h-5 w-5" />
        {label}
      </Link>
    </Button>
  );
}
