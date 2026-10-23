import type { TransferReconciliationRepository } from "@/entities/transfer-payment/api/transfer-reconciliation-repository";

export function getTransferPayment(
  repo: TransferReconciliationRepository,
  tenantId: string,
  paymentId: string,
) {
  return repo.getById(tenantId, paymentId);
}
