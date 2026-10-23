import {
  computeExpiryIso,
  DEFAULT_RECEIPT_RETENTION_DAYS,
  getReceiptPolicyView,
} from "../model/receipt-policy";
import type { TransferPayment, TransferPaymentStatus } from "../model/transfer-payment";
import {
  attachDuplicateWarnings,
  canTransitionStatus,
  normalizeReference,
} from "../model/transfer-rules";
import type {
  ListTransferPaymentsFilters,
  RecordVerificationInput,
  TransferReconciliationRepository,
} from "./transfer-reconciliation-repository";
import { mockReceiptPreviewUrl } from "./mock-receipt-preview";

const TENANT = "ten-ec-001";

let payments: TransferPayment[] = attachDuplicateWarnings([
  seed({
    id: "tp-001",
    saleId: "sale-1042",
    saleLabel: "Venta #1042",
    reportedAt: "2026-10-21T15:28:00Z",
    cashierName: "María Salinas",
    destinationAccountId: "acc-pichincha",
    destinationAccountName: "Banco Pichincha · ****4821",
    amountCents: 89000,
    bankName: "Banco Pichincha",
    reference: "TR-881902",
    status: "pending_verification",
    receiptFileName: "comprobante-881902.jpg",
  }),
  seed({
    id: "tp-002",
    saleId: "sale-1038",
    saleLabel: "Venta #1038",
    reportedAt: "2026-10-21T11:22:00Z",
    cashierName: "Diego Ortiz",
    destinationAccountId: "acc-guayaquil",
    destinationAccountName: "Banco Guayaquil · ****1190",
    amountCents: 56000,
    bankName: "Banco Guayaquil",
    reference: "TR 902 441",
    status: "pending_verification",
    receiptFileName: "transferencia-902441.png",
  }),
  seed({
    id: "tp-003",
    saleId: "sale-1020",
    saleLabel: "Venta #1020",
    reportedAt: "2026-10-18T09:18:00Z",
    cashierName: "María Salinas",
    destinationAccountId: "acc-pichincha",
    destinationAccountName: "Banco Pichincha · ****4821",
    amountCents: 42000,
    bankName: "Banco Pichincha",
    reference: "TR-881902",
    status: "in_review",
    receiptFileName: "ref-duplicada.jpg",
  }),
  seed({
    id: "tp-004",
    saleId: "sale-1011",
    saleLabel: "Venta #1011",
    reportedAt: "2026-10-17T16:40:00Z",
    cashierName: "Luis Paredes",
    destinationAccountId: "acc-pichincha",
    destinationAccountName: "Banco Pichincha · ****4821",
    amountCents: 125000,
    bankName: "Banco Pichincha",
    reference: "TR-870011",
    status: "confirmed",
    receiptFileName: "ok-870011.jpg",
    confirmed: true,
  }),
  seed({
    id: "tp-005",
    saleId: "sale-1005",
    saleLabel: "Venta #1005",
    reportedAt: "2026-10-16T14:05:00Z",
    cashierName: "Diego Ortiz",
    destinationAccountId: "acc-guayaquil",
    destinationAccountName: "Banco Guayaquil · ****1190",
    amountCents: 32000,
    bankName: "Banco Guayaquil",
    reference: "TR-FAKE-99",
    status: "rejected",
    receiptFileName: "rechazado.jpg",
    rejected: true,
  }),
]);

