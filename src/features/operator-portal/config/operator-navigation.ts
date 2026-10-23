import type { NavItem, NavSection } from "@/shared/config/navigation";
import type { OperatorProfile } from "@/entities/operator/model/permissions";
import { hasPermission } from "@/entities/operator/model/permissions";
import {
  Bell,
  Building2,
  ClipboardList,
  LayoutDashboard,
  Receipt,
  User,
  Wallet,
} from "lucide-react";

export function buildOperatorNavigation(profile: OperatorProfile, tenantCount: number): NavSection[] {
  const items: NavItem[] = [];

  if (hasPermission(profile, "dashboard:view")) {
    items.push({
      title: "Mi panel",
      href: "/app/operativo",
      icon: LayoutDashboard,
      matchPrefix: false,
    });
  }

  if (hasPermission(profile, "organization:switch") && tenantCount > 1) {
    items.push({
      title: "Organización",
      href: "/app/operativo/organizacion",
      icon: Building2,
    });
  }

  if (hasPermission(profile, "accounts:view")) {
    items.push({ title: "Mis cuentas", href: "/app/operativo/cuentas", icon: Wallet });
  }

  if (hasPermission(profile, "movements:view_own")) {
    items.push({
      title: "Mis movimientos",
      href: "/app/operativo/movimientos",
      icon: ClipboardList,
    });
  }

  if (hasPermission(profile, "sales:view_own") && profile.enabledFeatures.cashier) {
    items.push({ title: "Mis ventas", href: "/app/operativo/ventas", icon: Receipt });
  }

  if (hasPermission(profile, "shifts:view_own") && profile.enabledFeatures.cashier) {
    items.push({ title: "Mis turnos", href: "/app/operativo/turnos", icon: Receipt });
  }

  if (hasPermission(profile, "requests:view_own")) {
    items.push({
      title: "Solicitudes",
      href: "/app/operativo/solicitudes",
      icon: ClipboardList,
    });
  }

  if (hasPermission(profile, "notifications:view")) {
    items.push({
      title: "Notificaciones",
      href: "/app/operativo/notificaciones",
      icon: Bell,
    });
  }

  if (hasPermission(profile, "profile:edit")) {
    items.push({ title: "Mi perfil", href: "/app/operativo/perfil", icon: User });
  }

  return [{ label: "Operaciones", items }];
}
