import type { PlannedScreen } from "@/shared/ui/prototype/planned-screens-panel";

export const ORGANIZATIONS_PLANNED_SCREENS: PlannedScreen[] = [
  {
    id: "list",
    title: "Listado de empresas",
    description: "Filtros, paginación, estados y acciones rápidas.",
    status: "en-diseno",
  },
  {
    id: "wizard",
    title: "Alta de organización",
    description: "Asistente en pasos: datos, plan, límites e invitación.",
    status: "en-diseno",
  },
  {
    id: "detail",
    title: "Ficha de empresa",
    description: "Resumen, admin principal, suspender o reactivar.",
    status: "en-diseno",
  },
  {
    id: "edit",
    title: "Edición",
    description: "Datos legales, plan y límites operativos.",
    status: "borrador",
  },
  {
    id: "invite-admin",
    title: "Invitar admin principal",
    description: "Formulario de invitación sin gestión de contraseñas.",
    status: "borrador",
  },
];
