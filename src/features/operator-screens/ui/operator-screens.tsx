import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { operatorPortalUseCases } from "@/features/operator-portal/api/operator-portal-composition";
import { useOperatorContext } from "@/features/operator-portal/model/use-operator-context";
import { OperatorPermissionGate } from "@/features/operator-portal/ui/operator-permission-gate";
import { mockReceiptPreviewUrl } from "@/entities/transfer-payment/api/mock-receipt-preview";
import { mockSessionRepository } from "@/entities/session/api/mock-session-repository";
import { useSession } from "@/features/auth/model/use-session";
import { RoleDashboardShell } from "@/widgets/role-dashboard-shell";
import { PageHeader } from "@/shared/ui/layout/page-header";
import { StatePanel } from "@/shared/ui/feedback/state-panel";
import { formatDateTimeEc, formatUsdFromCents } from "@/shared/lib/format";
import { Button } from "@/shared/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { SelectField } from "@/shared/ui/select-field";
import type { OperatorPermission } from "@/entities/operator/model/permissions";

function useOperatorIds() {
  const { session } = useSession();
  return { userId: session?.id ?? "", tenantId: session?.tenant?.id ?? "" };
}

function Shell({
  permission,
  title,
  description,
  breadcrumbs,
  children,
}: {
  permission: OperatorPermission;
  title: string;
  description?: string;
  breadcrumbs: { label: string; href?: string }[];
  children: React.ReactNode;
}) {
  return (
    <OperatorPermissionGate permission={permission}>
      <RoleDashboardShell breadcrumbs={breadcrumbs}>
        <div className="mx-auto max-w-3xl space-y-6 lg:max-w-5xl">
          <PageHeader title={title} description={description} />
          {children}
        </div>
      </RoleDashboardShell>
    </OperatorPermissionGate>
  );
}

