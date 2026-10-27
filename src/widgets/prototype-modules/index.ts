/**
 * Punto único para reutilizar bloques UI en rutas /app y en /prototipos.
 * Cada bloque vive en su feature; aquí solo se reexporta la API pública.
 */
export { OrganizationListBlock } from "@/features/organization-list";
export { OrganizationDetailBlock } from "@/features/organization-detail";
export { OrganizationWizardBlock } from "@/features/organization-create";
export { OrganizationEditBlock } from "@/features/organization-edit";
export { OrganizationTenantModelOverview } from "@/features/organization/ui/organization-tenant-model-overview";

export { GovernancePageSection } from "@/features/platform-governance";
export { PlatformAdminsPageSection } from "@/features/platform-admins";
export { OrganizationCompanyAdminsPanel } from "@/features/company-admins";
export { BrandParametrizationForm as BrandParametrizationWorkspace } from "@/features/platform-brand/ui/brand-parametrization-form";
