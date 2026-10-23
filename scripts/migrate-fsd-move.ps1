$ErrorActionPreference = "Stop"
$src = Join-Path $PSScriptRoot "..\src"

function Ensure-Dir($p) { New-Item -ItemType Directory -Force -Path $p | Out-Null }
function Move-File($from, $to) {
  if (-not (Test-Path $from)) { return }
  Ensure-Dir (Split-Path $to -Parent)
  Move-Item -Force $from $to
}

# Legacy Next.js
$legacyApp = Join-Path $src "app"
if (Test-Path $legacyApp) { Remove-Item -Recurse -Force $legacyApp }

# --- shared/ui ---
Ensure-Dir "$src\shared\ui\data"
Ensure-Dir "$src\shared\ui\feedback"
Ensure-Dir "$src\shared\ui\layout"
Ensure-Dir "$src\shared\ui\prototype"
Move-File "$src\shared\presentation\components\ui\*" "$src\shared\ui\"
Get-ChildItem "$src\shared\presentation\components\data" -ErrorAction SilentlyContinue | Move-Item -Destination "$src\shared\ui\data\"
Get-ChildItem "$src\shared\presentation\components\feedback" -ErrorAction SilentlyContinue | Move-Item -Destination "$src\shared\ui\feedback\"
Move-File "$src\shared\presentation\components\layout\page-header.tsx" "$src\shared\ui\layout\page-header.tsx"
Move-File "$src\shared\presentation\components\layout\breadcrumbs.tsx" "$src\shared\ui\layout\breadcrumbs.tsx"
Move-File "$src\shared\domain\api\contracts.ts" "$src\shared\api\contracts.ts"

# --- widgets ---
$widgetMap = @{
  "app-shell.tsx" = "app-shell\ui\AppShell.tsx"
  "app-sidebar.tsx" = "app-sidebar\ui\AppSidebar.tsx"
  "app-topbar.tsx" = "app-topbar\ui\AppTopbar.tsx"
  "role-dashboard-shell.tsx" = "role-dashboard-shell\ui\RoleDashboardShell.tsx"
}
foreach ($entry in $widgetMap.GetEnumerator()) {
  $from = Join-Path "$src\shared\presentation\components\layout" $entry.Key
  $to = Join-Path "$src\widgets" $entry.Value
  Move-File $from $to
}

# --- app ---
Ensure-Dir "$src\app\providers"
Ensure-Dir "$src\app\router"
Ensure-Dir "$src\app\styles"
Move-File "$src\App.tsx" "$src\app\App.tsx"
Move-File "$src\styles\globals.css" "$src\app\styles\globals.css"
Move-File "$src\shared\presentation\providers\app-providers.tsx" "$src\app\providers\app-providers.tsx"
Move-File "$src\router\AppRoutes.tsx" "$src\app\router\routes.tsx"
Move-File "$src\prototypes\router\prototype-routes.tsx" "$src\app\router\prototype-routes.tsx"

# --- pages (app routes) ---
Ensure-Dir "$src\pages\login\ui"
Ensure-Dir "$src\pages\home-redirect\ui"
Ensure-Dir "$src\pages\app-index\ui"
Ensure-Dir "$src\pages\company-dashboard\ui"
Ensure-Dir "$src\pages\superadmin-dashboard\ui"
Move-File "$src\pages\LoginPage.tsx" "$src\pages\login\ui\LoginPage.tsx"
Move-File "$src\pages\HomeRedirect.tsx" "$src\pages\home-redirect\ui\HomeRedirect.tsx"
Move-File "$src\pages\AppIndexRedirect.tsx" "$src\pages\app-index\ui\AppIndexRedirect.tsx"
Move-File "$src\pages\CompanyDashboardPage.tsx" "$src\pages\company-dashboard\ui\CompanyDashboardPage.tsx"
Move-File "$src\pages\SuperadminDashboardClient.tsx" "$src\pages\superadmin-dashboard\ui\SuperadminDashboardPage.tsx"

