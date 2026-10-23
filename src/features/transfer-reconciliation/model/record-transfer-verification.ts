import type {
  RecordVerificationInput,
  TransferReconciliationRepository,
} from "@/entities/transfer-payment/api/transfer-reconciliation-repository";

export function recordTransferVerification(
  repo: TransferReconciliationRepository,
  input: RecordVerificationInput,
) {
  if (!input.reason.trim()) throw new Error("REASON_REQUIRED");
  if (input.action === "confirm" && !input.verificationSource) {
    throw new Error("VERIFICATION_SOURCE_REQUIRED");
  }
  return repo.recordVerification(input);
}
