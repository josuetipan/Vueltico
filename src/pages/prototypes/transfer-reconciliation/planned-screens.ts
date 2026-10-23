import type { PlannedScreen } from "@/shared/ui/prototype/planned-screens-panel";

export const TRANSFER_RECONCILIATION_PLANNED_SCREENS: PlannedScreen[] = [
  {
    id: "inbox-pending",
    title: "Bandeja pendientes",
    description: "Transferencias por verificar con alertas de duplicado.",
    status: "en-diseno",
  },
  {
    id: "inbox-history",
    title: "Historial",
    description: "Pagos conciliados, rechazados y observados.",
    status: "en-diseno",
  },
  {
    id: "detail",
    title: "Detalle de pago",
    description: "Datos de venta, comprobante y acciones de verificación.",
    status: "en-diseno",
  },
  {
    id: "receipt-policy",
    title: "Política de comprobante",
    description: "Reglas de visualización y campos obligatorios.",
    status: "borrador",
  },
];
