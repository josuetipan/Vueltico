import { ZoomIn, ZoomOut } from "lucide-react";
import { useState } from "react";
import { formatDateTimeEc } from "@/shared/lib/format";
import { Button } from "@/shared/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/ui/card";

type ReceiptViewerProps = {
  fileName: string;
  mimeType: string;
  previewUrl: string;
  uploadedAt: string;
  expiresAt: string;
  legalHold: boolean;
};

export function ReceiptViewer({
  fileName,
  mimeType,
  previewUrl,
  uploadedAt,
  expiresAt,
  legalHold,
}: ReceiptViewerProps) {
  const [zoom, setZoom] = useState(1);

  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between gap-4 space-y-0">
        <div>
          <CardTitle className="text-base">Comprobante</CardTitle>
          <CardDescription>Vista segura · sin OCR · no acredita pago</CardDescription>
        </div>
        <div className="flex gap-1">
          <Button
            type="button"
            variant="outline"
            size="icon"
            aria-label="Alejar"
            onClick={() => setZoom((z) => Math.max(0.5, z - 0.25))}
          >
            <ZoomOut className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="outline"
            size="icon"
            aria-label="Acercar"
            onClick={() => setZoom((z) => Math.min(2.5, z + 0.25))}
          >
            <ZoomIn className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <dl className="grid gap-2 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-muted-foreground">Archivo</dt>
            <dd className="font-medium">{fileName}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Tipo</dt>
            <dd>{mimeType}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Subido</dt>
            <dd>{formatDateTimeEc(uploadedAt)}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Expira</dt>
            <dd>
              {legalHold ? "Retención legal (sin expiración)" : formatDateTimeEc(expiresAt)}
            </dd>
          </div>
        </dl>
        <div className="overflow-auto rounded-lg border bg-muted/30 p-4">
          <img
            src={previewUrl}
            alt={`Vista previa ${fileName}`}
            className="mx-auto max-w-full origin-center transition-transform"
            style={{ transform: `scale(${zoom})` }}
          />
        </div>
      </CardContent>
    </Card>
  );
}
