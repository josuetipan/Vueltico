import { Link } from "react-router-dom";
import { FlaskConical } from "lucide-react";
import { PROTOTYPE_MODULES } from "@/pages/prototypes/config/registry";
import { PageHeader } from "@/shared/ui/layout/page-header";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/ui/card";
import { Button } from "@/shared/ui/button";

export function PrototypeHubPage() {
  return (
    <div className="min-h-screen bg-background px-4 py-10 lg:px-8">
      <div className="mx-auto max-w-5xl space-y-8">
        <PageHeader
          title="Prototipos por módulo"
          description="Prototipos por dominio (capa pages/prototypes). La implementación definitiva sigue Feature-Sliced Design en entities, features, widgets y pages."
          actions={
            <Button variant="outline" asChild>
              <Link to="/login">App con sesión demo</Link>
            </Button>
          }
        />
        <div className="flex items-start gap-3 rounded-lg border border-dashed bg-muted/40 p-4 text-sm text-muted-foreground">
          <FlaskConical className="mt-0.5 h-5 w-5 shrink-0 text-primary" aria-hidden />
          <p>
            Convención FSD: diseñe en{" "}
            <code className="rounded bg-muted px-1 py-0.5 text-xs">pages/prototypes/&lt;dominio&gt;/</code>
            ; luego modele en{" "}
            <code className="rounded bg-muted px-1 py-0.5 text-xs">entities/</code>, acciones en{" "}
            <code className="rounded bg-muted px-1 py-0.5 text-xs">features/</code>, bloques en{" "}
            <code className="rounded bg-muted px-1 py-0.5 text-xs">widgets/</code> y pantallas en{" "}
            <code className="rounded bg-muted px-1 py-0.5 text-xs">pages/</code>.
          </p>
        </div>
        <ul className="grid gap-4 sm:grid-cols-2">
          {PROTOTYPE_MODULES.map((mod) => {
            const Icon = mod.icon;
            return (
              <li key={mod.id}>
                <Card className="h-full transition-colors hover:border-primary/40">
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <span className="flex h-9 w-9 items-center justify-center rounded-md bg-primary/10 text-primary">
                        <Icon className="h-5 w-5" aria-hidden />
                      </span>
                      <div>
                        <CardTitle className="text-lg">{mod.name}</CardTitle>
                        <CardDescription className="text-xs">{mod.audience}</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground">{mod.description}</p>
                    <p className="font-mono text-[11px] text-muted-foreground">{mod.folder}</p>
                    <Button asChild className="w-full sm:w-auto">
                      <Link to={mod.path}>Abrir prototipo</Link>
                    </Button>
                  </CardContent>
                </Card>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
