"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import {
  canAccessPath,
  getRoleHomePath,
  type UserSession,
} from "@/modules/identity/domain/session";
import { useSession } from "@/modules/identity/presentation/hooks/use-session";
import { getNavigationForRole } from "@/shared/config/navigation";
import { StatePanel } from "@/shared/presentation/components/feedback/state-panel";
import { AppSidebar } from "./app-sidebar";
import { AppTopbar } from "./app-topbar";
import { Sheet, SheetContent, SheetTitle } from "@/shared/presentation/components/ui/sheet";
import type { BreadcrumbItem } from "./breadcrumbs";

type AppShellProps = {
  children: React.ReactNode;
  breadcrumbs: BreadcrumbItem[];
};

export function AppShell({ children, breadcrumbs }: AppShellProps) {
  const router = useRouter();
  const { session, isLoading, signOut, isSigningOut } = useSession();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    if (isLoading) return;
    if (!session) {
      router.replace("/login");
      return;
    }
    if (!canAccessPath(session.role, pathname)) {
      router.replace(getRoleHomePath(session.role));
    }
  }, [isLoading, session, router, pathname]);

  const navSections = useMemo(
    () => (session ? getNavigationForRole(session.role) : []),
    [session],
  );

  if (isLoading || !session) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-6">
        <StatePanel
          variant="loading"
          title="Cargando sesión"
          description="Preparando su espacio de trabajo…"
          className="w-full max-w-md border-solid bg-card"
        />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-muted/20">
      <div className="hidden w-64 shrink-0 lg:block">
        <div className="fixed inset-y-0 left-0 w-64">
          <AppSidebar sections={navSections} />
        </div>
      </div>
      <Sheet open={mobileNavOpen} onOpenChange={setMobileNavOpen}>
        <SheetContent side="left" className="w-[min(100%,18rem)] p-0">
          <SheetTitle className="sr-only">Navegación</SheetTitle>
          <AppSidebar
            sections={navSections}
            onNavigate={() => setMobileNavOpen(false)}
          />
        </SheetContent>
      </Sheet>
      <div className="flex min-h-screen min-w-0 flex-1 flex-col lg:pl-64">
        <AppTopbar
          session={session}
          breadcrumbs={breadcrumbs}
          onOpenMobileNav={() => setMobileNavOpen(true)}
          onSignOut={async () => {
            await signOut();
            router.replace("/login");
          }}
        />
        <main
          id="main-content"
          className="flex-1 px-4 py-6 lg:px-8 lg:py-8"
          tabIndex={-1}
        >
          {children}
        </main>
      </div>
      {isSigningOut ? (
        <span className="sr-only" aria-live="polite">
          Cerrando sesión…
        </span>
      ) : null}
    </div>
  );
}

export type { UserSession };
