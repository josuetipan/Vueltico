import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { SUBSCRIPTION_PLANS, getPlanById } from "@/entities/organization/model/organization";
import { organizationsUseCases } from "@/features/organization/api/organizations-composition";
import { useActorEmail } from "@/features/organization/model/use-actor-email";
import { RoleDashboardShell } from "@/widgets/role-dashboard-shell";
import { PageHeader } from "@/shared/ui/layout/page-header";
import { Button } from "@/shared/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { SelectField } from "@/shared/ui/select-field";

const wizardSchema = z.object({
  tradeName: z.string().min(2, "Requerido"),
  legalName: z.string().min(2, "Requerido"),
  ruc: z.string().min(13, "RUC de 13 dígitos"),
  email: z.string().email("Correo inválido"),
  phone: z.string().min(8, "Teléfono requerido"),
  country: z.string().min(2),
  province: z.string().min(2),
  city: z.string().min(2),
  planId: z.enum(["trial", "growth", "business"]),
  maxUsers: z.number().min(1),
  maxBranches: z.number().min(1),
  storageGb: z.number().min(1),
  adminFullName: z.string().min(2),
  adminEmail: z.string().email(),
});

type WizardValues = z.infer<typeof wizardSchema>;

const STEPS = [
  "Información empresarial",
  "Plan contratado",
  "Límites iniciales",
  "Administrador principal",
  "Resumen",
] as const;

export function OrganizationWizardClient() {
  const navigate = useNavigate();
  const actorEmail = useActorEmail();
  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  const form = useForm<WizardValues>({
    resolver: zodResolver(wizardSchema),
    defaultValues: {
      tradeName: "",
      legalName: "",
      ruc: "",
      email: "",
      phone: "",
      country: "Ecuador",
      province: "Pichincha",
      city: "Quito",
      planId: "business",
      maxUsers: 75,
      maxBranches: 5,
      storageGb: 150,
      adminFullName: "",
      adminEmail: "",
    },
  });

  const planId = form.watch("planId");
  const plan = getPlanById(planId);

  function applyPlanDefaults(id: WizardValues["planId"]) {
    const p = getPlanById(id);
    form.setValue("maxUsers", p.maxUsers);
    const storageByPlan = { trial: 10, growth: 50, business: 150 } as const;
    const branchesByPlan = { trial: 1, growth: 3, business: 10 } as const;
    form.setValue("storageGb", storageByPlan[id]);
    form.setValue("maxBranches", branchesByPlan[id]);
  }

  async function onConfirm() {
    const valid = await form.trigger();
    if (!valid) return;
    setSubmitting(true);
    try {
      const v = form.getValues();
      const org = await organizationsUseCases.createOrganization(
        {
          tradeName: v.tradeName,
          legalName: v.legalName,
          ruc: v.ruc,
          email: v.email,
          phone: v.phone,
          country: v.country,
          province: v.province,
          city: v.city,
          planId: v.planId,
          limits: {
            maxUsers: v.maxUsers,
            maxBranches: v.maxBranches,
            storageGb: v.storageGb,
          },
          principalAdmin: { fullName: v.adminFullName, email: v.adminEmail },
        },
        actorEmail,
      );
      toast.success("Organización creada e invitación enviada (mock)");
      navigate(`/app/superadmin/empresas/${org.id}`);
    } catch {
      toast.error("No se pudo crear la organización. Verifique el RUC.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <RoleDashboardShell
      breadcrumbs={[
        { label: "Plataforma", href: "/app/superadmin" },
        { label: "Empresas", href: "/app/superadmin/empresas" },
        { label: "Nueva" },
      ]}
    >
      <div className="mx-auto max-w-3xl space-y-6">
        <PageHeader
          title="Registrar organización"
          description="Proceso guiado. No se almacenan contraseñas: el admin recibirá invitación por correo."
        />
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
                <Field label="RUC" error={form.formState.errors.ruc?.message}>
                  <Input {...form.register("ruc")} inputMode="numeric" />
                </Field>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Correo" error={form.formState.errors.email?.message}>
                    <Input type="email" {...form.register("email")} />
                  </Field>
                  <Field label="Teléfono" error={form.formState.errors.phone?.message}>
                    <Input {...form.register("phone")} />
                  </Field>
                </div>
                <div className="grid gap-4 sm:grid-cols-3">
                  <Field label="País"><Input {...form.register("country")} /></Field>
                  <Field label="Provincia"><Input {...form.register("province")} /></Field>
                  <Field label="Ciudad"><Input {...form.register("city")} /></Field>
                </div>
              </>
            ) : null}

            {step === 1 ? (
              <SelectField
                id="planId"
                label="Plan"
                value={planId}
                onChange={(v) => {
                  form.setValue("planId", v as WizardValues["planId"]);
                  applyPlanDefaults(v as WizardValues["planId"]);
                }}
                options={SUBSCRIPTION_PLANS.map((p) => ({
                  value: p.id,
                  label: `${p.name} · hasta ${p.maxUsers} usuarios`,
                }))}
              />
            ) : null}

            {step === 2 ? (
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Máx. usuarios" error={form.formState.errors.maxUsers?.message}>
                  <Input type="number" {...form.register("maxUsers")} />
                </Field>
                <Field label="Almacenamiento (GB)" error={form.formState.errors.storageGb?.message}>
                  <Input type="number" {...form.register("storageGb")} />
                </Field>
              </div>
            ) : null}

            {step === 3 ? (
              <>
                <Field label="Nombre del administrador" error={form.formState.errors.adminFullName?.message}>
                  <Input {...form.register("adminFullName")} />
                </Field>
                <Field label="Correo del administrador" error={form.formState.errors.adminEmail?.message}>
                  <Input type="email" {...form.register("adminEmail")} />
                </Field>
                <p className="text-xs text-muted-foreground">
                  Se enviará enlace de invitación. El superadmin no define contraseña.
                </p>
              </>
            ) : null}

            {step === 4 ? (
              <dl className="space-y-2 text-sm">
                <SummaryRow label="Comercial" value={form.watch("tradeName")} />
                <SummaryRow label="RUC" value={form.watch("ruc")} />
                <SummaryRow label="Plan" value={plan?.name ?? planId} />
                <SummaryRow label="Límites" value={`${form.watch("maxUsers")} usuarios · ${form.watch("storageGb")} GB`} />
                <SummaryRow label="Admin" value={`${form.watch("adminFullName")} (${form.watch("adminEmail")})`} />
                <SummaryRow label="Aislamiento" value="Tenant dedicado (mock)" />
              </dl>
            ) : null}

            <div className="flex justify-between pt-4">
              <Button type="button" variant="outline" asChild>
                <Link to="/app/superadmin/empresas">Cancelar</Link>
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
                        ["tradeName", "legalName", "ruc", "email", "phone", "country", "province", "city"],
                        ["planId"],
                        ["maxUsers", "storageGb"],
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
    </RoleDashboardShell>
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