export function OperatorOrganizationClient() {
  const { tenants, session } = useOperatorContext();
  const { setSession } = useSession();
  const queryClient = useQueryClient();

  async function switchTenant(tenantId: string) {
    const t = tenants.find((x) => x.id === tenantId);
    if (!session || !t) return;
    const next = await mockSessionRepository.save({ ...session, tenant: t });
    setSession(next);
    toast.success(`Organización: ${t.tradeName}`);
    void queryClient.invalidateQueries({ queryKey: ["operator"] });
  }

  return (
    <Shell
      permission="organization:switch"
      title="Organización activa"
      description="Seleccione la empresa con la que operará. Solo verá datos de la organización elegida."
      breadcrumbs={[
        { label: "Operaciones", href: "/app/operativo" },
        { label: "Organización" },
      ]}
    >
      {tenants.length <= 1 ? (
        <StatePanel variant="empty" title="Una sola organización" description="No requiere cambio." />
      ) : (
        <div className="grid gap-3">
          {tenants.map((t) => (
            <Card key={t.id}>
              <CardContent className="flex flex-wrap items-center justify-between gap-3 py-4">
                <div>
                  <p className="font-medium">{t.tradeName}</p>
                  <p className="text-xs text-muted-foreground">{t.ruc}</p>
                </div>
                <Button
                  type="button"
                  variant={session?.tenant?.id === t.id ? "default" : "outline"}
                  onClick={() => void switchTenant(t.id)}
                >
                  {session?.tenant?.id === t.id ? "Activa" : "Usar"}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </Shell>
  );
}

export function OperatorAccountsClient() {
  const { userId, tenantId } = useOperatorIds();
  const q = useQuery({
    queryKey: ["operator", "accounts", userId, tenantId],
    queryFn: () => operatorPortalUseCases.listAuthorizedAccounts(userId, tenantId),
    enabled: Boolean(userId && tenantId),
  });

  return (
    <Shell
      permission="accounts:view"
      title="Cuentas autorizadas"
      description="Cuentas a las que puede acceder según su rol. Números enmascarados."
      breadcrumbs={[{ label: "Operaciones", href: "/app/operativo" }, { label: "Cuentas" }]}
    >
      {q.isLoading ? <StatePanel variant="loading" title="Cargando" /> : null}
      {q.data?.map((a) => (
        <Card key={a.id}>
          <CardContent className="py-4">
            <p className="font-medium">{a.name}</p>
            <p className="text-sm text-muted-foreground">{a.maskedNumber}</p>
          </CardContent>
        </Card>
      ))}
    </Shell>
  );
}

export function OperatorMovementsClient() {
  const { userId, tenantId } = useOperatorIds();
  const q = useQuery({
    queryKey: ["operator", "movements", userId, tenantId],
    queryFn: () => operatorPortalUseCases.listMyMovements(userId, tenantId),
    enabled: Boolean(userId && tenantId),
  });

  return (
    <Shell
      permission="movements:view_own"
      title="Mis movimientos"
      breadcrumbs={[{ label: "Operaciones", href: "/app/operativo" }, { label: "Movimientos" }]}
    >
      <Button asChild className="w-full sm:w-auto">
        <Link to="/app/operativo/movimientos/nuevo">Registrar movimiento</Link>
      </Button>
      {q.data?.map((m) => (
        <Card key={m.id}>
          <CardContent className="space-y-2 py-4 text-sm">
            <div className="flex justify-between gap-2">
              <span className="font-medium">{m.description}</span>
              <span className="tabular-nums">{formatUsdFromCents(m.amountCents)}</span>
            </div>
            <p className="text-muted-foreground">
              {formatDateTimeEc(m.occurredAt)} · {m.accountName} · {m.status === "pending_approval" ? "Pendiente" : "Registrado"}
              {m.receiptAttached ? " · Comprobante adjunto" : ""}
            </p>
            {!m.receiptAttached && m.status === "pending_approval" ? (
              <AttachReceiptInline movementId={m.id} />
            ) : null}
          </CardContent>
        </Card>
      ))}
    </Shell>
  );
}

function AttachReceiptInline({ movementId }: { movementId: string }) {
  const { userId, tenantId } = useOperatorIds();
  const qc = useQueryClient();
  const [preview, setPreview] = useState<string | null>(null);
  const mutation = useMutation({
    mutationFn: (fileName: string) =>
      operatorPortalUseCases.attachReceipt(userId, tenantId, movementId, fileName),
    onSuccess: () => {
      toast.success("Comprobante adjunto (vista previa)");
      void qc.invalidateQueries({ queryKey: ["operator", "movements"] });
    },
  });

  return (
    <div className="rounded-md border border-dashed p-3">
      <Label htmlFor={`file-${movementId}`} className="text-xs">
        Adjuntar comprobante (solo vista previa)
      </Label>
      <Input
        id={`file-${movementId}`}
        type="file"
        accept="image/*"
        className="mt-2"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (!f) return;
          setPreview(mockReceiptPreviewUrl(f.name));
          mutation.mutate(f.name);
        }}
      />
      {preview ? (
        <img src={preview} alt="Vista previa" className="mt-2 max-h-40 rounded-md border" />
      ) : null}
    </div>
  );
}

export function OperatorNewMovementClient() {
  const { userId, tenantId } = useOperatorIds();
  const navigate = useNavigate();
  const accountsQuery = useQuery({
    queryKey: ["operator", "accounts", userId, tenantId],
    queryFn: () => operatorPortalUseCases.listAuthorizedAccounts(userId, tenantId),
    enabled: Boolean(userId && tenantId),
  });
  const [accountId, setAccountId] = useState("");
  const [type, setType] = useState<"income" | "expense">("expense");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");

  const mutation = useMutation({
    mutationFn: () =>
      operatorPortalUseCases.createMovement(userId, tenantId, {
        accountId: accountId || "acc-caja",
        type,
        amountCents: Math.round(parseFloat(amount) * 100),
        description,
      }),
    onSuccess: () => {
      toast.success("Enviado a aprobación del supervisor");
      navigate("/app/operativo/solicitudes");
    },
    onError: () => toast.error("No se pudo registrar. Verifique permisos e importe."),
  });

  return (
    <Shell
      permission="movements:create"
      title="Registrar movimiento"
      description="Quedará pendiente de aprobación. No modifica saldos hasta autorización."
      breadcrumbs={[
        { label: "Operaciones", href: "/app/operativo" },
        { label: "Movimientos", href: "/app/operativo/movimientos" },
        { label: "Nuevo" },
      ]}
    >
      <form
        className="space-y-4"
        onSubmit={(e) => {
          e.preventDefault();
          mutation.mutate();
        }}
      >
        <SelectField
          id="acc"
          label="Cuenta"
          value={accountId || accountsQuery.data?.[0]?.id || ""}
          onChange={setAccountId}
          options={(accountsQuery.data ?? []).map((a) => ({ value: a.id, label: a.name }))}
        />
        <SelectField
          id="type"
          label="Tipo"
          value={type}
          onChange={(v) => setType(v as "income" | "expense")}
          options={[
            { value: "income", label: "Ingreso" },
            { value: "expense", label: "Egreso" },
          ]}
        />
        <div className="space-y-2">
          <Label htmlFor="amount">Importe USD</Label>
          <Input id="amount" type="number" step="0.01" min="0.01" required value={amount} onChange={(e) => setAmount(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="desc">Descripción</Label>
          <Input id="desc" required value={description} onChange={(e) => setDescription(e.target.value)} />
        </div>
        <Button type="submit" className="w-full" size="lg" disabled={mutation.isPending}>
          Enviar solicitud
        </Button>
      </form>
    </Shell>
  );
}

export function OperatorSalesClient() {
  const { userId, tenantId } = useOperatorIds();
  const q = useQuery({
    queryKey: ["operator", "sales", userId, tenantId],
    queryFn: () => operatorPortalUseCases.listMySales(userId, tenantId),
    enabled: Boolean(userId && tenantId),
  });

  return (
    <Shell
      permission="sales:view_own"
      title="Mis ventas"
      breadcrumbs={[{ label: "Operaciones", href: "/app/operativo" }, { label: "Ventas" }]}
    >
      {q.data?.map((s) => (
        <Card key={s.id}>
          <CardContent className="flex justify-between py-4">
            <div>
              <p className="font-medium">{s.label}</p>
              <p className="text-xs text-muted-foreground">{formatDateTimeEc(s.occurredAt)}</p>
              <p className="text-xs text-muted-foreground">{s.paymentSummary}</p>
            </div>
            <p className="font-semibold tabular-nums">{formatUsdFromCents(s.totalCents)}</p>
          </CardContent>
        </Card>
      ))}
    </Shell>
  );
}

export function OperatorShiftsClient() {
  const { userId, tenantId } = useOperatorIds();
  const q = useQuery({
    queryKey: ["operator", "shifts", userId, tenantId],
    queryFn: () => operatorPortalUseCases.listMyShifts(userId, tenantId),
    enabled: Boolean(userId && tenantId),
  });

  return (
    <Shell
      permission="shifts:view_own"
      title="Mis turnos"
      breadcrumbs={[{ label: "Operaciones", href: "/app/operativo" }, { label: "Turnos" }]}
    >
      {q.data?.map((s) => (
        <Card key={s.id}>
          <CardContent className="py-4 text-sm">
            <p className="font-medium">
              {s.registerName} · {s.status === "open" ? "Abierto" : s.status === "closed" ? "Cerrado" : "Pendiente cierre"}
            </p>
            <p className="text-muted-foreground">
              Apertura {formatDateTimeEc(s.openedAt)} · Fondo {formatUsdFromCents(s.openingFloatCents)}
            </p>
          </CardContent>
        </Card>
      ))}
    </Shell>
  );
}

export function OperatorRequestsClient() {
  const { userId, tenantId } = useOperatorIds();
  const q = useQuery({
    queryKey: ["operator", "requests", userId, tenantId],
    queryFn: () => operatorPortalUseCases.listPendingRequests(userId, tenantId),
    enabled: Boolean(userId && tenantId),
  });

  return (
    <Shell
      permission="requests:view_own"
      title="Mis solicitudes pendientes"
      breadcrumbs={[{ label: "Operaciones", href: "/app/operativo" }, { label: "Solicitudes" }]}
    >
      {q.data?.length === 0 ? <StatePanel variant="empty" title="Sin pendientes" /> : null}
      {q.data?.map((r) => (
        <Card key={r.id}>
          <CardContent className="py-4">
            <p className="font-medium">{r.title}</p>
            <p className="text-sm text-muted-foreground">{formatDateTimeEc(r.submittedAt)} · {r.status}</p>
          </CardContent>
        </Card>
      ))}
    </Shell>
  );
}

export function OperatorNotificationsClient() {
  const { userId, tenantId } = useOperatorIds();
  const qc = useQueryClient();
  const q = useQuery({
    queryKey: ["operator", "notifications", userId, tenantId],
    queryFn: () => operatorPortalUseCases.listNotifications(userId, tenantId),
    enabled: Boolean(userId && tenantId),
  });

  return (
    <Shell
      permission="notifications:view"
      title="Notificaciones"
      breadcrumbs={[{ label: "Operaciones", href: "/app/operativo" }, { label: "Notificaciones" }]}
    >
      {q.data?.map((n) => (
        <Card key={n.id} className={n.read ? "opacity-70" : ""}>
          <CardContent className="flex flex-wrap items-start justify-between gap-2 py-4">
            <div>
              <p className="font-medium">{n.title}</p>
              <p className="text-sm text-muted-foreground">{n.body}</p>
              <p className="text-xs text-muted-foreground">{formatDateTimeEc(n.at)}</p>
            </div>
            {!n.read ? (
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  void operatorPortalUseCases.markNotificationRead(userId, tenantId, n.id).then(() =>
                    qc.invalidateQueries({ queryKey: ["operator", "notifications"] }),
                  );
                }}
              >
                Marcar leída
              </Button>
            ) : null}
          </CardContent>
        </Card>
      ))}
    </Shell>
  );
}

export function OperatorProfileClient() {
  const { userId, tenantId } = useOperatorIds();
  const q = useQuery({
    queryKey: ["operator", "profile-settings", userId, tenantId],
    queryFn: () => operatorPortalUseCases.getAccountSettings(userId, tenantId),
    enabled: Boolean(userId && tenantId),
  });
  const [phone, setPhone] = useState("");
  const mutation = useMutation({
    mutationFn: () => operatorPortalUseCases.updateAccountSettings(userId, tenantId, { phone }),
    onSuccess: () => toast.success("Preferencias guardadas"),
  });

  useEffect(() => {
    if (q.data?.phone) setPhone(q.data.phone);
  }, [q.data?.phone]);

  return (
    <Shell
      permission="profile:edit"
      title="Mi perfil"
      description="Datos de cuenta operativa. No incluye gestión de planes ni administradores."
      breadcrumbs={[{ label: "Operaciones", href: "/app/operativo" }, { label: "Perfil" }]}
    >
      {q.data ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Información</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm">
              <span className="text-muted-foreground">Nombre:</span> {q.data.fullName}
            </p>
            <p className="text-sm">
              <span className="text-muted-foreground">Correo:</span> {q.data.email}
            </p>
            <div className="space-y-2">
              <Label htmlFor="phone">Teléfono</Label>
              <Input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
            </div>
            <Button type="button" onClick={() => mutation.mutate()} disabled={mutation.isPending}>
              Guardar
            </Button>
          </CardContent>
        </Card>
      ) : null}
    </Shell>
  );
}
