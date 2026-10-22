"use client";

import { Menu, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import type { UserSession } from "@/modules/identity/domain/session";
import { getRoleLabel } from "@/shared/config/navigation";
import { AppBreadcrumbs, type BreadcrumbItem } from "./breadcrumbs";
import { Avatar, AvatarFallback } from "@/shared/presentation/components/ui/avatar";
import { Button } from "@/shared/presentation/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/shared/presentation/components/ui/dropdown-menu";

type AppTopbarProps = {
  session: UserSession;
  breadcrumbs: BreadcrumbItem[];
  onOpenMobileNav?: () => void;
  onSignOut: () => void;
};

export function AppTopbar({
  session,
  breadcrumbs,
  onOpenMobileNav,
  onSignOut,
}: AppTopbarProps) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  return (
    <header className="sticky top-0 z-40 flex h-14 shrink-0 items-center gap-3 border-b bg-background/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/80 lg:px-6">
      <Button
        variant="ghost"
        size="icon"
        className="lg:hidden"
        onClick={onOpenMobileNav}
        aria-label="Abrir menú de navegación"
      >
        <Menu className="h-5 w-5" />
      </Button>
      <div className="min-w-0 flex-1">
        <AppBreadcrumbs items={breadcrumbs} />
      </div>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
        aria-label="Cambiar tema claro u oscuro"
      >
        {mounted && theme === "dark" ? (
          <Sun className="h-4 w-4" />
        ) : (
          <Moon className="h-4 w-4" />
        )}
      </Button>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="relative h-9 gap-2 px-2"
            aria-label="Menú de cuenta"
          >
            <Avatar className="h-8 w-8">
              <AvatarFallback className="bg-primary/10 text-xs text-primary">
                {session.avatarInitials}
              </AvatarFallback>
            </Avatar>
            <span className="hidden max-w-[140px] truncate text-left text-sm md:inline">
              {session.fullName}
            </span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium">{session.fullName}</p>
              <p className="text-xs text-muted-foreground">{session.email}</p>
              <p className="text-xs text-muted-foreground">
                {getRoleLabel(session.role)}
              </p>
              {session.tenant ? (
                <p className="text-xs text-muted-foreground">
                  {session.tenant.tradeName}
                </p>
              ) : null}
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={onSignOut}>Cerrar sesión</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}
