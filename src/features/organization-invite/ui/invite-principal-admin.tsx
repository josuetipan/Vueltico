import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { z } from "zod";
import { organizationsUseCases } from "@/features/organization/api/organizations-composition";
import { useActorEmail } from "@/features/organization/model/use-actor-email";
import { RoleDashboardShell } from "@/widgets/role-dashboard-shell";
import { PageHeader } from "@/shared/ui/layout/page-header";
import { StatePanel } from "@/shared/ui/feedback/state-panel";
import { Button } from "@/shared/ui/button";
import { Card, CardContent } from "@/shared/ui/card";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";

const schema = z.object({
  fullName: z.string().min(2),
  email: z.string().email(),
});

type FormValues = z.infer<typeof schema>;

export function InvitePrincipalAdminClient({ organizationId }: { organizationId: string }) {
  const navigate = useNavigate();
  const actorEmail = useActorEmail();
  const queryClient = useQueryClient();

  const orgQuery = useQuery({
    queryKey: ["organizations", organizationId],
    queryFn: () => organizationsUseCases.getOrganization(organizationId),
  });

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { fullName: "", email: "" },
  });

  const mutation = useMutation({
    mutationFn: (values: FormValues) =>
      organizationsUseCases.invitePrincipalAdmin(
        {
          organizationId,
          fullName: values.fullName,
          email: values.email,
        },
        actorEmail,
      ),
    onSuccess: () => {
      toast.success("Invitación registrada (mock). No se guarda contraseña.");
      void queryClient.invalidateQueries({ queryKey: ["organizations", organizationId] });
      navigate(`/app/superadmin/empresas/${organizationId}`);
    },
    onError: () => toast.error("No se pudo enviar la invitación"),
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
        <StatePanel variant="error" title="Organización no encontrada" />
      </RoleDashboardShell>
    );
  }

  return (
    <RoleDashboardShell
      breadcrumbs={[
        { label: "Plataforma", href: "/app/superadmin" },
        { label: "Empresas", href: "/app/superadmin/empresas" },
        {
          label: orgQuery.data.tradeName,
          href: `/app/superadmin/empresas/${organizationId}`,
        },
        { label: "Invitar administrador" },
      ]}
    >
      <div className="mx-auto max-w-lg space-y-6">
        <PageHeader
          title="Invitar administrador principal"
          description={`Organización: ${orgQuery.data.tradeName}. Se enviará enlace por correo; sin contraseña manual.`}
        />
        <Card>
          <CardContent className="pt-6">
            <form
              className="space-y-4"
              onSubmit={form.handleSubmit((v) => mutation.mutate(v))}
            >
              <div className="space-y-2">
                <Label htmlFor="fullName">Nombre completo</Label>
                <Input id="fullName" {...form.register("fullName")} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Correo electrónico</Label>
                <Input id="email" type="email" {...form.register("email")} />
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" asChild>
                  <Link to={`/app/superadmin/empresas/${organizationId}`}>Cancelar</Link>
                </Button>
                <Button type="submit" disabled={mutation.isPending}>
                  {mutation.isPending ? "Enviando…" : "Enviar invitación"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </RoleDashboardShell>
  );
}
