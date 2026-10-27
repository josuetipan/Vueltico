import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { z } from "zod";
import { SUBSCRIPTION_PLANS, getPlanLimits } from "@/entities/plan";
import {
  SUBSCRIPTION_STATUSES,
  subscriptionStatusLabel,
} from "@/entities/organization/model/organization";
import { organizationsUseCases } from "@/features/organization/api/organizations-composition";
import { useActorEmail } from "@/features/organization/model/use-actor-email";
import { StatePanel } from "@/shared/ui/feedback/state-panel";
import { Button } from "@/shared/ui/button";
import { Card, CardContent } from "@/shared/ui/card";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { SelectField } from "@/shared/ui/select-field";
import {
  CountryCitySelectFields,
  geographyLabels,
  resolveGeographySelection,
} from "@/entities/geography";
import {
  SubscriptionStatusChangeConfirmDialog,
  type PendingSubscriptionStatusChange,
} from "@/features/organization/ui/subscription-status-change-confirm-dialog";

const schema = z.object({
  tradeName: z.string().min(2),
  legalName: z.string().min(2),
  taxId: z.string().min(13),
  email: z.string().email(),
  phone: z.string().min(8),
  countryId: z.string().min(1, "Seleccione país"),
  cityId: z.string().min(1, "Seleccione ciudad"),
  address: z.string().min(3),
  planId: z.enum(["trial", "growth", "business"]),
  subscriptionStatus: z.enum(SUBSCRIPTION_STATUSES),
});

type FormValues = z.infer<typeof schema>;

export type OrganizationEditBlockProps = {
  organizationId: string;
  detailPath?: (id: string) => string;
  /** En detalle de empresa: no redirige al guardar. */
  embedded?: boolean;
  /** Sin `Card` exterior (p. ej. modal). */
  layout?: "card" | "plain";
  onAfterSave?: () => void;
  onCancel?: () => void;
};

