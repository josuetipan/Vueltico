import { Link, useLocation } from "react-router-dom";
import { cn } from "@/shared/lib/utils";

const LINKS = [
  { href: "/app/superadmin/planes", label: "Catálogo de planes" },
  { href: "/app/superadmin/suscripciones", label: "Suscripciones" },
  { href: "/app/superadmin/facturas", label: "Facturas" },
] as const;

export function BillingSubnav() {
  const { pathname } = useLocation();
  return (
    <nav
      className="flex flex-wrap gap-2 border-b border-border pb-3"
      aria-label="Facturación"
    >
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
