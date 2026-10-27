import { useState } from "react";
import { PlatformAdminsBlock } from "@/features/platform-admins/ui/platform-admins-block";
import { PageHeader } from "@/shared/ui/layout/page-header";
import { PageHeaderAction } from "@/shared/ui/layout/page-header-action";

export function PlatformAdminsPageSection() {
  const [showCreateForm, setShowCreateForm] = useState(false);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Administradores de plataforma"
        description="Registro de administradores con plan, vigencia y rol de gobernanza."
        actions={
          <PageHeaderAction type="button" onClick={() => setShowCreateForm(true)}>
            Nuevo administrador
          </PageHeaderAction>
        }
      />
      <PlatformAdminsBlock
        showCreateForm={showCreateForm}
        onShowCreateFormChange={setShowCreateForm}
      />
    </div>
  );
}
