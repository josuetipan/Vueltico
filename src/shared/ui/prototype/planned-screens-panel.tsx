import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/ui/card";
import { Badge } from "@/shared/ui/badge";

export type PlannedScreen = {
  id: string;
  title: string;
  description: string;
  status: "borrador" | "en-diseno" | "revision";
};

type PlannedScreensPanelProps = {
  screens: PlannedScreen[];
};

const statusLabel: Record<PlannedScreen["status"], string> = {
  borrador: "Borrador",
  "en-diseno": "En diseño",
  revision: "Revisión",
};

export function PlannedScreensPanel({ screens }: PlannedScreensPanelProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {screens.map((screen) => (
        <Card key={screen.id} className="border-dashed">
          <CardHeader className="pb-2">
            <div className="flex items-start justify-between gap-2">
              <CardTitle className="text-base">{screen.title}</CardTitle>
              <Badge variant="secondary" className="shrink-0 text-[10px] uppercase">
                {statusLabel[screen.status]}
              </Badge>
            </div>
            <CardDescription>{screen.description}</CardDescription>
          </CardHeader>
          <CardContent className="text-xs text-muted-foreground">
            Pantalla pendiente en esta carpeta de prototipo.
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