export function OrganizationEditBlock({
  organizationId,
  detailPath = (id) => `/app/superadmin/empresas/${id}`,
  embedded = false,
  layout = "card",
  onAfterSave,
  onCancel,
}: OrganizationEditBlockProps) {
  const navigate = useNavigate();
  const actorEmail = useActorEmail();
  const queryClient = useQueryClient();

  const orgQuery = useQuery({
    queryKey: ["organizations", organizationId],
    queryFn: () => organizationsUseCases.getOrganization(organizationId),
  });

  const form = useForm<FormValues>({ resolver: zodResolver(schema) });
  const [pendingSubscriptionChange, setPendingSubscriptionChange] =
    useState<PendingSubscriptionStatusChange | null>(null);
  const planId = form.watch("planId");
  const subscriptionStatus = form.watch("subscriptionStatus");
  const limits = planId ? getPlanLimits(planId) : null;

  useEffect(() => {
    const org = orgQuery.data;
    if (!org) return;
    const geo = resolveGeographySelection({
      countryId: org.countryId,
      cityId: org.cityId,
      cityName: org.city,
    });
    form.reset({
      tradeName: org.tradeName,
      legalName: org.legalName,
      taxId: org.taxId,
      email: org.email,
      phone: org.phone,
      countryId: geo.countryId,
      cityId: geo.cityId,
      address: org.address,
      planId: org.planId,
      subscriptionStatus: org.subscriptionStatus,
    });
  }, [orgQuery.data, form]);

  const mutation = useMutation({
    mutationFn: (values: FormValues) => {
      const { country, city } = geographyLabels(values.countryId, values.cityId);
      return organizationsUseCases.updateOrganization(
        organizationId,
        {
          tradeName: values.tradeName,
          legalName: values.legalName,
          taxId: values.taxId,
          email: values.email,
          phone: values.phone,
          countryId: values.countryId,
          country,
          cityId: values.cityId,
          city,
          address: values.address,
          planId: values.planId,
          subscriptionStatus: values.subscriptionStatus,
        },
        actorEmail,
      );
    },
    onSuccess: () => {
      toast.success("Cambios guardados");
      void queryClient.invalidateQueries({ queryKey: ["organizations"] });
      if (onAfterSave) onAfterSave();
      else if (!embedded) navigate(detailPath(organizationId));
    },
    onError: () => toast.error("No se pudo actualizar. Verifique el RUC."),
  });

  if (orgQuery.isLoading) {
    return <StatePanel variant="loading" title="Cargando" />;
  }

  if (!orgQuery.data) {
    return <StatePanel variant="error" title="No encontrada" />;
  }

  const org = orgQuery.data;
  const orgLabel = org.tradeName;

  function confirmPendingSubscriptionInForm() {
    if (!pendingSubscriptionChange) return;
    form.setValue("subscriptionStatus", pendingSubscriptionChange.to, { shouldDirty: true });
    setPendingSubscriptionChange(null);
  }

  const formBody = (
        <form
          className="space-y-4"
          onSubmit={form.handleSubmit((values) => mutation.mutate(values))}
        >
          <Field label="Nombre comercial"><Input {...form.register("tradeName")} /></Field>
          <Field label="Razón social"><Input {...form.register("legalName")} /></Field>
          <Field label="RUC"><Input {...form.register("taxId")} /></Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Correo"><Input type="email" {...form.register("email")} /></Field>
            <Field label="Teléfono"><Input {...form.register("phone")} /></Field>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <CountryCitySelectFields
              idPrefix="org-edit"
              countryId={form.watch("countryId") ?? org.countryId ?? "ec"}
              cityId={form.watch("cityId") ?? ""}
              onCountryIdChange={(v) => form.setValue("countryId", v, { shouldValidate: true })}
              onCityIdChange={(v) => form.setValue("cityId", v, { shouldValidate: true })}
              countryError={form.formState.errors.countryId?.message}
              cityError={form.formState.errors.cityId?.message}
            />
          </div>
          <Field label="Dirección"><Input {...form.register("address")} /></Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <SelectField
              id="planId"
              label="Plan"
              value={planId}
              onChange={(v) => form.setValue("planId", v as FormValues["planId"])}
              options={SUBSCRIPTION_PLANS.map((p) => ({ value: p.id, label: p.name }))}
            />
            <SelectField
              id="subscriptionStatus"
              label="Estado de suscripción"
              value={subscriptionStatus ?? org.subscriptionStatus}
              onChange={(v) => {
                const next = v as FormValues["subscriptionStatus"];
                const current = subscriptionStatus ?? org.subscriptionStatus;
                if (next === current) return;
                setPendingSubscriptionChange({
                  organizationLabel: orgLabel,
                  from: current,
                  to: next,
                });
              }}
              options={SUBSCRIPTION_STATUSES.map((s) => ({
                value: s,
                label: subscriptionStatusLabel(s),
              }))}
            />
          </div>
          {limits ? (
            <p className="text-xs font-normal text-foreground/70">
              Límites del plan seleccionado: {limits.maxUsers} usuarios, {limits.storageGb} GB.
            </p>
          ) : null}
          <div className="flex gap-2 pt-2">
            <Button type="submit" disabled={mutation.isPending}>
              Guardar
            </Button>
            {onCancel ? (
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancelar
              </Button>
            ) : !embedded ? (
              <Button type="button" variant="outline" asChild>
                <Link to={detailPath(organizationId)}>Cancelar</Link>
              </Button>
            ) : null}
          </div>
        </form>
  );

  return (
    <>
    {layout === "card" ? (
      <Card>
        <CardContent className="space-y-4 pt-6">{formBody}</CardContent>
      </Card>
    ) : (
      formBody
    )}
    <SubscriptionStatusChangeConfirmDialog
      pending={pendingSubscriptionChange}
      onDismiss={() => setPendingSubscriptionChange(null)}
      onConfirm={confirmPendingSubscriptionInForm}
    />
    </>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      {children}
    </div>
  );
}
