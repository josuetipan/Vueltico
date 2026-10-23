import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { useState } from "react";
import { toast } from "sonner";
import { getPlanById } from "@/entities/organization/model/organization";
import { organizationsUseCases } from "@/features/organization/api/organizations-composition";
import { suspendErrorMessage } from "@/features/organization/model/suspend-organization";
import { reactivateErrorMessage } from "@/features/organization/model/reactivate-organization";
import { useActorEmail } from "@/features/organization/model/use-actor-email";
import { OrganizationStatusBadge } from "@/entities/organization/ui/organization-status-badge";
import { RoleDashboardShell } from "@/widgets/role-dashboard-shell";
import { PageHeader } from "@/shared/ui/layout/page-header";
import { ConfirmDialog } from "@/shared/ui/feedback/confirm-dialog";
import { StatePanel } from "@/shared/ui/feedback/state-panel";
import { formatDateEc, formatDateTimeEc } from "@/shared/lib/format";
import { Button } from "@/shared/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";

export function OrganizationDetailClient({ organizationId }: { organizationId: string }) {
  const actorEmail = useActorEmail();
  const queryClient = useQueryClient();
  const [confirmSuspend, setConfirmSuspend] = useState(false);
  const [confirmReactivate, setConfirmReactivate] = useState(false);

  const orgQuery = useQuery({
    queryKey: ["organizations", organizationId],
    queryFn: () => organizationsUseCases.getOrganization(organizationId),
  });

  const auditQuery = useQuery({
    queryKey: ["organizations", organizationId, "audit"],
    queryFn: () => organizationsUseCases.getOrganizationAuditLog(organizationId),
    enabled: Boolean(orgQuery.data),
  });

  const suspendMutation = useMutation({
    mutationFn: () => organizationsUseCases.suspendOrganization(organizationId, actorEmail),
    onSuccess: () => {
      toast.success("Organización suspendida");
      void queryClient.invalidateQueries({ queryKey: ["organizations"] });
      setConfirmSuspend(false);
    },
    onError: (e: Error) => toast.error(suspendErrorMessage(e.message)),
  });

  const reactivateMutation = useMutation({
    mutationFn: () => organizationsUseCases.reactivateOrganization(organizationId, actorEmail),
    onSuccess: () => {
      toast.success("Organización reactivada");
      void queryClient.invalidateQueries({ queryKey: ["organizations"] });
      setConfirmReactivate(false);
    },
    onError: (e: Error) => toast.error(reactivateErrorMessage(e.message)),
  });

  const org = orgQuery.data;
  const plan = org ? getPlanById(org.planId) : null;

  return (
    <RoleDashboardShell
      breadcrumbs={[
        { label: "Plataforma", href: "/app/superadmin" },
        { label: "Empresas", href: "/app/superadmin/empresas" },
        { label: org?.tradeName ?? "Detalle" },
      ]}
    >
      <div className="mx-auto max-w-4xl space-y-6">
        {orgQuery.isLoading ? (
          <StatePanel variant="loading" title="Cargando organización" />
        ) : null}
        {orgQuery.isError || (!orgQuery.isLoading && !org) ? (
          <StatePanel variant="error" title="Organización no encontrada" />
        ) : null}

        {org ? (
          <>
            <PageHeader
              title={org.tradeName}
              description={org.legalName}
              actions={
                <div className="flex flex-wrap gap-2">
                  <Button variant="outline" asChild>
                    <Link to={`/app/superadmin/empresas/${org.id}/editar`}>Editar</Link>
                  </Button>
                  <Button variant="outline" asChild>
                    <Link to={`/app/superadmin/empresas/${org.id}/invitar-admin`}>
                      Invitar admin
                    </Link>
                  </Button>
                  {org.status === "suspended" ? (
                    <Button onClick={() => setConfirmReactivate(true)}>Reactivar</Button>
                  ) : (
                    <Button variant="destructive" onClick={() => setConfirmSuspend(true)}>
                      Suspender
                    </Button>
                  )}
                </div>
              }
            />

            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Información general</CardTitle>
                <OrganizationStatusBadge status={org.status} />
              </CardHeader>
              <CardContent className="grid gap-3 text-sm sm:grid-cols-2">
                <Info label="RUC" value={org.ruc} />
                <Info label="Correo" value={org.email} />
                <Info label="Teléfono" value={org.phone} />
                <Info label="Ubicación" value={`${org.city}, ${org.province}, ${org.country}`} />
                <Info label="Plan" value={plan?.name ?? org.planId} />
                <Info label="Registro" value={formatDateEc(org.registeredAt)} />
                <Info label="Usuarios activos" value={String(org.activeUsersCount)} />
                <Info label="Límites" value={`${org.limits.maxUsers} usuarios · ${org.limits.storageGb} GB`} />
                <Info label="Admin principal" value={`${org.admin.fullName} (${org.admin.email})`} />
                <Info label="Aislamiento tenant" value={org.tenantIsolationKey} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Auditoría administrativa</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {auditQuery.isLoading ? <p className="text-sm text-muted-foreground">Cargando…</p> : null}
                {auditQuery.data?.length === 0 ? (
                  <StatePanel variant="empty" title="Sin eventos registrados" />
                ) : null}
                {auditQuery.data?.map((entry) => (
                  <div key={entry.id} className="rounded-lg border px-4 py-3 text-sm">
                    <p className="font-medium">{entry.summary}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatDateTimeEc(entry.occurredAt)} · {entry.actorEmail}
                    </p>
                  </div>
                ))}
              </CardContent>
            </Card>
          </>
        ) : null}
      </div>

      <ConfirmDialog
        open={confirmSuspend}
        onOpenChange={setConfirmSuspend}
        title="Suspender organización"
        description="El acceso quedará bloqueado pero la información se conserva en su tenant aislado."
        confirmLabel="Suspender"
        destructive
        onConfirm={() => suspendMutation.mutate()}
      />
      <ConfirmDialog
        open={confirmReactivate}
        onOpenChange={setConfirmReactivate}
        title="Reactivar organización"
        description="Restaurará el acceso según el estado anterior (activa o prueba)."
        confirmLabel="Reactivar"
        onConfirm={() => reactivateMutation.mutate()}
      />
    </RoleDashboardShell>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-muted-foreground">{label}</p>
      <p className="font-medium">{value}</p>
    </div>
  );
}
