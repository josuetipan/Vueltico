import { formatUsd } from "@/shared/lib/format";
import { PageHeader } from "@/shared/presentation/components/layout/page-header";
import { RoleDashboardShell } from "@/shared/presentation/components/layout/role-dashboard-shell";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/presentation/components/ui/card";
import { Badge } from "@/shared/presentation/components/ui/badge";

const kpis = [
  { label: "Empresas activas", value: "128", trend: "+6 este mes" },
  { label: "MRR simulado", value: formatUsd(48250), trend: "+4.2%" },
  { label: "Usuarios totales", value: "1.940", trend: "Multi-tenant" },
  { label: "Incidencias abiertas", value: "3", trend: "Prioridad media" },
];

export default function SuperadminDashboardPage() {
  return (
    <RoleDashboardShell
      breadcrumbs={[
        { label: "Plataforma", href: "/app/superadmin" },
        { label: "Panel general" },
      ]}
    >
      <div className="mx-auto max-w-7xl space-y-8">
        <PageHeader
          title="Panel de plataforma"
          description="Visión consolidada del ecosistema multiempresa. Métricas y entidades con datos ficticios para el prototipo."
        />
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {kpis.map((kpi) => (
            <Card key={kpi.label}>
              <CardHeader className="pb-2">
                <CardDescription>{kpi.label}</CardDescription>
                <CardTitle className="text-2xl tabular-nums">{kpi.value}</CardTitle>
              </CardHeader>
              <CardContent>
                <Badge variant="success">{kpi.trend}</Badge>
              </CardContent>
            </Card>
          ))}
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Próximos módulos</CardTitle>
            <CardDescription>
              Las pantallas de empresas, planes, auditoría y configuración se
              integrarán en iteraciones siguientes usando la misma arquitectura
              feature-first.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Utilice la navegación lateral para explorar rutas habilitadas. Los
            ítems marcados como «Próx.» permanecen deshabilitados hasta su
            implementación.
          </CardContent>
        </Card>
      </div>
    </RoleDashboardShell>
  );
}
