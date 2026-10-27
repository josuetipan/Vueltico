import { useState } from "react";
import { CompanyAdminsBlock } from "@/features/company-admins/ui/company-admins-block";
import { PageHeader } from "@/shared/ui/layout/page-header";
import { PageHeaderAction } from "@/shared/ui/layout/page-header-action";

export function CompanyAdminsPageSection() {
  const [showCreateForm, setShowCreateForm] = useState(false);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Administradores de empresas"
        description="Personas que administran cada tenant cliente. Distinto de Admins. plataforma (equipo Vueltico)."
        actions={
          <PageHeaderAction type="button" onClick={() => setShowCreateForm(true)}>
            Nuevo admin. empresa
          </PageHeaderAction>
        }
      />
      <CompanyAdminsBlock
        showCreateForm={showCreateForm}
        onShowCreateFormChange={setShowCreateForm}
      />
    </div>
  );
}
