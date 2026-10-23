import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { AlertTriangle, ArrowLeft } from "lucide-react";
import { useState } from "react";
import { useSession } from "@/features/auth/model/use-session";
import { isTransferAccredited } from "@/entities/transfer-payment/model/transfer-payment";
import { transferReconciliationUseCases } from "@/features/transfer-reconciliation/api/transfer-reconciliation-composition";
import { ReceiptViewer } from "@/widgets/receipt-viewer";
import { TransferStatusBadge } from "@/entities/transfer-payment/ui/transfer-status-badge";
import { RoleDashboardShell } from "@/widgets/role-dashboard-shell";
import { PageHeader } from "@/shared/ui/layout/page-header";
import { ConfirmDialog } from "@/shared/ui/feedback/confirm-dialog";
import { StatePanel } from "@/shared/ui/feedback/state-panel";
import { formatDateTimeEc, formatUsdFromCents } from "@/shared/lib/format";
import { Button } from "@/shared/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/ui/card";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { SelectField } from "@/shared/ui/select-field";

type TransferDetailClientProps = { paymentId: string };

export function TransferDetailClient({ paymentId }: TransferDetailClientProps) {
  const { session } = useSession();
  const tenantId = session?.tenant?.id ?? "";
  const queryClient = useQueryClient();

  const [action, setAction] = useState<"confirm" | "reject" | "mark_in_review" | "defer_verification">("confirm");
  const [verificationSource, setVerificationSource] = useState("authorized_bank_statement");
  const [reason, setReason] = useState("");
  const [notes, setNotes] = useState("");
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const detailQuery = useQuery({
    queryKey: ["transfer-reconciliation", "detail", tenantId, paymentId],
    queryFn: () => transferReconciliationUseCases.getTransferPayment(tenantId, paymentId),
    enabled: Boolean(tenantId),
  });

  const verifyMutation = useMutation({
    mutationFn: () =>
      transferReconciliationUseCases.recordVerification({
        tenantId,
        paymentId,
        action,
        responsibleUserId: session!.id,
        responsibleEmail: session!.email,
        reason,
        notes: notes || undefined,
        verificationSource:
          action === "confirm"
            ? (verificationSource as "authorized_bank_statement" | "banking_portal_manual" | "other_documented")
            : undefined,
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["transfer-reconciliation"] });
      setConfirmOpen(false);
      setFormError(null);
    },
    onError: (e: Error) => setFormError(mapError(e.message)),
  });

  const payment = detailQuery.data;

  const breadcrumbs = [
    { label: "Empresa", href: "/app/empresa" },
    { label: "Transferencias", href: "/app/empresa/transferencias" },
    { label: payment?.saleLabel ?? "Detalle" },
  ];

  function onSubmitVerification(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);
    if (!reason.trim()) {
      setFormError("Indique el motivo de la decisión.");
      return;
    }
    if (action === "confirm" && !verificationSource) {
      setFormError("Seleccione la fuente de verificación bancaria.");
      return;
    }
    setConfirmOpen(true);
  }

  return (
    <RoleDashboardShell breadcrumbs={breadcrumbs}>
      <div className="mx-auto max-w-7xl space-y-6">
        <PageHeader
          title="Detalle de transferencia"
          description="Validación manual contra fuente bancaria autorizada. La foto del comprobante no acredita el pago."
          actions={
            <Button asChild variant="outline" size="sm">
              <Link to="/app/empresa/transferencias">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Volver a bandeja
              </Link>
            </Button>
          }
        />

        {detailQuery.isLoading ? <StatePanel variant="loading" title="Cargando detalle" /> : null}
        {detailQuery.isError ? (
          <StatePanel variant="error" title="No encontrado" description="La transferencia no existe o no pertenece a su organización." />
        ) : null}

        {payment ? (
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex flex-wrap items-center gap-2 text-base">
                    {payment.saleLabel}
                    <TransferStatusBadge status={payment.status} />
                  </CardTitle>
                  <CardDescription>
                    {isTransferAccredited(payment.status)
                      ? "Acreditada en registros internos."
                      : "No acreditada hasta confirmación explícita."}
                  </CardDescription>
                </CardHeader>
                <CardContent className="grid gap-3 text-sm sm:grid-cols-2">
                  <Field label="Fecha reporte" value={formatDateTimeEc(payment.reportedAt)} />
                  <Field label="Cajero" value={payment.cashierName} />
                  <Field label="Cuenta destino" value={payment.destinationAccountName} />
                  <Field label="Banco" value={payment.bankName} />
                  <Field label="Importe reportado" value={formatUsdFromCents(payment.amountCents)} />
                  <Field label="Referencia" value={payment.reference} mono />
                </CardContent>
              </Card>

              {payment.duplicateReferenceWarningIds.length > 0 ? (
                <Card className="border-warning/50 bg-warning/10">
                  <CardContent className="flex gap-3 py-4 text-sm">
                    <AlertTriangle className="h-5 w-5 shrink-0 text-warning" />
                    <div>
                      <p className="font-medium">Posible referencia duplicada</p>
                      <p className="mt-1 text-muted-foreground">
                        Otros pagos comparten una referencia similar ({payment.duplicateReferenceWarningIds.join(", ")}).
                        Verifique en su banco antes de confirmar; no se rechaza automáticamente.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ) : null}

              <ReceiptViewer
                fileName={payment.receiptFileName}
                mimeType={payment.receiptMimeType}
                previewUrl={payment.receiptPreviewUrl}
                uploadedAt={payment.receiptUploadedAt}
                expiresAt={payment.retention.expiresAt}
                legalHold={payment.retention.legalHold}
              />
            </div>

            <div className="space-y-6">
              {payment.status !== "confirmed" && payment.status !== "rejected" ? (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Validación manual</CardTitle>
                    <CardDescription>
                      Confirme solo si verificó en una fuente bancaria autorizada, o indique que aún no puede confirmar.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={onSubmitVerification} className="space-y-4">
                      <SelectField
                        id="action"
                        label="Decisión"
                        value={action}
                        onChange={(v) =>
                          setAction(v as "confirm" | "reject" | "mark_in_review" | "defer_verification")
                        }
                        options={[
                          { value: "confirm", label: "Confirmar acreditación" },
                          { value: "reject", label: "Rechazar" },
                          { value: "mark_in_review", label: "Marcar en revisión" },
                          {
                            value: "defer_verification",
                            label: "Aún no puedo confirmar (pendiente)",
                          },
                        ]}
                      />
                      {action === "confirm" ? (
                        <SelectField
                          id="source"
                          label="Fuente de verificación"
                          value={verificationSource}
                          onChange={setVerificationSource}
                          options={[
                            {
                              value: "authorized_bank_statement",
                              label: "Extracto / estado de cuenta autorizado",
                            },
                            {
                              value: "banking_portal_manual",
                              label: "Portal bancario (consulta manual)",
                            },
                            {
                              value: "other_documented",
                              label: "Otra fuente documentada",
                            },
                          ]}
                        />
                      ) : null}
                      <div className="space-y-2">
                        <Label htmlFor="reason">Motivo *</Label>
                        <Input
                          id="reason"
                          value={reason}
                          onChange={(e) => setReason(e.target.value)}
                          placeholder="Describa la verificación o el motivo del rechazo"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="notes">Notas</Label>
                        <Input id="notes" value={notes} onChange={(e) => setNotes(e.target.value)} />
                      </div>
                      {formError ? (
                        <p className="text-sm text-destructive" role="alert">
                          {formError}
                        </p>
                      ) : null}
                      <Button type="submit" disabled={verifyMutation.isPending}>
                        Registrar decisión
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Decisión registrada</CardTitle>
                    <CardDescription>Este pago ya fue cerrado en la bandeja.</CardDescription>
                  </CardHeader>
                </Card>
              )}

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Historial de decisiones</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {payment.decisions.length === 0 ? (
                    <p className="text-sm text-muted-foreground">Sin decisiones aún.</p>
                  ) : (
                    payment.decisions
                      .slice()
                      .reverse()
                      .map((d) => (
                        <div key={d.id} className="rounded-lg border px-3 py-2 text-sm">
                          <p className="font-medium">{decisionLabel(d.action)}</p>
                          <p className="text-muted-foreground">{formatDateTimeEc(d.at)} · {d.responsibleEmail}</p>
                          <p className="mt-1">{d.reason}</p>
                          {d.verificationSource ? (
                            <p className="mt-1 text-xs text-muted-foreground">Fuente: {d.verificationSource}</p>
                          ) : null}
                        </div>
                      ))
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        ) : null}

        <ConfirmDialog
          open={confirmOpen}
          onOpenChange={setConfirmOpen}
          title="Confirmar registro"
          description="La decisión quedará auditada con su usuario. Las transferencias pendientes no se tratarán como acreditadas hasta confirmar."
          confirmLabel="Registrar"
          onConfirm={() => verifyMutation.mutate()}
          destructive={action === "reject"}
        />
      </div>
    </RoleDashboardShell>
  );
}

function Field({
  label,
  value,
  mono,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div>
      <p className="text-muted-foreground">{label}</p>
      <p className={mono ? "font-mono text-xs" : "font-medium"}>{value}</p>
    </div>
  );
}

function decisionLabel(action: string): string {
  switch (action) {
    case "confirm":
      return "Confirmada";
    case "reject":
      return "Rechazada";
    case "mark_in_review":
      return "En revisión";
    case "defer_verification":
      return "Verificación diferida";
    default:
      return action;
  }
}

function mapError(code: string): string {
  switch (code) {
    case "REASON_REQUIRED":
      return "El motivo es obligatorio.";
    case "VERIFICATION_SOURCE_REQUIRED":
      return "Indique la fuente bancaria al confirmar.";
    case "INVALID_TRANSITION":
      return "No se puede cambiar el estado en esta etapa.";
    default:
      return "No se pudo registrar la decisión.";
  }
}
