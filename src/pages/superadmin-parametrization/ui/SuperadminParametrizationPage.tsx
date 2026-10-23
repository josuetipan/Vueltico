import { BrandParametrizationForm } from "@/features/platform-brand/ui/brand-parametrization-form";
import { RoleDashboardShell } from "@/widgets/role-dashboard-shell";
import { PageHeader } from "@/shared/ui/layout/page-header";

export function SuperadminParametrizationPage() {
  return (
    <RoleDashboardShell
      breadcrumbs={[
        { label: "Plataforma", href: "/app/superadmin" },
        { label: "Parametrización" },
      ]}
    >
      <div className="w-full max-w-6xl space-y-8">
        <PageHeader
          title="Parametrización de marca"
          description="Colores globales e imágenes del fondo de login."
        />
        <BrandParametrizationForm />
      </div>
    </RoleDashboardShell>
  );
}
