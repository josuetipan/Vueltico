import type { PlannedScreen } from "@/shared/ui/prototype/planned-screens-panel";

export const PLATFORM_ADMIN_PLANNED_SCREENS: PlannedScreen[] = [
  {
    id: "dashboard",
    title: "Panel general",
    description: "KPIs de plataforma, empresas activas y uso.",
    status: "en-diseno",
  },
  {
    id: "plans",
    title: "Planes y facturación",
    description: "Catálogo de planes y límites por suscripción.",
    status: "borrador",
  },
  {
    id: "global-users",
    title: "Usuarios globales",
    description: "Operadores de plataforma y permisos transversales.",
    status: "borrador",
  },
  {
    id: "audit",
    title: "Auditoría",
    description: "Bitácora de acciones sensibles en tenants.",
    status: "borrador",
  },
];
