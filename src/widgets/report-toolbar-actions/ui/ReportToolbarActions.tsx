import { Download, Printer } from "lucide-react";
import { buildCsv, downloadCsv } from "@/shared/lib/csv";
import { Button } from "@/shared/ui/button";

type ReportToolbarActionsProps = {
  filename: string;
  headers: string[];
  rows: (string | number)[][];
};

export function ReportToolbarActions({ filename, headers, rows }: ReportToolbarActionsProps) {
  return (
    <div className="flex flex-wrap gap-2 print:hidden">
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => downloadCsv(filename, buildCsv(headers, rows))}
      >
        <Download className="mr-2 h-4 w-4" />
        Exportar CSV
      </Button>
      <Button type="button" variant="outline" size="sm" onClick={() => window.print()}>
        <Printer className="mr-2 h-4 w-4" />
        Imprimir
      </Button>
    </div>
  );
}
