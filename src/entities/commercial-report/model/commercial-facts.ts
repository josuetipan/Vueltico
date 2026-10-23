/** Hechos comerciales normalizados (centavos enteros). */

export type BranchRef = { id: string; name: string };
export type RegisterRef = { id: string; branchId: string; name: string };
export type CashierRef = { id: string; name: string; branchId: string };

/** Desglose de cobro: la suma debe igualar totalCents (evita duplicar mixtos). */
export type SalePaymentAllocation = {
  cashCents: number;
  transferReportedCents: number;
  transferConfirmedCents: number;
};

export type CommercialSale = {
  id: string;
  tenantId: string;
  occurredAt: string;
  branchId: string;
  registerId: string;
  cashierId: string;
  label: string;
  totalCents: number;
  allocation: SalePaymentAllocation;
};

export type CashMovement = {
  id: string;
  tenantId: string;
  occurredAt: string;
  branchId: string;
  type: "income" | "expense";
  amountCents: number;
  category: string;
  description: string;
};

export type ShiftClosureFact = {
  id: string;
  tenantId: string;
  branchId: string;
  registerId: string;
  cashierId: string;
  closedAt: string;
  expectedCashCents: number;
  countedCashCents: number;
  outcome: "balanced" | "shortage" | "overage";
};

export type TransferSummaryFact = {
  id: string;
  tenantId: string;
  saleId: string;
  reportedAt: string;
  amountCents: number;
  status: "pending_verification" | "in_review" | "confirmed" | "rejected";
};

export type TenantCommercialDataset = {
  branches: BranchRef[];
  registers: RegisterRef[];
  cashiers: CashierRef[];
  sales: CommercialSale[];
  movements: CashMovement[];
  closures: ShiftClosureFact[];
  transfers: TransferSummaryFact[];
};

export function assertAllocationMatchesTotal(sale: CommercialSale): void {
  const { cashCents, transferReportedCents, transferConfirmedCents } = sale.allocation;
  const sum = cashCents + transferReportedCents + transferConfirmedCents;
  if (sum !== sale.totalCents) {
    throw new Error("ALLOCATION_MISMATCH");
  }
}
