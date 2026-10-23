import { useState, type ReactNode } from "react";
import { RoleDashboardShell } from "@/widgets/role-dashboard-shell";
import { PageHeader } from "@/shared/ui/layout/page-header";
import { cn } from "@/shared/lib/utils";
import { PermissionsPanel } from "./permissions-panel";
import { RolesPanel } from "./roles-panel";

type GovTab = "permissions" | "roles";

export function GovernanceClient() {
  const [tab, setTab] = useState<GovTab>("roles");

  return (
    <RoleDashboardShell
      breadcrumbs={[
        { label: "Plataforma", href: "/app/superadmin" },
        { label: "Gobernanza" },
      ]}
    >
      <div className="mx-auto max-w-7xl space-y-6">
        <PageHeader
          title="Permisos y roles"
          description="Defina qué puede hacer cada rol de plataforma. Los administradores heredan un rol."
        />

        <div
          className="inline-flex rounded-lg border border-border bg-muted/30 p-1"
          role="tablist"
          aria-label="Gobernanza"
        >
          <TabButton active={tab === "roles"} onClick={() => setTab("roles")}>
            Roles
          </TabButton>
          <TabButton active={tab === "permissions"} onClick={() => setTab("permissions")}>
            Permisos
          </TabButton>
        </div>

        {tab === "roles" ? <RolesPanel /> : <PermissionsPanel />}
      </div>
    </RoleDashboardShell>
  );
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      className={cn(
        "rounded-md px-4 py-2 text-sm font-normal transition-colors",
        active ? "bg-background text-foreground shadow-sm" : "text-foreground/70 hover:text-foreground",
      )}
      onClick={onClick}
    >
      {children}
    </button>
  );
}
