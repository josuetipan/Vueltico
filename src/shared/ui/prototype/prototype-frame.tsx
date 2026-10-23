import { Link } from "react-router-dom";
import { ArrowLeft, FlaskConical } from "lucide-react";
import { cn } from "@/shared/lib/utils";
import { Badge } from "@/shared/ui/badge";

type PrototypeFrameProps = {
  moduleLabel: string;
  children: React.ReactNode;
  className?: string;
};

export function PrototypeFrame({ moduleLabel, children, className }: PrototypeFrameProps) {
  return (
    <div className="min-h-screen bg-muted/30">
      <div className="border-b border-amber-200/80 bg-amber-50 text-amber-950 dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-100">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-2.5 text-sm">
          <div className="flex items-center gap-2">
            <FlaskConical className="h-4 w-4 shrink-0" aria-hidden />
            <span className="font-medium">Modo prototipo</span>
            <Badge variant="outline" className="border-amber-300/80 bg-white/60 dark:bg-black/20">
              {moduleLabel}
            </Badge>
          </div>
          <p className="text-xs text-amber-900/80 dark:text-amber-100/80">
            UI y flujos de demostración · sin lógica de negocio definitiva
          </p>
          <Link
            to="/prototipos"
            className="inline-flex items-center gap-1 font-medium underline-offset-2 hover:underline"
          >
            <ArrowLeft className="h-3.5 w-3.5" aria-hidden />
            Índice de módulos
          </Link>
        </div>
      </div>
      <div className={cn("mx-auto max-w-6xl px-4 py-8 lg:px-8", className)}>{children}</div>
    </div>
  );
}
