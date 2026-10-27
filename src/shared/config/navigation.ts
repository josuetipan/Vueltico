import type { LucideIcon } from "lucide-react";
import {
  BarChart3,
  Building2,
  CreditCard,
  FileSearch,
  KeyRound,
  LayoutDashboard,
  LayoutGrid,
  Palette,
  Settings,
  Shield,
  UserCog,
  Users,
  Wallet,
} from "lucide-react";
import type { UserRole } from "@/entities/session";

export type NavItem = {
  title: string;
  href: string;
  icon: LucideIcon;
  badge?: string;
  disabled?: boolean;
  /** Si es false, solo coincide la ruta exacta (p. ej. panel raíz). */
  matchPrefix?: boolean;
};

export type NavSection = {
  label?: string;
  items: NavItem[];
};

const superadminNav: NavSection[] = [
  {
    items: [
      {
        title: "Panel general",
        href: "/app/superadmin",
        icon: LayoutDashboard,
        matchPrefix: false,
      },
    ],
  },
  {
    label: "Plataforma",
    items: [
      { title: "Empresas", href: "/app/superadmin/empresas", icon: Building2 },
      {
        title: "Planes",
        href: "/app/superadmin/planes",
        icon: CreditCard,
      },
      {
        title: "Suscripciones",
        href: "/app/superadmin/suscripciones",
        icon: Wallet,
      },
      {
        title: "Facturas",
        href: "/app/superadmin/facturas",
        icon: BarChart3,
      },
      {
        title: "Admins. plataforma",
        href: "/app/superadmin/administradores",
        icon: UserCog,
      },
    ],
  },
  {
    label: "Sistema",
    items: [
      {
        title: "Pantallas y módulos",
        href: "/app/superadmin/sistema/pantallas",
        icon: LayoutGrid,
      },
      {
        title: "Permisos por pantalla",
        href: "/app/superadmin/sistema/permisos",
        icon: Shield,
      },
      {
        title: "Roles globales",
        href: "/app/superadmin/sistema/roles",
        icon: Users,
      },
    ],
  },
  {
    label: "Gobernanza",
    items: [
      {
        title: "Permisos y roles (plataforma)",
        href: "/app/superadmin/gobernanza",
        icon: KeyRound,
      },
      {
        title: "Auditoría",
        href: "/app/superadmin/auditoria",
        icon: FileSearch,
        disabled: true,
      },
      {
        title: "Parametrización",
        href: "/app/superadmin/parametrizacion",
        icon: Palette,
      },
      {
        title: "Configuración",
        href: "/app/superadmin/configuracion",
        icon: Settings,
        disabled: true,
      },
    ],
  },
];

const companyAdminNav: NavSection[] = [
  {
    items: [
      {
        title: "Panel general",
        href: "/app/empresa",
        icon: LayoutDashboard,
        matchPrefix: false,
      },
    ],
  },
  {
    label: "Organización",
    items: [
      {
        title: "Usuarios y roles",
        href: "/app/empresa/usuarios",
        icon: Users,
        disabled: true,
      },
      {
        title: "Configuración",
        href: "/app/empresa/configuracion",
        icon: Settings,
        disabled: true,
      },
    ],
  },
  {
    label: "Operaciones",
    items: [
      {
        title: "Reportes",
        href: "/app/empresa/reportes",
        icon: BarChart3,
      },
      {
        title: "Verificar transferencias",
        href: "/app/empresa/transferencias",
        icon: FileSearch,
      },
      {
        title: "Tesorería",
        href: "/app/empresa/tesoreria",
        icon: Wallet,
        disabled: true,
      },
    ],
  },
];

const operatorNav: NavSection[] = [
  {
    items: [
      {
        title: "Mi panel",
        href: "/app/operativo",
        icon: LayoutDashboard,
        matchPrefix: false,
      },
      {
        title: "Tareas asignadas",
        href: "/app/operativo/tareas",
        icon: Shield,
        disabled: true,
      },
    ],
  },
];

export function getNavigationForRole(role: UserRole): NavSection[] {
  switch (role) {
    case "superadmin":
      return superadminNav;
    case "company_admin":
      return companyAdminNav;
    case "operator":
      return operatorNav;
  }
}

export function getRoleLabel(role: UserRole): string {
  switch (role) {
    case "superadmin":
      return "Superadministrador";
    case "company_admin":
      return "Administrador de empresa";
    case "operator":
      return "Usuario operativo";
  }
}
