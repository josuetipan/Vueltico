import { Route, Routes } from "react-router-dom";
import { PrototypeHubPage } from "@/pages/prototypes/hub";
import { IdentityPrototypeHome } from "@/pages/prototypes/identity";
import { PlatformAdminPrototypeHome } from "@/pages/prototypes/platform-admin";
import { OrganizationsPrototypeHome } from "@/pages/prototypes/organizations";
import { TransferReconciliationPrototypeHome } from "@/pages/prototypes/transfer-reconciliation";
import { CommercialReportsPrototypeHome } from "@/pages/prototypes/commercial-reports";
import { OperatorPortalPrototypeHome } from "@/pages/prototypes/operator-portal";
import { SystemCatalogPrototypeHome } from "@/pages/prototypes/system-catalog";

/** Rutas anidadas bajo /prototipos/* en AppRoutes */
export function PrototypeRoutes() {
  return (
    <Routes>
      <Route index element={<PrototypeHubPage />} />
      <Route path="identity" element={<IdentityPrototypeHome />} />
      <Route path="platform-admin" element={<PlatformAdminPrototypeHome />} />
      <Route path="organizations" element={<OrganizationsPrototypeHome />} />
      <Route path="transfer-reconciliation" element={<TransferReconciliationPrototypeHome />} />
      <Route path="commercial-reports" element={<CommercialReportsPrototypeHome />} />
      <Route path="operator-portal" element={<OperatorPortalPrototypeHome />} />
      <Route path="system-catalog" element={<SystemCatalogPrototypeHome />} />
    </Routes>
  );
}
