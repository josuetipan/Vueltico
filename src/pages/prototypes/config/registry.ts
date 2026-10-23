import type { LucideIcon } from "lucide-react";
import {
  BarChart3,
  Building2,
  LayoutDashboard,
  LogIn,
  Smartphone,
  Wallet,
} from "lucide-react";

export type PrototypeModuleId =
  | "identity"
  | "platform-admin"
  | "organizations"
  | "transfer-reconciliation"
  | "commercial-reports"
  | "operator-portal";

export type PrototypeModuleEntry = {
  id: PrototypeModuleId;
  name: string;
  folder: string;
  description: string;
  path: string;
  icon: LucideIcon;
  audience: string;
};

export const PROTOTYPE_MODULES: PrototypeModuleEntry[] = [
  {
    id: "identity",
    name: "Identidad y acceso",
    folder: "pages/prototypes/identity · features/auth",
    description: "Login, sesión, roles y redirección por perfil.",
    path: "/prototipos/identity",
    icon: LogIn,
    audience: "Todos los perfiles",
  },
  {
    id: "platform-admin",
    name: "Administración de plataforma",
    folder: "pages/prototypes/platform-admin · features/platform-dashboard",
    description: "Panel superadmin, métricas globales y gobernanza.",
    path: "/prototipos/platform-admin",
    icon: LayoutDashboard,
    audience: "Superadmin",
  },
  {
    id: "organizations",
    name: "Organizaciones (empresas)",
    folder: "pages/prototypes/organizations · entities/organization",
    description: "Alta, edición, estados e invitación del admin principal.",
    path: "/prototipos/organizations",
    icon: Building2,
    audience: "Superadmin",
  },
  {
    id: "transfer-reconciliation",
    name: "Conciliación de transferencias",
    folder: "pages/prototypes/transfer-reconciliation · entities/transfer-payment",
    description: "Bandeja, historial, detalle y comprobante.",
    path: "/prototipos/transfer-reconciliation",
    icon: Wallet,
    audience: "Admin empresa",
  },
  {
    id: "commercial-reports",
    name: "Reportes comerciales",
    folder: "pages/prototypes/commercial-reports · features/commercial-report",
    description: "Dashboard analítico, ventas, cierres y exportación.",
    path: "/prototipos/commercial-reports",
    icon: BarChart3,
    audience: "Admin empresa",
  },
  {
    id: "operator-portal",
    name: "Portal operativo",
    folder: "pages/prototypes/operator-portal · features/operator-portal",
    description: "Cajero: movimientos, ventas, turnos y permisos.",
    path: "/prototipos/operator-portal",
    icon: Smartphone,
    audience: "Operador",
  },
];

export function getPrototypeModule(id: PrototypeModuleId): PrototypeModuleEntry | undefined {
  return PROTOTYPE_MODULES.find((m) => m.id === id);
}