function seed(
  p: {
    id: string;
    saleId: string;
    saleLabel: string;
    reportedAt: string;
    cashierName: string;
    destinationAccountId: string;
    destinationAccountName: string;
    amountCents: number;
    bankName: string;
    reference: string;
    status: TransferPaymentStatus;
    receiptFileName: string;
    confirmed?: boolean;
    rejected?: boolean;
  },
): TransferPayment {
  const storedAt = p.reportedAt;
  const retention = {
    policyDays: DEFAULT_RECEIPT_RETENTION_DAYS,
    storedAt,
    expiresAt: computeExpiryIso(storedAt, DEFAULT_RECEIPT_RETENTION_DAYS),
    legalHold: false,
  };
  const decisions: TransferPayment["decisions"] = [];
  if (p.confirmed) {
    decisions.push({
      id: `dec-${p.id}-1`,
      action: "confirm",
      at: "2026-10-17T10:00:00Z",
      responsibleUserId: "usr-ca-001",
      responsibleEmail: "admin@andina.demo",
      reason: "Coincide con extracto Banco Pichincha",
      verificationSource: "authorized_bank_statement",
    });
  }
  if (p.rejected) {
    decisions.push({
      id: `dec-${p.id}-1`,
      action: "reject",
      at: "2026-10-16T18:00:00Z",
      responsibleUserId: "usr-ca-001",
      responsibleEmail: "admin@andina.demo",
      reason: "Referencia no encontrada en cuenta destino",
    });
  }
  return {
    tenantId: TENANT,
    duplicateReferenceWarningIds: [],
    receiptMimeType: "image/jpeg",
    receiptPreviewUrl: mockReceiptPreviewUrl(p.reference),
    receiptUploadedAt: storedAt,
    retention,
    decisions,
    ...p,
  };
}

function actionToStatus(action: RecordVerificationInput["action"]): TransferPaymentStatus {
  switch (action) {
    case "confirm":
      return "confirmed";
    case "reject":
      return "rejected";
    case "mark_in_review":
      return "in_review";
    case "defer_verification":
      return "pending_verification";
  }
}

export const mockTransferReconciliationRepository: TransferReconciliationRepository = {
  async list(filters) {
    await delay(240);
    let rows = payments.filter((p) => p.tenantId === filters.tenantId);
    if (filters.status && filters.status !== "all") {
      rows = rows.filter((p) => p.status === filters.status);
    }
    if (filters.search?.trim()) {
      const q = filters.search.trim().toLowerCase();
      rows = rows.filter(
        (p) =>
          p.reference.toLowerCase().includes(q) ||
          p.saleLabel.toLowerCase().includes(q) ||
          p.cashierName.toLowerCase().includes(q),
      );
    }
    rows.sort((a, b) => b.reportedAt.localeCompare(a.reportedAt));
    return rows.map((p) => ({
      id: p.id,
      reportedAt: p.reportedAt,
      saleId: p.saleId,
      saleLabel: p.saleLabel,
      cashierName: p.cashierName,
      destinationAccountName: p.destinationAccountName,
      amountCents: p.amountCents,
      reference: p.reference,
      status: p.status,
      duplicateReferenceWarningIds: p.duplicateReferenceWarningIds,
    }));
  },

  async getById(tenantId, paymentId) {
    await delay(180);
    const row = payments.find((p) => p.tenantId === tenantId && p.id === paymentId);
    if (!row) throw new Error("NOT_FOUND");
    return row;
  },

  async recordVerification(input) {
    await delay(280);
    const idx = payments.findIndex(
      (p) => p.tenantId === input.tenantId && p.id === input.paymentId,
    );
    if (idx < 0) throw new Error("NOT_FOUND");
    const current = payments[idx]!;
    const nextStatus = actionToStatus(input.action);
    if (!canTransitionStatus(current.status, nextStatus)) throw new Error("INVALID_TRANSITION");

    const decision = {
      id: `dec-${input.paymentId}-${Date.now()}`,
      action: input.action,
      at: new Date().toISOString(),
      responsibleUserId: input.responsibleUserId,
      responsibleEmail: input.responsibleEmail,
      reason: input.reason.trim(),
      verificationSource: input.verificationSource,
      notes: input.notes?.trim(),
    };

    const updated: TransferPayment = {
      ...current,
      status: nextStatus,
      decisions: [...current.decisions, decision],
    };
    payments[idx] = updated;
    payments = attachDuplicateWarnings(payments);
    return payments.find((p) => p.id === input.paymentId)!;
  },

  async getReceiptPolicy() {
    await delay(80);
    return getReceiptPolicyView();
  },
};

function delay(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

export function __normalizeReferenceForTests(reference: string) {
  return normalizeReference(reference);
}
