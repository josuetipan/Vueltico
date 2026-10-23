import { formatUsd } from "@/shared/lib/format";
import { PageHeader } from "@/shared/ui/layout/page-header";
import { RoleDashboardShell } from "@/widgets/role-dashboard-shell";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/ui/card";

const kpis = [
  { label: "Saldo disponible", value: formatUsd(128450.32) },
  { label: "Por cobrar (30 días)", value: formatUsd(38420.0) },
  { label: "Operaciones hoy", value: "47" },
  { label: "Usuarios activos", value: "12" },
];

export function CompanyDashboardPage() {
  return (
    <RoleDashboardShell
      breadcrumbs={[
        { label: "Empresa", href: "/app/empresa" },
        { label: "Panel general" },
      ]}
    >
      <div className="mx-auto max-w-7xl space-y-8">
        <PageHeader
          title="Panel de empresa"
          description="Resumen operativo para administradores. Datos de demostración en USD con contexto ecuatoriano."
        />
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {kpis.map((kpi) => (
            <Card key={kpi.label}>
              <CardHeader className="pb-2">
                <CardDescription>{kpi.label}</CardDescription>
                <CardTitle className="text-2xl tabular-nums">{kpi.value}</CardTitle>
              </CardHeader>
              <CardContent className="text-xs text-muted-foreground">
                Simulado · no vinculado a backend
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </RoleDashboardShell>
  );
}
