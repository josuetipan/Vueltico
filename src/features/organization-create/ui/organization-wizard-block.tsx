import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { SUBSCRIPTION_PLANS, getPlanById, getPlanLimits } from "@/entities/plan";
import { organizationsUseCases } from "@/features/organization/api/organizations-composition";
import { useActorEmail } from "@/features/organization/model/use-actor-email";
import { Button } from "@/shared/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { SelectField } from "@/shared/ui/select-field";
import { CountryCitySelectFields, geographyLabels } from "@/entities/geography";

const wizardSchema = z.object({
  tradeName: z.string().min(2, "Requerido"),
  legalName: z.string().min(2, "Requerido"),
  taxId: z.string().min(13, "RUC de 13 dígitos"),
  email: z.string().email("Correo inválido"),
  phone: z.string().min(8, "Teléfono requerido"),
  countryId: z.string().min(1, "Seleccione país"),
  cityId: z.string().min(1, "Seleccione ciudad"),
  address: z.string().min(3, "Dirección requerida"),
  planId: z.string().min(1),
  adminFullName: z.string().min(2),
  adminEmail: z.string().email(),
});

type WizardValues = z.infer<typeof wizardSchema>;

const STEPS = [
  "Información empresarial",
  "Plan contratado",
  "Administrador principal",
  "Resumen",
] as const;

export type OrganizationWizardBlockProps = {
  cancelPath?: string;
  successPath?: (orgId: string) => string;
};

