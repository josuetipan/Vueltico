import type {
  ListTransferPaymentsFilters,
  TransferReconciliationRepository,
} from "@/entities/transfer-payment/api/transfer-reconciliation-repository";

export function listTransferPayments(
  repo: TransferReconciliationRepository,
  filters: ListTransferPaymentsFilters,
) {
  return repo.list(filters);
}
