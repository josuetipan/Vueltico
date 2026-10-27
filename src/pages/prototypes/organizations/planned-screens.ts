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
    title: "Registro de organización",
    description: "Asistente: datos, plan y administrador principal de la empresa.",
    status: "en-diseno",
  },
  {
    id: "detail",
    title: "Ficha de empresa",
    description: "Datos del tenant, usuarios de la empresa, suspender o reactivar.",
    status: "en-diseno",
  },
  {
    id: "edit",
    title: "Edición",
    description: "Datos legales, plan y límites operativos.",
    status: "borrador",
  },
];
