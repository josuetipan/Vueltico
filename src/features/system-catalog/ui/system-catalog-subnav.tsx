import { Link, useLocation } from "react-router-dom";
import { cn } from "@/shared/lib/utils";

const LINKS = [
  { href: "/app/superadmin/sistema/pantallas", label: "Pantallas y módulos" },
  { href: "/app/superadmin/sistema/permisos", label: "Acciones por pantalla" },
  { href: "/app/superadmin/sistema/roles", label: "Roles globales" },
] as const;

export function SystemCatalogSubnav() {
  const { pathname } = useLocation();
  return (
    <nav className="flex flex-wrap gap-2 border-b border-border pb-3" aria-label="Sistema">
      {LINKS.map((link) => {
        const active = pathname === link.href;
        return (
          <Link
            key={link.href}
            to={link.href}
            className={cn(
              "rounded-md px-3 py-1.5 text-sm transition-colors",
              active
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-muted hover:text-foreground",
            )}
            aria-current={active ? "page" : undefined}
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
