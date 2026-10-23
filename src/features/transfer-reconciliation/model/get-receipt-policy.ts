import type { TransferReconciliationRepository } from "@/entities/transfer-payment/api/transfer-reconciliation-repository";

export function getReceiptPolicy(repo: TransferReconciliationRepository) {
  return repo.getReceiptPolicy();
}
