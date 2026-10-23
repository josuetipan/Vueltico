import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { z } from "zod";
import { SUBSCRIPTION_PLANS } from "@/entities/organization/model/organization";
import { organizationsUseCases } from "@/features/organization/api/organizations-composition";
import { useActorEmail } from "@/features/organization/model/use-actor-email";
import { RoleDashboardShell } from "@/widgets/role-dashboard-shell";
import { PageHeader } from "@/shared/ui/layout/page-header";
import { StatePanel } from "@/shared/ui/feedback/state-panel";
import { Button } from "@/shared/ui/button";
import { Card, CardContent } from "@/shared/ui/card";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { SelectField } from "@/shared/ui/select-field";

const schema = z.object({
  tradeName: z.string().min(2),
  legalName: z.string().min(2),
  ruc: z.string().min(13),
  email: z.string().email(),
  phone: z.string().min(8),
  country: z.string().min(2),
  province: z.string().min(2),
  city: z.string().min(2),
  planId: z.enum(["trial", "growth", "business"]),
  maxUsers: z.number().min(1),
  maxBranches: z.number().min(1),
  storageGb: z.number().min(1),
});

type FormValues = z.infer<typeof schema>;

export function OrganizationEditClient({ organizationId }: { organizationId: string }) {
  const navigate = useNavigate();
  const actorEmail = useActorEmail();
  const queryClient = useQueryClient();

  const orgQuery = useQuery({
    queryKey: ["organizations", organizationId],
    queryFn: () => organizationsUseCases.getOrganization(organizationId),
  });

  const form = useForm<FormValues>({ resolver: zodResolver(schema) });

  useEffect(() => {
    const org = orgQuery.data;
    if (!org) return;
    form.reset({
      tradeName: org.tradeName,
      legalName: org.legalName,
      ruc: org.ruc,
      email: org.email,
      phone: org.phone,
      country: org.country,
      province: org.province,
      city: org.city,
      planId: org.planId,
      maxUsers: org.limits.maxUsers,
      maxBranches: org.limits.maxBranches,
      storageGb: org.limits.storageGb,
    });
  }, [orgQuery.data, form]);

  const mutation = useMutation({
    mutationFn: (values: FormValues) =>
      organizationsUseCases.updateOrganization(
        organizationId,
        {
          tradeName: values.tradeName,
          legalName: values.legalName,
          ruc: values.ruc,
          email: values.email,
          phone: values.phone,
          country: values.country,
          province: values.province,
          city: values.city,
          planId: values.planId,
          limits: {
            maxUsers: values.maxUsers,
            maxBranches: values.maxBranches,
            storageGb: values.storageGb,
          },
        },
        actorEmail,
      ),
    onSuccess: () => {
      toast.success("Cambios guardados");
      void queryClient.invalidateQueries({ queryKey: ["organizations"] });
      navigate(`/app/superadmin/empresas/${organizationId}`);
    },
    onError: () => toast.error("No se pudo actualizar. Verifique el RUC."),
  });

  if (orgQuery.isLoading) {
    return (
      <RoleDashboardShell breadcrumbs={[]}>
        <StatePanel variant="loading" title="Cargando" />
      </RoleDashboardShell>
    );
  }

  if (!orgQuery.data) {
    return (
      <RoleDashboardShell breadcrumbs={[]}>
        <StatePanel variant="error" title="No encontrada" />
      </RoleDashboardShell>
    );
  }

  return (
    <RoleDashboardShell
      breadcrumbs={[
        { label: "Plataforma", href: "/app/superadmin" },
        { label: "Empresas", href: "/app/superadmin/empresas" },
        { label: orgQuery.data.tradeName, href: `/app/superadmin/empresas/${organizationId}` },
        { label: "Editar" },
      ]}
    >
      <div className="mx-auto max-w-2xl space-y-6">
        <PageHeader title="Editar organización" description="Actualiza datos operativos y límites del tenant." />
        <Card>
          <CardContent className="pt-6">
            <form
              className="space-y-4"
              onSubmit={form.handleSubmit((v) => mutation.mutate(v))}
            >
              <Field label="Nombre comercial"><Input {...form.register("tradeName")} /></Field>
              <Field label="Razón social"><Input {...form.register("legalName")} /></Field>
              <Field label="RUC"><Input {...form.register("ruc")} /></Field>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Correo"><Input type="email" {...form.register("email")} /></Field>
                <Field label="Teléfono"><Input {...form.register("phone")} /></Field>
              </div>
              <div className="grid gap-4 sm:grid-cols-3">
                <Field label="País"><Input {...form.register("country")} /></Field>
                <Field label="Provincia"><Input {...form.register("province")} /></Field>
                <Field label="Ciudad"><Input {...form.register("city")} /></Field>
              </div>
              <SelectField
                id="planId"
                label="Plan"
                value={form.watch("planId")}
                onChange={(v) => form.setValue("planId", v as FormValues["planId"])}
                options={SUBSCRIPTION_PLANS.map((p) => ({ value: p.id, label: p.name }))}
              />
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Máx. usuarios"><Input type="number" {...form.register("maxUsers")} /></Field>
                <Field label="Almacenamiento GB"><Input type="number" {...form.register("storageGb")} /></Field>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" asChild>
                  <Link to={`/app/superadmin/empresas/${organizationId}`}>Cancelar</Link>
                </Button>
                <Button type="submit" disabled={mutation.isPending}>
                  {mutation.isPending ? "Guardando…" : "Guardar"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </RoleDashboardShell>
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