export function OrganizationWizardBlock({
  cancelPath = "/app/superadmin/empresas",
  successPath = (id) => `/app/superadmin/empresas/${id}`,
}: OrganizationWizardBlockProps) {
  const navigate = useNavigate();
  const actorEmail = useActorEmail();
  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  const form = useForm<WizardValues>({
    resolver: zodResolver(wizardSchema),
    defaultValues: {
      tradeName: "",
      legalName: "",
      taxId: "",
      email: "",
      phone: "",
      countryId: "ec",
      cityId: "ec-quito",
      address: "",
      planId: "business",
      adminFullName: "",
      adminEmail: "",
    },
  });

  const planId = form.watch("planId");
  const plan = getPlanById(planId);
  const limits = getPlanLimits(planId);

  async function onConfirm() {
    const valid = await form.trigger();
    if (!valid) return;
    setSubmitting(true);
    try {
      const v = form.getValues();
      const { country, city } = geographyLabels(v.countryId, v.cityId);
      const org = await organizationsUseCases.createOrganization(
        {
          tradeName: v.tradeName,
          legalName: v.legalName,
          taxId: v.taxId,
          email: v.email,
          phone: v.phone,
          countryId: v.countryId,
          country,
          cityId: v.cityId,
          city,
          address: v.address,
          planId: v.planId,
          principalAdmin: { fullName: v.adminFullName, email: v.adminEmail },
        },
        actorEmail,
      );
      toast.success("Organización creada e invitación enviada (mock)");
      navigate(successPath(org.id));
    } catch {
      toast.error("No se pudo crear. Verifique el RUC.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-6">
        <ol className="flex flex-wrap gap-2 text-xs">
          {STEPS.map((label, i) => (
            <li
              key={label}
              className={`rounded-full px-3 py-1 ${i === step ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}
            >
              {i + 1}. {label}
            </li>
          ))}
        </ol>

        <Card>
          <CardHeader>
            <CardTitle>{STEPS[step]}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {step === 0 ? (
              <>
                <Field label="Nombre comercial" error={form.formState.errors.tradeName?.message}>
                  <Input {...form.register("tradeName")} />
                </Field>
                <Field label="Razón social" error={form.formState.errors.legalName?.message}>
                  <Input {...form.register("legalName")} />
                </Field>
                <Field label="RUC (tax_id)" error={form.formState.errors.taxId?.message}>
                  <Input {...form.register("taxId")} inputMode="numeric" />
                </Field>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Correo" error={form.formState.errors.email?.message}>
                    <Input type="email" {...form.register("email")} />
                  </Field>
                  <Field label="Teléfono" error={form.formState.errors.phone?.message}>
                    <Input {...form.register("phone")} />
                  </Field>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <CountryCitySelectFields
                    idPrefix="org-wizard"
                    countryId={form.watch("countryId")}
                    cityId={form.watch("cityId")}
                    onCountryIdChange={(v) => form.setValue("countryId", v, { shouldValidate: true })}
                    onCityIdChange={(v) => form.setValue("cityId", v, { shouldValidate: true })}
                    countryError={form.formState.errors.countryId?.message}
                    cityError={form.formState.errors.cityId?.message}
                  />
                </div>
                <Field label="Dirección" error={form.formState.errors.address?.message}>
                  <Input {...form.register("address")} />
                </Field>
              </>
            ) : null}

            {step === 1 ? (
              <>
                <SelectField
                  id="planId"
                  label="Plan (FK plans)"
                  value={planId}
                  onChange={(v) => form.setValue("planId", v as WizardValues["planId"])}
                  options={SUBSCRIPTION_PLANS.map((p) => ({
                    value: p.id,
                    label: p.name,
                  }))}
                />
                <p className="text-sm font-normal text-foreground">
                  Límites incluidos: {limits.maxUsers} usuarios, {limits.maxBranches} sucursales,{" "}
                  {limits.storageGb} GB — no se guardan en la fila de empresa.
                </p>
              </>
            ) : null}

            {step === 2 ? (
              <>
                <Field label="Nombre del administrador" error={form.formState.errors.adminFullName?.message}>
                  <Input {...form.register("adminFullName")} />
                </Field>
                <Field label="Correo del administrador" error={form.formState.errors.adminEmail?.message}>
                  <Input type="email" {...form.register("adminEmail")} />
                </Field>
                <p className="text-xs font-normal text-foreground/70">
                  Se crea un registro en company_users con rol company_admin.
                </p>
              </>
            ) : null}

            {step === 3 ? (
              <dl className="space-y-2 text-sm">
                <SummaryRow label="Comercial" value={form.watch("tradeName")} />
                <SummaryRow label="RUC" value={form.watch("taxId")} />
                <SummaryRow
                  label="País / ciudad / dirección"
                  value={(() => {
                    const geo = geographyLabels(form.watch("countryId"), form.watch("cityId"));
                    return `${geo.country} · ${geo.city} · ${form.watch("address")}`;
                  })()}
                />
                <SummaryRow label="Plan" value={plan?.name ?? planId} />
                <SummaryRow label="Límites (plan)" value={`${limits.maxUsers} usu · ${limits.storageGb} GB`} />
                <SummaryRow label="Admin (company_users)" value={`${form.watch("adminFullName")} (${form.watch("adminEmail")})`} />
              </dl>
            ) : null}

            <div className="flex justify-between pt-4">
              <Button type="button" variant="outline" asChild>
                <Link to={cancelPath}>Cancelar</Link>
              </Button>
              <div className="flex gap-2">
                {step > 0 ? (
                  <Button type="button" variant="outline" onClick={() => setStep(step - 1)}>
                    Atrás
                  </Button>
                ) : null}
                {step < STEPS.length - 1 ? (
                  <Button
                    type="button"
                    onClick={async () => {
                      const fieldsByStep: (keyof WizardValues)[][] = [
                        ["tradeName", "legalName", "taxId", "email", "phone", "countryId", "cityId", "address"],
                        ["planId"],
                        ["adminFullName", "adminEmail"],
                        [],
                      ];
                      const ok = await form.trigger(fieldsByStep[step]);
                      if (ok) setStep(step + 1);
                    }}
                  >
                    Siguiente
                  </Button>
                ) : (
                  <Button type="button" disabled={submitting} onClick={onConfirm}>
                    {submitting ? "Creando…" : "Confirmar registro"}
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
    </div>
  );
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      {children}
      {error ? <p className="text-xs text-destructive">{error}</p> : null}
    </div>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4 border-b py-2">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="text-right font-medium">{value || "—"}</dd>
    </div>
  );
}
