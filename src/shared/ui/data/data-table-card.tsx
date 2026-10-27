import { Card, CardContent } from "@/shared/ui/card";

type DataTableCardProps = {
  toolbar: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
};

/** Card + franja de filtros + cuerpo (tabla). Mismo patrón en todos los listados. */
export function DataTableCard({ toolbar, children, footer }: DataTableCardProps) {
  return (
    <Card className="overflow-hidden">
      {toolbar}
      <CardContent className="space-y-3 p-4 pt-3">
        {children}
        {footer}
      </CardContent>
    </Card>
  );
}
