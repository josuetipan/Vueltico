import { assertAllocationMatchesTotal, type TenantCommercialDataset } from "../model/commercial-facts";

const TENANT = "ten-ec-001";

/** Dataset alineado con transferencias (sale-1042, tp-001…) y sucursales Andina. */
export const MOCK_COMMERCIAL_DATASET: TenantCommercialDataset = {
  branches: [
    { id: "br-quito", name: "Quito Centro" },
    { id: "br-cumbaya", name: "Cumbayá" },
    { id: "br-machala", name: "Machala" },
  ],
  registers: [
    { id: "reg-q1", branchId: "br-quito", name: "Caja 1" },
    { id: "reg-q2", branchId: "br-quito", name: "Caja 2" },
    { id: "reg-c1", branchId: "br-cumbaya", name: "Caja 1" },
    { id: "reg-m1", branchId: "br-machala", name: "Caja 1" },
  ],
  cashiers: [
    { id: "cash-ms", name: "María Salinas", branchId: "br-quito" },
    { id: "cash-do", name: "Diego Ortiz", branchId: "br-cumbaya" },
    { id: "cash-lp", name: "Luis Paredes", branchId: "br-machala" },
  ],
  sales: [
    sale("sale-1042", "2026-10-21T15:28:00Z", "br-quito", "reg-q1", "cash-ms", "Venta #1042", 89000, {
      cashCents: 0,
      transferReportedCents: 89000,
      transferConfirmedCents: 0,
    }),
    sale("sale-1048", "2026-10-21T16:05:00Z", "br-cumbaya", "reg-c1", "cash-do", "Venta #1048", 12000, {
      cashCents: 12000,
      transferReportedCents: 0,
      transferConfirmedCents: 0,
    }),
    sale("sale-1038", "2026-10-21T11:22:00Z", "br-cumbaya", "reg-c1", "cash-do", "Venta #1038", 56000, {
      cashCents: 0,
      transferReportedCents: 56000,
      transferConfirmedCents: 0,
    }),
    sale("sale-1050", "2026-10-21T17:35:00Z", "br-machala", "reg-m1", "cash-lp", "Venta #1050", 20500, {
      cashCents: 20500,
      transferReportedCents: 0,
      transferConfirmedCents: 0,
    }),
    sale("sale-1035", "2026-10-20T18:45:00Z", "br-quito", "reg-q1", "cash-ms", "Venta #1035", 150000, {
      cashCents: 50000,
      transferReportedCents: 100000,
      transferConfirmedCents: 0,
    }),
    sale("sale-1020", "2026-10-18T09:18:00Z", "br-quito", "reg-q2", "cash-ms", "Venta #1020", 42000, {
      cashCents: 0,
      transferReportedCents: 42000,
      transferConfirmedCents: 0,
    }),
    sale("sale-1011", "2026-10-17T16:40:00Z", "br-quito", "reg-q1", "cash-ms", "Venta #1011", 125000, {
      cashCents: 0,
      transferReportedCents: 0,
      transferConfirmedCents: 125000,
    }),
    sale("sale-1008", "2026-10-16T14:05:00Z", "br-cumbaya", "reg-c1", "cash-do", "Venta #1008", 32000, {
      cashCents: 8000,
      transferReportedCents: 24000,
      transferConfirmedCents: 0,
    }),
    sale("sale-1001", "2026-10-10T10:00:00Z", "br-quito", "reg-q1", "cash-ms", "Venta #1001", 31025, {
      cashCents: 31025,
      transferReportedCents: 0,
      transferConfirmedCents: 0,
    }),
  ],
  movements: [
    mov("mov-1", "2026-10-21T08:00:00Z", "br-quito", "expense", 8500, "Insumos", "Compra insumos caja"),
    mov("mov-2", "2026-10-20T12:00:00Z", "br-cumbaya", "income", 20000, "Ajuste", "Ajuste ingreso menor"),
    mov("mov-3", "2026-10-19T17:00:00Z", "br-quito", "expense", 4550, "Operativo", "Gasto operativo"),
    mov("mov-4", "2026-10-18T09:00:00Z", "br-machala", "income", 15000, "Servicio", "Ingreso servicio adicional"),
    mov("mov-5", "2026-10-15T11:00:00Z", "br-quito", "expense", 12000, "Mantenimiento", "Mantenimiento caja"),
  ],
  closures: [
    closure("cl-1", "2026-10-20T22:00:00Z", "br-quito", "reg-q1", "cash-ms", 295000, 292000, "shortage"),
    closure("cl-2", "2026-10-18T21:00:00Z", "br-cumbaya", "reg-c1", "cash-do", 78050, 80500, "overage"),
    closure("cl-3", "2026-10-19T21:30:00Z", "br-machala", "reg-m1", "cash-lp", 110000, 110000, "balanced"),
  ],
  transfers: [
    { id: "tp-001", tenantId: TENANT, saleId: "sale-1042", reportedAt: "2026-10-21T15:28:00Z", amountCents: 89000, status: "pending_verification" },
    { id: "tp-002", tenantId: TENANT, saleId: "sale-1038", reportedAt: "2026-10-21T11:22:00Z", amountCents: 56000, status: "pending_verification" },
    { id: "tp-003", tenantId: TENANT, saleId: "sale-1020", reportedAt: "2026-10-18T09:18:00Z", amountCents: 42000, status: "in_review" },
    { id: "tp-004", tenantId: TENANT, saleId: "sale-1011", reportedAt: "2026-10-17T16:40:00Z", amountCents: 125000, status: "confirmed" },
    { id: "tp-005", tenantId: TENANT, saleId: "sale-1008", reportedAt: "2026-10-16T14:05:00Z", amountCents: 32000, status: "rejected" },
  ],
};

function sale(
  id: string,
  occurredAt: string,
  branchId: string,
  registerId: string,
  cashierId: string,
  label: string,
  totalCents: number,
  allocation: { cashCents: number; transferReportedCents: number; transferConfirmedCents: number },
) {
  const row = {
    id,
    tenantId: TENANT,
    occurredAt,
    branchId,
    registerId,
    cashierId,
    label,
    totalCents,
    allocation,
  };
  assertAllocationMatchesTotal(row);
  return row;
}

function mov(
  id: string,
  occurredAt: string,
  branchId: string,
  type: "income" | "expense",
  amountCents: number,
  category: string,
  description: string,
) {
  return { id, tenantId: TENANT, occurredAt, branchId, type, amountCents, category, description };
}

function closure(
  id: string,
  closedAt: string,
  branchId: string,
  registerId: string,
  cashierId: string,
  expectedCashCents: number,
  countedCashCents: number,
  outcome: "balanced" | "shortage" | "overage",
) {
  return {
    id,
    tenantId: TENANT,
    branchId,
    registerId,
    cashierId,
    closedAt,
    expectedCashCents,
    countedCashCents,
    outcome,
  };
}

for (const s of MOCK_COMMERCIAL_DATASET.sales) {
  assertAllocationMatchesTotal(s);
}
