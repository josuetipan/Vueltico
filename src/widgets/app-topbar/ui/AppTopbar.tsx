import { Bell, Menu, Moon, Sun } from "lucide-react";
import { useTheme } from "@/shared/lib/theme";
import { useEffect, useState } from "react";
import type { UserSession } from "@/entities/session";
import { getRoleLabel } from "@/shared/config/navigation";
import { AppBreadcrumbs, type BreadcrumbItem } from "@/shared/ui/layout/breadcrumbs";
import { Avatar, AvatarFallback } from "@/shared/ui/avatar";
import { Button } from "@/shared/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/shared/ui/dropdown-menu";

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
  const { theme, toggleTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  return (
    <header className="sticky top-0 z-40 flex h-14 shrink-0 items-center gap-3 border-b border-border bg-background px-4 lg:px-6">
      <Button variant="ghost" size="icon" className="lg:hidden" onClick={onOpenMobileNav} aria-label="Abrir menú">
        <Menu className="h-5 w-5" />
      </Button>
      <div className="min-w-0 flex-1">
        <AppBreadcrumbs items={breadcrumbs} />
      </div>
      {session.role === "superadmin" ? (
        <Button variant="ghost" size="icon" className="relative" aria-label="Notificaciones">
          <Bell className="h-4 w-4" />
        </Button>
      ) : null}
      <Button variant="ghost" size="icon" onClick={toggleTheme} aria-label="Tema">
        {mounted && theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
      </Button>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-9 gap-2 px-2" aria-label="Cuenta">
            <Avatar className="h-8 w-8">
              <AvatarFallback className="bg-primary/10 text-xs text-primary">{session.avatarInitials}</AvatarFallback>
            </Avatar>
            <span className="hidden max-w-[140px] truncate text-sm md:inline">{session.fullName}</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel className="font-normal">
            <p className="text-sm font-medium">{session.fullName}</p>
            <p className="text-xs text-muted-foreground">{session.email}</p>
            <p className="text-xs text-muted-foreground">{getRoleLabel(session.role)}</p>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={onSignOut}>Cerrar sesión</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}
