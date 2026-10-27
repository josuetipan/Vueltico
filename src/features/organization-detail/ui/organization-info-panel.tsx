import { Pencil } from "lucide-react";
import { useState } from "react";
import type { Organization } from "@/entities/organization/model/organization";
import { subscriptionStatusLabel } from "@/entities/organization/model/organization";
import { OrganizationStatusBadge } from "@/entities/organization/ui/organization-status-badge";
import { OrganizationEditBlock } from "@/features/organization-edit/ui/organization-edit-block";
import { getPlanById, getPlanLimits } from "@/entities/plan";
import { Button } from "@/shared/ui/button";
import { Card, CardContent } from "@/shared/ui/card";
import {
  DataTableShell,
  dataTableHeadClass,
  dataTableTdClass,
  dataTableThClass,
} from "@/shared/ui/data/data-table-shell";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/dialog";
import { formatDateTimeEc } from "@/shared/lib/format";

type OrganizationInfoPanelProps = {
  organizationId: string;
  org: Organization;
};

export function OrganizationInfoPanel({
  organizationId,
  org,
}: OrganizationInfoPanelProps) {
  const [editOpen, setEditOpen] = useState(false);
  const plan = getPlanById(org.planId);
  const limits = getPlanLimits(org.planId);
  const limitsLabel = `${limits.maxUsers} usu. · ${limits.storageGb} GB · ${limits.maxBranches} suc.`;

  return (
    <section className="space-y-3">
      <div className="space-y-1">
        <h2 className="text-lg font-semibold tracking-tight">
          Información de la empresa
        </h2>
      </div>

      <Card className="overflow-hidden">
        <CardContent className="p-0">
          <DataTableShell
            className="rounded-none border-0"
            tableClassName="min-w-[1200px] text-sm"
          >
            <thead className={dataTableHeadClass}>
              <tr>
                <th className={dataTableThClass}>Nombre comercial</th>
                <th className={dataTableThClass}>Razón social</th>
                <th className={dataTableThClass}>Suscripción</th>
                <th className={dataTableThClass}>RUC</th>
                <th className={dataTableThClass}>Correo</th>
                <th className={dataTableThClass}>Teléfono</th>
                <th className={dataTableThClass}>País</th>
                <th className={dataTableThClass}>Ciudad</th>
                <th className={dataTableThClass}>Dirección</th>
                <th className={dataTableThClass}>Plan</th>
                <th className={dataTableThClass}>Límites</th>
                <th className={dataTableThClass}>Registro</th>
                <th className={`${dataTableThClass} w-28`}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b last:border-0">
                <td className={`${dataTableTdClass} font-semibold`}>
                  {org.tradeName}
                </td>
                <td className={dataTableTdClass}>{org.legalName}</td>
                <td className={dataTableTdClass}>
                  <OrganizationStatusBadge status={org.subscriptionStatus} />
                  <span className="sr-only">
                    {subscriptionStatusLabel(org.subscriptionStatus)}
                  </span>
                </td>
                <td className={`${dataTableTdClass} font-mono text-xs`}>
                  {org.taxId}
                </td>
                <td className={dataTableTdClass}>{org.email}</td>
                <td className={dataTableTdClass}>{org.phone}</td>
                <td className={dataTableTdClass}>{org.country}</td>
                <td className={dataTableTdClass}>{org.city}</td>
                <td className={dataTableTdClass}>{org.address}</td>
                <td className={dataTableTdClass}>{plan?.name ?? org.planId}</td>
                <td className={`${dataTableTdClass} whitespace-nowrap text-xs`}>
                  {limitsLabel}
                </td>
                <td
                  className={`${dataTableTdClass} whitespace-nowrap tabular-nums`}
                >
                  {formatDateTimeEc(org.createdAt)}
                </td>
                <td className={dataTableTdClass}>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="gap-1.5"
                    onClick={() => setEditOpen(true)}
                  >
                    <Pencil className="h-3.5 w-3.5" aria-hidden />
                    Editar
                  </Button>
                </td>
              </tr>
            </tbody>
          </DataTableShell>
        </CardContent>
      </Card>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="max-h-[90vh] max-w-lg overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar empresa</DialogTitle>
            <DialogDescription>
              Plan, suscripción y datos de contacto. El cambio de suscripción
              pide confirmación.
            </DialogDescription>
          </DialogHeader>
          <OrganizationEditBlock
            organizationId={organizationId}
            embedded
            layout="plain"
            onAfterSave={() => setEditOpen(false)}
            onCancel={() => setEditOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </section>
  );
}
