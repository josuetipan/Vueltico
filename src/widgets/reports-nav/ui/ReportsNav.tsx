import { Link, useLocation } from "react-router-dom";
import { cn } from "@/shared/lib/utils";

const LINKS = [
  { href: "/app/empresa/reportes", label: "Dashboard analítico", exact: true },
  { href: "/app/empresa/reportes/ventas-diarias", label: "Ventas diarias" },
  { href: "/app/empresa/reportes/ingresos-egresos", label: "Ingresos y egresos" },
  { href: "/app/empresa/reportes/medios-pago", label: "Medios de pago" },
  { href: "/app/empresa/reportes/sucursales", label: "Por sucursal" },
  { href: "/app/empresa/reportes/cajeros", label: "Por cajero" },
  { href: "/app/empresa/reportes/cierres", label: "Cierres y diferencias" },
  { href: "/app/empresa/reportes/transferencias", label: "Transferencias" },
];

export function ReportsNav() {
  const pathname = useLocation().pathname;
  return (
    <nav className="flex flex-wrap gap-2 print:hidden" aria-label="Reportes">
      {LINKS.map((link) => {
        const active = link.exact ? pathname === link.href : pathname.startsWith(link.href);
        return (
          <Link
            key={link.href}
            to={link.href}
            className={cn(
              "rounded-md border px-3 py-1.5 text-sm transition-colors",
              active ? "border-primary bg-primary/10 text-primary" : "hover:bg-muted",
            )}
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
