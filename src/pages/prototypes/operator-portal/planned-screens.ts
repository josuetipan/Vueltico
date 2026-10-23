import type { PlannedScreen } from "@/shared/ui/prototype/planned-screens-panel";

export const OPERATOR_PORTAL_PLANNED_SCREENS: PlannedScreen[] = [
  {
    id: "dashboard",
    title: "Panel operativo",
    description: "Accesos rápidos según permisos del cajero.",
    status: "en-diseno",
  },
  {
    id: "movements",
    title: "Movimientos",
    description: "Listado y registro con flujo de aprobación.",
    status: "en-diseno",
  },
  {
    id: "sales",
    title: "Ventas",
    description: "Consulta de ventas del operador en turno.",
    status: "borrador",
  },
  {
    id: "shifts",
    title: "Turnos",
    description: "Apertura, cierre y resumen de caja.",
    status: "borrador",
  },
  {
    id: "organization-switch",
    title: "Cambio de organización",
    description: "Selector cuando el operador tiene varios tenants.",
    status: "borrador",
  },
  {
    id: "permissions",
    title: "Puertas de permiso",
    description: "Pantallas bloqueadas con mensaje claro.",
    status: "borrador",
  },
];
