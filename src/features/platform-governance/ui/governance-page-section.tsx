import { useState } from "react";
import {
  GovernanceWorkspace,
  type GovTab,
} from "@/features/platform-governance/ui/governance-workspace";
import { PageHeader } from "@/shared/ui/layout/page-header";
import { PageHeaderAction } from "@/shared/ui/layout/page-header-action";

export function GovernancePageSection() {
  const [tab, setTab] = useState<GovTab>("roles");
  const [rolesShowCreateForm, setRolesShowCreateForm] = useState(false);
  const [permissionsShowCreateForm, setPermissionsShowCreateForm] = useState(false);

  function onTabChange(next: GovTab) {
    setTab(next);
    setRolesShowCreateForm(false);
    setPermissionsShowCreateForm(false);
  }

  const headerAction =
    tab === "roles" ? (
      <PageHeaderAction type="button" onClick={() => setRolesShowCreateForm(true)}>
        Nuevo rol
      </PageHeaderAction>
    ) : tab === "permissions" ? (
      <PageHeaderAction type="button" onClick={() => setPermissionsShowCreateForm(true)}>
        Nuevo permiso
      </PageHeaderAction>
    ) : null;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Permisos y roles"
        description="Defina qué puede hacer cada rol de plataforma. Los administradores heredan un rol."
        actions={headerAction}
      />
      <GovernanceWorkspace
        tab={tab}
        onTabChange={onTabChange}
        rolesShowCreateForm={rolesShowCreateForm}
        onRolesShowCreateFormChange={setRolesShowCreateForm}
        permissionsShowCreateForm={permissionsShowCreateForm}
        onPermissionsShowCreateFormChange={setPermissionsShowCreateForm}
      />
    </div>
  );
}
