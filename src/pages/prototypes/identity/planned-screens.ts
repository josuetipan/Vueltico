import type { PlannedScreen } from "@/shared/ui/prototype/planned-screens-panel";

export const IDENTITY_PLANNED_SCREENS: PlannedScreen[] = [
  {
    id: "login",
    title: "Inicio de sesión",
    description: "Correo, contraseña y accesos demo por rol.",
    status: "en-diseno",
  },
  {
    id: "session-expired",
    title: "Sesión expirada",
    description: "Mensaje y retorno al login sin perder contexto.",
    status: "borrador",
  },
  {
    id: "role-redirect",
    title: "Redirección por rol",
    description: "Tras login, envío a superadmin, empresa u operativo.",
    status: "borrador",
  },
];
