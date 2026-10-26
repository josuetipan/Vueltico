import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import {
  canAccessPath,
  getRoleHomePath,
  type UserSession,
} from "@/entities/session";
import { useSession } from "@/features/auth/model/use-session";
import { getNavigationForRole } from "@/shared/config/navigation";
import { buildOperatorNavigation } from "@/features/operator-portal/config/operator-navigation";
import { useOperatorContext } from "@/features/operator-portal/model/use-operator-context";
import { useBrandPaletteContext } from "@/features/platform-brand/ui/brand-palette-provider";
import { StatePanel } from "@/shared/ui/feedback/state-panel";
import { AppSidebar } from "@/widgets/app-sidebar";
import { AppTopbar } from "@/widgets/app-topbar";
import { Sheet, SheetContent, SheetTitle } from "@/shared/ui/sheet";
import type { BreadcrumbItem } from "@/shared/ui/layout/breadcrumbs";

type AppShellProps = {
  children: React.ReactNode;
  breadcrumbs: BreadcrumbItem[];
};

export function AppShell({ children, breadcrumbs }: AppShellProps) {
  const navigate = useNavigate();
  const { session, isLoading, signOut, isSigningOut } = useSession();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const pathname = useLocation().pathname;

  useEffect(() => {
    if (isLoading) return;
    if (!session) {
      navigate("/login", { replace: true });
      return;
    }
    if (!canAccessPath(session.role, pathname)) {
      navigate(getRoleHomePath(session.role), { replace: true });
    }
  }, [isLoading, session, navigate, pathname]);

  const { profile: operatorProfile, tenants: operatorTenants } = useOperatorContext();
  const { shellBranding } = useBrandPaletteContext();

  const navSections = useMemo(() => {
    if (!session) return [];
    if (session.role === "operator" && operatorProfile) {
      return buildOperatorNavigation(operatorProfile, operatorTenants.length);
    }
    if (session.role === "operator") {
      return getNavigationForRole("operator");
    }
    return getNavigationForRole(session.role);
  }, [session, operatorProfile, operatorTenants.length]);

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
    <div className="min-h-screen bg-background">
      <div className="fixed inset-y-0 left-0 z-30 hidden w-64 lg:block">
        <AppSidebar sections={navSections} shellBranding={shellBranding} />
      </div>
      <Sheet open={mobileNavOpen} onOpenChange={setMobileNavOpen}>
        <SheetContent side="left" className="w-[min(100%,18rem)] p-0">
          <SheetTitle className="sr-only">Navegación</SheetTitle>
          <AppSidebar
            sections={navSections}
            shellBranding={shellBranding}
            onNavigate={() => setMobileNavOpen(false)}
          />
        </SheetContent>
      </Sheet>
      <div className="flex min-h-screen min-w-0 flex-col lg:pl-64">
        <AppTopbar
          session={session}
          breadcrumbs={breadcrumbs}
          onOpenMobileNav={() => setMobileNavOpen(true)}
          onSignOut={async () => {
            await signOut();
            navigate("/login", { replace: true });
          }}
        />
        <main
          id="main-content"
          className="flex-1 bg-background px-4 py-6 lg:px-8 lg:py-8"
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
