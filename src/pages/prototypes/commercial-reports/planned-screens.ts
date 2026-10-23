import type { PlannedScreen } from "@/shared/ui/prototype/planned-screens-panel";

export const COMMERCIAL_REPORTS_PLANNED_SCREENS: PlannedScreen[] = [
  {
    id: "analytical-dashboard",
    title: "Dashboard analítico",
    description: "Resumen ejecutivo con filtros de fecha y sucursal.",
    status: "en-diseno",
  },
  {
    id: "daily-sales",
    title: "Ventas diarias",
    description: "Serie temporal y comparación con periodo anterior.",
    status: "borrador",
  },
  {
    id: "payment-methods",
    title: "Medios de pago",
    description: "Desglose efectivo, tarjeta, transferencia.",
    status: "borrador",
  },
  {
    id: "closures",
    title: "Cierres y diferencias",
    description: "Arqueos de caja y variaciones por turno.",
    status: "borrador",
  },
  {
    id: "export",
    title: "Exportación CSV",
    description: "Descarga con mismos filtros activos en pantalla.",
    status: "borrador",
  },
];
