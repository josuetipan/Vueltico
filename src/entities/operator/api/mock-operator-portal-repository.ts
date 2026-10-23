import { MOCK_COMMERCIAL_DATASET } from "@/entities/commercial-report/api/mock-commercial-dataset";
import type { TenantSummary } from "@/entities/session";
import type { OperatorPermission, OperatorProfile } from "@/entities/operator/model/permissions";
import type {
  CreateMovementInput,
  OperatorPortalRepository,
} from "./operator-portal-repository";

const PROFILES: Record<string, OperatorProfile> = {
  "usr-op-001|ten-ec-001": profile({
    userId: "usr-op-001",
    tenantId: "ten-ec-001",
    operatorStaffId: "cash-ms",
    displayName: "María Salinas",
    email: "operador@andina.demo",
    branchId: "br-quito",
    branchName: "Quito Centro",
    permissions: [
      "dashboard:view",
      "accounts:view",
      "movements:view_own",
      "movements:create",
      "receipts:attach",
      "sales:view_own",
      "shifts:view_own",
      "requests:view_own",
      "notifications:view",
      "profile:edit",
    ],
    cashier: true,
  }),
  "usr-op-002|ten-ec-001": profile({
    userId: "usr-op-002",
    tenantId: "ten-ec-001",
    operatorStaffId: "cash-do",
    displayName: "Diego Ortiz",
    email: "cajero.cumbaya@andina.demo",
    branchId: "br-cumbaya",
    branchName: "Cumbayá",
    permissions: [
      "dashboard:view",
      "organization:switch",
      "accounts:view",
      "movements:view_own",
      "sales:view_own",
      "shifts:view_own",
      "notifications:view",
      "profile:edit",
    ],
    cashier: true,
    treasury: false,
  }),
  "usr-op-002|ten-ec-002": profile({
    userId: "usr-op-002",
    tenantId: "ten-ec-002",
    operatorStaffId: "cash-ext-01",
    displayName: "Diego Ortiz",
    email: "cajero.cumbaya@andina.demo",
    branchId: "br-sur",
    branchName: "Sucursal Sur",
    permissions: ["dashboard:view", "movements:view_own", "notifications:view", "profile:edit"],
    cashier: false,
  }),
};

const TENANTS_BY_USER: Record<string, TenantSummary[]> = {
  "usr-op-001": [
    {
      id: "ten-ec-001",
      tradeName: "Andina Retail",
      legalName: "Comercial Andina Cía. Ltda.",
      ruc: "1790123456001",
    },
  ],
  "usr-op-002": [
    {
      id: "ten-ec-001",
      tradeName: "Andina Retail",
      legalName: "Comercial Andina Cía. Ltda.",
      ruc: "1790123456001",
    },
    {
      id: "ten-ec-002",
      tradeName: "Pacífico Trade",
      legalName: "Pacífico Comercial S.A.",
      ruc: "1790987654001",
    },
  ],
};

let movementsStore: import("@/entities/operator/api/operator-portal-repository").OperatorMovement[] = [
  {
    id: "om-1",
    occurredAt: "2026-10-21T08:00:00Z",
    type: "expense",
    amountCents: 8500,
    accountName: "Caja general",
    description: "Compra insumos caja",
    status: "posted",
    receiptAttached: true,
  },
  {
    id: "om-2",
    occurredAt: "2026-10-20T12:00:00Z",
    type: "income",
    amountCents: 20000,
    accountName: "Caja general",
    description: "Ajuste ingreso menor",
    status: "pending_approval",
    receiptAttached: false,
  },
];

let notifications: import("@/entities/operator/api/operator-portal-repository").OperatorNotification[] = [
  {
    id: "n-1",
    at: "2026-10-21T09:00:00Z",
    title: "Movimiento en revisión",
    body: "Su egreso del 20 oct. está pendiente de aprobación del supervisor.",
    read: false,
  },
  {
    id: "n-2",
    at: "2026-10-20T18:00:00Z",
    title: "Turno abierto",
    body: "Caja 1 · Quito Centro — recuerde cerrar al finalizar la jornada.",
    read: true,
  },
];

function profile(p: {
  userId: string;
  tenantId: string;
  operatorStaffId: string;
  displayName: string;
  email: string;
  branchId: string;
  branchName: string;
  permissions: OperatorPermission[];
  cashier: boolean;
  treasury?: boolean;
}): OperatorProfile {
  return {
    userId: p.userId,
    tenantId: p.tenantId,
    operatorStaffId: p.operatorStaffId,
    displayName: p.displayName,
    email: p.email,
    branchId: p.branchId,
    branchName: p.branchName,
    roleLabel: p.cashier ? "Cajero / vendedor" : "Usuario operativo",
    permissions: p.permissions,
    enabledFeatures: { cashier: p.cashier, treasury: p.treasury ?? true },
  };
}

function ecTodayKey(): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Guayaquil",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

