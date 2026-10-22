import { formatDateEc } from "@/shared/lib/format";
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

const tasks = [
  { title: "Conciliar depósito #1042", status: "Pendiente" as const },
  { title: "Registrar nota de venta", status: "En curso" as const },
  { title: "Validar comprobante recibido", status: "Completada" as const },
];

export default function OperatorDashboardPage() {
  return (
    <RoleDashboardShell
      breadcrumbs={[
        { label: "Operaciones", href: "/app/operativo" },
        { label: "Mi panel" },
      ]}
    >
      <div className="mx-auto max-w-7xl space-y-8">
        <PageHeader
          title="Mi panel operativo"
          description={`Resumen del ${formatDateEc(new Date())}. Tareas ficticias para validar flujos del usuario operativo.`}
        />
        <Card>
          <CardHeader>
            <CardTitle>Tareas destacadas</CardTitle>
            <CardDescription>
              Las acciones detalladas se implementarán por pantalla.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {tasks.map((task) => (
              <div
                key={task.title}
                className="flex flex-wrap items-center justify-between gap-2 rounded-lg border bg-card px-4 py-3"
              >
                <span className="text-sm font-medium">{task.title}</span>
                <Badge
                  variant={
                    task.status === "Completada"
                      ? "success"
                      : task.status === "En curso"
                        ? "warning"
                        : "secondary"
                  }
                >
                  {task.status}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </RoleDashboardShell>
  );
}
