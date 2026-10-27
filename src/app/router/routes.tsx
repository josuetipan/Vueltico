import { Navigate, Route, Routes, useParams } from "react-router-dom";
import { SuperadminDashboardClient } from "@/pages/superadmin-dashboard";
import { OrganizationsListClient } from "@/features/organization-list";
import { OrganizationWizardClient } from "@/features/organization-create";
import { OrganizationDetailClient } from "@/features/organization-detail";
import { TransferInboxClient } from "@/features/transfer-inbox";
import { TransferDetailClient } from "@/features/transfer-detail";
import { CommercialReportClient } from "@/features/commercial-report";
import { OperatorDashboardClient } from "@/features/operator-dashboard";
import {
  OperatorAccountsClient,
  OperatorMovementsClient,
  OperatorNewMovementClient,
  OperatorNotificationsClient,
  OperatorOrganizationClient,
  OperatorProfileClient,
  OperatorRequestsClient,
  OperatorSalesClient,
  OperatorShiftsClient,
} from "@/features/operator-screens";
import { ForgotPasswordPage, LoginPage } from "@/pages/login";
import { AppIndexRedirect } from "@/pages/app-index";
import { CompanyDashboardPage } from "@/pages/company-dashboard";
import { HomeRedirect } from "@/pages/home-redirect";
import { PrototypeRoutes } from "@/app/router/prototype-routes";
import { SuperadminParametrizationPage } from "@/pages/superadmin-parametrization";
import { GovernanceClient } from "@/features/platform-governance";
import { PlatformAdminsClient } from "@/features/platform-admins";
import {
  InvoicesClient,
  PlansCatalogClient,
  SubscriptionsClient,
} from "@/features/platform-billing";
import {
  GlobalRolesClient,
  ScreenActionsClient,
  ScreensCatalogClient,
} from "@/features/system-catalog";

function OrgDetailRoute() {
  const { id } = useParams();
  if (!id) return null;
  return <OrganizationDetailClient organizationId={id} />;
}

function OrgEditRedirectRoute() {
  const { id } = useParams();
  if (!id) return <Navigate to="/app/superadmin/empresas" replace />;
  return <Navigate to={`/app/superadmin/empresas/${id}`} replace />;
}

function TransferDetailRoute() {
  const { id } = useParams();
  if (!id) return null;
  return <TransferDetailClient paymentId={id} />;
}

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<HomeRedirect />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/login/recuperar-contrasena" element={<ForgotPasswordPage />} />
      <Route path="/prototipos/*" element={<PrototypeRoutes />} />

      <Route path="/app" element={<AppIndexRedirect />} />

      <Route path="/app/superadmin" element={<SuperadminDashboardClient />} />
      <Route path="/app/superadmin/parametrizacion" element={<SuperadminParametrizationPage />} />
      <Route path="/app/superadmin/gobernanza" element={<GovernanceClient />} />
      <Route path="/app/superadmin/administradores" element={<PlatformAdminsClient />} />
      <Route
        path="/app/superadmin/admins-empresas"
        element={<Navigate to="/app/superadmin/empresas" replace />}
      />
      <Route path="/app/superadmin/empresas" element={<OrganizationsListClient />} />
      <Route path="/app/superadmin/empresas/nueva" element={<OrganizationWizardClient />} />
      <Route path="/app/superadmin/empresas/:id" element={<OrgDetailRoute />} />
      <Route path="/app/superadmin/empresas/:id/editar" element={<OrgEditRedirectRoute />} />
      <Route path="/app/superadmin/planes" element={<PlansCatalogClient />} />
      <Route path="/app/superadmin/suscripciones" element={<SubscriptionsClient />} />
      <Route path="/app/superadmin/facturas" element={<InvoicesClient />} />
      <Route path="/app/superadmin/sistema/pantallas" element={<ScreensCatalogClient />} />
      <Route path="/app/superadmin/sistema/permisos" element={<ScreenActionsClient />} />
      <Route path="/app/superadmin/sistema/roles" element={<GlobalRolesClient />} />

      <Route path="/app/empresa" element={<CompanyDashboardPage />} />
      <Route path="/app/empresa/transferencias" element={<TransferInboxClient mode="pending" />} />
      <Route path="/app/empresa/transferencias/historial" element={<TransferInboxClient mode="history" />} />
      <Route path="/app/empresa/transferencias/:id" element={<TransferDetailRoute />} />
      <Route path="/app/empresa/reportes" element={<CommercialReportClient kind="analytical_dashboard" />} />
      <Route path="/app/empresa/reportes/ventas-diarias" element={<CommercialReportClient kind="daily_sales" />} />
      <Route path="/app/empresa/reportes/ingresos-egresos" element={<CommercialReportClient kind="income_expense" />} />
      <Route path="/app/empresa/reportes/medios-pago" element={<CommercialReportClient kind="payment_methods" />} />
      <Route path="/app/empresa/reportes/sucursales" element={<CommercialReportClient kind="by_branch" />} />
      <Route path="/app/empresa/reportes/cajeros" element={<CommercialReportClient kind="by_cashier" />} />
      <Route path="/app/empresa/reportes/cierres" element={<CommercialReportClient kind="closures" />} />
      <Route path="/app/empresa/reportes/transferencias" element={<CommercialReportClient kind="transfers" />} />

      <Route path="/app/operativo" element={<OperatorDashboardClient />} />
      <Route path="/app/operativo/organizacion" element={<OperatorOrganizationClient />} />
      <Route path="/app/operativo/cuentas" element={<OperatorAccountsClient />} />
      <Route path="/app/operativo/movimientos" element={<OperatorMovementsClient />} />
      <Route path="/app/operativo/movimientos/nuevo" element={<OperatorNewMovementClient />} />
      <Route path="/app/operativo/ventas" element={<OperatorSalesClient />} />
      <Route path="/app/operativo/turnos" element={<OperatorShiftsClient />} />
      <Route path="/app/operativo/solicitudes" element={<OperatorRequestsClient />} />
      <Route path="/app/operativo/notificaciones" element={<OperatorNotificationsClient />} />
      <Route path="/app/operativo/perfil" element={<OperatorProfileClient />} />

      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}