export const mockOperatorPortalRepository: OperatorPortalRepository = {
  async getProfile(userId, tenantId) {
    await delay(120);
    return PROFILES[`${userId}|${tenantId}`] ?? null;
  },

  async listAvailableTenants(userId) {
    await delay(100);
    return TENANTS_BY_USER[userId] ?? [];
  },

  async getDashboard(profile) {
    await delay(200);
    const today = ecTodayKey();
    const salesTodayCents = MOCK_COMMERCIAL_DATASET.sales
      .filter(
        (s) =>
          s.cashierId === profile.operatorStaffId &&
          new Intl.DateTimeFormat("en-CA", { timeZone: "America/Guayaquil" }).format(
            new Date(s.occurredAt),
          ) === today,
      )
      .reduce((a, s) => a + s.totalCents, 0);

    return {
      salesTodayCents,
      openShiftLabel: profile.enabledFeatures.cashier ? "Caja 1 · Abierto" : null,
      pendingRequestsCount: movementsStore.filter((m) => m.status === "pending_approval").length,
      unreadNotifications: notifications.filter((n) => !n.read).length,
      recentActivity: [
        {
          id: "a1",
          at: new Date().toISOString(),
          summary: `${salesTodayCents > 0 ? "Ventas registradas hoy" : "Sin ventas hoy"} en ${profile.branchName}`,
        },
      ],
    };
  },

  async listAuthorizedAccounts(profile) {
    await delay(150);
    if (!profile.enabledFeatures.treasury) {
      return [{ id: "acc-caja", name: "Caja asignada", kind: "cash", maskedNumber: "· Caja 1" }];
    }
    return [
      { id: "acc-caja", name: "Caja general", kind: "cash", maskedNumber: "Efectivo · sucursal" },
      { id: "acc-pichincha", name: "Banco Pichincha", kind: "bank", maskedNumber: "****4821" },
    ];
  },

  async listMyMovements(profile) {
    await delay(180);
    void profile;
    return movementsStore;
  },

  async createMovement(profile, input: CreateMovementInput) {
    await delay(250);
    void profile;
    void input;
    const row = {
      id: `om-${Date.now()}`,
      occurredAt: new Date().toISOString(),
      type: input.type,
      amountCents: input.amountCents,
      accountName: "Caja general",
      description: input.description,
      status: "pending_approval" as const,
      receiptAttached: false,
    };
    movementsStore = [row, ...movementsStore];
    return row;
  },

  async attachReceipt(profile, movementId, fileName) {
    await delay(200);
    void profile;
    movementsStore = movementsStore.map((m) =>
      m.id === movementId ? { ...m, receiptAttached: true } : m,
    );
    void fileName;
  },

  async listMySales(profile) {
    await delay(180);
    return MOCK_COMMERCIAL_DATASET.sales
      .filter((s) => s.cashierId === profile.operatorStaffId)
      .map((s) => ({
        id: s.id,
        label: s.label,
        occurredAt: s.occurredAt,
        totalCents: s.totalCents,
        paymentSummary: paymentLabel(s.allocation),
      }));
  },

  async listMyShifts(profile) {
    await delay(150);
    if (!profile.enabledFeatures.cashier) return [];
    return [
      {
        id: "shift-1",
        registerName: "Caja 1",
        status: "open" as const,
        openedAt: "2026-10-21T08:00:00Z",
        openingFloatCents: 15000,
      },
      {
        id: "shift-0",
        registerName: "Caja 1",
        status: "closed" as const,
        openedAt: "2026-10-20T08:00:00Z",
        openingFloatCents: 15000,
      },
    ];
  },

  async listPendingRequests(profile) {
    await delay(150);
    void profile;
    return movementsStore
      .filter((m) => m.status === "pending_approval")
      .map((m) => ({
        id: m.id,
        kind: "movement" as const,
        title: `Movimiento: ${m.description}`,
        submittedAt: m.occurredAt,
        status: "pending" as const,
      }));
  },

  async listNotifications(profile) {
    await delay(120);
    void profile;
    return notifications;
  },

  async markNotificationRead(profile, id) {
    await delay(80);
    void profile;
    notifications = notifications.map((n) => (n.id === id ? { ...n, read: true } : n));
  },

  async getAccountSettings(profile) {
    await delay(100);
    return {
      fullName: profile.displayName,
      email: profile.email,
      phone: "+593 99 123 4567",
      notifyEmail: true,
      notifyPush: false,
    };
  },

  async updateAccountSettings(profile, patch) {
    await delay(150);
    const current = await this.getAccountSettings(profile);
    return { ...current, ...patch };
  },
};

function paymentLabel(a: {
  cashCents: number;
  transferReportedCents: number;
  transferConfirmedCents: number;
}): string {
  const parts: string[] = [];
  if (a.cashCents) parts.push("Efectivo");
  if (a.transferReportedCents) parts.push("Transfer. reportada");
  if (a.transferConfirmedCents) parts.push("Transfer. confirmada");
  return parts.join(" · ") || "—";
}

function delay(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}
