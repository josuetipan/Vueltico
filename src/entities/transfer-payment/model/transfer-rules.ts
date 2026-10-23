import type { TransferPayment, TransferPaymentStatus } from "./transfer-payment";

export type DuplicateReferenceWarning = {
  referenceNormalized: string;
  paymentIds: string[];
  message: string;
};

export function normalizeReference(reference: string): string {
  return reference.replace(/\s+/g, "").toUpperCase();
}

/** Advierte por coincidencia textual; no rechaza automáticamente. */
export function findDuplicateReferenceWarnings(
  payments: Pick<TransferPayment, "id" | "reference" | "status">[],
): Map<string, DuplicateReferenceWarning> {
  const byRef = new Map<string, string[]>();
  for (const p of payments) {
    const key = normalizeReference(p.reference);
    if (!key) continue;
    const list = byRef.get(key) ?? [];
    list.push(p.id);
    byRef.set(key, list);
  }
  const warnings = new Map<string, DuplicateReferenceWarning>();
  for (const [referenceNormalized, paymentIds] of byRef) {
    if (paymentIds.length < 2) continue;
    const message =
      "La referencia coincide con otros pagos reportados. Revise antes de confirmar; la coincidencia no implica rechazo automático.";
    warnings.set(referenceNormalized, { referenceNormalized, paymentIds, message });
  }
  return warnings;
}

export function attachDuplicateWarnings<T extends TransferPayment>(payments: T[]): T[] {
  const warnings = findDuplicateReferenceWarnings(payments);
  return payments.map((p) => {
    const key = normalizeReference(p.reference);
    const w = warnings.get(key);
    return {
      ...p,
      duplicateReferenceWarningIds:
        w && w.paymentIds.length > 1
          ? w.paymentIds.filter((id) => id !== p.id)
          : [],
    };
  });
}

const TERMINAL: TransferPaymentStatus[] = ["confirmed", "rejected"];

export function canTransitionStatus(
  from: TransferPaymentStatus,
  to: TransferPaymentStatus,
): boolean {
  if (from === to) return true;
  if (TERMINAL.includes(from)) return false;
  if (to === "pending_verification") {
    return from === "in_review" || from === "pending_verification";
  }
  if (from === "pending_verification") {
    return to === "in_review" || to === "confirmed" || to === "rejected";
  }
  if (from === "in_review") {
    return to === "confirmed" || to === "rejected";
  }
  return false;
}

export function assertPositiveAmountCents(amountCents: number): void {
  if (!Number.isInteger(amountCents) || amountCents <= 0) {
    throw new Error("INVALID_AMOUNT");
  }
}
