import fs from "node:fs";
import path from "node:path";

const root = path.join(import.meta.dirname, "..", "src");

const replacements = [
  ["@/shared/presentation/components/ui/", "@/shared/ui/"],
  ["@/shared/presentation/components/data/", "@/shared/ui/data/"],
  ["@/shared/presentation/components/feedback/", "@/shared/ui/feedback/"],
  ["@/shared/presentation/components/layout/app-shell", "@/widgets/app-shell"],
  ["@/shared/presentation/components/layout/app-sidebar", "@/widgets/app-sidebar"],
  ["@/shared/presentation/components/layout/app-topbar", "@/widgets/app-topbar"],
  ["@/shared/presentation/components/layout/role-dashboard-shell", "@/widgets/role-dashboard-shell"],
  ["@/shared/presentation/components/layout/page-header", "@/shared/ui/layout/page-header"],
  ["@/shared/presentation/components/layout/breadcrumbs", "@/shared/ui/layout/breadcrumbs"],
  ["@/shared/presentation/providers/app-providers", "@/app/providers/app-providers"],
  ["@/shared/domain/api/", "@/shared/api/"],
  ["@/modules/identity/domain/session", "@/entities/session"],
  ["@/modules/identity/application/ports/session-repository", "@/entities/session/api/session-repository"],
  ["@/modules/identity/infrastructure/mock-session-repository", "@/entities/session/api/mock-session-repository"],
  ["@/modules/identity/infrastructure/identity-composition", "@/features/auth/api/identity-composition"],
  ["@/modules/identity/application/use-cases/", "@/features/auth/model/"],
  ["@/modules/identity/presentation/hooks/use-session", "@/features/auth/model/use-session"],
  ["@/modules/identity/presentation/components/login-form", "@/features/auth/ui/login-form"],
  ["@/modules/organizations/domain/", "@/entities/organization/model/"],
  ["@/modules/organizations/application/ports/", "@/entities/organization/api/"],
  ["@/modules/organizations/infrastructure/mock-organization-repository", "@/entities/organization/api/mock-organization-repository"],
  ["@/modules/organizations/infrastructure/mock-audit-log-repository", "@/entities/organization/api/mock-audit-log-repository"],
  ["@/modules/organizations/infrastructure/organizations-composition", "@/features/organization/api/organizations-composition"],
  ["@/modules/organizations/application/use-cases/", "@/features/organization/model/"],
  ["@/modules/organizations/presentation/hooks/use-actor-email", "@/features/organization/model/use-actor-email"],
  ["@/modules/organizations/presentation/components/organizations-list-client", "@/features/organization-list/ui/organizations-list"],
  ["@/modules/organizations/presentation/components/organization-wizard-client", "@/features/organization-create/ui/organization-wizard"],
  ["@/modules/organizations/presentation/components/organization-detail-client", "@/features/organization-detail/ui/organization-detail"],
  ["@/modules/organizations/presentation/components/organization-edit-client", "@/features/organization-edit/ui/organization-edit"],
  ["@/modules/organizations/presentation/components/invite-principal-admin-client", "@/features/organization-invite/ui/invite-principal-admin"],
  ["@/modules/organizations/presentation/components/organization-status-badge", "@/entities/organization/ui/organization-status-badge"],
  ["@/modules/transfer-reconciliation/domain/", "@/entities/transfer-payment/model/"],
  ["@/modules/transfer-reconciliation/application/ports/", "@/entities/transfer-payment/api/"],
  ["@/modules/transfer-reconciliation/infrastructure/mock-transfer-reconciliation-repository", "@/entities/transfer-payment/api/mock-transfer-reconciliation-repository"],
  ["@/modules/transfer-reconciliation/infrastructure/mock-receipt-preview", "@/entities/transfer-payment/api/mock-receipt-preview"],
  ["@/modules/transfer-reconciliation/infrastructure/transfer-reconciliation-composition", "@/features/transfer-reconciliation/api/transfer-reconciliation-composition"],
  ["@/modules/transfer-reconciliation/application/use-cases/", "@/features/transfer-reconciliation/model/"],
  ["@/modules/transfer-reconciliation/presentation/components/transfer-inbox-client", "@/features/transfer-inbox/ui/transfer-inbox"],
  ["@/modules/transfer-reconciliation/presentation/components/transfer-detail-client", "@/features/transfer-detail/ui/transfer-detail"],
  ["@/modules/transfer-reconciliation/presentation/components/transfer-status-badge", "@/entities/transfer-payment/ui/transfer-status-badge"],
  ["@/modules/transfer-reconciliation/presentation/components/receipt-viewer", "@/widgets/receipt-viewer"],
  ["@/modules/commercial-reports/domain/", "@/entities/commercial-report/model/"],
  ["@/modules/commercial-reports/application/ports/", "@/entities/commercial-report/api/"],
  ["@/modules/commercial-reports/infrastructure/mock-commercial-dataset", "@/entities/commercial-report/api/mock-commercial-dataset"],
  ["@/modules/commercial-reports/infrastructure/mock-commercial-reports-repository", "@/entities/commercial-report/api/mock-commercial-reports-repository"],
  ["@/modules/commercial-reports/infrastructure/commercial-reports-composition", "@/features/commercial-report/api/commercial-reports-composition"],
  ["@/modules/commercial-reports/presentation/components/commercial-report-client", "@/features/commercial-report/ui/commercial-report"],
  ["@/modules/commercial-reports/presentation/components/reports-nav", "@/widgets/reports-nav"],
  ["@/modules/commercial-reports/presentation/components/report-filters-bar", "@/widgets/report-filters-bar"],
  ["@/modules/commercial-reports/presentation/components/report-charts", "@/widgets/report-charts"],
  ["@/modules/commercial-reports/presentation/components/report-toolbar-actions", "@/widgets/report-toolbar-actions"],
  ["@/modules/operator-portal/domain/", "@/entities/operator/model/"],
  ["@/modules/operator-portal/application/ports/", "@/entities/operator/api/"],
  ["@/modules/operator-portal/infrastructure/mock-operator-portal-repository", "@/entities/operator/api/mock-operator-portal-repository"],
  ["@/modules/operator-portal/infrastructure/operator-portal-composition", "@/features/operator-portal/api/operator-portal-composition"],
  ["@/modules/operator-portal/presentation/config/operator-navigation", "@/features/operator-portal/config/operator-navigation"],
  ["@/modules/operator-portal/presentation/hooks/use-operator-context", "@/features/operator-portal/model/use-operator-context"],
  ["@/modules/operator-portal/presentation/components/operator-dashboard-client", "@/features/operator-dashboard/ui/operator-dashboard"],
  ["@/modules/operator-portal/presentation/components/operator-screens-client", "@/features/operator-screens/ui/operator-screens"],
  ["@/modules/operator-portal/presentation/components/operator-access-denied", "@/features/operator-portal/ui/operator-access-denied"],
  ["@/modules/operator-portal/presentation/components/operator-permission-gate", "@/features/operator-portal/ui/operator-permission-gate"],
  ["@/modules/platform-admin/domain/", "@/entities/platform-metrics/model/"],
  ["@/modules/platform-admin/infrastructure/mock-platform-metrics-repository", "@/entities/platform-metrics/api/mock-platform-metrics-repository"],
  ["@/modules/platform-admin/platform-admin-api", "@/features/platform-dashboard/api/platform-admin-api"],
  ["@/modules/platform-admin/company-dashboard-api", "@/features/company-dashboard/api/company-dashboard-api"],
  ["@/pages/LoginPage", "@/pages/login"],
  ["@/pages/HomeRedirect", "@/pages/home-redirect"],
  ["@/pages/AppIndexRedirect", "@/pages/app-index"],
  ["@/pages/CompanyDashboardPage", "@/pages/company-dashboard"],
  ["@/pages/SuperadminDashboardClient", "@/pages/superadmin-dashboard"],
  ["@/router/AppRoutes", "@/app/router/routes"],
  ["@/prototypes/_shared/prototype-frame", "@/shared/ui/prototype/prototype-frame"],
  ["@/prototypes/_shared/planned-screens-panel", "@/shared/ui/prototype/planned-screens-panel"],
  ["@/prototypes/registry", "@/pages/prototypes/config/registry"],
  ["@/prototypes/hub/prototype-hub-page", "@/pages/prototypes/hub"],
  ["@/prototypes/router/prototype-routes", "@/app/router/prototype-routes"],
  ["@/prototypes/identity/identity-prototype-home", "@/pages/prototypes/identity"],
  ["@/prototypes/identity/planned-screens", "@/pages/prototypes/identity/planned-screens"],
  ["@/prototypes/platform-admin/platform-admin-prototype-home", "@/pages/prototypes/platform-admin"],
  ["@/prototypes/platform-admin/planned-screens", "@/pages/prototypes/platform-admin/planned-screens"],
  ["@/prototypes/organizations/organizations-prototype-home", "@/pages/prototypes/organizations"],
  ["@/prototypes/organizations/planned-screens", "@/pages/prototypes/organizations/planned-screens"],
  ["@/prototypes/transfer-reconciliation/transfer-reconciliation-prototype-home", "@/pages/prototypes/transfer-reconciliation"],
  ["@/prototypes/transfer-reconciliation/planned-screens", "@/pages/prototypes/transfer-reconciliation/planned-screens"],
  ["@/prototypes/commercial-reports/commercial-reports-prototype-home", "@/pages/prototypes/commercial-reports"],
  ["@/prototypes/commercial-reports/planned-screens", "@/pages/prototypes/commercial-reports/planned-screens"],
  ["@/prototypes/operator-portal/operator-portal-prototype-home", "@/pages/prototypes/operator-portal"],
  ["@/prototypes/operator-portal/planned-screens", "@/pages/prototypes/operator-portal/planned-screens"],
  ['from "../../domain/session"', 'from "@/entities/session"'],
  ['from "../domain/session"', 'from "@/entities/session"'],
  ['from "../../domain/organization"', 'from "@/entities/organization/model/organization"'],
  ['from "../../infrastructure/organizations-composition"', 'from "@/features/organization/api/organizations-composition"'],
  ['from "../../application/use-cases/suspend-organization"', 'from "@/features/organization/model/suspend-organization"'],
  ['from "../../application/use-cases/reactivate-organization"', 'from "@/features/organization/model/reactivate-organization"'],
  ['from "../../infrastructure/operator-portal-composition"', 'from "@/features/operator-portal/api/operator-portal-composition"'],
  ['from "@/modules/transfer-reconciliation/infrastructure/mock-receipt-preview"', 'from "@/entities/transfer-payment/api/mock-receipt-preview"'],
  ["@/App", "@/app/App"],
  ['from "./App"', 'from "@/app/App"'],
  ['import "./styles/globals.css"', 'import "@/app/styles/globals.css"'],
];

function walk(dir, files = []) {
  for (const name of fs.readdirSync(dir)) {
    const p = path.join(dir, name);
    if (name === "node_modules" || name === "app" && dir.endsWith("src\\app")) continue;
    const st = fs.statSync(p);
    if (st.isDirectory()) walk(p, files);
    else if (/\.(tsx?|mjs)$/.test(name)) files.push(p);
  }
  return files;
}

function applyReplacements(content) {
  let out = content;
  for (const [from, to] of replacements) {
    out = out.split(from).join(to);
  }
  return out;
}

const files = walk(root);
let changed = 0;
for (const file of files) {
  const before = fs.readFileSync(file, "utf8");
  const after = applyReplacements(before);
  if (after !== before) {
    fs.writeFileSync(file, after);
    changed++;
  }
}
console.log(`Updated ${changed} files`);