# --- prototypes -> pages/prototypes ---
$proto = "$src\prototypes"
$pp = "$src\pages\prototypes"
Ensure-Dir "$pp\config"
Ensure-Dir "$pp\hub\ui"
Ensure-Dir "$pp\identity\ui"
Ensure-Dir "$pp\platform-admin\ui"
Ensure-Dir "$pp\organizations\ui"
Ensure-Dir "$pp\transfer-reconciliation\ui"
Ensure-Dir "$pp\commercial-reports\ui"
Ensure-Dir "$pp\operator-portal\ui"
Move-File "$proto\registry.ts" "$pp\config\registry.ts"
Move-File "$proto\hub\prototype-hub-page.tsx" "$pp\hub\ui\PrototypeHubPage.tsx"
Move-File "$proto\_shared\prototype-frame.tsx" "$src\shared\ui\prototype\prototype-frame.tsx"
Move-File "$proto\_shared\planned-screens-panel.tsx" "$src\shared\ui\prototype\planned-screens-panel.tsx"
Move-File "$proto\identity\identity-prototype-home.tsx" "$pp\identity\ui\IdentityPrototypePage.tsx"
Move-File "$proto\identity\planned-screens.ts" "$pp\identity\planned-screens.ts"
Move-File "$proto\platform-admin\platform-admin-prototype-home.tsx" "$pp\platform-admin\ui\PlatformAdminPrototypePage.tsx"
Move-File "$proto\platform-admin\planned-screens.ts" "$pp\platform-admin\planned-screens.ts"
Move-File "$proto\organizations\organizations-prototype-home.tsx" "$pp\organizations\ui\OrganizationsPrototypePage.tsx"
Move-File "$proto\organizations\planned-screens.ts" "$pp\organizations\planned-screens.ts"
Move-File "$proto\transfer-reconciliation\transfer-reconciliation-prototype-home.tsx" "$pp\transfer-reconciliation\ui\TransferReconciliationPrototypePage.tsx"
Move-File "$proto\transfer-reconciliation\planned-screens.ts" "$pp\transfer-reconciliation\planned-screens.ts"
Move-File "$proto\commercial-reports\commercial-reports-prototype-home.tsx" "$pp\commercial-reports\ui\CommercialReportsPrototypePage.tsx"
Move-File "$proto\commercial-reports\planned-screens.ts" "$pp\commercial-reports\planned-screens.ts"
Move-File "$proto\operator-portal\operator-portal-prototype-home.tsx" "$pp\operator-portal\ui\OperatorPortalPrototypePage.tsx"
Move-File "$proto\operator-portal\planned-screens.ts" "$pp\operator-portal\planned-screens.ts"

# --- entities & features from modules ---
$m = "$src\modules"

# session / auth
Ensure-Dir "$src\entities\session\api"
Ensure-Dir "$src\features\auth\model"
Ensure-Dir "$src\features\auth\ui"
Ensure-Dir "$src\features\auth\api"
Move-File "$m\identity\domain\session.ts" "$src\entities\session\index.ts"
Move-File "$m\identity\application\ports\session-repository.ts" "$src\entities\session\api\session-repository.ts"
Move-File "$m\identity\infrastructure\mock-session-repository.ts" "$src\entities\session\api\mock-session-repository.ts"
Move-File "$m\identity\infrastructure\identity-composition.ts" "$src\features\auth\api\identity-composition.ts"
Get-ChildItem "$m\identity\application\use-cases" -ErrorAction SilentlyContinue | Move-Item -Destination "$src\features\auth\model\"
Move-File "$m\identity\presentation\hooks\use-session.ts" "$src\features\auth\model\use-session.ts"
Move-File "$m\identity\presentation\components\login-form.tsx" "$src\features\auth\ui\login-form.tsx"

# organization
Ensure-Dir "$src\entities\organization\model"
Ensure-Dir "$src\entities\organization\api"
Ensure-Dir "$src\entities\organization\ui"
Ensure-Dir "$src\features\organization\model"
Ensure-Dir "$src\features\organization\api"
Get-ChildItem "$m\organizations\domain" | Move-Item -Destination "$src\entities\organization\model\"
Get-ChildItem "$m\organizations\application\ports" | Move-Item -Destination "$src\entities\organization\api\"
Move-File "$m\organizations\infrastructure\mock-organization-repository.ts" "$src\entities\organization\api\mock-organization-repository.ts"
Move-File "$m\organizations\infrastructure\mock-audit-log-repository.ts" "$src\entities\organization\api\mock-audit-log-repository.ts"
Move-File "$m\organizations\infrastructure\organizations-composition.ts" "$src\features\organization\api\organizations-composition.ts"
Get-ChildItem "$m\organizations\application\use-cases" | Move-Item -Destination "$src\features\organization\model\"
Move-File "$m\organizations\presentation\hooks\use-actor-email.ts" "$src\features\organization\model\use-actor-email.ts"
Move-File "$m\organizations\presentation\components\organization-status-badge.tsx" "$src\entities\organization\ui\organization-status-badge.tsx"

