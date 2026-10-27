import { SegmentTabs } from "@/shared/ui/layout/segment-tabs";
import { PermissionsPanel } from "./permissions-panel";
import { RolesPanel } from "./roles-panel";

export type GovTab = "permissions" | "roles";

const GOV_TABS = [
  { id: "roles" as const, label: "Roles" },
  { id: "permissions" as const, label: "Permisos" },
];

type GovernanceWorkspaceProps = {
  tab: GovTab;
  onTabChange: (tab: GovTab) => void;
  rolesShowCreateForm: boolean;
  onRolesShowCreateFormChange: (open: boolean) => void;
  permissionsShowCreateForm: boolean;
  onPermissionsShowCreateFormChange: (open: boolean) => void;
};

export function GovernanceWorkspace({
  tab,
  onTabChange,
  rolesShowCreateForm,
  onRolesShowCreateFormChange,
  permissionsShowCreateForm,
  onPermissionsShowCreateFormChange,
}: GovernanceWorkspaceProps) {
  return (
    <div className="space-y-6">
      <SegmentTabs
        items={GOV_TABS}
        value={tab}
        onChange={onTabChange}
        ariaLabel="Gobernanza"
      />
      {tab === "roles" ? (
        <RolesPanel
          showCreateForm={rolesShowCreateForm}
          onShowCreateFormChange={onRolesShowCreateFormChange}
        />
      ) : (
        <PermissionsPanel
          showCreateForm={permissionsShowCreateForm}
          onShowCreateFormChange={onPermissionsShowCreateFormChange}
        />
      )}
    </div>
  );
}
