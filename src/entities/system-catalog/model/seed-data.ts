import type {
  CatalogModule,
  CatalogScreen,
  GlobalRoleTemplate,
  ScreenAction,
} from "./catalog";

const ts = "2025-06-01T00:00:00.000Z";

export const SEED_CATALOG_MODULES: CatalogModule[] = [
  { id: "mod-transfers", name: "Transferencias", slug: "transferencias", status: "ACTIVE" },
  { id: "mod-reports", name: "Reportes", slug: "reportes", status: "ACTIVE" },
  { id: "mod-billing", name: "Facturación", slug: "facturacion", status: "ACTIVE" },
  { id: "mod-orgs", name: "Empresas", slug: "empresas", status: "ACTIVE" },
];

export const SEED_CATALOG_SCREENS: CatalogScreen[] = [
  {
    id: "scr-transfers-list",
    moduleId: "mod-transfers",
    name: "Listado de Transferencias",
    screenKey: "view_transfers_list",
    path: "/app/empresa/transferencias",
    description: "Bandeja de transferencias pendientes y filtros.",
    status: "ACTIVE",
    createdAt: ts,
    updatedAt: ts,
  },
  {
    id: "scr-transfer-detail",
    moduleId: "mod-transfers",
    name: "Detalle de Transferencia",
    screenKey: "view_transfer_detail",
    path: "/app/empresa/transferencias/:id",
    description: "Revisión, conciliación y comprobantes.",
    status: "ACTIVE",
    createdAt: ts,
    updatedAt: ts,
  },
  {
    id: "scr-reports-dash",
    moduleId: "mod-reports",
    name: "Panel analítico",
    screenKey: "view_reports_dashboard",
    path: "/app/empresa/reportes",
    description: "Dashboard comercial consolidado.",
    status: "ACTIVE",
    createdAt: ts,
    updatedAt: ts,
  },
  {
    id: "scr-billing-plans",
    moduleId: "mod-billing",
    name: "Catálogo de planes",
    screenKey: "view_billing_plans",
    path: "/app/superadmin/planes",
    description: "CRUD de planes SaaS.",
    status: "ACTIVE",
    createdAt: ts,
    updatedAt: ts,
  },
];

export const SEED_SCREEN_ACTIONS: ScreenAction[] = [
  {
    id: "act-tx-view",
    screenId: "scr-transfers-list",
    name: "Ver listado",
    permissionKey: "transfers:view",
    httpMethod: "GET",
    apiRoute: "/api/v1/transfers",
    uiElement: "Tabla_Accion",
    description: "Consulta paginada de transferencias.",
  },
  {
    id: "act-tx-create",
    screenId: "scr-transfers-list",
    name: 'Botón "Crear"',
    permissionKey: "transfers:create",
    httpMethod: "POST",
    apiRoute: "/api/v1/transfers",
    uiElement: "Boton_Principal",
    description: "Permite enviar el formulario de registro de transferencia.",
  },
  {
    id: "act-tx-approve",
    screenId: "scr-transfer-detail",
    name: 'Botón "Aprobar"',
    permissionKey: "transfers:approve",
    httpMethod: "PATCH",
    apiRoute: "/api/v1/transfers/{id}/approve",
    uiElement: "Boton_Principal",
    description: "Procesa y valida la transferencia de dinero.",
  },
  {
    id: "act-tx-delete",
    screenId: "scr-transfer-detail",
    name: 'Botón "Eliminar"',
    permissionKey: "transfers:delete",
    httpMethod: "DELETE",
    apiRoute: "/api/v1/transfers/{id}",
    uiElement: "Menu_Contextual",
    description: "Anula el registro contable de la transferencia.",
  },
  {
    id: "act-tx-export",
    screenId: "scr-transfers-list",
    name: "Exportar Excel",
    permissionKey: "transfers:export",
    httpMethod: "GET",
    apiRoute: "/api/v1/transfers/export",
    uiElement: "Tabla_Accion",
    description: "Genera y descarga el archivo con los movimientos.",
  },
];

export const SEED_GLOBAL_ROLES: GlobalRoleTemplate[] = [
  {
    id: "grole-admin",
    code: "ROLE_ADMIN",
    name: "Administrador",
    description: "Control operativo completo en la empresa.",
    permissionKeys: [
      "transfers:view",
      "transfers:create",
      "transfers:approve",
      "transfers:export",
    ],
    isSystem: true,
  },
  {
    id: "grole-cashier",
    code: "ROLE_CASHIER",
    name: "Cajero / Operador",
    description: "Registra movimientos y consulta bandejas asignadas.",
    permissionKeys: ["transfers:view", "transfers:create"],
    isSystem: true,
  },
  {
    id: "grole-auditor",
    code: "ROLE_AUDITOR",
    name: "Auditor",
    description: "Solo lectura y exportación para controles.",
    permissionKeys: ["transfers:view", "transfers:export"],
    isSystem: true,
  },
];