Ensure-Dir "$src\features\organization-list\ui"
Ensure-Dir "$src\features\organization-create\ui"
Ensure-Dir "$src\features\organization-detail\ui"
Ensure-Dir "$src\features\organization-edit\ui"
Ensure-Dir "$src\features\organization-invite\ui"
Move-File "$m\organizations\presentation\components\organizations-list-client.tsx" "$src\features\organization-list\ui\organizations-list.tsx"
Move-File "$m\organizations\presentation\components\organization-wizard-client.tsx" "$src\features\organization-create\ui\organization-wizard.tsx"
Move-File "$m\organizations\presentation\components\organization-detail-client.tsx" "$src\features\organization-detail\ui\organization-detail.tsx"
Move-File "$m\organizations\presentation\components\organization-edit-client.tsx" "$src\features\organization-edit\ui\organization-edit.tsx"
Move-File "$m\organizations\presentation\components\invite-principal-admin-client.tsx" "$src\features\organization-invite\ui\invite-principal-admin.tsx"

# transfer
Ensure-Dir "$src\entities\transfer-payment\model"
Ensure-Dir "$src\entities\transfer-payment\api"
Ensure-Dir "$src\entities\transfer-payment\ui"
Ensure-Dir "$src\features\transfer-reconciliation\model"
Ensure-Dir "$src\features\transfer-reconciliation\api"
Ensure-Dir "$src\features\transfer-inbox\ui"
Ensure-Dir "$src\features\transfer-detail\ui"
Ensure-Dir "$src\widgets\receipt-viewer\ui"
Get-ChildItem "$m\transfer-reconciliation\domain" | Move-Item -Destination "$src\entities\transfer-payment\model\"
Get-ChildItem "$m\transfer-reconciliation\application\ports" | Move-Item -Destination "$src\entities\transfer-payment\api\"
Move-File "$m\transfer-reconciliation\infrastructure\mock-transfer-reconciliation-repository.ts" "$src\entities\transfer-payment\api\mock-transfer-reconciliation-repository.ts"
Move-File "$m\transfer-reconciliation\infrastructure\mock-receipt-preview.ts" "$src\entities\transfer-payment\api\mock-receipt-preview.ts"
Move-File "$m\transfer-reconciliation\infrastructure\transfer-reconciliation-composition.ts" "$src\features\transfer-reconciliation\api\transfer-reconciliation-composition.ts"
Get-ChildItem "$m\transfer-reconciliation\application\use-cases" | Move-Item -Destination "$src\features\transfer-reconciliation\model\"
Move-File "$m\transfer-reconciliation\presentation\components\transfer-inbox-client.tsx" "$src\features\transfer-inbox\ui\transfer-inbox.tsx"
Move-File "$m\transfer-reconciliation\presentation\components\transfer-detail-client.tsx" "$src\features\transfer-detail\ui\transfer-detail.tsx"
Move-File "$m\transfer-reconciliation\presentation\components\transfer-status-badge.tsx" "$src\entities\transfer-payment\ui\transfer-status-badge.tsx"
Move-File "$m\transfer-reconciliation\presentation\components\receipt-viewer.tsx" "$src\widgets\receipt-viewer\ui\ReceiptViewer.tsx"

