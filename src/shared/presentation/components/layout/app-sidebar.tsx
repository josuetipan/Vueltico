"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/shared/lib/utils";
import type { NavSection } from "@/shared/config/navigation";
import { ScrollArea } from "@/shared/presentation/components/ui/scroll-area";
import { Badge } from "@/shared/presentation/components/ui/badge";

type AppSidebarProps = {
  sections: NavSection[];
  onNavigate?: () => void;
};

export function AppSidebar({ sections, onNavigate }: AppSidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="flex h-full w-full flex-col bg-sidebar text-sidebar-foreground">
      <div className="flex h-14 items-center gap-2 border-b border-sidebar-border px-4">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sidebar-accent font-bold text-white">
          V
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold tracking-tight">Vueltico</p>
          <p className="truncate text-xs text-sidebar-muted">Plataforma B2B</p>
        </div>
      </div>
      <ScrollArea className="flex-1 px-3 py-4">
        <nav className="space-y-6" aria-label="Navegación principal">
          {sections.map((section, sectionIndex) => (
            <div key={section.label ?? sectionIndex} className="space-y-1">
              {section.label ? (
                <p className="px-2 text-[11px] font-semibold uppercase tracking-wider text-sidebar-muted">
                  {section.label}
                </p>
              ) : null}
              <ul className="space-y-0.5">
                {section.items.map((item) => {
                  const matchPrefix = item.matchPrefix ?? true;
                  const active =
                    pathname === item.href ||
                    (matchPrefix && pathname.startsWith(`${item.href}/`));
                  const Icon = item.icon;
                  return (
                    <li key={item.href}>
                      {item.disabled ? (
                        <span
                          className="flex cursor-not-allowed items-center gap-3 rounded-md px-2 py-2 text-sm text-sidebar-muted opacity-60"
                          aria-disabled="true"
                        >
                          <Icon className="h-4 w-4 shrink-0" aria-hidden />
                          <span className="truncate">{item.title}</span>
                          <Badge
                            variant="outline"
                            className="ml-auto border-sidebar-border text-[10px] text-sidebar-muted"
                          >
                            Próx.
                          </Badge>
                        </span>
                      ) : (
                        <Link
                          href={item.href}
                          onClick={onNavigate}
                          className={cn(
                            "flex items-center gap-3 rounded-md px-2 py-2 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-accent",
                            active
                              ? "bg-sidebar-accent/20 text-white"
                              : "text-sidebar-foreground/90 hover:bg-white/5 hover:text-white",
                          )}
                          aria-current={active ? "page" : undefined}
                        >
                          <Icon className="h-4 w-4 shrink-0" aria-hidden />
                          <span className="truncate">{item.title}</span>
                          {item.badge ? (
                            <Badge className="ml-auto">{item.badge}</Badge>
                          ) : null}
                        </Link>
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>
      </ScrollArea>
      <div className="border-t border-sidebar-border p-4 text-xs text-sidebar-muted">
        Prototipo · datos simulados
      </div>
    </aside>
  );
}