# commercial reports
Ensure-Dir "$src\entities\commercial-report\model"
Ensure-Dir "$src\entities\commercial-report\api"
Ensure-Dir "$src\features\commercial-report\ui"
Ensure-Dir "$src\features\commercial-report\api"
Ensure-Dir "$src\widgets\reports-nav\ui"
Ensure-Dir "$src\widgets\report-filters-bar\ui"
Ensure-Dir "$src\widgets\report-charts\ui"
Ensure-Dir "$src\widgets\report-toolbar-actions\ui"
Get-ChildItem "$m\commercial-reports\domain" | Move-Item -Destination "$src\entities\commercial-report\model\"
Get-ChildItem "$m\commercial-reports\application\ports" | Move-Item -Destination "$src\entities\commercial-report\api\"
Move-File "$m\commercial-reports\infrastructure\mock-commercial-dataset.ts" "$src\entities\commercial-report\api\mock-commercial-dataset.ts"
Move-File "$m\commercial-reports\infrastructure\mock-commercial-reports-repository.ts" "$src\entities\commercial-report\api\mock-commercial-reports-repository.ts"
Move-File "$m\commercial-reports\infrastructure\commercial-reports-composition.ts" "$src\features\commercial-report\api\commercial-reports-composition.ts"
Move-File "$m\commercial-reports\presentation\components\commercial-report-client.tsx" "$src\features\commercial-report\ui\commercial-report.tsx"
Move-File "$m\commercial-reports\presentation\components\reports-nav.tsx" "$src\widgets\reports-nav\ui\ReportsNav.tsx"
Move-File "$m\commercial-reports\presentation\components\report-filters-bar.tsx" "$src\widgets\report-filters-bar\ui\ReportFiltersBar.tsx"
Move-File "$m\commercial-reports\presentation\components\report-charts.tsx" "$src\widgets\report-charts\ui\ReportCharts.tsx"
Move-File "$m\commercial-reports\presentation\components\report-toolbar-actions.tsx" "$src\widgets\report-toolbar-actions\ui\ReportToolbarActions.tsx"

# operator
Ensure-Dir "$src\entities\operator\model"
Ensure-Dir "$src\entities\operator\api"
Ensure-Dir "$src\features\operator-portal\model"
Ensure-Dir "$src\features\operator-portal\api"
Ensure-Dir "$src\features\operator-portal\config"
Ensure-Dir "$src\features\operator-portal\ui"
Ensure-Dir "$src\features\operator-dashboard\ui"
Ensure-Dir "$src\features\operator-screens\ui"
Move-File "$m\operator-portal\domain\permissions.ts" "$src\entities\operator\model\permissions.ts"
Move-File "$m\operator-portal\application\ports\operator-portal-repository.ts" "$src\entities\operator\api\operator-portal-repository.ts"
Move-File "$m\operator-portal\infrastructure\mock-operator-portal-repository.ts" "$src\entities\operator\api\mock-operator-portal-repository.ts"
Move-File "$m\operator-portal\infrastructure\operator-portal-composition.ts" "$src\features\operator-portal\api\operator-portal-composition.ts"
Move-File "$m\operator-portal\presentation\config\operator-navigation.ts" "$src\features\operator-portal\config\operator-navigation.ts"
Move-File "$m\operator-portal\presentation\hooks\use-operator-context.ts" "$src\features\operator-portal\model\use-operator-context.ts"
Move-File "$m\operator-portal\presentation\components\operator-access-denied.tsx" "$src\features\operator-portal\ui\operator-access-denied.tsx"
Move-File "$m\operator-portal\presentation\components\operator-permission-gate.tsx" "$src\features\operator-portal\ui\operator-permission-gate.tsx"
Move-File "$m\operator-portal\presentation\components\operator-dashboard-client.tsx" "$src\features\operator-dashboard\ui\operator-dashboard.tsx"
Move-File "$m\operator-portal\presentation\components\operator-screens-client.tsx" "$src\features\operator-screens\ui\operator-screens.tsx"

# platform admin
Ensure-Dir "$src\entities\platform-metrics\model"
Ensure-Dir "$src\entities\platform-metrics\api"
Ensure-Dir "$src\features\platform-dashboard\api"
Ensure-Dir "$src\features\company-dashboard\api"
Move-File "$m\platform-admin\domain\metrics.ts" "$src\entities\platform-metrics\model\metrics.ts"
Move-File "$m\platform-admin\infrastructure\mock-platform-metrics-repository.ts" "$src\entities\platform-metrics\api\mock-platform-metrics-repository.ts"
Move-File "$m\platform-admin\platform-admin-api.ts" "$src\features\platform-dashboard\api\platform-admin-api.ts"
Move-File "$m\platform-admin\company-dashboard-api.ts" "$src\features\company-dashboard\api\company-dashboard-api.ts"

# cleanup empty dirs
Remove-Item -Recurse -Force "$src\modules" -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force "$src\prototypes" -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force "$src\router" -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force "$src\styles" -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force "$src\shared\presentation" -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force "$src\shared\domain" -ErrorAction SilentlyContinue

Write-Host "FSD move complete."
